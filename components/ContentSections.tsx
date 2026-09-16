import { t, type Locale } from '@/lib/i18n';
import { Download, Smartphone, Zap, EyeOff, Infinity as InfinityIcon, Glasses } from 'lucide-react';

export function HowTo({ locale }: { locale: Locale }) {
  return (
    <section className="mx-auto max-w-3xl px-4 mt-6" aria-labelledby="howto">
      <div className="bg-gradient-to-br from-violet-700 to-indigo-600 rounded-xl text-white p-6 md:p-8">
        <h2 id="howto" className="text-xl md:text-2xl font-semibold text-center">
          {t(locale, 'how.title')}
        </h2>
        <ol className="mt-5 space-y-4 text-sm max-w-xl mx-auto">
          {[1, 2, 3].map((i) => (
            <li key={i}>
              <p className="font-bold">{t(locale, `how.s${i}.t`)}</p>
              <p className="text-white/85 text-[13px]">{t(locale, `how.s${i}.d`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function MobileAppBanner({ locale }: { locale: Locale }) {
  return (
    <section className="mx-auto max-w-3xl px-4 mt-5">
      <div className="rounded-xl border border-fuchsia-200 bg-white shadow-card overflow-hidden flex">
        <div className="hidden sm:flex w-44 shrink-0 bg-gradient-to-br from-violet-100 to-fuchsia-50 items-center justify-center p-4">
          <Smartphone size={72} className="text-violet-500" aria-hidden />
        </div>
        <div className="p-5">
          <h2 className="font-bold text-slate-800">{t(locale, 'app.title')}</h2>
          <p className="text-[13px] text-slate-600 mt-1">{t(locale, 'app.desc')}</p>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 mt-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded"
          >
            <Download size={13} /> {t(locale, 'app.cta')}
          </a>
        </div>
      </div>
    </section>
  );
}

export function FeatureBlocks({ locale }: { locale: Locale }) {
  return (
    <section className="mx-auto max-w-3xl px-4 mt-8 space-y-8">
      <h2 className="text-center text-xl font-semibold text-indigo-900">Instagram Highlights Downloader</h2>
      <div className="grid md:grid-cols-[120px_1fr] gap-4 items-start">
        <div className="mx-auto w-24 h-32 rounded-lg bg-gradient-to-br from-violet-300 to-fuchsia-200 flex items-center justify-center">
          <Zap size={36} className="text-white" aria-hidden />
        </div>
        <div>
          <h3 className="font-bold text-indigo-900 text-sm">Highlights Downloader</h3>
          <p className="text-[13px] text-slate-600 mt-1">
            Download featured Instagram stories without providing any information. Free and easy to use, in original quality.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-[1fr_120px] gap-4 items-start">
        <div>
          <h3 className="font-bold text-indigo-900 text-sm">Story Saver</h3>
          <p className="text-[13px] text-slate-600 mt-1">
            Save Instagram stories before they disappear within 24 hours. No screenshots needed — download anonymously.
          </p>
        </div>
        <div className="mx-auto w-24 h-32 rounded-lg bg-gradient-to-br from-sky-200 to-emerald-100 flex items-center justify-center">
          <EyeOff size={36} className="text-white" aria-hidden />
        </div>
      </div>
    </section>
  );
}

export function WhyUs({ locale }: { locale: Locale }) {
  const feats = [
    { icon: <InfinityIcon size={40} className="text-sky-500" aria-hidden />, t1: t(locale, 'why.f1.t'), d: t(locale, 'why.f1.d') },
    { icon: <Glasses size={40} className="text-amber-600" aria-hidden />, t1: t(locale, 'why.f2.t'), d: t(locale, 'why.f2.d') },
    { icon: <Zap size={40} className="text-yellow-500" aria-hidden />, t1: t(locale, 'why.f3.t'), d: t(locale, 'why.f3.d') }
  ];
  return (
    <section className="mx-auto max-w-3xl px-4 mt-8" aria-labelledby="why">
      <div className="rounded-xl border border-fuchsia-200 bg-white shadow-card p-6">
        <h2 id="why" className="text-center text-xl font-semibold text-indigo-900">
          {t(locale, 'why.title')}
        </h2>
        <div className="mt-5 space-y-5">
          {feats.map((f) => (
            <div key={f.t1} className="flex gap-4 items-start">
              <div className="shrink-0 w-14 flex justify-center">{f.icon}</div>
              <div>
                <h3 className="font-bold text-indigo-900 text-sm">{f.t1}</h3>
                <p className="text-[13px] text-slate-600">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
