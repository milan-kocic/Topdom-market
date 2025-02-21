/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.formaideale.rs',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.tehnomanija.rs',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'emmezeta.rs',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jysk.rs',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ikea.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;