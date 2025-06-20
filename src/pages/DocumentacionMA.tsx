
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentacionMAHero from '@/components/documentacion-ma/DocumentacionMAHero';
import DocumentacionMAStartHere from '@/components/documentacion-ma/DocumentacionMAStartHere';
import DocumentacionMATableOfContents from '@/components/documentacion-ma/DocumentacionMATableOfContents';
import DocumentacionMAContent from '@/components/documentacion-ma/DocumentacionMAContent';
import DocumentacionMAPopularArticles from '@/components/documentacion-ma/DocumentacionMAPopularArticles';

const DocumentacionMA = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        <div className="max-w-5xl mx-auto px-6">
          <DocumentacionMAHero />
          <DocumentacionMAStartHere />
          <DocumentacionMATableOfContents />
          <DocumentacionMAContent />
        </div>
      </div>
      <DocumentacionMAPopularArticles />
      <Footer />
    </div>
  );
};

export default DocumentacionMA;
