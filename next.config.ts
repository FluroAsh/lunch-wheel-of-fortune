import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Google Maps API does not play nice with StrictMode enabled
};

export default nextConfig;
