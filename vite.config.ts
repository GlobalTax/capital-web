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
        // ⚡ OPTIMIZACIÓN: Chunks especializados para reducir JS inicial
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@react-pdf') || id.includes('jspdf')) return 'pdf';
            if (id.includes('react-quill') || id.includes('quill')) return 'editor';
            if (id.includes('xlsx') || id.includes('html2canvas')) return 'export';
            if (id.includes('@supabase')) return 'supabase';
          }
        }
      }
    },
    target: ['es2020', 'chrome80', 'safari14'],
    minify: 'esbuild',
    cssMinify: true,
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
