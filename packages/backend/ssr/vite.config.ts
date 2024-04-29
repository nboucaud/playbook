import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const workspaceDir = join(fileURLToPath(import.meta.url), '..', '..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@affine/core': join(workspaceDir, 'frontend/core/src'),
      '@affine/i18n': join(workspaceDir, 'frontend/i18n/src'),
      '@toeverything/infra': join(workspaceDir, 'frontend/infra/src'),
    },
  },
  build: {
    target: 'node20',
    rollupOptions: {
      input: './src/index.tsx',
    },
  },
});
