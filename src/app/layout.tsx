import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'First Choice Roofing — Admin',
  description: 'Admin dashboard for First Choice Roofing Services.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
