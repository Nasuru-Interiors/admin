'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Editor from '@/components/Editor';
import ImageUpload from '@/components/ImageUpload';
import type { AboutContent } from '@/lib/types';

export default function AboutAdminPage() {
  const [a, setA] = useState<AboutContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AboutContent>('/about').then(setA).catch((e) => setError(e.message));
  }, []);

  if (error && !a) return <p className="text-sm text-red-600">{error}</p>;
  if (!a) return <p className="text-sm text-gray-400">Loading…</p>;

  const set = <K extends keyof AboutContent>(k: K, v: AboutContent[K]) =>
    setA((prev) => (prev ? { ...prev, [k]: v } : prev));

  function setStat(i: number, key: 'label' | 'value', val: string) {
    const stats = [...a!.stats];
    stats[i] = { ...stats[i], [key]: val };
    set('stats', stats);
  }

  async function save() {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await api.put('/about', a);
      setMsg('About page saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-ink">About Page</h1>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {msg && <p className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{msg}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-6">
        <div className="card space-y-4">
          <div>
            <label className="label">Headline</label>
            <input className="input" value={a.headline} onChange={(e) => set('headline', e.target.value)} />
          </div>
          <div>
            <label className="label">Subheading</label>
            <input className="input" value={a.subheading} onChange={(e) => set('subheading', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Body</label>
          <Editor value={a.body_html} onChange={(html) => set('body_html', html)} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <ImageUpload
              label="About image"
              value={a.image_url}
              folder="about"
              onUploaded={(url, publicId) => {
                set('image_url', url || null);
                set('image_public_id', publicId || null);
              }}
            />
          </div>

          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-brand-ink">Stats</p>
              <button
                className="text-sm font-semibold text-brand-primary"
                onClick={() => set('stats', [...a.stats, { label: '', value: '' }])}
              >
                + Add stat
              </button>
            </div>
            {a.stats.map((stat, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input"
                  placeholder="Value (e.g. 10+)"
                  value={stat.value}
                  onChange={(e) => setStat(i, 'value', e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Label (e.g. Years)"
                  value={stat.label}
                  onChange={(e) => setStat(i, 'label', e.target.value)}
                />
                <button
                  className="text-gray-400 hover:text-red-600"
                  onClick={() => set('stats', a.stats.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
            {a.stats.length === 0 && <p className="text-sm text-gray-400">No stats added.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
