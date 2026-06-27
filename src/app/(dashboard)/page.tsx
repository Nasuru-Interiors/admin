'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Stats } from '@/lib/types';

const CARDS = [
  { key: 'published', label: 'Published Articles' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'carousel', label: 'Carousel Slides' },
  { key: 'categories', label: 'Categories' },
] as const;

const QUICK = [
  { href: '/articles/new', label: 'Write a new article' },
  { href: '/hero', label: 'Design the hero' },
  { href: '/carousel', label: 'Manage carousel' },
  { href: '/appearance', label: 'Change brand colors' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<Stats>('/stats')
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Welcome back. Here&apos;s your site at a glance.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load stats: {error}. Make sure the backend is running and you are an admin.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div key={c.key} className="card">
            <div className="text-3xl font-extrabold text-brand-primary">
              {stats ? stats[c.key] : '—'}
            </div>
            <div className="mt-1 text-sm text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="card flex items-center justify-between hover:border-brand-primary"
            >
              <span className="font-semibold text-brand-ink">{q.label}</span>
              <span className="text-brand-primary">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
