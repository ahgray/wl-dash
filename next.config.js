/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['a.espncdn.com'],
    unoptimized: true,
  },
}

module.exports = nextConfig