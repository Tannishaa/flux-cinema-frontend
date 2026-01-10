/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://flux-api-wjqx.onrender.com/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;