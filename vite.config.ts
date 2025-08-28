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
        manualChunks: (id) => {
          // Vendor chunks optimizados y seguros
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            return 'vendor';
          }
          
          // Feature chunks más conservadores - solo admin por ahora
          if (id.includes('/admin/') && !id.includes('LazyIcon') && !id.includes('icon-registry')) {
            return 'admin';
          }
          
          // No chunking para iconos - mantenerlos en el bundle principal
          if (id.includes('icon-registry') || id.includes('LazyIcon')) {
            return undefined; // Bundle principal
          }
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
    exclude: ['@vite/client', '@vite/env']
  }
};
});
