import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React Strict Mode to prevent double socket connections
  reactStrictMode: false,
};

export default nextConfig;
