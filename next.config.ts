import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // libheif-js (HEIC decoder) has a Node-only branch that requires fs/path.
    resolveAlias: {
      fs: { browser: "./lib/shims/empty.ts" },
      path: { browser: "./lib/shims/empty.ts" },
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
