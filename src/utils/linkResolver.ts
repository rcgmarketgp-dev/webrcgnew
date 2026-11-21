import {
  BlockType,
  Language,
  LinkTarget,
  NavMenuItem,
  PageData,
  ProjectData,
} from '../types/editor';

export interface CategorizedLinkSuggestion {
  id: string;
  category: 'pages' | 'currentSections' | 'otherSections' | 'quick';
  title: string;
  subtitle?: string;
  target: LinkTarget;
}

const BLOCK_TYPE_NAMES: Record<BlockType, { fa: string; en: string }> = {
  navbar: { fa: 'نوار ناوبری', en: 'Navbar' },
  hero: { fa: 'معرفی اصلی', en: 'Hero' },
  features: { fa: 'ویژگی‌ها', en: 'Features' },
  products: { fa: 'محصولات', en: 'Products' },
  gallery: { fa: 'گالری تصاویر', en: 'Gallery' },
  testimonials: { fa: 'نظرات مشتریان', en: 'Testimonials' },
  pricing: { fa: 'تعرفه و خدمات', en: 'Pricing' },
  stats: { fa: 'آمار و ارقام', en: 'Stats' },
  faq: { fa: 'سوالات متداول', en: 'FAQ' },
  contact: { fa: 'فرم تماس', en: 'Contact' },
  map: { fa: 'نقشه', en: 'Map' },
  cta: { fa: 'دعوت به اقدام', en: 'CTA Banner' },
  richtext: { fa: 'متن آزاد', en: 'Rich Text' },
  footer: { fa: 'پاورقی (Footer)', en: 'Footer' },
};

export function sanitizeExternalUrl(raw?: string): string {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return '#';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function normalizeLegacyLink(
  link?: LinkTarget,
  fallbackPageId?: string,
  fallbackExternalUrl?: string
): LinkTarget | undefined {
  if (link && link.kind) return link;
  if (fallbackExternalUrl && fallbackExternalUrl.trim()) {
    return {
      kind: 'external',
      url: fallbackExternalUrl.trim(),
      openInNewTab: true,
    };
  }
  if (fallbackPageId && fallbackPageId.trim()) {
    return {
      kind: 'page',
      pageId: fallbackPageId.trim(),
    };
  }
  return undefined;
}

export function resolveNavItemLink(item: NavMenuItem): LinkTarget {
  if (item.link && item.link.kind) return item.link;
  if (item.externalUrl && item.externalUrl.trim()) {
    return {
      kind: 'external',
      url: item.externalUrl.trim(),
      openInNewTab: true,
    };
  }
  return {
    kind: 'page',
    pageId: item.pageId,
  };
}

export function buildCategorizedLinks(
  project: ProjectData,
  activePageId: string,
  lang: Language
): CategorizedLinkSuggestion[] {
  const suggestions: CategorizedLinkSuggestion[] = [];

  // 1. Site Pages
  for (const page of project.pages) {
    suggestions.push({
      id: `page:${page.id}`,
      category: 'pages',
      title: page.title,
      subtitle: page.slug || '/',
      target: {
        kind: 'page',
        pageId: page.id,
        labelSnapshot: page.title,
      },
    });
  }

  // 2. Current Page Sections
  const currentPage = project.pages.find((p) => p.id === activePageId) ?? project.pages[0];
  if (currentPage) {
    for (const blk of currentPage.blocks) {
      if (blk.hidden) continue;
      const typeLabel = BLOCK_TYPE_NAMES[blk.type]?.[lang] ?? blk.type;
      suggestions.push({
        id: `sec-curr:${blk.id}`,
        category: 'currentSections',
        title: blk.label || typeLabel,
        subtitle: `${typeLabel} · ${currentPage.title}`,
        target: {
          kind: 'section',
          pageId: currentPage.id,
          blockId: blk.id,
          labelSnapshot: blk.label || typeLabel,
        },
      });
    }
  }

  // 3. Other Pages' Sections
  for (const page of project.pages) {
    if (currentPage && page.id === currentPage.id) continue;
    for (const blk of page.blocks) {
      if (blk.hidden) continue;
      const typeLabel = BLOCK_TYPE_NAMES[blk.type]?.[lang] ?? blk.type;
      suggestions.push({
        id: `sec-other:${page.id}:${blk.id}`,
        category: 'otherSections',
        title: `${blk.label || typeLabel}`,
        subtitle: `${page.title} (${typeLabel})`,
        target: {
          kind: 'section',
          pageId: page.id,
          blockId: blk.id,
          labelSnapshot: `${page.title} — ${blk.label || typeLabel}`,
        },
      });
    }
  }

  // 4. Quick Actions & Contact (discovered from project blocks)
  suggestions.push({
    id: 'quick:top',
    category: 'quick',
    title: lang === 'fa' ? 'بازگشت به بالای صفحه' : 'Scroll to Top',
    subtitle: '#top',
    target: {
      kind: 'external',
      url: '#top',
      openInNewTab: false,
      labelSnapshot: lang === 'fa' ? 'بالای صفحه' : 'Top of Page',
    },
  });

  const phones = new Set<string>();
  const emails = new Set<string>();
  for (const page of project.pages) {
    for (const blk of page.blocks) {
      const phoneRaw = blk.content?.phoneValue || blk.content?.phone;
      if (typeof phoneRaw === 'string' && phoneRaw.trim()) {
        phones.add(phoneRaw.trim());
      }
      const emailRaw = blk.content?.email;
      if (typeof emailRaw === 'string' && emailRaw.includes('@')) {
        emails.add(emailRaw.trim());
      }
    }
  }

  phones.forEach((phone) => {
    const telClean = phone.replace(/[^\d+]/g, '');
    if (telClean) {
      suggestions.push({
        id: `quick:tel:${telClean}`,
        category: 'quick',
        title: lang === 'fa' ? `تماس تلفنی: ${phone}` : `Call: ${phone}`,
        subtitle: `tel:${telClean}`,
        target: {
          kind: 'external',
          url: `tel:${telClean}`,
          openInNewTab: false,
          labelSnapshot: phone,
        },
      });
    }
  });

  emails.forEach((email) => {
    suggestions.push({
      id: `quick:mail:${email}`,
      category: 'quick',
      title: lang === 'fa' ? `ارسال ایمیل: ${email}` : `Email: ${email}`,
      subtitle: `mailto:${email}`,
      target: {
        kind: 'external',
        url: `mailto:${email}`,
        openInNewTab: false,
        labelSnapshot: email,
      },
    });
  });

  return suggestions;
}

export function describeLinkTarget(
  link: LinkTarget | undefined,
  project: ProjectData,
  lang: Language
): string {
  if (!link) {
    return lang === 'fa' ? 'بدون لینک' : 'No link';
  }
  if (link.kind === 'page') {
    const page = project.pages.find((p) => p.id === link.pageId);
    if (page) return `${lang === 'fa' ? 'صفحه' : 'Page'}: ${page.title}`;
    return link.labelSnapshot || (lang === 'fa' ? 'صفحه سایت' : 'Site Page');
  }
  if (link.kind === 'section') {
    const page = project.pages.find((p) => p.id === link.pageId);
    const blk = page?.blocks.find((b) => b.id === link.blockId);
    if (blk && page) {
      return `${lang === 'fa' ? 'بخش' : 'Section'}: ${blk.label} (${page.title})`;
    }
    return link.labelSnapshot || (lang === 'fa' ? 'بخش سایت' : 'Site Section');
  }
  const url = (link.url || '').trim();
  if (url === '#top') return lang === 'fa' ? 'بالای صفحه' : 'Top of Page';
  if (url.startsWith('tel:')) return `${lang === 'fa' ? 'تماس' : 'Call'}: ${url.slice(4)}`;
  if (url.startsWith('mailto:')) return `${lang === 'fa' ? 'ایمیل' : 'Email'}: ${url.slice(7)}`;
  try {
    const parsed = new URL(sanitizeExternalUrl(url));
    return parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
  } catch {
    return url || (lang === 'fa' ? 'لینک بیرونی' : 'External URL');
  }
}

export function pageSlugToExportFile(page: PageData): string {
  if (page.isHome || page.slug === '/') return 'index.html';
  const cleaned = page.slug.replace(/^\/+/, '').replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '-');
  return `${cleaned || page.id}.html`;
}

export function resolveExportHref(
  link: LinkTarget | undefined,
  project: ProjectData,
  currentPageId: string,
  fallbackHref = '#'
): { href: string; targetBlank: boolean } {
  if (!link) return { href: fallbackHref, targetBlank: false };

  if (link.kind === 'external') {
    const href = sanitizeExternalUrl(link.url);
    const isHttp = href.startsWith('http://') || href.startsWith('https://');
    return { href, targetBlank: Boolean(link.openInNewTab && isHttp) };
  }

  if (link.kind === 'page') {
    const targetPage = project.pages.find((p) => p.id === link.pageId);
    return {
      href: targetPage ? pageSlugToExportFile(targetPage) : fallbackHref,
      targetBlank: false,
    };
  }

  if (link.kind === 'section') {
    const anchor = link.blockId ? `#section-${link.blockId}` : '#top';
    if (!link.pageId || link.pageId === currentPageId) {
      return { href: anchor, targetBlank: false };
    }
    const targetPage = project.pages.find((p) => p.id === link.pageId);
    const file = targetPage ? pageSlugToExportFile(targetPage) : 'index.html';
    return { href: `${file}${anchor}`, targetBlank: false };
  }

  return { href: fallbackHref, targetBlank: false };
}
