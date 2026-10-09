import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Assets are already compressed at build time. Serving them directly avoids
  // a runtime optimizer dependency and keeps images available offline.
  images: { unoptimized: true },
};

export default nextConfig;
