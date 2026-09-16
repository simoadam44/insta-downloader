import type { Locale, ToolSlug } from './i18n';
import { LOCALES, TOOL_KEYS } from './i18n';
import { t } from './i18n';

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://your-project.vercel.app'
  );
}

export function canonicalFor(locale: Locale, tool?: ToolSlug): string {
  return tool ? `${siteUrl()}/${locale}/${tool}` : `${siteUrl()}/${locale}`;
}

export function hreflangLinks(tool?: ToolSlug) {
  return LOCALES.map((l) => ({
    hreflang: l,
    href: tool ? `${siteUrl()}/${l}/${tool}` : `${siteUrl()}/${l}`
  }));
}

export function metaFor(locale: Locale, tool: ToolSlug) {
  const key = TOOL_KEYS[tool];
  const title = `${t(locale, `hero.${key}.title`)} — Fast, Free & Anonymous | SSSInstagram`;
  const description = `${t(locale, `hero.${key}.title`)}. ${t(locale, 'hero.subtitle')}`;
  return { title, description };
}

export function webAppSchema(locale: Locale, tool: ToolSlug) {
  const { title, description } = metaFor(locale, tool);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    url: canonicalFor(locale, tool),
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description,
    inLanguage: locale
  };
}

export function howToSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t(locale, 'how.title'),
    step: [1, 2, 3].map((i) => ({
      '@type': 'HowToStep',
      position: i,
      name: t(locale, `how.s${i}.t`),
      text: t(locale, `how.s${i}.d`)
    }))
  };
}

export type FaqItem = { q: string; a: string };

export function faqsFor(locale: Locale, tool: ToolSlug): FaqItem[] {
  const key = TOOL_KEYS[tool];
  const label =
    key === 'highlights'
      ? 'Highlight Downloader'
      : key === 'story'
        ? 'Story Saver'
        : `${key[0].toUpperCase()}${key.slice(1)} Downloader`;
  return [
    {
      q: `What formats does ${label} support?`,
      a: `${label} supports MP4 for videos and JPEG/PNG for images. Choose your preferred format when downloading.`
    },
    {
      q: 'Are downloaded files of original quality?',
      a: 'Yes. We retain the highest quality available, maintaining the original resolution (up to 1080p MP4 / HD JPG).'
    },
    {
      q: `Is it safe and legal to use ${label}?`,
      a: 'It is safe as long as you adhere to copyright laws. Download only content that you own or have permission to use.'
    },
    {
      q: `Do I need to install any software to use ${label}?`,
      a: 'No. It is fully web-based. No software installation is required, on mobile or desktop.'
    }
  ];
}

export function faqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}
