'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import type { SiteSettings } from '@/lib/types';

export default function AppearancePage() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<SiteSettings>('/site-settings').then(setS).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!s) return <p className="text-sm text-gray-400">Loading…</p>;

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setS((prev) => (prev ? { ...prev, [k]: v } : prev));

  async function save() {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await api.put('/site-settings', s);
      setMsg('Appearance saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-ink">Appearance</h1>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {msg && <p className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{msg}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <p className="text-sm font-bold text-brand-ink">Brand Colors</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Primary (red)</label>
              <input type="color" className="h-10 w-full rounded-lg border" value={s.primary_color} onChange={(e) => set('primary_color', e.target.value)} />
            </div>
            <div>
              <label className="label">Secondary (white)</label>
              <input type="color" className="h-10 w-full rounded-lg border" value={s.secondary_color} onChange={(e) => set('secondary_color', e.target.value)} />
            </div>
            <div>
              <label className="label">Default hero color</label>
              <input type="color" className="h-10 w-full rounded-lg border" value={s.default_hero_color} onChange={(e) => set('default_hero_color', e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            The default hero color is used when the hero has no background image.
          </p>
        </div>

        <div className="card">
          <ImageUpload
            label="Logo"
            value={s.logo_url}
            folder="brand"
            onUploaded={(url, publicId) => {
              set('logo_url', url || null);
              set('logo_public_id', publicId || null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
