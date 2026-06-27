'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <h1 className="text-xl font-bold text-brand-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-500">{error.message || 'Unexpected error.'}</p>
      <button onClick={reset} className="btn btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
