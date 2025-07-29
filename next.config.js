/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel optimizations
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'], // Better compression
    minimumCacheTTL: 60, // Cache images for 1 minute
  },
  
  // Remove custom env as Vercel handles this better
  env: {
    CUSTOM_KEY: 'skinwise-app',
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      'firebase',
      'lucide-react',
      '@radix-ui/react-icons',
      '@upstash/redis',
      '@upstash/ratelimit'
    ],
    // Enable edge runtime for API routes where possible
    runtime: 'nodejs', // Keep nodejs for Firebase compatibility
  },

  // Webpack optimizations for serverless
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Only apply optimizations in production
    if (!dev && isServer) {
      // Optimize for serverless cold starts
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          firebase: {
            name: 'firebase',
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          stripe: {
            name: 'stripe',
            test: /[\\/]node_modules[\\/]stripe[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          upstash: {
            name: 'upstash',
            test: /[\\/]node_modules[\\/]@upstash[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
        },
      }
    }

    return config
  },

  // Vercel-optimized security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy - Updated for Vercel
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.googleapis.com vercel.live",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob: https: *.googleapis.com *.firebaseapp.com firebasestorage.googleapis.com",
              "connect-src 'self' *.googleapis.com *.stripe.com wss://*.firebaseio.com *.firebaseio.com *.upstash.io vercel.live",
              "frame-src 'self' *.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "block-all-mixed-content",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: [
              'camera=(self)',
              'microphone=(self)',
              'geolocation=()',
              'payment=(self)',
              'usb=()',
              'magnetometer=()',
              'accelerometer=()',
              'gyroscope=()',
            ].join(', '),
          },
        ],
      },
      // Cache static assets longer on Vercel
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*).png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Enable compression
  compress: true,
  
  // Optimize build output
  swcMinify: true,
  
  // Remove powered by Next.js header
  poweredByHeader: false,

  // Vercel analytics support
  ...(process.env.NODE_ENV === 'production' && {
    analytics: {
      id: process.env.VERCEL_ANALYTICS_ID,
    },
  }),
}

module.exports = nextConfig
