
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentacionMAHero from '@/components/documentacion-ma/DocumentacionMAHero';
import DocumentacionMAStartHere from '@/components/documentacion-ma/DocumentacionMAStartHere';
import DocumentacionMAContent from '@/components/documentacion-ma/DocumentacionMAContent';
import DocumentacionMAPopularArticles from '@/components/documentacion-ma/DocumentacionMAPopularArticles';

const DocumentacionMA = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <DocumentacionMAHero />
      <DocumentacionMAStartHere />
      <DocumentacionMAContent />
      <DocumentacionMAPopularArticles />
      <Footer />
    </div>
  );
};

export default DocumentacionMA;
