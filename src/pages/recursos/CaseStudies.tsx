
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CaseStudies from '@/components/CaseStudies';

const CaseStudiesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <CaseStudies />
      </div>
      <Footer />
    </div>
  );
};

export default CaseStudiesPage;
