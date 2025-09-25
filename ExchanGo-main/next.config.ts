import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "exchango.opineomanager.com",
      "flagcdn.com",
      "lh3.googleusercontent.com",
      "maps.app.goo.gl",
      "exchango.opineomanager.comhttps",
      "gmail.com",
    ],
  },
  optimizeDeps: {
    exclude: ["lightningcss"],
  },
  async rewrites() {
    return [
      {
        source: "/exchange-detail/:slug",
        destination: "/exchange-detail",
      },
      {
        source: "/exchange-detail",
        destination: "/exchange-detail",
      },
    ];
  },
};

export default nextConfig;
