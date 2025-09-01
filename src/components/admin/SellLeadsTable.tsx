import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SellLead {
  id: string;
  full_name: string;
  company: string;
  email: string;
  phone?: string;
  message?: string;
  page_origin?: string;
  status: string;
  email_sent: boolean;
  created_at: string;
}

const SellLeadsTable = () => {
  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['sell-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sell_leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SellLead[];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-green-100 text-green-800';
      case 'qualified': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        Error al cargar los leads de venta de empresas
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Leads de Venta de Empresas</h2>
        <Badge variant="outline">{leads?.length || 0} leads</Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Email Enviado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads?.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.full_name}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell className="text-sm">{lead.email}</TableCell>
                <TableCell>{lead.phone || '-'}</TableCell>
                <TableCell className="max-w-xs truncate" title={lead.message || ''}>
                  {lead.message ? (
                    lead.message.length > 50 
                      ? `${lead.message.substring(0, 50)}...` 
                      : lead.message
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {lead.page_origin || 'venta-empresas'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.email_sent ? (
                    <Badge className="bg-green-100 text-green-800">Enviado</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Pendiente</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {leads?.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No hay leads de venta de empresas registrados
        </div>
      )}
    </div>
  );
};

export default SellLeadsTable;