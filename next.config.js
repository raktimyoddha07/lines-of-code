/** @type {import('next').NextConfig} */
const isDesktopBuild = process.env.BUILD_TARGET === 'desktop';

const nextConfig = {
  reactStrictMode: true,
  ...(isDesktopBuild ? { output: 'export' } : {}),
  images: { unoptimized: true },
};

module.exports = nextConfig;
