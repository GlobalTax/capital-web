
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminAccess = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => navigate('/admin')}
        variant="outline"
        size="sm"
        className="bg-white border border-gray-300 text-gray-600 hover:text-black hover:border-black rounded-lg shadow-sm"
      >
        Admin
      </Button>
    </div>
  );
};

export default AdminAccess;
