import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getPublicBranding, faviconFrom } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getPublicBranding();
  const favicon = faviconFrom(branding.logo_url);
  return {
    title: `${branding.business_name} — Admin`,
    description: 'Admin dashboard for First Choice Roofing Services.',
    robots: { index: false, follow: false },
    ...(favicon ? { icons: { icon: favicon, shortcut: favicon, apple: favicon } } : {}),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
