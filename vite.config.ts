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
  },
  build: {
    rollupOptions: {
      output: {
        // ⚡ OPTIMIZACIÓN: Manual chunks para librerías pesadas solo en admin
        manualChunks: (id) => {
          // Separar react-quill (usado solo en admin blog)
          if (id.includes('react-quill') || id.includes('quill')) {
            return 'quill-editor';
          }
          
          // Separar recharts (usado solo en dashboards)
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Separar @react-pdf (usado solo en exports)
          if (id.includes('@react-pdf') || id.includes('react-pdf')) {
            return 'pdf-renderer';
          }
          
          // Vendor principal (React, etc.)
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    target: ['es2020', 'chrome80', 'safari14'],
    minify: 'esbuild',
    sourcemap: false, // ⚡ Sin sourcemaps en producción
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
    reportCompressedSize: false
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom'
    ],
    exclude: ['@vite/client', '@vite/env'],
    force: true
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none'
  }
};
});
