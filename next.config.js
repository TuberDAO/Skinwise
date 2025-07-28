/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  env: {
    CUSTOM_KEY: 'skinwise-app',
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy - Prevent XSS attacks
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.googleapis.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob: https: *.googleapis.com *.firebaseapp.com firebasestorage.googleapis.com",
              "connect-src 'self' *.googleapis.com *.stripe.com wss://*.firebaseio.com *.firebaseio.com",
              "frame-src 'self' *.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "block-all-mixed-content",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Enable XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Prevent referrer leakage
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Enforce HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // Remove server information
          {
            key: 'X-Powered-By',
            value: ''
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: [
              'camera=(self)',
              'microphone=()',
              'geolocation=()',
              'payment=(self)',
              'usb=()',
              'magnetometer=()',
              'accelerometer=()',
              'gyroscope=()'
            ].join(', ')
          }
        ]
      },
      // Additional security for API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      }
    ]
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
  poweredByHeader: false, // Remove X-Powered-By header for security
}

module.exports = nextConfig
