'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LOCALES, LOCALE_NAMES, type Locale, type ToolSlug } from '@/lib/i18n';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function LanguageSelector({
  locale,
  activeTool
}: {
  locale: Locale;
  activeTool?: ToolSlug;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: Locale) {
    // Replace /<locale> prefix, keep rest of path
    const parts = pathname.split('/');
    parts[1] = next;
    router.push(parts.join('/') || `/${next}`);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-semibold text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {locale.toUpperCase()} <ChevronDown size={12} />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-card border border-slate-100 py-1 text-sm z-50">
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                onClick={() => switchTo(l)}
                className={`w-full text-left px-3 py-1.5 hover:bg-purple-50 ${l === locale ? 'font-bold text-fuchsia-700' : ''}`}
              >
                {LOCALE_NAMES[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Fix: locale.toUpperCase is a function — render correctly
export function __noop() {
  return Link;
}
