import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep turbopack rooted on this package when a parent lockfile exists.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Retailer product photos (og:image from ASOS / Zara / Mango / H&M / COS)
    // are rendered unoptimised; next/image still requires the host allowed.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack: (config, { isServer, webpack }) => {
    // lib/webImages.ts imports "node:crypto" and is reachable from a client
    // component via lib/journey.ts. The browser bundle never runs that path;
    // strip the node: scheme and stub crypto so the client build compiles.
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
      );
      config.resolve.fallback = { ...(config.resolve.fallback ?? {}), crypto: false };
    }
    return config;
  },
};

export default nextConfig;
