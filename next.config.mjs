/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The course lived at the site root before the multi-course catalog.
    const base = '/courses/catalan-a1';
    return [
      // verbadium.ad (Andorra ccTLD) → canonical verbadium.com, any path. Listed
      // first so a .ad request goes straight to .com (no redirect chain). The
      // domains are attached to this Vercel project; SSL is auto-issued.
      { source: '/:path*', has: [{ type: 'host', value: 'verbadium.ad' }], destination: 'https://verbadium.com/:path*', permanent: true },
      { source: '/:path*', has: [{ type: 'host', value: 'www.verbadium.ad' }], destination: 'https://verbadium.com/:path*', permanent: true },
      { source: '/unit/:num', destination: `${base}/unit/:num`, permanent: true },
      { source: '/ipa', destination: `${base}/ipa`, permanent: true },
      { source: '/exam', destination: `${base}/exam`, permanent: true },
      { source: '/mock', destination: `${base}/mock`, permanent: true },
      { source: '/glossary', destination: `${base}/glossary`, permanent: true },
    ];
  },
};
export default nextConfig;
