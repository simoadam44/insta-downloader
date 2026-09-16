'use client';
import { useEffect, useState } from 'react';
import { BarChart3, Globe, Megaphone, Settings, LogOut } from 'lucide-react';
import { LOCALES, TOOLS, type Locale } from '@/lib/i18n';

type Store = {
  stats: { requests: number; success: number; fail: number; bytes: number };
  seo: Record<string, { title: string; description: string; faqs: string }>;
  ads: Record<string, { enabled: boolean; code: string }>;
  api: { endpoint: string; apiKey?: string; proxies: string; rateLimit: string };
};

const TABS = [
  { id: 'stats', label: 'Overview', icon: <BarChart3 size={14} /> },
  { id: 'seo', label: 'Content & SEO', icon: <Globe size={14} /> },
  { id: 'ads', label: 'Ad Spaces', icon: <Megaphone size={14} /> },
  { id: 'api', label: 'API Config', icon: <Settings size={14} /> }
] as const;

export default function AdminDashboard() {
  const [store, setStore] = useState<Store | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('stats');
  const [lang, setLang] = useState<Locale>('en');
  const [tool, setTool] = useState<string>(TOOLS[4]);
  const [msg, setMsg] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testOut, setTestOut] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/config')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStore)
      .catch(() => (window.location.href = '/admin'));
  }, []);

  async function save(patch: Partial<Store>) {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const j = await res.json();
    if (j.store) setStore(j.store);
    setMsg('Saved ✓');
    setTimeout(() => setMsg(null), 1500);
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    window.location.href = '/admin';
  }

  async function testExtractor() {
    setTesting(true);
    setTestOut(null);
    try {
      // Save first so the test uses the current endpoint/key.
      await save({ api: store!.api });
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: 'https://www.instagram.com/p/DdM_3N1vjci/' })
      });
      const j = await res.json().catch(() => ({}));
      const summary = j.items
        ? `OK (${res.status}): ${j.items.length} item(s), type=${j.detectedType}, author=@${j.author}`
        : `FAILED (${res.status}): ${j.error || 'unknown error'}`;
      setTestOut(`${summary}\n\n${JSON.stringify(j, null, 2).slice(0, 2000)}`);
    } catch (e: any) {
      setTestOut(`Request failed: ${e.message}`);
    } finally {
      setTesting(false);
    }
  }

  if (!store) return <p className="p-8 text-sm">Loading admin…</p>;

  const seoKey = `${lang}/${tool}`;
  const seoVal = store.seo[seoKey] || { title: '', description: '', faqs: '' };
  const rate = store.stats.requests
    ? ((store.stats.success / store.stats.requests) * 100).toFixed(1)
    : '0';

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-2">
        <h1 className="font-bold text-sm">SSSInstagram Admin</h1>
        <nav className="ml-4 flex gap-1 text-xs">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${tab === t.id ? 'bg-fuchsia-100 text-fuchsia-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="ml-auto text-xs flex items-center gap-1 text-slate-500 hover:text-red-600">
          <LogOut size={13} /> Logout
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {msg && <p className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded mb-3">{msg}</p>}

        {tab === 'stats' && (
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              ['Total requests', store.stats.requests.toLocaleString()],
              ['Success rate', `${rate}%`],
              ['Failures', store.stats.fail.toLocaleString()],
              ['Bandwidth', `${(store.stats.bytes / 1024 ** 3).toFixed(1)} GB`]
            ].map(([k, v]) => (
              <div key={k} className="bg-white rounded-lg border p-4">
                <p className="text-[11px] uppercase text-slate-400">{k}</p>
                <p className="text-xl font-extrabold">{v}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'seo' && (
          <div className="bg-white rounded-lg border p-4 space-y-3">
            <div className="flex gap-2 text-xs">
              <select value={lang} onChange={(e) => setLang(e.target.value as Locale)} className="border rounded px-2 py-1.5">
                {LOCALES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <select value={tool} onChange={(e) => setTool(e.target.value)} className="border rounded px-2 py-1.5">
                {TOOLS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <label className="block text-xs font-semibold">SEO Title
              <input
                value={seoVal.title}
                onChange={(e) => setStore({ ...store, seo: { ...store.seo, [seoKey]: { ...seoVal, title: e.target.value } } })}
                placeholder="Custom title override"
                className="mt-1 w-full border rounded px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-xs font-semibold">Meta description
              <textarea
                value={seoVal.description}
                onChange={(e) => setStore({ ...store, seo: { ...store.seo, [seoKey]: { ...seoVal, description: e.target.value } } })}
                rows={3}
                className="mt-1 w-full border rounded px-3 py-2 font-normal"
              />
            </label>
            <button
              onClick={() => save({ seo: { [seoKey]: seoVal } })}
              className="bg-fuchsia-600 text-white text-xs font-bold px-4 py-2 rounded"
            >
              Save SEO
            </button>
          </div>
        )}

        {tab === 'ads' && (
          <div className="space-y-3">
            {Object.entries(store.ads).map(([slot, cfg]) => (
              <div key={slot} className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={cfg.enabled}
                    onChange={(e) =>
                      setStore({ ...store, ads: { ...store.ads, [slot]: { ...cfg, enabled: e.target.checked } } })
                    }
                  />
                  {slot}
                </div>
                <textarea
                  value={cfg.code}
                  onChange={(e) =>
                    setStore({ ...store, ads: { ...store.ads, [slot]: { ...cfg, code: e.target.value } } })
                  }
                  placeholder="Paste AdSense / native ad script here"
                  rows={2}
                  className="mt-2 w-full border rounded px-3 py-2 text-xs font-mono"
                />
              </div>
            ))}
            <button onClick={() => save({ ads: store.ads })} className="bg-fuchsia-600 text-white text-xs font-bold px-4 py-2 rounded">
              Save Ads
            </button>
          </div>
        )}

        {tab === 'api' && (
          <div className="bg-white rounded-lg border p-4 space-y-3 text-xs">
            <p className="text-slate-500">
              Instagram blocks direct server fetching, so the app needs an extractor backend.
              Two free options: <strong>(A)</strong> a free RapidAPI Instagram-downloader key —
              sign up at rapidapi.com, subscribe (free tier) to an Instagram downloader API,
              paste its endpoint + key below; <strong>(B)</strong> your own Cobalt instance
              (<code className="bg-slate-100 px-1 rounded">docker run -d --name cobalt -p 9000:9000 ghcr.io/imputnet/cobalt:latest</code>).
              For production, mirror these as Vercel env vars{' '}
              <code className="bg-slate-100 px-1 rounded">EXTRACTOR_API_URL</code> /{' '}
              <code className="bg-slate-100 px-1 rounded">EXTRACTOR_API_KEY</code>.
            </p>
            <label className="block font-semibold">Backend API Endpoint (POST-first, GET ?url= fallback)
              <input value={store.api.endpoint} onChange={(e) => setStore({ ...store, api: { ...store.api, endpoint: e.target.value } })} placeholder="https://xxx.p.rapidapi.com/... or https://YOUR-INSTANCE/api/json" className="mt-1 w-full border rounded px-3 py-2 font-normal" />
            </label>
            <label className="block font-semibold">API Key (sent as Bearer + x-rapidapi-key)
              <input
                type="password"
                value={(store.api as { apiKey?: string }).apiKey || ''}
                onChange={(e) => setStore({ ...store, api: { ...store.api, apiKey: e.target.value } as typeof store.api })}
                placeholder="RapidAPI key or Cobalt API key (optional)"
                className="mt-1 w-full border rounded px-3 py-2 font-normal font-mono"
              />
            </label>
            <label className="block font-semibold">Rotating proxies (one per line)
              <textarea value={store.api.proxies} onChange={(e) => setStore({ ...store, api: { ...store.api, proxies: e.target.value } })} rows={3} className="mt-1 w-full border rounded px-3 py-2 font-normal font-mono" />
            </label>
            <label className="block font-semibold">Rate limit (req/min)
              <input value={store.api.rateLimit} onChange={(e) => setStore({ ...store, api: { ...store.api, rateLimit: e.target.value } })} className="mt-1 w-32 border rounded px-3 py-2 font-normal" />
            </label>
            <div className="flex gap-2">
              <button onClick={() => save({ api: store.api })} className="bg-fuchsia-600 text-white text-xs font-bold px-4 py-2 rounded">
                Save API config
              </button>
              <button onClick={() => testExtractor()} className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded">
                {testing ? 'Testing…' : 'Test connection'}
              </button>
            </div>
            {testOut && (
              <pre className="bg-slate-900 text-green-300 text-[11px] p-3 rounded overflow-auto max-h-64 whitespace-pre-wrap">
                {testOut}
              </pre>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
