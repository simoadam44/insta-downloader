'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { t, type Locale } from '@/lib/i18n';
import type { FaqItem } from '@/lib/seo';

export default function Faq({ locale, faqs }: { locale: Locale; faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-3xl px-4 mt-8 mb-10" aria-labelledby="faq">
      <h2 id="faq" className="text-center text-xl font-semibold">
        {t(locale, 'faq.title')}
      </h2>
      <div className="mt-4 space-y-2">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="border border-sky-200 rounded-md bg-white overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 text-[13px] font-semibold"
              >
                {f.q}
                <ChevronDown size={15} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && <p className="px-3 pb-3 text-[13px] text-slate-600 border-t border-slate-100 pt-2">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
