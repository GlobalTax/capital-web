import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { ProfileValuations } from './ProfileValuations';
import { ValuationDetail } from './ValuationDetail';

export const ProfileRouter: React.FC = () => {
  return (
    <ProfileLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/perfil/valoraciones" replace />} />
        <Route path="/valoraciones" element={<ProfileValuations />} />
        <Route path="/valoraciones/:id" element={<ValuationDetail />} />
      </Routes>
    </ProfileLayout>
  );
};

export default ProfileRouter;