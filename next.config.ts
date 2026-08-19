import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker uchun: kerakli fayllarni bitta papkaga yig'adi, image kichik bo'ladi
  output: "standalone",
};

export default nextConfig;
