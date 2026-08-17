import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    // Bundle the SDK so Vite resolves its internal directory imports.
    // This is required because @scopelift/stealth-address-sdk ships pure ESM
    // with directory imports that bare Node.js module resolution cannot handle.
    server: {
      deps: {
        inline: ['@scopelift/stealth-address-sdk'],
      },
    },
  },
});
