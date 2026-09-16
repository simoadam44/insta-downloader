'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ClipboardPaste, X, Download, Loader2, BadgeCheck, PlayCircle } from 'lucide-react';
import type { Locale, ToolSlug } from '@/lib/i18n';
import { t, TOOL_KEYS } from '@/lib/i18n';
import { TABS, toolPath } from './Header';
import { extractMedia, isInstagramUrl, type ExtractResult } from '@/lib/instagram';

export default function Downloader({ locale, activeTool }: { locale: Locale; activeTool: ToolSlug }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const toolKey = TOOL_KEYS[activeTool];

  async function onPaste() {
    try {
      const txt = await navigator.clipboard.readText();
      if (txt) setUrl(txt.trim());
    } catch {
      setError('Clipboard access denied — paste manually.');
    }
  }

  async function onDownload() {
    setError(null);
    setResult(null);
    const v = url.trim();
    if (!v) {
      setError('Please paste an Instagram link first.');
      return;
    }
    if (!isInstagramUrl(v)) {
      setError('That does not look like a valid Instagram URL.');
      return;
    }
    setLoading(true);
    try {
      const r = await extractMedia(v);
      setResult(r);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch media.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-gradient-to-r from-fuchsia-600 via-violet-500 to-sky-500">
      {/* desktop tab pills */}
      <div className="hidden md:flex justify-center gap-2 pt-4 text-xs text-white">
        {TABS.map((tb) => (
          <Link
            key={tb.slug}
            href={toolPath(locale, tb.slug)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
              activeTool === tb.slug ? 'bg-white/25 font-semibold' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span className="opacity-90">{tb.icon}</span>
            {t(locale, tb.labelKey)}
          </Link>
        ))}
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-6 pb-8 text-center">
        <h1 className="text-white text-2xl md:text-3xl font-light">{t(locale, `hero.${toolKey}.title`)}</h1>
        <p className="text-white/85 text-sm mt-1">{t(locale, 'hero.subtitle')}</p>

        <div className="mt-5 flex items-stretch gap-0 rounded overflow-hidden shadow-card bg-white">
          <label htmlFor="ig-url" className="sr-only">
            Instagram URL
          </label>
          <input
            id="ig-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t(locale, 'hero.placeholder')}
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none"
          />
          {url && (
            <button
              onClick={() => {
                setUrl('');
                setResult(null);
                setError(null);
              }}
              aria-label={t(locale, 'hero.clear')}
              className="px-2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onPaste}
            className="flex items-center gap-1 px-2.5 text-xs border-l border-slate-100 text-slate-600 hover:bg-slate-50"
          >
            <ClipboardPaste size={14} /> {t(locale, 'hero.paste')}
          </button>
          <button
            onClick={onDownload}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-70 text-white text-xs font-bold px-5 flex items-center gap-1.5"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {t(locale, 'hero.download')}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 inline-block bg-red-600/90 text-white text-xs px-3 py-1.5 rounded">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-4 text-left bg-white rounded-xl shadow-card p-3 md:p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <BadgeCheck size={14} className="text-green-600" />
              <span className="font-semibold text-slate-700">@{result.author}</span>
              <span className="ml-auto rounded bg-purple-100 text-purple-700 px-2 py-0.5 font-semibold">
                {result.detectedType === 'video' ? 'video' : result.detectedType}
              </span>
            </div>
            {result.caption && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{result.caption}</p>}
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {result.items.map((m) => (
                <article key={m.id} className="border border-slate-100 rounded-lg overflow-hidden">
                  {m.type === 'video' ? (
                    <video
                      src={m.url}
                      poster={m.thumbnail}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full aspect-video bg-slate-900"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={m.thumbnail}
                      alt={result.caption?.slice(0, 80) || 'Instagram media preview'}
                      loading="lazy"
                      width={640}
                      height={360}
                      className="w-full aspect-video object-cover bg-slate-100"
                    />
                  )}
                  <div className="flex items-center gap-2 p-2.5">
                    <span className="text-[11px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      {m.quality}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      {m.type === 'video' && <PlayCircle size={12} />}
                      {m.type.toUpperCase()}
                    </span>
                    <a
                      href={`/api/download?url=${encodeURIComponent(m.url)}&filename=${encodeURIComponent(m.id)}`}
                      className="ml-auto text-xs font-bold bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-3 py-1.5 rounded"
                    >
                      Download
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
