import React from 'react';

interface TestLayoutProps {
  children: React.ReactNode;
}

const TestLayout: React.FC<TestLayoutProps> = ({ children }) => {
  return (
    <div className="light-institutional min-h-screen bg-white">
      {children}
    </div>
  );
};

export default TestLayout;
