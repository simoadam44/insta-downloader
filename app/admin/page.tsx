'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password })
    });
    setLoading(false);
    if (!res.ok) {
      setError('Invalid password.');
      return;
    }
    router.push('/admin/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-600 to-sky-500 p-4">
      <form onSubmit={submit} className="bg-white rounded-xl shadow-card p-6 w-full max-w-sm">
        <h1 className="font-bold flex items-center gap-2">
          <Lock size={16} /> Admin Login
        </h1>
        <p className="text-xs text-slate-500 mt-1">Protected route. Use ADMIN_PASSWORD env var.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="mt-4 w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
        />
        {error && (
          <p role="alert" className="text-xs text-red-600 mt-2">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="mt-3 w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-60 text-white text-sm font-bold py-2 rounded"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
