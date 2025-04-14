import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'express', 'fs', 'path', 'http', 'crypto', 'zlib',
        'querystring', 'stream', 'net', 'mime', 'body-parser',
        'cookie-signature', 'serve-static', 'mime-types',
        'destroy', 'etag'
      ],
      output: {
        format: 'esm'
      }
    },
    target: 'es2020'
  },
  ssr: {
    // Don't externalize dependencies that need to be processed by Vite
    noExternal: ['@angular/*']
  },
  optimizeDeps: {
    // Exclude node modules from dependency optimization
    exclude: [
      'express', 'fs', 'path', 'http', 'crypto', 'zlib',
      'querystring', 'stream', 'net', 'mime', 'body-parser',
      'cookie-signature', 'serve-static', 'mime-types',
      'destroy', 'etag'
    ]
  },
  // Tell Vite to treat these as external modules
  resolve: {
    // browserField: true,
    mainFields: ['browser', 'module', 'main'],
  }
});