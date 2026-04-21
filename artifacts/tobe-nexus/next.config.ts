import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  distDir: '.next-build',
  allowedDevOrigins: [
    "*.replit.dev",
    "*.spock.replit.dev",
    "*.repl.co",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Language", value: "zh-TW" },
        ],
      },
    ];
  },
};

export default nextConfig;
