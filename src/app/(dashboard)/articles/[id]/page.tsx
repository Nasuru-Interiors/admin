'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import ArticleForm, { ArticleFormValues } from '@/components/ArticleForm';
import type { ArticleFull } from '@/lib/types';

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<ArticleFormValues | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<ArticleFull>(`/articles/${params.id}`)
      .then((a) =>
        setInitial({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt || '',
          content_html: a.content_html || '',
          cover_image_url: a.cover_image_url,
          cover_public_id: a.cover_public_id,
          meta_title: a.meta_title || '',
          meta_description: a.meta_description || '',
          keywords: a.keywords || [],
          status: a.status,
          featured: a.featured,
          author: a.author || 'First Choice Roofing Services',
        }),
      )
      .catch((e) => setError(e.message));
  }, [params.id]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!initial) return <p className="text-sm text-gray-400">Loading…</p>;

  return <ArticleForm initial={initial} />;
}
