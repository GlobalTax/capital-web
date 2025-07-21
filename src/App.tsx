
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Contact from '@/components/Contact';
import Newsletter from '@/components/Newsletter';
import LandingPagesPage from '@/pages/admin/LandingPagesPage';
import { usePageImagePrefetch, useIntelligentPrefetch } from '@/components/ImagePrefetcher';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Componente interno para hooks que requieren Router context
const AppContent = () => {
  // Hooks para prefetching inteligente
  usePageImagePrefetch();
  useIntelligentPrefetch();
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin/landing-pages" element={<LandingPagesPage />} />
        <Route path="/contacto" element={
          <div className="min-h-screen bg-white">
            <main className="container mx-auto px-4 py-8">
              <div className="space-y-20">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Contacto - Capittal</h1>
                  <p className="text-xl text-muted-foreground">Ponte en contacto con nuestros expertos</p>
                </div>
                <Contact />
                <Newsletter />
              </div>
            </main>
          </div>
        } />
        <Route path="*" element={
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
            <p className="text-muted-foreground">La página que buscas no existe.</p>
          </div>
        } />
      </Routes>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
