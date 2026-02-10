import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Check if HMR should be disabled (useful for Lovable sandbox environments)
  const disableHmr = process.env.VITE_DISABLE_HMR === '1';
  
  if (disableHmr) {
    console.log('🔧 HMR disabled via VITE_DISABLE_HMR environment variable');
  }
  
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: disableHmr ? false : undefined,
    },
    plugins: [
      react(),
      mode === 'development' && !disableHmr &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime"],
    },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom') || id.includes('react/') || id.includes('react-router') || id.includes('scheduler')) return 'react-core';
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'charts';
          if (id.includes('react-pdf') || id.includes('jspdf') || id.includes('html2canvas')) return 'pdf';
          if (id.includes('xlsx')) return 'xlsx';
          if (id.includes('framer-motion')) return 'animation';
          if (id.includes('@radix-ui') || id.includes('@tanstack')) return 'ui-libs';
          return 'vendor';
        }
      }
    },
    target: ['es2020', 'chrome80', 'safari14'],
    minify: 'esbuild',
    sourcemap: mode === 'development', // ⚡ Sourcemaps solo en desarrollo
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
    reportCompressedSize: false
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none'
  }
};
});
