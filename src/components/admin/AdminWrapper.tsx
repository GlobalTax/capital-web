import React from 'react';

interface AdminWrapperProps {
  children: React.ReactNode;
}

// Simplified AdminWrapper - just passes through children
// Auth logic is now handled directly in Admin.tsx
export const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
  return <>{children}</>;
};