// Reads public branding (logo, name) from the SAME source as the users site:
// the backend's public site-settings endpoint. No auth needed.

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface PublicBranding {
  logo_url: string | null;
  business_name: string;
}

export async function getPublicBranding(): Promise<PublicBranding> {
  try {
    const res = await fetch(`${BASE}/api/public/site-settings`, { cache: 'no-store' });
    if (!res.ok) throw new Error('bad status');
    const d = await res.json();
    return {
      logo_url: d.logo_url ?? null,
      business_name: d.business_name ?? 'First Choice Roofing Services',
    };
  } catch {
    return { logo_url: null, business_name: 'First Choice Roofing Services' };
  }
}

/** Square padded favicon from the logo (same transform the users site uses). */
export function faviconFrom(url: string | null): string | undefined {
  if (!url || !url.includes('/upload/')) return undefined;
  return url.replace('/upload/', '/upload/w_64,h_64,c_pad,b_rgb:fbf6f4,f_png/');
}

/** Optimized small logo for the sidebar/login. */
export function logoThumb(url: string | null): string | undefined {
  if (!url || !url.includes('/upload/')) return undefined;
  return url.replace('/upload/', '/upload/h_80,c_fit,f_auto,q_auto/');
}
