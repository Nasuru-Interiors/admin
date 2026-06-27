const isDev = process.env.NODE_ENV !== 'production';

function origin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

// Origins the admin browser legitimately connects to (backend + Cloudinary only;
// the admin never connects to Supabase).
const backend = origin(process.env.NEXT_PUBLIC_BACKEND_URL || '');
const connectSrc = [
  "'self'",
  backend,
  'https://api.cloudinary.com',
  ...(isDev ? ['ws://localhost:*'] : []),
]
  .filter(Boolean)
  .join(' ');

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' https://res.cloudinary.com data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `connect-src ${connectSrc}`,
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  async headers() {
    // The admin must never be indexed or framed.
    return [
      {
        source: '/:path*',
        headers: [...securityHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
