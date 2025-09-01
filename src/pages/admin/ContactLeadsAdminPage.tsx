import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GeneralContactLeadsTable from '@/components/admin/GeneralContactLeadsTable';
import SellLeadsTable from '@/components/admin/SellLeadsTable';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Mail, MessageSquare } from 'lucide-react';

const ContactLeadsAdminPage = () => {
  // Fetch stats for all types of leads
  const { data: generalContactStats } = useQuery({
    queryKey: ['general-contact-stats'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('general_contact_leads')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return { total: count || 0 };
    }
  });

  const { data: sellLeadsStats } = useQuery({
    queryKey: ['sell-leads-stats'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('sell_leads')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return { total: count || 0 };
    }
  });

  const { data: contactLeadsStats } = useQuery({
    queryKey: ['contact-leads-stats'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contact_leads')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return { total: count || 0 };
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestión de Leads de Contacto</h1>
        <p className="text-muted-foreground">
          Administrar todos los leads generados por los formularios de contacto
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contacto General</p>
                <p className="text-3xl font-bold">{generalContactStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Desde página de contacto</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Venta de Empresas</p>
                <p className="text-3xl font-bold">{sellLeadsStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Desde venta-empresas</p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contacto Legacy</p>
                <p className="text-3xl font-bold">{contactLeadsStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Sistema anterior</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different lead types */}
      <Tabs defaultValue="general-contact" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general-contact" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contacto General
            <Badge variant="secondary">{generalContactStats?.total || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sell-leads" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Venta de Empresas
            <Badge variant="secondary">{sellLeadsStats?.total || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="legacy-contact" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contacto Legacy
            <Badge variant="secondary">{contactLeadsStats?.total || 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general-contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Leads de Contacto General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GeneralContactLeadsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sell-leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Leads de Venta de Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SellLeadsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legacy-contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Leads de Contacto (Sistema Legacy)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Estos son los leads del sistema anterior. Nuevos leads se guardan en "Contacto General".
              </p>
              {/* Here you could add the old contact leads table if needed */}
              <div className="text-center p-8 text-gray-500">
                Tabla de contacto legacy - implementar si es necesario
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactLeadsAdminPage;