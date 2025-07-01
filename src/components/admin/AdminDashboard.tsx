
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import LeadNurturingDashboard from './LeadNurturingDashboard';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      return;
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "👋 Adiós!",
      description: "Has cerrado sesión exitosamente.",
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Lead Nurturing</h1>
          <p className="text-gray-600">Gestiona y convierte tus leads en clientes</p>
        </div>
        <Button variant="destructive" onClick={handleSignOut}>
          Cerrar Sesión
        </Button>
      </div>

      <LeadNurturingDashboard />
    </div>
  );
};

export default AdminDashboard;
