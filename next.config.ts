import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages compatibility
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
