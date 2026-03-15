import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Schaltet ESLint-Prüfungen während des Vercel-Builds stumm
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Erlaubt den Build, selbst wenn TypeScript-Typenfehler vorliegen
    ignoreBuildErrors: true,
  },
};

export default nextConfig;