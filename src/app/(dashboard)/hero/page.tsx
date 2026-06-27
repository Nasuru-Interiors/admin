'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import type { Hero } from '@/lib/types';

export default function HeroPage() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Hero>('/hero').then(setHero).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!hero) return <p className="text-sm text-gray-400">Loading…</p>;

  const set = <K extends keyof Hero>(k: K, v: Hero[K]) =>
    setHero((prev) => (prev ? { ...prev, [k]: v } : prev));

  async function save() {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await api.put('/hero', hero);
      setMsg('Hero saved. Changes appear on the site within a minute.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const useImage = hero.background_type === 'image' && !!hero.image_url;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-ink">Hero Designer</h1>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving…' : 'Save Hero'}
        </button>
      </div>
      {msg && <p className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{msg}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      {/* Live preview */}
      <div
        className="relative mt-6 flex min-h-[260px] items-center justify-center overflow-hidden rounded-2xl"
        style={!useImage ? { backgroundColor: hero.background_color } : undefined}
      >
        {useImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.image_url!} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black" style={{ opacity: hero.overlay_opacity }} />
          </>
        )}
        <div className="relative z-10 px-6 text-center">
          <h2 className="text-3xl font-extrabold" style={{ color: hero.text_color }}>
            {hero.heading || 'Your heading'}
          </h2>
          <p className="mx-auto mt-2 max-w-md" style={{ color: hero.text_color, opacity: 0.9 }}>
            {hero.subheading}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <p className="text-sm font-bold text-brand-ink">Content</p>
          <div>
            <label className="label">Heading</label>
            <input className="input" value={hero.heading} onChange={(e) => set('heading', e.target.value)} />
          </div>
          <div>
            <label className="label">Subheading</label>
            <textarea className="input" rows={2} value={hero.subheading} onChange={(e) => set('subheading', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Primary button label</label>
              <input className="input" value={hero.cta_label} onChange={(e) => set('cta_label', e.target.value)} />
            </div>
            <div>
              <label className="label">Primary button link</label>
              <input className="input" value={hero.cta_href} onChange={(e) => set('cta_href', e.target.value)} />
            </div>
            <div>
              <label className="label">Secondary button label</label>
              <input className="input" value={hero.secondary_cta_label} onChange={(e) => set('secondary_cta_label', e.target.value)} />
            </div>
            <div>
              <label className="label">Secondary button link</label>
              <input className="input" value={hero.secondary_cta_href} onChange={(e) => set('secondary_cta_href', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <p className="text-sm font-bold text-brand-ink">Background</p>
          <div>
            <label className="label">Background type</label>
            <select
              className="input"
              value={hero.background_type}
              onChange={(e) => set('background_type', e.target.value as 'image' | 'color')}
            >
              <option value="color">Solid color</option>
              <option value="image">Image</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              If type is &quot;Image&quot; but no image is uploaded, the site falls back to the color below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Background color</label>
              <input type="color" className="h-10 w-full rounded-lg border" value={hero.background_color} onChange={(e) => set('background_color', e.target.value)} />
            </div>
            <div>
              <label className="label">Text color</label>
              <input type="color" className="h-10 w-full rounded-lg border" value={hero.text_color} onChange={(e) => set('text_color', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Overlay darkness ({Math.round(hero.overlay_opacity * 100)}%)</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              className="w-full"
              value={hero.overlay_opacity}
              onChange={(e) => set('overlay_opacity', parseFloat(e.target.value))}
            />
          </div>

          <ImageUpload
            label="Hero image"
            value={hero.image_url}
            folder="hero"
            onUploaded={(url, publicId) => {
              set('image_url', url || null);
              set('image_public_id', publicId || null);
              if (url) set('background_type', 'image');
            }}
          />
        </div>
      </div>
    </div>
  );
}
