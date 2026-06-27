'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, ShieldCheck } from 'lucide-react';
import { login } from '@/lib/auth';
import { getPublicBranding, logoThumb } from '@/lib/site';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    getPublicBranding().then((b) => setLogo(b.logo_url));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-dark px-5">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 80% at 50% 0%, rgba(201,162,39,0.16) 0%, rgba(201,162,39,0) 60%)',
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoThumb(logo)} alt="First Choice Roofing" className="mx-auto mb-4 h-16 w-auto" />
          ) : (
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-brand-gold text-lg font-extrabold text-brand-ink">
              FC
            </div>
          )}
          <h1 className="text-xl font-bold text-white">First Choice Roofing</h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/60">
            <ShieldCheck size={14} className="text-brand-gold" /> Admin Dashboard
          </p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-7 shadow-card">
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
            placeholder="admin@firstchoiceroofingservice.com"
            autoComplete="username"
          />

          <label className="label">Password</label>
          <input
            type="password"
            required
            className="input mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading} className="btn-primary w-full">
            <LogIn size={18} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-white/40">
          © {new Date().getFullYear()} First Choice Roofing Services
        </p>
      </div>
    </div>
  );
}
