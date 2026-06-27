'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  FilePen,
  GalleryHorizontalEnd,
  Tags,
  PenLine,
  Image as ImageIcon,
  Palette,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { getAdminEmail } from '@/lib/auth';
import type { Stats } from '@/lib/types';

const CARDS: { key: keyof Stats; label: string; icon: LucideIcon; tint: string }[] = [
  { key: 'published', label: 'Published Articles', icon: FileCheck2, tint: 'bg-green-50 text-green-600' },
  { key: 'drafts', label: 'Drafts', icon: FilePen, tint: 'bg-amber-50 text-amber-600' },
  { key: 'carousel', label: 'Carousel Slides', icon: GalleryHorizontalEnd, tint: 'bg-rose-50 text-brand-primary' },
  { key: 'categories', label: 'Categories', icon: Tags, tint: 'bg-yellow-50 text-[#8a6d12]' },
];

const QUICK: { href: string; label: string; desc: string; icon: LucideIcon }[] = [
  { href: '/articles/new', label: 'Write a new article', desc: 'Publish roofing tips & guides', icon: PenLine },
  { href: '/hero', label: 'Design the hero', desc: 'Headline, image & colors', icon: ImageIcon },
  { href: '/carousel', label: 'Manage carousel', desc: 'Showcase your work', icon: GalleryHorizontalEnd },
  { href: '/appearance', label: 'Brand & logo', desc: 'Colors and logo', icon: Palette },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getAdminEmail());
    api
      .get<Stats>('/stats')
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="mb-7">
        <h1 className="page-title">Welcome back{email ? `, ${email.split('@')[0]}` : ''}</h1>
        <p className="page-subtitle">Here&apos;s your site at a glance.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load stats: {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.key} className="card flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.tint}`}>
                <Icon size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-ink">{stats ? stats[c.key] : '—'}</div>
                <div className="text-xs font-medium text-brand-muted">{c.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 mt-9 text-xs font-bold uppercase tracking-wide text-brand-muted">
        Quick actions
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {QUICK.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className="card group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-card"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/8 text-brand-primary">
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-brand-ink">{q.label}</p>
                <p className="text-xs text-brand-muted">{q.desc}</p>
              </div>
              <ArrowRight
                size={18}
                className="text-brand-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-primary"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
