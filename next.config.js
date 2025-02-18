/**
 * @type {import('next').NextConfig}
 *
 * Next.js configuration file for the Polyglot AI Summarizer application.
 * This file defines various settings for the Next.js build, including
 * React Strict Mode, output options for deployment, and image optimization.
 */
const nextConfig = {
  // Enable React's Strict Mode for improved error handling and warnings in development.
  // This helps identify potential problems in your application and its dependencies.
  reactStrictMode: true,

  // Configure Next.js to output a standalone application for production deployments.
  // This is particularly useful for Docker-based deployments, as it creates a
  // self-contained folder with all necessary files, optimizing image size and startup time.
  output: 'standalone',

  // Configure image optimization for external images.
  // This is crucial for an application that processes URLs, as it might need to
  // display associated images like favicons, social media previews, or article thumbnails.
  images: {
    // Define remote patterns to allow image optimization for images hosted on external domains.
    // For a summarizer that takes arbitrary URLs, images can come from many sources.
    //
    // WARNING: Using `hostname: '**'` is very broad and can be a security risk
    // as it allows image optimization from any domain. In a production environment,
    // it is highly recommended to narrow this down to specific, trusted domains
    // or implement a more robust image proxying solution if user-provided URLs
    // are the primary source of images.
    remotePatterns: [
      {
        protocol: 'http', // Allow HTTP for development or specific non-HTTPS sources
        hostname: '**',   // Wildcard for any hostname (see warning above)
      },
      {
        protocol: 'https', // Standard and recommended for production
        hostname: '**',   // Wildcard for any hostname (see warning above)
      },
    ],
    // Optionally, you can define specific domains if you know them beforehand:
    // domains: ['example.com', 'cdn.another-service.net'],
  },

  // Environment variables that are available to the client-side code.
  // Variables prefixed with `NEXT_PUBLIC_` are automatically exposed to the browser.
  // For server-side only variables (e.g., API keys for the backend), use `process.env`
  // directly in server-side code (e.g., API routes, `getServerSideProps`).
  // Example:
  // env: {
  //   NEXT_PUBLIC_APP_NAME: 'Polyglot AI Summarizer',
  // },

  // Custom webpack configuration (if needed).
  // The default Next.js webpack configuration is usually sufficient.
  // This section can be used for advanced customizations like adding custom loaders
  // or plugins.
  // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  //   // Example: Add a custom SVG loader
  //   // config.module.rules.push({
  //   //   test: /\.svg$/,
  //   //   use: ['@svgr/webpack'],
  //   // });
  //   return config;
  // },

  // Optional: Add custom headers for all responses.
  // This can be useful for setting security headers, caching policies, etc.
  // async headers() {
  //   return [
  //     {
  //       source: '/api/:path*', // Apply to all API routes
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
  //         },
  //         {
  //           key: 'Pragma',
  //           value: 'no-cache',
  //         },
  //         {
  //           key: 'Expires',
  //           value: '0',
  //         },
  //       ],
  //     },
  //   ];
  // },

  // Optional: Add custom redirects.
  // This allows you to define URL redirects for your application.
  // async redirects() {
  //   return [
  //     {
  //       source: '/old-summary-page',
  //       destination: '/new-summary-feature',
  //       permanent: true, // Use permanent: true for 308 status, false for 307
  //     },
  //   ];
  // },
};

module.exports = nextConfig;