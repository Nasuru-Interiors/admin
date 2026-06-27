import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="text-5xl font-extrabold text-brand-primary">404</p>
      <h1 className="mt-3 text-xl font-bold text-brand-ink">Page not found</h1>
      <Link href="/" className="btn btn-primary mt-6">
        Back to dashboard
      </Link>
    </div>
  );
}
