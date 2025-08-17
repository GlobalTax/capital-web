import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { ProfileValuations } from './ProfileValuations';
import { ValuationDetail } from './ValuationDetail';
import { ValoracionDetallePage } from './ValoracionDetallePage';

export const ProfileRouter: React.FC = () => {
  return (
    <ProfileLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/perfil/valoraciones" replace />} />
        <Route path="/valoraciones" element={<ProfileValuations />} />
        <Route path="/valoraciones/:id" element={<ValoracionDetallePage />} />
      </Routes>
    </ProfileLayout>
  );
};

export default ProfileRouter;