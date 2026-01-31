import React from 'react';

interface TestLayoutProps {
  children: React.ReactNode;
}

const TestLayout: React.FC<TestLayoutProps> = ({ children }) => {
  return (
    <div className="dark-institutional min-h-screen bg-[hsl(var(--dark-bg))]">
      {children}
    </div>
  );
};

export default TestLayout;
