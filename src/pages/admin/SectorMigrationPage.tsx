import React from 'react';
import SectorMigrationPanel from '@/components/admin/SectorMigrationPanel';

const SectorMigrationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Migración de Sectores PE</h1>
        <p className="text-muted-foreground mt-1">
          Normaliza los sectores existentes a la taxonomía estándar de Private Equity y Search Funds
        </p>
      </div>
      <SectorMigrationPanel />
    </div>
  );
};

export default SectorMigrationPage;
