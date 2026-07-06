import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allowing all domains for now, replace with your S3 domain in production
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/jobs",
        destination: "/careers",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
