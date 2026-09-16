import Link from 'next/link';
import { Clapperboard, Image, Film, History, Star } from 'lucide-react';
import type { Locale, ToolSlug } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import LanguageSelector from './LanguageSelector';

const TABS: { slug: ToolSlug; icon: React.ReactNode; labelKey: string }[] = [
  { slug: 'video-downloader', icon: <Clapperboard size={14} />, labelKey: 'nav.video' },
  { slug: 'photo-downloader', icon: <Image size={14} />, labelKey: 'nav.photo' },
  { slug: 'reels-downloader', icon: <Film size={14} />, labelKey: 'nav.reels' },
  { slug: 'story-saver', icon: <History size={14} />, labelKey: 'nav.story' },
  { slug: 'highlights-downloader', icon: <Star size={14} />, labelKey: 'nav.highlights' }
];

export function toolPath(locale: Locale, slug: ToolSlug) {
  return `/${locale}/${slug}`;
}

export default function Header({
  locale,
  activeTool
}: {
  locale: Locale;
  activeTool: ToolSlug;
}) {
  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 z-40 border-b border-purple-100">
      <div className="mx-auto max-w-5xl px-4 flex h-12 items-center justify-between gap-2">
        <Link href={`/${locale}`} className="flex items-center gap-1 font-extrabold text-sm" aria-label="SSSInstagram home">
          <span className="bg-gradient-to-r from-fuchsia-600 to-sky-500 text-white rounded px-1.5 py-0.5">SSS</span>
          <span className="text-fuchsia-600">Instagram</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-[13px]" aria-label="Tools">
          {TABS.map((tb) => (
            <Link
              key={tb.slug}
              href={toolPath(locale, tb.slug)}
              className={`px-2.5 py-1.5 rounded-full hover:bg-purple-50 ${
                activeTool === tb.slug ? 'text-fuchsia-700 font-semibold bg-purple-50' : 'text-slate-600'
              }`}
            >
              {t(locale, tb.labelKey)}
            </Link>
          ))}
        </nav>
        <LanguageSelector locale={locale} activeTool={activeTool} />
      </div>
      {/* mobile tabs */}
      <div className="md:hidden overflow-x-auto border-t border-purple-50">
        <div className="flex gap-1 px-3 py-1.5 text-xs whitespace-nowrap">
          {TABS.map((tb) => (
            <Link
              key={tb.slug}
              href={toolPath(locale, tb.slug)}
              className={`px-2.5 py-1 rounded-full ${
                activeTool === tb.slug ? 'bg-purple-100 text-fuchsia-700 font-semibold' : 'text-slate-600'
              }`}
            >
              {t(locale, tb.labelKey)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

export { TABS };
