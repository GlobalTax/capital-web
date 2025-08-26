import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CalculatorLayout } from './CalculatorLayout';
import { CalculatorDashboard } from './CalculatorDashboard';
import { AdvancedCalculator } from './AdvancedCalculator';
import { UserValuationsHistory } from './UserValuationsHistory';
import { ValuationDetail } from './ValuationDetail';
import { CalculatorSettings } from './CalculatorSettings';
import { CalculatorAuthGuard } from './CalculatorAuthGuard';

const CalculatorApp: React.FC = () => {
  const { user, isApproved, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <CalculatorAuthGuard>
      <CalculatorLayout>
        <Routes>
          <Route path="/" element={<CalculatorDashboard />} />
          <Route path="/nueva-valoracion" element={<AdvancedCalculator />} />
          <Route path="/historial" element={<UserValuationsHistory />} />
          <Route path="/valoracion/:id" element={<ValuationDetail />} />
          <Route path="/configuracion" element={<CalculatorSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CalculatorLayout>
    </CalculatorAuthGuard>
  );
};

export default CalculatorApp;