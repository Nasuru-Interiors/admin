'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, X, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  async function load() {
    setLoading(true);
    try {
      setItems(await api.get<Category[]>('/categories'));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const created = await api.post<Category>('/categories', { name: name.trim() });
      setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create category');
    } finally {
      setCreating(false);
    }
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    try {
      const updated = await api.put<Category>(`/categories/${id}`, { name: editName.trim() });
      setItems((prev) =>
        prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not rename category');
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this category? Articles will stay, but lose this category.')) return;
    await api.del(`/categories/${id}`);
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Group your articles by topic — used for filtering on the website.</p>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={create} className="card mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="label">New category</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Roofing Tips"
          />
        </div>
        <button type="submit" disabled={creating || !name.trim()} className="btn-primary">
          <Plus size={18} /> {creating ? 'Adding…' : 'Add Category'}
        </button>
      </form>

      <div className="overflow-hidden border border-black/5 bg-white shadow-soft">
        {loading ? (
          <p className="p-6 text-sm text-brand-muted">Loading…</p>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-brand-ink">No categories yet</p>
            <p className="mt-1 text-sm text-brand-muted">Add one above to start organising your blog.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold text-brand-ink">
                    {editingId === c.id ? (
                      <input
                        className="input max-w-xs"
                        value={editName}
                        autoFocus
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(c.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="text-brand-muted">/{c.slug}</td>
                  <td className="text-right">
                    {editingId === c.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="inline-flex items-center gap-1 font-semibold text-green-600 hover:underline"
                        >
                          <Check size={14} /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="ml-4 inline-flex items-center gap-1 font-semibold text-brand-muted hover:text-brand-ink"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(c.id);
                            setEditName(c.name);
                          }}
                          className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline"
                        >
                          <Pencil size={14} /> Rename
                        </button>
                        <button
                          onClick={() => remove(c.id)}
                          className="ml-4 inline-flex items-center gap-1 font-semibold text-brand-muted hover:text-red-600"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    )}
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
