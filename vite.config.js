import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'SynapseBg',
      fileName: 'synapse-bg-wc', // filename of bundles -- change if you like
    },
    // outDir: 'dist', // output directory relative to project root -- change if you like
  }
});
