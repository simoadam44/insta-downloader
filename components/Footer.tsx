import Link from 'next/link';
import { t, LOCALES, TOOLS, type Locale, TOOL_KEYS } from '@/lib/i18n';
import { SITE_NAME } from '@/lib/site';

export default function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center">
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] uppercase text-slate-500" aria-label="Tools">
          {TOOLS.map((tool) => (
            <Link key={tool} href={`/${locale}/${tool}`} className="hover:text-fuchsia-700">
              {TOOL_KEYS[tool]} downloader
            </Link>
          ))}
        </nav>
        <nav className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] uppercase text-slate-500" aria-label="Legal">
          <Link href={`/${locale}`} className="hover:text-fuchsia-700">How to download</Link>
          <Link href="/privacy" className="hover:text-fuchsia-700">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-fuchsia-700">About</Link>
          <Link href="/terms" className="hover:text-fuchsia-700">Terms</Link>
          <Link href="/disclaimer" className="hover:text-fuchsia-700">Disclaimer</Link>
        </nav>
        <nav className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-slate-400" aria-label="Languages">
          {LOCALES.map((l) => (
            <Link key={l} href={`/${l}`} className="hover:text-fuchsia-700">
              {l.toUpperCase()}
            </Link>
          ))}
        </nav>
        <p className="mt-4 text-xs">
          <span className="bg-gradient-to-r from-fuchsia-600 to-sky-500 text-white rounded px-1.5 py-0.5 font-extrabold">SSS</span>{' '}
          <span className="text-fuchsia-600 font-bold">{SITE_NAME.replace('SSS', '')}</span>
        </p>
        <p className="text-[11px] text-slate-400 mt-1">2018–2026 • {t(locale, 'footer.rights')}</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xl mx-auto">{t(locale, 'footer.disclaimer')}</p>
      </div>
    </footer>
  );
}
