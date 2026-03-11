import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wqvmmbdkhqxystbzmplg.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
