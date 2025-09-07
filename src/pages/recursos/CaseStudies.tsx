
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DetailedCaseStudies from '@/components/DetailedCaseStudies';

const CaseStudiesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <DetailedCaseStudies />
      </div>
      <Footer />
    </div>
  );
};

export default CaseStudiesPage;
