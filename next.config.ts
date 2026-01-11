import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack (new syntax for Next.js 15)
  turbopack: {
    // Turbopack options
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;