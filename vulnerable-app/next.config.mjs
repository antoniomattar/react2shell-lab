/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration - App Router is enabled by default
  // This makes the app vulnerable to CVE-2025-55182
  reactStrictMode: true,
  
  // Note: Even without any server actions defined,
  // the RSC Flight endpoint is exposed and vulnerable
  // when using the App Router (default in Next.js 13+)
};

export default nextConfig;
