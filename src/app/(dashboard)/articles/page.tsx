'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { api } from '@/lib/api';
import type { ArticleListItem } from '@/lib/types';

type StatusFilter = 'all' | 'published' | 'draft';

export default function ArticlesPage() {
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (a) =>
        (status === 'all' || a.status === status) &&
        (!q || a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q)),
    );
  }, [items, search, status]);

  async function load() {
    setLoading(true);
    try {
      setItems(await api.get<ArticleListItem[]>('/articles'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    await api.del(`/articles/${id}`);
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Articles</h1>
          <p className="page-subtitle">Create, edit and publish blog posts.</p>
        </div>
        <Link href="/articles/new" className="btn-primary">
          <Plus size={18} /> New Article
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Search + status filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            className="input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug…"
          />
        </div>
        <div className="flex gap-1 border border-black/10 bg-white p-1">
          {(['all', 'published', 'draft'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                status === s ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-brand-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs text-brand-muted">
          {visible.length} of {items.length}
        </span>
      </div>

      <div className="overflow-hidden border border-black/5 bg-white shadow-soft">
        {loading ? (
          <p className="p-6 text-sm text-brand-muted">Loading…</p>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-brand-ink">No articles yet</p>
            <p className="mt-1 text-sm text-brand-muted">Create your first one to get started.</p>
            <Link href="/articles/new" className="btn-primary mt-5 inline-flex">
              <Plus size={18} /> New Article
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-brand-muted">
                    No articles match your search.
                  </td>
                </tr>
              )}
              {visible.map((a) => (
                <tr key={a.id}>
                  <td className="font-semibold text-brand-ink">
                    {a.title}
                    {a.featured && <span className="badge badge-gold ml-2">★ Featured</span>}
                  </td>
                  <td>
                    <span className={`badge ${a.status === 'published' ? 'badge-green' : 'badge-gray'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="text-brand-muted">{new Date(a.updated_at).toLocaleDateString()}</td>
                  <td className="text-right">
                    <Link
                      href={`/articles/${a.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline"
                    >
                      <Pencil size={14} /> Edit
                    </Link>
                    <button
                      onClick={() => remove(a.id)}
                      className="ml-4 inline-flex items-center gap-1 font-semibold text-brand-muted hover:text-red-600"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
