/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  // Treat warnings as non-blocking during build
  webpack: (config, { isServer }) => {
    return config;
  },
};

export default nextConfig;
