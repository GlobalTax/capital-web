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
        manualChunks: {
          // Simplificado para evitar fragmentación excesiva
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast', '@tanstack/react-query']
        }
      }
    },
    target: ['es2019', 'safari13'],
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
