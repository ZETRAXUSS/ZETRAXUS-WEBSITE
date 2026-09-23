import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  // OpenNext/Cloudflare Workers configuration
  experimental: {
    isrMemoryCacheSize: 0,
  },
};

export default nextConfig;
