'use client';

import ArticleForm, { EMPTY_ARTICLE } from '@/components/ArticleForm';

export default function NewArticlePage() {
  return <ArticleForm initial={EMPTY_ARTICLE} />;
}
