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
          // Simplified chunking strategy to avoid React dependency issues
          if (id.includes('node_modules')) {
            // Keep React and UI libraries together to avoid forwardRef issues
            if (id.includes('react') || id.includes('react-dom') || id.includes('@radix-ui')) {
              return 'react-ui-vendor';
            }
            if (id.includes('@tanstack/react-query')) return 'query-vendor';
            // Keep PDF libraries separate as they're heavy
            if (id.includes('@react-pdf') || id.includes('react-pdf')) return 'react-pdf-vendor';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf-libs-vendor';
            return 'vendor';
          }
          
          // Feature-based chunks only for large features
          if (id.includes('/admin/')) return 'admin';
          if (id.includes('/valuation/')) return 'valuation';
        }
      }
    },
    target: ['es2020', 'chrome80', 'safari14'],
    minify: 'esbuild',
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
    reportCompressedSize: false
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@tanstack/react-query',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      '@radix-ui/react-toast'
    ],
    exclude: ['@vite/client', '@vite/env'],
    force: false
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none'
  }
};
});
