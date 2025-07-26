/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  env: {
    CUSTOM_KEY: 'skinwise-app',
  },
  webpack: (config, { isServer, dev }) => {
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

    // Improve chunk loading and prevent timeout issues
    if (!isServer) {
      config.output.chunkLoadTimeout = 120000 // 2 minutes
      config.output.chunkLoadingGlobal = 'webpackChunkNext'
    }

    // Optimize chunk splitting in development
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      }
    }

    return config
  },
  // Experimental features to handle ESM and modern syntax
  experimental: {
    esmExternals: 'loose',
    optimizePackageImports: ['firebase', 'lucide-react'],
  },
  // Improve build performance and reduce chunk loading issues
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
