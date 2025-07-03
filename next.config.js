/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  env: {
    CUSTOM_KEY: 'skinwise-app',
  },
  webpack: (config, { isServer }) => {
    // Exclude undici from client-side bundle to prevent private class field parsing errors
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // Alternative: Mark undici as external for server-side
    if (isServer) {
      config.externals = [...config.externals, 'undici']
    }

    return config
  },
  // Experimental features to handle ESM and modern syntax
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
