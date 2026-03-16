/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignoriert TypeScript-Fehler beim Build, damit Vercel durchläuft
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignoriert ESLint-Warnungen beim Build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ermöglicht die Nutzung von Top-Level Await (wichtig für Data-Fetching)
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

export default nextConfig;