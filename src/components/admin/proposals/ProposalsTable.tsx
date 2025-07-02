import React, { useState } from 'react';
import { useProposals } from '@/hooks/useProposals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Send, 
  Trash2, 
  Download,
  Copy,
  ExternalLink
} from 'lucide-react';
import { FeeProposal } from '@/types/proposals';
import { PROPOSAL_STATUS_LABELS, SERVICE_TYPE_LABELS } from '@/types/proposals';

export const ProposalsTable = () => {
  const { proposals, sendProposal, deleteProposal } = useProposals();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<FeeProposal | null>(null);

  const filteredProposals = proposals.filter(proposal =>
    proposal.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.client_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.proposal_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.proposal_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'sent': return 'secondary';
      case 'viewed': return 'outline';
      case 'rejected': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return `€${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const handleSendProposal = async (id: string) => {
    await sendProposal(id);
  };

  const handleDeleteProposal = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propuesta?')) {
      await deleteProposal(id);
    }
  };

  const copyProposalUrl = (proposal: FeeProposal) => {
    if (proposal.unique_url) {
      const url = `${window.location.origin}/propuesta/${proposal.unique_url}`;
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Propuestas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, empresa, título o número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead>Enviada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-medium">
                      {proposal.proposal_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{proposal.client_name}</p>
                        <p className="text-sm text-gray-500">{proposal.client_company}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {SERVICE_TYPE_LABELS[proposal.service_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(proposal.estimated_fee)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(proposal.status)}>
                        {PROPOSAL_STATUS_LABELS[proposal.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(proposal.created_at)}
                    </TableCell>
                    <TableCell>
                      {formatDate(proposal.sent_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {proposal.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleSendProposal(proposal.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar
                            </DropdownMenuItem>
                          )}
                          {proposal.unique_url && (
                            <>
                              <DropdownMenuItem onClick={() => copyProposalUrl(proposal)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar URL
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Abrir Propuesta
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteProposal(proposal.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProposals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron propuestas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};