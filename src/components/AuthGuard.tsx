'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasValidToken, me, clearToken } from '@/lib/auth';

/**
 * Client-side route guard for the dashboard. Real security is enforced by the
 * backend (every API call requires a valid JWT); this just redirects
 * unauthenticated users to /login and avoids rendering protected UI for them.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasValidToken()) {
      router.replace('/login');
      return;
    }
    // Confirm the token is still accepted by the backend.
    me().then((ok) => {
      if (ok) {
        setReady(true);
      } else {
        clearToken();
        router.replace('/login');
      }
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-brand-primary"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return <>{children}</>;
}
