import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'SynapseBg',
      fileName: 'synapse-bg-wc',
    },
    outDir: '../builds/synapse-bg-wc'
  }
});
