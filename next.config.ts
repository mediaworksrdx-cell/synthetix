import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  allowedDevOrigins: ["nonsignificative-jake-diffidently.ngrok-free.dev"],
};

export default nextConfig;
