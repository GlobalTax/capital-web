
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
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
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            <div className="space-y-20">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Capittal - M&A Specialists</h1>
                <p className="text-xl text-muted-foreground">Expertos en fusiones y adquisiciones</p>
              </div>
              <Contact />
              <Newsletter />
            </div>
          } />
          <Route path="/admin/landing-pages" element={<LandingPagesPage />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="*" element={
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
              <p className="text-muted-foreground">La página que buscas no existe.</p>
            </div>
          } />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
