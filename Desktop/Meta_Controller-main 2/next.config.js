const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // ONNX Runtime Web configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Copy ONNX models to public folder
    config.module.rules.push({
      test: /\.onnx$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/models/[name][ext]'
      }
    });

    // Force .mjs files to be treated as ESM
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    return config;
  },
  // Enable experimental features for WebAssembly
  experimental: {
    serverComponentsExternalPackages: ['onnxruntime-node', 'onnxruntime-web'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    outputFileTracingExcludes: {
      '*': [
        './node_modules/onnxruntime-node/bin/**/*',
        './public/models/**/*',
      ],
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
