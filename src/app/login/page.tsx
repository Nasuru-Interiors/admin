'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace('/');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-ink px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-extrabold text-brand-primary">First Choice Roofing</h1>
          <p className="mt-1 text-sm text-gray-500">Admin Dashboard</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <label className="label">Email</label>
        <input
          type="email"
          required
          className="input mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@firstchoice.com"
        />

        <label className="label">Password</label>
        <input
          type="password"
          required
          className="input mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
