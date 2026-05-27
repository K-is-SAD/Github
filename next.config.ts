import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  crossOrigin: 'anonymous',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;
