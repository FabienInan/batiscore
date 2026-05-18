/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'batiscore.ca' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/entrepreneur/:id/',
        destination: '/rapport/:id/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
