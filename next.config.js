/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize server components
  serverExternalPackages: ['@mapbox/mapbox-gl-js'],

  // Bundle analyzer configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          
          // Admin components chunk
          admin: {
            test: /[\\/]components[\\/](Admin|analytics)/i,
            name: 'admin',
            priority: 20,
            reuseExistingChunk: true,
          },
          
          // Map components chunk
          maps: {
            test: /[\\/]components[\\/].*[Mm]ap/i,
            name: 'maps',
            priority: 15,
            reuseExistingChunk: true,
          },
          
          // Chart components chunk
          charts: {
            test: /[\\/]components[\\/].*[Cc]hart/i,
            name: 'charts',
            priority: 15,
            reuseExistingChunk: true,
          },
          
          // Crisis components chunk
          crisis: {
            test: /[\\/]components[\\/].*[Cc]risis/i,
            name: 'crisis',
            priority: 15,
            reuseExistingChunk: true,
          },
          
          // Common utilities
          utils: {
            test: /[\\/]lib[\\/]/,
            name: 'utils',
            priority: 5,
            reuseExistingChunk: true,
            minChunks: 2,
          },
        },
      };
    }

    return config;
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Compression and performance
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  },

  // Output configuration for production
  output: 'standalone',
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Trailing slash configuration
  trailingSlash: false,
};

module.exports = nextConfig;