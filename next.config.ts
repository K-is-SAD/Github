import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ['http://192.168.0.120', 'https://nebula-backend-1-pxku.onrender.com/'],
  },
  crossOrigin:'use-credentials',
  images: {
    domains: ['img.clerk.com']
  }
};

export default nextConfig;
