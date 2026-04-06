import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hmqahmhxedkbkfmprvva.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth avatars
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub OAuth avatars
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
