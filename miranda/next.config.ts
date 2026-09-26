import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep turbopack rooted on this package when a parent lockfile exists.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Web-sourced product photos (Pexels / Flickr / Wikimedia) are rendered
    // unoptimised, but next/image still requires the host to be allowed.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
