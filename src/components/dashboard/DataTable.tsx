
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataItem {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
}

interface DataTableProps {
  data: DataItem[];
}

export function DataTable({ data }: DataTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'In Process':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Technical content':
        return 'bg-blue-100 text-blue-800';
      case 'Narrative':
        return 'bg-purple-100 text-purple-800';
      case 'Legal':
        return 'bg-red-100 text-red-800';
      case 'Research':
        return 'bg-orange-100 text-orange-800';
      case 'Planning':
        return 'bg-cyan-100 text-cyan-800';
      case 'Financial':
        return 'bg-green-100 text-green-800';
      case 'Visual':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mx-4 lg:mx-6">
      <CardHeader>
        <CardTitle>Elementos de Documentación</CardTitle>
        <CardDescription>
          Estado actual de todos los elementos del proyecto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Límite</TableHead>
                <TableHead>Revisor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 20).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.header}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(item.type)} variant="secondary">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)} variant="secondary">
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.target}</TableCell>
                  <TableCell>{item.limit}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.reviewer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.length > 20 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Mostrando 20 de {data.length} elementos
          </div>
        )}
      </CardContent>
    </Card>
  );
}
