import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Product photography is served as AVIF where supported, WebP otherwise.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
};

export default nextConfig;
