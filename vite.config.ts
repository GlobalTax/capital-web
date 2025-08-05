import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
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
          // Vendor chunks optimizados
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          routing: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Feature chunks
          admin: [
            './src/pages/Admin.tsx',
            './src/components/admin/ModernBlogManager.tsx',
            './src/components/admin/BlogPostsManager.tsx'
          ],
          dashboard: [
            './src/features/dashboard/hooks/useMarketingMetrics.ts',
            './src/hooks/useAdvancedDashboardStats.tsx'
          ],
          blog: [
            './src/hooks/useBlogPosts.tsx',
            './src/pages/Blog.tsx'
          ]
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
}));
