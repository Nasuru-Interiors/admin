'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/articles', label: 'Articles' },
  { href: '/hero', label: 'Hero Designer' },
  { href: '/carousel', label: 'Carousel' },
  { href: '/appearance', label: 'Appearance' },
  { href: '/about', label: 'About Page' },
  { href: '/settings', label: 'Business & SEO' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-5">
        <p className="text-base font-extrabold leading-tight text-brand-primary">First Choice</p>
        <p className="text-xs text-gray-400">Roofing Admin</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(link.href)
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <button onClick={handleLogout} className="btn btn-ghost w-full justify-center">
          Log out
        </button>
      </div>
    </aside>
  );
}
