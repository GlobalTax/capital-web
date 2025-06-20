
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentacionMASidebar from '@/components/documentacion-ma/DocumentacionMASidebar';
import Fase1Content from '@/components/documentacion-ma/content/Fase1Content';

const Fase1 = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        <div className="flex min-h-screen">
          <DocumentacionMASidebar />
          <div className="flex-1 max-w-4xl mx-auto px-8 py-16">
            <Fase1Content />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Fase1;
