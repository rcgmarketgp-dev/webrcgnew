import JSZip from 'jszip';
import { ActionButtonItem, BlockInstance, BlockStyleProps, LinkTarget, PageData, ProjectData } from '../types/editor';
import { pluginRegistry, registerExporter } from '../plugins/registry';
import {
  normalizeLegacyLink,
  pageSlugToExportFile,
  resolveExportHref,
  resolveNavItemLink,
} from '../utils/linkResolver';

function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getEffectiveStyle(block: BlockInstance): BlockStyleProps {
  return block.style;
}

function pageSlugToFilename(page: PageData): string {
  return pageSlugToExportFile(page);
}

function renderExportAnchorAttrs(
  link: LinkTarget | undefined,
  project: ProjectData,
  currentPageId: string,
  fallbackHref = '#'
): string {
  const { href, targetBlank } = resolveExportHref(link, project, currentPageId, fallbackHref);
  return `href="${escapeHtml(href)}"${targetBlank ? ' target="_blank" rel="noopener noreferrer"' : ''}`;
}

function renderExportCustomButtons(
  buttons: ActionButtonItem[] | undefined,
  project: ProjectData,
  currentPageId: string,
  inline = false
): string {
  if (!Array.isArray(buttons) || buttons.length === 0) return '';
  const items = buttons
    .map((btn) => {
      const cls =
        btn.style === 'primary'
          ? 'arsi-btn-primary'
          : btn.style === 'secondary'
          ? 'arsi-btn-secondary'
          : 'arsi-btn-secondary';
      return `<a ${renderExportAnchorAttrs(btn.link, project, currentPageId)} class="${cls}">${escapeHtml(btn.label)}</a>`;
    })
    .join('');
  return inline ? items : `<div class="arsi-btn-row" style="margin-top:16px;">${items}</div>`;
}

function renderBlockHtml(
  block: BlockInstance,
  project: ProjectData,
  currentPageId: string,
  dir: 'rtl' | 'ltr'
): string {
  if (block.hidden) return '';
  const s = getEffectiveStyle(block);
  const c = block.content;
  const customButtons: ActionButtonItem[] = Array.isArray(c.buttons) ? c.buttons : [];
  const sectionIdAttr = `id="section-${escapeHtml(block.id)}"`;
  const maxW =
    s.maxWidth === 'full' ? '100%' : s.maxWidth === 'md' ? '768px' : s.maxWidth === 'lg' ? '1024px' : '1200px';

  let bgCss = s.backgroundColor && s.backgroundColor !== 'transparent' ? `background-color:${s.backgroundColor};` : '';
  if (s.backgroundType === 'gradient') {
    bgCss = `background:linear-gradient(135deg, ${s.gradientFrom}, ${s.gradientTo});`;
  } else if (s.backgroundType === 'image' && s.backgroundImage) {
    bgCss = `background-image:linear-gradient(rgba(7,20,41,${s.backgroundOverlayOpacity}), rgba(7,20,41,${s.backgroundOverlayOpacity})), url('${escapeHtml(s.backgroundImage)}');background-size:cover;background-position:center;`;
  }

  const sectionStyle = `${bgCss}color:${s.textColor || 'var(--site-text)'};padding:${s.paddingY}px ${s.paddingX}px;margin:${s.marginY}px 0;border-radius:${s.borderRadius}px;${s.borderWidth > 0 ? `border:${s.borderWidth}px solid ${s.borderColor};` : ''}text-align:${s.textAlign === 'center' ? 'center' : s.textAlign === 'end' ? 'end' : 'start'};`;
  const innerStyle = `max-width:${maxW};margin:0 auto;`;

  const webhookConnector = project.connectors['contact-webhook'];
  const formAction =
    webhookConnector?.enabled && webhookConnector.values.webhookUrl
      ? ` action="${escapeHtml(webhookConnector.values.webhookUrl)}" method="${escapeHtml(webhookConnector.values.method || 'POST')}"`
      : '';

  switch (block.type) {
    case 'navbar': {
      const linksHtml = project.navMenu
        .map(
          (item) =>
            `<a ${renderExportAnchorAttrs(resolveNavItemLink(item), project, currentPageId)} class="arsi-nav-link">${escapeHtml(item.label)}</a>`
        )
        .join('');
      const ctaLink = normalizeLegacyLink(c.ctaLink, c.ctaPageId || 'page-contact');
      return `<header ${sectionIdAttr} class="arsi-section" style="${sectionStyle}">
        <div class="arsi-nav-wrap" style="${innerStyle}">
          <a href="index.html" class="arsi-brand">
            ${c.logoUrl ? `<img src="${escapeHtml(c.logoUrl)}" alt="${escapeHtml(c.brandName)}" class="arsi-logo" />` : ''}
            <span>${escapeHtml(c.brandName)}</span>
          </a>
          <nav class="arsi-nav">${linksHtml}</nav>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <a ${renderExportAnchorAttrs(ctaLink, project, currentPageId, 'contact.html')} class="arsi-btn-primary">${escapeHtml(c.ctaLabel || (dir === 'ltr' ? 'Contact' : 'تماس'))}</a>
            ${renderExportCustomButtons(customButtons, project, currentPageId, true)}
          </div>
        </div>
      </header>`;
    }

    case 'hero':
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}">
        <div class="${block.variant === 'b' ? 'arsi-hero-centered' : 'arsi-hero-split'}" style="${innerStyle}">
          <div>
            ${c.kicker ? `<p class="arsi-kicker">${escapeHtml(c.kicker)}</p>` : ''}
            <h1 class="arsi-h1">${escapeHtml(c.headline)}</h1>
            <p class="arsi-lead">${escapeHtml(c.subheadline)}</p>
            <div class="arsi-btn-row">
              ${c.primaryCta ? `<a ${renderExportAnchorAttrs(c.primaryLink, project, currentPageId, '#products')} class="arsi-btn-primary">${escapeHtml(c.primaryCta)}</a>` : ''}
              ${c.secondaryCta ? `<a ${renderExportAnchorAttrs(c.secondaryLink, project, currentPageId, '#contact')} class="arsi-btn-secondary">${escapeHtml(c.secondaryCta)}</a>` : ''}
              ${renderExportCustomButtons(customButtons, project, currentPageId, true)}
            </div>
          </div>
          ${c.imageUrl ? `<div class="arsi-media-box"><img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.imageAlt || '')}" /></div>` : ''}
        </div>
      </section>`;

    case 'stats': {
      const items = (c.items || [])
        .map(
          (item: { value: string; label: string }) =>
            `<div class="arsi-card arsi-stat"><div class="arsi-stat-val">${escapeHtml(item.value)}</div><div class="arsi-muted">${escapeHtml(item.label)}</div></div>`
        )
        .join('');
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}">
        <div style="${innerStyle}">
          ${c.heading ? `<h2 class="arsi-h2">${escapeHtml(c.heading)}</h2>` : ''}
          <div class="arsi-grid-4" style="gap:${s.gap}px;">${items}</div>
          ${renderExportCustomButtons(customButtons, project, currentPageId)}
        </div>
      </section>`;
    }

    case 'features': {
      const items = (c.items || [])
        .map(
          (item: { index?: string; title: string; description: string }) =>
            `<div class="arsi-card">
              ${item.index ? `<div class="arsi-index">${escapeHtml(item.index)}</div>` : ''}
              <h3 class="arsi-h3">${escapeHtml(item.title)}</h3>
              <p class="arsi-muted">${escapeHtml(item.description)}</p>
            </div>`
        )
        .join('');
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}">
        <div style="${innerStyle}">
          <h2 class="arsi-h2">${escapeHtml(c.heading)}</h2>
          ${c.subheading ? `<p class="arsi-muted arsi-sub">${escapeHtml(c.subheading)}</p>` : ''}
          <div class="${block.variant === 'b' ? 'arsi-grid-1' : 'arsi-grid-2'}" style="gap:${s.gap}px;">${items}</div>
          ${renderExportCustomButtons(customButtons, project, currentPageId)}
        </div>
      </section>`;
    }

    case 'products': {
      const items = (c.items || [])
        .map(
          (item: { category?: string; title: string; description: string; imageUrl?: string; ctaLabel?: string; ctaLink?: LinkTarget }) =>
            `<article class="arsi-card arsi-product">
              ${item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" class="arsi-card-img" />` : ''}
              <div class="arsi-card-body">
                ${item.category ? `<span class="arsi-kicker">${escapeHtml(item.category)}</span>` : ''}
                <h3 class="arsi-h3">${escapeHtml(item.title)}</h3>
                <p class="arsi-muted">${escapeHtml(item.description)}</p>
                ${item.ctaLabel ? `<a ${renderExportAnchorAttrs(item.ctaLink, project, currentPageId, 'contact.html')} class="arsi-link">${escapeHtml(item.ctaLabel)}</a>` : ''}
              </div>
            </article>`
        )
        .join('');
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}">
        <div style="${innerStyle}">
          <h2 class="arsi-h2">${escapeHtml(c.heading)}</h2>
          ${c.subheading ? `<p class="arsi-muted arsi-sub">${escapeHtml(c.subheading)}</p>` : ''}
          <div class="${block.variant === 'b' ? 'arsi-grid-1' : 'arsi-grid-3'}" style="gap:${s.gap}px;">${items}</div>
          ${renderExportCustomButtons(customButtons, project, currentPageId)}
        </div>
      </section>`;
    }

    case 'gallery': {
      const items = (c.items || [])
        .map(
          (item: { url: string; caption?: string }) =>
            `<figure class="arsi-card"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.caption || '')}" class="arsi-card-img" />${item.caption ? `<figcaption class="arsi-muted" style="padding:12px;">${escapeHtml(item.caption)}</figcaption>` : ''}</figure>`
        )
        .join('');
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}"><div style="${innerStyle}"><h2 class="arsi-h2">${escapeHtml(c.heading)}</h2><div class="arsi-grid-4" style="gap:${s.gap}px;">${items}</div>${renderExportCustomButtons(customButtons, project, currentPageId)}</div></section>`;
    }

    case 'testimonials': {
      const items = (c.items || [])
        .map(
          (item: { quote: string; author: string; role?: string }) =>
            `<blockquote class="arsi-card"><p style="margin-bottom:14px;">«${escapeHtml(item.quote)}»</p><footer><strong>${escapeHtml(item.author)}</strong> · <span class="arsi-muted">${escapeHtml(item.role || '')}</span></footer></blockquote>`
        )
        .join('');
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}"><div style="${innerStyle}"><h2 class="arsi-h2">${escapeHtml(c.heading)}</h2><div class="arsi-grid-2" style="gap:${s.gap}px;">${items}</div>${renderExportCustomButtons(customButtons, project, currentPageId)}</div></section>`;
    }

    case 'pricing': {
      const plans = (c.plans || [])
        .map(
          (p: { name: string; price: string; description: string; features: string[]; ctaLabel: string; ctaLink?: LinkTarget; highlighted?: boolean }) =>
            `<div class="arsi-card ${p.highlighted ? 'arsi-card-highlight' : ''}">
              <h3 class="arsi-h3">${escapeHtml(p.name)}</h3>
              <div class="arsi-stat-val" style="font-size:1.35rem;margin:8px 0;">${escapeHtml(p.price)}</div>
              <p class="arsi-muted">${escapeHtml(p.description)}</p>
              <ul class="arsi-list">${(p.features || []).map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
              <a ${renderExportAnchorAttrs(p.ctaLink, project, currentPageId, 'contact.html')} class="arsi-btn-primary" style="display:inline-block;margin-top:14px;">${escapeHtml(p.ctaLabel)}</a>
            </div>`
        )
        .join('');
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}"><div style="${innerStyle}"><h2 class="arsi-h2">${escapeHtml(c.heading)}</h2><p class="arsi-muted arsi-sub">${escapeHtml(c.subheading || '')}</p><div class="arsi-grid-3" style="gap:${s.gap}px;">${plans}</div>${renderExportCustomButtons(customButtons, project, currentPageId)}</div></section>`;
    }

    case 'faq': {
      const items = (c.items || [])
        .map(
          (item: { question: string; answer: string }) =>
            `<details class="arsi-card" style="margin-bottom:12px;"><summary style="font-weight:700;cursor:pointer;">${escapeHtml(item.question)}</summary><p class="arsi-muted" style="margin-top:10px;">${escapeHtml(item.answer)}</p></details>`
        )
        .join('');
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}"><div style="${innerStyle}"><h2 class="arsi-h2">${escapeHtml(c.heading)}</h2>${items}${renderExportCustomButtons(customButtons, project, currentPageId)}</div></section>`;
    }

    case 'contact':
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}">
        <div class="arsi-grid-2" style="${innerStyle};gap:${s.gap}px;">
          <div>
            <h2 class="arsi-h2">${escapeHtml(c.heading)}</h2>
            <p class="arsi-muted arsi-sub">${escapeHtml(c.subheading || '')}</p>
            <div class="arsi-card" style="margin-top:16px;">
              <p><strong>${escapeHtml(c.addressLabel)}:</strong> ${escapeHtml(c.addressValue)}</p>
              <p style="margin-top:8px;"><strong>${escapeHtml(c.phoneLabel)}:</strong> ${escapeHtml(c.phoneValue)}</p>
              <p style="margin-top:8px;"><strong>${escapeHtml(c.hoursLabel)}:</strong> ${escapeHtml(c.hoursValue)}</p>
            </div>
          </div>
          <form class="arsi-card arsi-form"${formAction}>
            <input class="arsi-input" type="text" name="name" placeholder="${dir === 'ltr' ? 'Full Name / Company' : 'نام و نام کارگاه'}" required />
            <input class="arsi-input" type="tel" name="phone" placeholder="${dir === 'ltr' ? 'Phone Number' : 'شماره تماس'}" required />
            <textarea class="arsi-input" name="message" rows="4" placeholder="${dir === 'ltr' ? 'Describe your inquiry or machine model...' : 'شرح نیاز یا دستگاه مورد نظر'}"></textarea>
            <button type="submit" class="arsi-btn-primary">${escapeHtml(c.submitLabel || (dir === 'ltr' ? 'Send' : 'ارسال'))}</button>
          </form>
        </div>
        <div style="${innerStyle}">${renderExportCustomButtons(customButtons, project, currentPageId)}</div>
      </section>`;

    case 'map':
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}"><div style="${innerStyle}"><h2 class="arsi-h2">${escapeHtml(c.heading)}</h2><p class="arsi-muted arsi-sub">${escapeHtml(c.caption)} · ${escapeHtml(c.coordinates)}</p>${c.imageUrl ? `<img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.heading)}" class="arsi-card-img" style="border-radius:var(--site-radius);" />` : ''}${renderExportCustomButtons(customButtons, project, currentPageId)}</div></section>`;

    case 'cta':
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}"><div class="arsi-cta-inner" style="${innerStyle}"><div><h2 class="arsi-h2">${escapeHtml(c.headline)}</h2><p class="arsi-muted">${escapeHtml(c.description)}</p></div><div class="arsi-btn-row"><a ${renderExportAnchorAttrs(normalizeLegacyLink(c.ctaLink, 'page-contact'), project, currentPageId, 'contact.html')} class="arsi-btn-primary">${escapeHtml(c.ctaLabel)}</a>${renderExportCustomButtons(customButtons, project, currentPageId, true)}</div></div></section>`;

    case 'richtext':
      return `<section ${sectionIdAttr} class="arsi-section" style="${sectionStyle}"><div style="${innerStyle}"><h2 class="arsi-h2">${escapeHtml(c.heading)}</h2><div class="arsi-prose">${String(c.body || '')
        .split('\n')
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join('')}</div>${renderExportCustomButtons(customButtons, project, currentPageId)}</div></section>`;

    case 'footer':
      return `<footer ${sectionIdAttr} class="arsi-section" style="${sectionStyle}">
        <div style="${innerStyle}">
          <div class="arsi-grid-3" style="gap:24px;">
            <div>
              ${c.logoUrl ? `<img src="${escapeHtml(c.logoUrl)}" alt="${escapeHtml(c.brandName)}" class="arsi-logo" style="margin-bottom:12px;" />` : ''}
              <p class="arsi-muted">${escapeHtml(c.summary)}</p>
            </div>
            <div>
              <p>${escapeHtml(c.address)}</p>
              <p class="arsi-muted" style="margin-top:6px;">${escapeHtml(c.phone)}</p>
              <p class="arsi-muted" style="margin-top:6px;">${escapeHtml(c.email)}</p>
            </div>
            <div>
              <p class="arsi-muted">${escapeHtml(c.copyright)}</p>
            </div>
          </div>
          ${renderExportCustomButtons(customButtons, project, currentPageId)}
        </div>
      </footer>`;
  }
}

export function buildStylesheetCss(project: ProjectData): string {
  const t = project.theme;
  const customFontFaces = (project.uploadedFonts || [])
    .map(
      (f) => `@font-face {
  font-family: '${f.family}';
  src: url('${f.dataUrl}');
  font-weight: ${f.weight || '400'};
  font-display: swap;
}`
    )
    .join('\n');

  return `${customFontFaces}
:root {
  --site-primary: ${t.primary};
  --site-primary-hover: ${t.primaryHover};
  --site-accent: ${t.accent};
  --site-accent-hover: ${t.accentHover};
  --site-bg: ${t.bg};
  --site-surface: ${t.surface};
  --site-text: ${t.text};
  --site-muted: ${t.muted};
  --site-border: ${t.border};
  --site-radius: ${t.baseRadius}px;
  --font-heading: '${t.headingFont}', 'Vazirmatn', Tahoma, sans-serif;
  --font-body: '${t.bodyFont}', 'Vazirmatn', Tahoma, sans-serif;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--site-bg);
  color: var(--site-text);
  font-family: var(--font-body);
  line-height: 1.7;
}
h1, h2, h3, h4 { font-family: var(--font-heading); line-height: 1.3; }
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
.arsi-nav-wrap { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.arsi-brand { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 1.1rem; }
.arsi-logo { height: 34px; width: auto; object-fit: contain; }
.arsi-nav { display: flex; gap: 20px; flex-wrap: wrap; }
.arsi-nav-link { font-size: 0.95rem; opacity: 0.88; }
.arsi-nav-link:hover { opacity: 1; color: var(--site-accent); }
.arsi-hero-split { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 36px; align-items: center; }
.arsi-hero-centered { max-width: 820px; margin: 0 auto; text-align: center; }
.arsi-kicker { color: var(--site-accent); font-size: 0.85rem; font-weight: 600; margin-bottom: 10px; display: block; }
.arsi-h1 { font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 800; margin-bottom: 16px; }
.arsi-h2 { font-size: clamp(1.5rem, 2.5vw, 2.1rem); font-weight: 700; margin-bottom: 14px; }
.arsi-h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 8px; }
.arsi-lead { font-size: 1.05rem; color: var(--site-muted); margin-bottom: 24px; }
.arsi-sub { margin-bottom: 24px; }
.arsi-muted { color: var(--site-muted); font-size: 0.94rem; }
.arsi-btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
.arsi-btn-primary { background: var(--site-accent); color: #fff; padding: 10px 22px; border-radius: var(--site-radius); font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.arsi-btn-primary:hover { background: var(--site-accent-hover); }
.arsi-btn-secondary { border: 1px solid var(--site-border); padding: 10px 22px; border-radius: var(--site-radius); font-weight: 600; }
.arsi-card { background: var(--site-surface); border: 1px solid var(--site-border); border-radius: var(--site-radius); padding: 22px; }
.arsi-card-highlight { border-color: var(--site-accent); }
.arsi-card-img { width: 100%; height: 210px; object-fit: cover; border-radius: calc(var(--site-radius) - 4px); }
.arsi-card-body { padding-top: 14px; }
.arsi-grid-1 { display: grid; grid-template-columns: 1fr; }
.arsi-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.arsi-grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.arsi-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); }
.arsi-stat-val { font-size: 1.8rem; font-weight: 800; color: var(--site-accent); margin-bottom: 6px; }
.arsi-index { font-weight: 800; color: var(--site-accent); margin-bottom: 8px; }
.arsi-link { color: var(--site-accent); font-weight: 600; display: inline-block; margin-top: 10px; }
.arsi-list { list-style: disc inside; margin-top: 12px; display: flex; flex-direction: column; gap: 6px; color: var(--site-muted); }
.arsi-form { display: flex; flex-direction: column; gap: 12px; }
.arsi-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--site-border); background: rgba(0,0,0,0.14); color: inherit; font-family: inherit; }
.arsi-cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.arsi-prose p + p { margin-top: 14px; }
`;
}

export function buildPageHtml(page: PageData, project: ProjectData, dir: 'rtl' | 'ltr', inlineCss = false): string {
  const ga = project.connectors['google-analytics'];
  const gaDef = pluginRegistry.getConnectors().find((c) => c.id === 'google-analytics');
  const gaHead = ga?.enabled && gaDef?.injectHeadHtml ? gaDef.injectHeadHtml(ga.values) : '';

  const blocksHtml = page.blocks.map((b) => renderBlockHtml(b, project, page.id, dir)).join('\n');
  const styleTag = inlineCss
    ? `<style>\n${buildStylesheetCss(project)}\n</style>`
    : `<link rel="stylesheet" href="styles.css" />`;

  return `<!doctype html>
<html lang="${dir === 'rtl' ? 'fa' : 'en'}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.seo.title || page.title)}</title>
  <meta name="description" content="${escapeHtml(page.seo.description || '')}" />
  ${page.seo.ogImage ? `<meta property="og:image" content="${escapeHtml(page.seo.ogImage)}" />` : ''}
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  ${styleTag}
  ${gaHead}
</head>
<body>
${blocksHtml}
</body>
</html>`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportSiteAsZip(project: ProjectData, dir: 'rtl' | 'ltr' = 'rtl'): Promise<void> {
  const zip = new JSZip();
  zip.file('styles.css', buildStylesheetCss(project));

  const assetPaths = new Set<string>();
  const renderedPages: { filename: string; html: string }[] = [];

  for (const page of project.pages) {
    let html = buildPageHtml(page, project, dir, false);
    const matches = html.match(/\/assets\/[A-Za-z0-9_.\-/]+/g);
    if (matches) {
      matches.forEach((m) => assetPaths.add(m));
    }
    html = html.replace(/\/assets\//g, 'assets/');
    renderedPages.push({ filename: pageSlugToFilename(page), html });
  }

  for (const assetPath of assetPaths) {
    try {
      const res = await fetch(assetPath);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        zip.file(assetPath.replace(/^\//, ''), buf);
      }
    } catch {
      // skip unfetchable assets
    }
  }

  for (const p of renderedPages) {
    zip.file(p.filename, p.html);
  }
  zip.file('project.json', JSON.stringify(project, null, 2));
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, 'arsi-industrial-site.zip');
}

export function exportProjectAsJson(project: ProjectData): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  triggerDownload(blob, 'arsi-studio-project.json');
}

let exportersInitialized = false;

export function initializeBuiltInExporters(): void {
  if (exportersInitialized) return;
  exportersInitialized = true;

  registerExporter({
    id: 'html-css-zip',
    nameFa: 'خروجی بسته کامل HTML/CSS (ZIP)',
    nameEn: 'HTML/CSS Website Bundle (.zip)',
    descriptionFa: 'خروجی مستقل تمام صفحات با فایل CSS مشترک و اتصال‌های فعال',
    descriptionEn: 'Self-contained multi-page HTML/CSS bundle with active connectors',
    extension: 'zip',
    execute: async (project) => {
      const currentDir = typeof document !== 'undefined' && document.documentElement.dir === 'ltr' ? 'ltr' : 'rtl';
      return exportSiteAsZip(project, currentDir);
    },
  });

  registerExporter({
    id: 'project-json',
    nameFa: 'خروجی پروژه (JSON)',
    nameEn: 'Project Archive (.json)',
    descriptionFa: 'فایل پشتیبان کامل شامل صفحات، تم، رسانه‌ها و تنظیمات',
    descriptionEn: 'Complete project backup including pages, theme, assets, and connectors',
    extension: 'json',
    execute: async (project) => exportProjectAsJson(project),
  });
}
