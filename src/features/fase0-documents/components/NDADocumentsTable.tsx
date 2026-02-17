import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Download, Send, CheckCircle, MoreHorizontal, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFase0Documents, useUpdateFase0Document } from '../hooks/useFase0Documents';
import {
  Fase0Document,
  Fase0DocumentType,
  Fase0DocumentStatus,
  FASE0_DOCUMENT_TYPE_LABELS,
  FASE0_STATUS_LABELS,
  FASE0_STATUS_COLORS,
} from '../types';
import { toast } from 'sonner';

interface NDADocumentsTableProps {
  onSelectDocument: (doc: Fase0Document) => void;
}

const formatDate = (date: string | null) => {
  if (!date) return '—';
  return format(new Date(date), 'dd/MM/yy', { locale: es });
};

export const NDADocumentsTable: React.FC<NDADocumentsTableProps> = ({ onSelectDocument }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: documents, isLoading } = useFase0Documents();
  const updateDocument = useUpdateFase0Document();

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return documents.filter((doc) => {
      // Type filter
      if (typeFilter !== 'all' && doc.document_type !== typeFilter) return false;
      // Status filter
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const clientName = (doc.filled_data?.cliente_nombre || '').toLowerCase();
        const clientCompany = (doc.filled_data?.cliente_empresa || '').toLowerCase();
        const ref = (doc.reference_number || '').toLowerCase();
        if (!clientName.includes(q) && !clientCompany.includes(q) && !ref.includes(q)) return false;
      }
      return true;
    });
  }, [documents, typeFilter, statusFilter, searchQuery]);

  const handleMarkSigned = (doc: Fase0Document) => {
    updateDocument.mutate({
      id: doc.id,
      updates: { status: 'signed', signed_at: new Date().toISOString() },
    }, {
      onSuccess: () => toast.success('Documento marcado como firmado'),
    });
  };

  const getClientLabel = (doc: Fase0Document) => {
    const name = doc.filled_data?.cliente_nombre || '';
    const company = doc.filled_data?.cliente_empresa || '';
    if (name && company) return `${name} — ${company}`;
    return name || company || 'Sin datos';
  };

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Cargando documentos…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa, cliente o referencia…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="nda">NDA</SelectItem>
            <SelectItem value="mandato_venta">Mandato Venta</SelectItem>
            <SelectItem value="mandato_compra">Mandato Compra</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="viewed">Visto</SelectItem>
            <SelectItem value="signed">Firmado</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente / Empresa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ref.</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Enviado</TableHead>
              <TableHead>Visto</TableHead>
              <TableHead>Firmado</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No se encontraron documentos
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectDocument(doc)}
                >
                  <TableCell className="font-medium max-w-[220px] truncate">
                    {getClientLabel(doc)}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">{FASE0_DOCUMENT_TYPE_LABELS[doc.document_type]}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {doc.reference_number || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${FASE0_STATUS_COLORS[doc.status]}`}>
                      {FASE0_STATUS_LABELS[doc.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(doc.sent_at)}</TableCell>
                  <TableCell className="text-xs">{formatDate(doc.viewed_at)}</TableCell>
                  <TableCell className="text-xs">{formatDate(doc.signed_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectDocument(doc); }}>
                          <FileText className="h-4 w-4 mr-2" /> Ver detalle
                        </DropdownMenuItem>
                        {doc.pdf_url && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(doc.pdf_url!, '_blank'); }}>
                            <Download className="h-4 w-4 mr-2" /> Descargar PDF
                          </DropdownMenuItem>
                        )}
                        {doc.status !== 'signed' && doc.status !== 'cancelled' && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkSigned(doc); }}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Marcar firmado
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
