import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ['http://192.168.0.120'],
  },
  crossOrigin:'anonymous',
  images: {
    domains: ['img.clerk.com']
  }
};

export default nextConfig;
