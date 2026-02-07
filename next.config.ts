import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // Request body size for API Route Handlers (e.g. /api/files/upload). Default is 10MB.
    proxyClientMaxBodySize: "50mb",
  },
};

export default nextConfig;
