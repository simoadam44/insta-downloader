import type { MetadataRoute } from 'next';
import { LOCALES, TOOLS } from '@/lib/i18n';
import { siteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const lang of LOCALES) {
    entries.push({ url: `${base}/${lang}`, lastModified: now, changeFrequency: 'daily', priority: 0.9 });
    for (const tool of TOOLS) {
      entries.push({
        url: `${base}/${lang}/${tool}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1
      });
    }
  }
  entries.push({ url: `${base}/terms`, lastModified: now, priority: 0.3 });
  entries.push({ url: `${base}/privacy`, lastModified: now, priority: 0.3 });
  entries.push({ url: `${base}/disclaimer`, lastModified: now, priority: 0.3 });
  return entries;
}
