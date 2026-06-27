'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { uploadToCloudinary } from '@/lib/upload';
import type { CarouselItem } from '@/lib/types';

export default function CarouselPage() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setItems(await api.get<CarouselItem[]>('/carousel'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url, publicId } = await uploadToCloudinary(file, 'carousel');
      const created = await api.post<CarouselItem>('/carousel', {
        image_url: url,
        public_id: publicId,
        sort_order: items.length,
      });
      setItems((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  async function update(id: string, patch: Partial<CarouselItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await api.put(`/carousel/${id}`, patch);
  }

  async function remove(id: string) {
    if (!confirm('Delete this slide?')) return;
    await api.del(`/carousel/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await api.put('/carousel-reorder', { ids: next.map((i) => i.id) });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-ink">Carousel</h1>
        <label className="btn btn-primary cursor-pointer">
          {busy ? 'Uploading…' : '+ Add Slide'}
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={busy} />
        </label>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Upload images for the home page carousel. Drag order with the arrows; toggle visibility with Active.
      </p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-3">
        {items.length === 0 && (
          <p className="card text-sm text-gray-400">No slides yet. Add your first image.</p>
        )}
        {items.map((item, index) => (
          <div key={item.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image_url} alt={item.alt} className="h-24 w-40 shrink-0 rounded-lg object-cover" />
            <div className="flex-1 space-y-2">
              <input
                className="input"
                placeholder="Alt text (for SEO & accessibility)"
                defaultValue={item.alt}
                onBlur={(e) => update(item.id, { alt: e.target.value })}
              />
              <input
                className="input"
                placeholder="Caption (optional)"
                defaultValue={item.caption}
                onBlur={(e) => update(item.id, { caption: e.target.value })}
              />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex flex-col">
                <button onClick={() => move(index, -1)} className="text-gray-400 hover:text-brand-primary">▲</button>
                <button onClick={() => move(index, 1)} className="text-gray-400 hover:text-brand-primary">▼</button>
              </div>
              <label className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={(e) => update(item.id, { active: e.target.checked })}
                />
                Active
              </label>
              <button onClick={() => remove(item.id)} className="text-sm text-gray-400 hover:text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
