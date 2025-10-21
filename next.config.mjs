/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'cardneto.com' },
      { hostname: 'localhost' },
      { hostname: 'd1kxbpnurhjwqd.cloudfront.net' },
      { hostname: 'cardneto.link' }
    ],
    formats: ['image/webp', 'image/avif']
  }
};

export default nextConfig;
