
import React from 'react';

interface MultiplePreviewProps {
  multiple: {
    sector_name: string;
    multiple_range: string;
    median_multiple: string;
    description?: string;
  };
}

const MultiplePreview = ({ multiple }: MultiplePreviewProps) => {
  return (
    <div className="p-6 bg-gray-50">
      <h3 className="text-lg font-medium text-black mb-4">Vista Previa - Múltiplo por Sector</h3>
      <div className="bg-white border-0.5 border-black rounded-lg shadow-sm max-w-2xl mx-auto">
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="font-medium text-black">{multiple.sector_name}</div>
            <div className="text-center">{multiple.multiple_range}</div>
            <div className="text-center font-semibold text-black">{multiple.median_multiple}</div>
            <div className="text-gray-600 text-xs">{multiple.description || '-'}</div>
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-gray-500 mt-4">
        Vista como aparecería en la tabla de múltiplos
      </p>
    </div>
  );
};

export default MultiplePreview;
