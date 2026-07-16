'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';
import Editor from './Editor';
import ImageUpload from './ImageUpload';

export interface ArticleFormValues {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  cover_image_url: string | null;
  cover_public_id: string | null;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  status: 'draft' | 'published';
  featured: boolean;
  author: string;
  category_ids: string[];
}

export const EMPTY_ARTICLE: ArticleFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content_html: '',
  cover_image_url: null,
  cover_public_id: null,
  meta_title: '',
  meta_description: '',
  keywords: [],
  status: 'draft',
  featured: false,
  author: 'First Choice Roofing Services',
  category_ids: [],
};

export default function ArticleForm({ initial }: { initial: ArticleFormValues }) {
  const router = useRouter();
  const [v, setV] = useState<ArticleFormValues>(initial);
  const [keywordsText, setKeywordsText] = useState(initial.keywords.join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<Category[]>('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  const toggleCategory = (id: string) =>
    setV((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));

  const set = <K extends keyof ArticleFormValues>(key: K, val: ArticleFormValues[K]) =>
    setV((prev) => ({ ...prev, [key]: val }));

  async function save(status: 'draft' | 'published') {
    setSaving(true);
    setError('');
    const payload = {
      ...v,
      status,
      keywords: keywordsText.split(',').map((k) => k.trim()).filter(Boolean),
    };
    try {
      if (v.id) {
        await api.put(`/articles/${v.id}`, payload);
      } else {
        await api.post('/articles', payload);
      }
      router.push('/articles');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{v.id ? 'Edit Article' : 'New Article'}</h1>
        <div className="flex gap-2">
          <button disabled={saving} onClick={() => save('draft')} className="btn btn-ghost">
            Save Draft
          </button>
          <button disabled={saving} onClick={() => save('published')} className="btn btn-primary">
            {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-4">
          <div className="card space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={v.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. 5 Reasons Aluminium Roofing Sheets Are Best for Lagos Homes"
              />
            </div>
            <div>
              <label className="label">Slug (URL)</label>
              <input
                className="input"
                value={v.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="auto-generated from title if left blank"
              />
            </div>
            <div>
              <label className="label">Excerpt (summary)</label>
              <textarea
                className="input"
                rows={2}
                value={v.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Content</label>
            <Editor value={v.content_html} onChange={(html) => set('content_html', html)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <ImageUpload
              label="Cover Image"
              value={v.cover_image_url}
              folder="covers"
              onUploaded={(url, publicId) => {
                set('cover_image_url', url || null);
                set('cover_public_id', publicId || null);
              }}
            />
          </div>

          <div className="card space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={v.featured}
                onChange={(e) => set('featured', e.target.checked)}
              />
              Feature this article
            </label>
            <div>
              <label className="label">Author</label>
              <input className="input" value={v.author} onChange={(e) => set('author', e.target.value)} />
            </div>
          </div>

          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-brand-ink">Categories</p>
              <Link href="/categories" className="text-xs font-semibold text-brand-primary hover:underline">
                Manage
              </Link>
            </div>
            {categories.length === 0 ? (
              <p className="text-sm text-brand-muted">
                No categories yet — <Link href="/categories" className="text-brand-primary underline">create one</Link>.
              </p>
            ) : (
              <div className="max-h-44 space-y-2 overflow-y-auto">
                {categories.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm text-brand-ink">
                    <input
                      type="checkbox"
                      checked={v.category_ids.includes(c.id)}
                      onChange={() => toggleCategory(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="card space-y-3">
            <p className="text-sm font-bold text-brand-ink">SEO</p>
            <div>
              <label className="label">Meta title</label>
              <input
                className="input"
                value={v.meta_title}
                onChange={(e) => set('meta_title', e.target.value)}
                placeholder="Falls back to the title"
              />
            </div>
            <div>
              <label className="label">Meta description</label>
              <textarea
                className="input"
                rows={3}
                value={v.meta_description}
                onChange={(e) => set('meta_description', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Keywords (comma separated)</label>
              <input
                className="input"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="aluminium roofing sheets, Lagos, Nigeria"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
