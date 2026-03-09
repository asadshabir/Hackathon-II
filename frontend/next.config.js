/** @type {import('next').NextConfig} */
const path = require('path');

// Check if next-pwa can be loaded
let withPWA = (config) => config;
try {
  withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development', // Enable PWA in production
    cacheOnFrontEndNav: true,
  });
} catch (error) {
  console.log('PWA configuration not available');
}

const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Standalone output for Docker; Vercel overrides this with its own adapter
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),

  // Fix workspace root warning
  outputFileTracingRoot: path.join(__dirname),

  // Configure image domains for next/image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
  },

  // Environment variables exposed to the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  },

  // Vercel-compatible headers for CORS and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
}

module.exports = withPWA(nextConfig);
