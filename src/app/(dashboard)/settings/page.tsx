'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export default function SettingsPage() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<SiteSettings>('/site-settings').then(setS).catch((e) => setError(e.message));
  }, []);

  if (error && !s) return <p className="text-sm text-red-600">{error}</p>;
  if (!s) return <p className="text-sm text-gray-400">Loading…</p>;

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setS((prev) => (prev ? { ...prev, [k]: v } : prev));

  async function save() {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await api.put('/site-settings', s);
      setMsg('Settings saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-ink">Business &amp; SEO</h1>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {msg && <p className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{msg}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <p className="text-sm font-bold text-brand-ink">Business</p>
          <Field label="Business name" value={s.business_name} onChange={(v) => set('business_name', v)} />
          <Field label="Tagline" value={s.tagline} onChange={(v) => set('tagline', v)} />
          <Field label="Phone" value={s.phone} onChange={(v) => set('phone', v)} />
          <Field label="WhatsApp" value={s.whatsapp} onChange={(v) => set('whatsapp', v)} />
          <Field label="Email" value={s.email} onChange={(v) => set('email', v)} />
          <Field label="Address" value={s.address} onChange={(v) => set('address', v)} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" value={s.city} onChange={(v) => set('city', v)} />
            <Field label="State" value={s.state} onChange={(v) => set('state', v)} />
            <Field label="Country" value={s.country} onChange={(v) => set('country', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Latitude</label>
              <input
                className="input"
                value={s.lat ?? ''}
                onChange={(e) => set('lat', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input
                className="input"
                value={s.lng ?? ''}
                onChange={(e) => set('lng', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-4">
            <p className="text-sm font-bold text-brand-ink">Social Links</p>
            <Field label="Facebook URL" value={s.facebook_url} onChange={(v) => set('facebook_url', v)} />
            <Field label="Instagram URL" value={s.instagram_url} onChange={(v) => set('instagram_url', v)} />
            <Field label="Twitter / X URL" value={s.twitter_url} onChange={(v) => set('twitter_url', v)} />
            <Field label="LinkedIn URL" value={s.linkedin_url} onChange={(v) => set('linkedin_url', v)} />
          </div>

          <div className="card space-y-4">
            <p className="text-sm font-bold text-brand-ink">Default SEO</p>
            <Field
              label="Default meta title"
              value={s.default_meta_title}
              onChange={(v) => set('default_meta_title', v)}
            />
            <div>
              <label className="label">Default meta description</label>
              <textarea
                className="input"
                rows={3}
                value={s.default_meta_description}
                onChange={(e) => set('default_meta_description', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
