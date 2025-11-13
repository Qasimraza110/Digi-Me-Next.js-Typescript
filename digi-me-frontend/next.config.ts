import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile images
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub avatars
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000", // your backend
      },
    ],
  },
};

export default nextConfig;
