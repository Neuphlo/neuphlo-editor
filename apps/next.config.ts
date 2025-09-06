import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure local workspace package changes trigger HMR during dev
  transpilePackages: ["neuphlo-editor"],
};

export default nextConfig;
