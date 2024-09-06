import path from 'path';
import { transformWithEsbuild, loadEnv } from 'vite';
import { defineConfig } from 'vitest/config'
import jsconfigPaths from 'vite-jsconfig-paths'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
//   plugins: [react()],
// Config to enable vitest to react JSX in .js files
// (credit: https://stackoverflow.com/a/76726872)
  
// maxConcurrency: 20,
//   pool: 'vmThreads',
//   poolOptions: {
//     threads: {
//       singleThread: true,
//     }
//   },
//   isolate: false, // only safe with the poolOptions above
//   css: false,  
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/app\/.*\.js$/)) return null;

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        })
      },
    },
    jsconfigPaths(),
    // stubNextAssetImport(),
    react(),
  ],
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  test: {
    globals: true, 
    environment: 'happy-dom',
    env: loadEnv('', process.cwd(), ''),
    setupFiles: ['/setupTests.js'],
    deps: {
      inline: ['nuqs'],
      // optimizer: {
      //   web: {
      //     include: ['nuqs']
      //   },
      // },
    },
  },
  resolve: {
    // alias: {'@': './app'}
        alias: {
            '@': path.resolve(__dirname, './app'),
        },  
    }
})

// Credit: https://github.com/vercel/next.js/issues/45350#issuecomment-1645556123
function stubNextAssetImport() {
  return {
    name: 'stub-next-asset-import',
    transform(_code, id) {
      if (/(jpg|jpeg|png|webp|gif|svg)$/.test(id)) {
        const imgSrc = path.relative(process.cwd(), id);
        return {
          code: `export default { src: '${imgSrc}', height: 1, width: 1 }`,
        };
      }
    },
  };
}