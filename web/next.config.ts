import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Cursor opens the parent monorepo folder. Without this, Turbopack infers the
  // wrong root, fails to find the Next.js package, panics on HMR, and the
  // browser reloads /discovery in a loop.
  turbopack: {
    root: projectRoot,
  },
  transpilePackages: ["@google/genai"],
};

export default nextConfig;
