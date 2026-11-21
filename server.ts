import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type, type GenerateContentParameters } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429');
}

function formatReadableError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) return String(parsed.error.message);
  } catch {
    // not raw json
  }
  return raw;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('503_TIMEOUT')), ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: Omit<GenerateContentParameters, 'model'>
) {
  const primaryModel = 'gemini-4-hydrogen';
  const fallbackModel = 'gemini-3.1-flash-lite';

  try {
    return await withTimeout(
      ai.models.generateContent({
        ...params,
        model: primaryModel,
        config: {
          ...params.config,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      }),
      7000
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!isTransientError(err) && msg !== '503_TIMEOUT') throw err;

    return await ai.models.generateContent({
      ...params,
      model: fallbackModel,
      config: {
        ...params.config,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      },
    });
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/ai/status', (_req, res) => {
    const client = getGeminiClient();
    res.json({
      available: Boolean(client),
      model: 'gemini-4-hydrogen',
    });
  });

  app.post('/api/ai/assist', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        available: false,
        error: 'کلید Gemini API در تنظیمات (Settings > Secrets) تعریف نشده است.',
      });
      return;
    }

    const { action, payload } = req.body ?? {};

    try {
      if (action === 'generate-section') {
        const description = String(payload?.description ?? '').trim();
        const lang = payload?.lang === 'en' ? 'en' : 'fa';
        if (!description) {
          res.status(400).json({ error: 'Description is required.' });
          return;
        }

        const response = await callGeminiWithFallback(ai, {
          contents: `Generate a website section block for Arsi Industrial Group (گروه صنعتی آرسی), a woodworking and MDF CNC cutting machinery manufacturer.
User description: "${description}"
Language: ${lang === 'fa' ? 'Persian (Farsi)' : 'English'}.
Choose the best matching block type from: hero, features, products, stats, testimonials, pricing, faq, contact, cta, richtext.
Do NOT invent fake technical specifications or fabricated prices; keep sample copy realistic and clearly marked as sample where numeric.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                variant: { type: Type.STRING },
                label: { type: Type.STRING },
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                ctaText: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      meta: { type: Type.STRING },
                    },
                  },
                },
              },
              required: ['type', 'variant', 'label', 'title', 'subtitle'],
            },
          },
        });

        const parsed = JSON.parse((response.text ?? '{}').trim());
        res.json({ ok: true, result: parsed });
        return;
      }

      if (action === 'rewrite-text') {
        const text = String(payload?.text ?? '').trim();
        const tone = String(payload?.tone ?? 'professional');
        const lang = payload?.lang === 'en' ? 'English' : 'Persian (Farsi)';
        if (!text) {
          res.status(400).json({ error: 'Text is required.' });
          return;
        }

        const response = await callGeminiWithFallback(ai, {
          contents: `Rewrite the following website copy for Arsi Industrial Group (woodworking & MDF CNC machine tools) in a "${tone}" tone in ${lang}. Return ONLY the rewritten text, without quotes or markdown wrappers.\n\nOriginal text:\n${text}`,
        });

        res.json({ ok: true, result: { text: (response.text ?? text).trim() } });
        return;
      }

      if (action === 'suggest-palette') {
        const currentPrimary = String(payload?.primary ?? '#12315F');
        const currentAccent = String(payload?.accent ?? '#F26A1B');
        const lang = payload?.lang === 'en' ? 'en' : 'fa';

        const response = await callGeminiWithFallback(ai, {
          contents: `Suggest 3 accessible industrial brand color palette variations inspired by deep navy (${currentPrimary}) and orange (${currentAccent}) for a woodworking & CNC machinery company. Ensure WCAG AA contrast between background and text colors. Language for names: ${lang === 'fa' ? 'Persian' : 'English'}.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  primary: { type: Type.STRING },
                  primaryHover: { type: Type.STRING },
                  accent: { type: Type.STRING },
                  bg: { type: Type.STRING },
                  surface: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ['name', 'primary', 'primaryHover', 'accent', 'bg', 'surface', 'text'],
              },
            },
          },
        });

        const parsed = JSON.parse((response.text ?? '[]').trim());
        res.json({ ok: true, result: parsed });
        return;
      }

      if (action === 'translate-project') {
        const targetLang = payload?.targetLang === 'en' ? 'en' : 'fa';
        const rawEntries = Array.isArray(payload?.entries) ? payload.entries : [];
        const entries = rawEntries
          .filter(
            (e: unknown): e is { key: string; text: string } =>
              Boolean(
                e &&
                  typeof e === 'object' &&
                  typeof (e as { key?: unknown }).key === 'string' &&
                  typeof (e as { text?: unknown }).text === 'string'
              )
          )
          .slice(0, 60);

        if (entries.length === 0) {
          res.json({ ok: true, result: [] });
          return;
        }

        const directionPrompt =
          targetLang === 'en'
            ? 'Persian (Farsi) to natural, authoritative industrial B2B English'
            : 'English to natural, fluent, authoritative corporate/industrial Persian (Farsi)';

        const response = await callGeminiWithFallback(ai, {
          contents: `You are a senior bilingual technical translator specializing in woodworking & MDF CNC machinery (CNC routers, sliding table panel saws, edge banders, industrial B2B engineering services) and website copywriting.

Translate every entry's "text" accurately from ${directionPrompt}.
Rules:
1. Return one item per input entry preserving the exact "key".
2. Keep technical acronyms & brand identifiers intact (RCG, CNC, MDF, PVC, G-Code, ISO, SEO) and preserve line breaks.
3. Translate placeholders/labels like "(نمونه)" <-> "(Sample)" accurately; never fabricate new numbers, prices, or specifications.
4. For Persian output, use standard Persian characters (ی/ک) and natural zero-width non-joiner spacing.

Entries JSON:
${JSON.stringify(entries)}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ['key', 'text'],
              },
            },
          },
        });

        const parsed = JSON.parse((response.text ?? '[]').trim());
        res.json({ ok: true, result: Array.isArray(parsed) ? parsed : [] });
        return;
      }

      res.status(400).json({ error: 'Unknown AI action.' });
    } catch (err: unknown) {
      const message = formatReadableError(err);
      res.status(500).json({ ok: false, error: message });
    }
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Arsi Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
