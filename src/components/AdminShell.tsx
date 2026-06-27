'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  GalleryHorizontalEnd,
  Palette,
  Info,
  Settings,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { logout, getAdminEmail } from '@/lib/auth';
import { getPublicBranding, logoThumb } from '@/lib/site';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/articles', label: 'Articles', icon: FileText },
  { href: '/hero', label: 'Hero Designer', icon: ImageIcon },
  { href: '/carousel', label: 'Carousel', icon: GalleryHorizontalEnd },
  { href: '/appearance', label: 'Appearance', icon: Palette },
  { href: '/about', label: 'About Page', icon: Info },
  { href: '/settings', label: 'Business & SEO', icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getAdminEmail());
    getPublicBranding().then((b) => setLogo(b.logo_url));
  }, []);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const current = NAV.find((n) => isActive(pathname, n.href))?.label ?? 'Admin';

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoThumb(logo)} alt="First Choice Roofing" className="h-9 w-auto" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center bg-brand-gold text-sm font-extrabold text-brand-ink">
            FC
          </div>
        )}
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">First Choice</p>
          <p className="text-[11px] text-white/50">Roofing Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon
                size={18}
                className={active ? 'text-brand-gold' : 'text-white/50 group-hover:text-white/80'}
              />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-gold" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {email && (
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase text-brand-gold">
              {email[0]}
            </div>
            <p className="truncate text-xs text-white/70" title={email}>
              {email}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} className="text-white/50" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-brand-dark lg:block">{SidebarBody}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-brand-dark shadow-xl">
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
            {SidebarBody}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur lg:px-8">
          <button
            aria-label="Open menu"
            className="text-brand-ink lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h1 className="text-sm font-semibold text-brand-ink">{current}</h1>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
