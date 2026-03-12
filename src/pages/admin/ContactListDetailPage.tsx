import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft, Upload, Plus, Download, Building2, MoreHorizontal,
  Edit, Trash2, History, Link2, AlertTriangle, Filter, FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useContactListCompanies,
  useContactListCampaigns,
  useCompanyListHistory,
  ContactListCompany,
  ContactListTipo,
} from '@/hooks/useContactLists';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';

// ===== UTILS =====
const normalizeColumnName = (name: string): string =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').trim();

const COLUMN_SYNONYMS: Record<string, string[]> = {
  empresa: ['empresa', 'nombre_empresa', 'company', 'nombre', 'razon_social', 'compania'],
  contacto: ['contacto', 'nombre_cliente', 'nombre_contacto', 'contact', 'persona'],
  email: ['email', 'mail', 'correo', 'e_mail', 'correo_electronico'],
  telefono: ['telefono', 'phone', 'tel', 'movil', 'celular'],
  cif: ['cif', 'nif', 'tax_id', 'identificacion_fiscal'],
  web: ['web', 'website', 'url', 'sitio_web', 'pagina_web'],
  provincia: ['provincia', 'ubicacion', 'location', 'region', 'estado', 'ciudad'],
  facturacion: ['facturacion', 'ventas', 'revenue', 'ingresos', 'ventas_2024', 'ventas_2023', 'facturacion_2024'],
  ebitda: ['ebitda', 'ebitda_2024', 'ebitda_2023', 'resultado'],
  anios_datos: ['anio_datos', 'ano_datos', 'anio', 'ano', 'year', 'ano_datos', 'anios_datos', 'ano_data'],
  num_trabajadores: ['num_trabajadores', 'n__trabajadores', 'trabajadores', 'empleados', 'employees', 'numero_trabajadores', 'no_trabajadores', 'plantilla'],
  director_ejecutivo: ['director_ejecutivo', 'director', 'ceo', 'gerente', 'director_general', 'administrador'],
  linkedin: ['linkedin', 'perfil_linkedin', 'linkedin_url', 'url_linkedin'],
  comunidad_autonoma: ['comunidad_autonoma', 'comunidad', 'ccaa', 'autonomia', 'comunidad_autonomica', 'region_autonoma'],
};

function parseSpanishNumber(val: any): number | null {
  if (val == null || val === '') return null;
  if (typeof val === 'number') return val;
  const str = String(val).trim().replace(/[€$%\s]/g, '');
  const parsed = parseFloat(str.replace(/\./g, '').replace(',', '.'));
  return isNaN(parsed) ? null : parsed;
}

function mapColumn(normalized: string): string | null {
  for (const [field, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
    if (synonyms.includes(normalized)) return field;
  }
  return null;
}

// ===== TEMPLATE DOWNLOAD =====
function downloadTemplate() {
  const headers = [
    'Nombre empresa', 'CIF', 'Año datos', 'Facturación', 'EBITDA',
    'Nº Trabajadores', 'Director Ejecutivo', 'Nombre Contacto',
    'Email', 'LinkedIn', 'Teléfono', 'Web', 'Provincia', 'Comunidad Autónoma',
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  // Set column widths
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 4, 16) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
  XLSX.writeFile(wb, 'plantilla_lista_contactos.xlsx');
}

// ===== ESTADO BADGES =====
const ESTADO_CONFIG: Record<string, { label: string; className: string }> = {
  borrador: { label: 'Borrador', className: 'bg-muted text-muted-foreground border-border' },
  activa: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  archivada: { label: 'Archivada', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function ContactListDetailPage() {
  const { id: listId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: list, isLoading: isLoadingList } = useQuery({
    queryKey: ['contact-list-detail', listId],
    enabled: !!listId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outbound_lists' as any)
        .select('*')
        .eq('id', listId!)
        .single();
      if (error) throw error;
      return data as any;
    },
  });

  const { companies, isLoading: isLoadingCompanies, addCompany, addCompanies, updateCompany, deleteCompany, deleteCompanies } = useContactListCompanies(listId);
  const { campaigns, isLoading: isLoadingCampaigns, linkCampaign } = useContactListCampaigns(listId);

  // State
  const [activeTab, setActiveTab] = useState('empresas');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLinkCampaignOpen, setIsLinkCampaignOpen] = useState(false);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [drawerCompany, setDrawerCompany] = useState<ContactListCompany | null>(null);
  const [editingCompany, setEditingCompany] = useState<ContactListCompany | null>(null);

  // Config tab state
  const [configName, setConfigName] = useState('');
  const [configDesc, setConfigDesc] = useState('');
  const [configSector, setConfigSector] = useState('');
  const [configEstado, setConfigEstado] = useState('borrador');
  const [configTipo, setConfigTipo] = useState<ContactListTipo>('outbound');

  React.useEffect(() => {
    if (list) {
      setConfigName(list.name || '');
      setConfigDesc(list.description || '');
      setConfigSector(list.sector || '');
      setConfigEstado(list.estado || 'borrador');
      setConfigTipo(list.tipo || 'outbound');
    }
  }, [list]);

  // Add manual form state
  const [addForm, setAddForm] = useState({
    empresa: '', contacto: '', email: '', telefono: '', cif: '', web: '',
    provincia: '', facturacion: '', ebitda: '', notas: '',
    num_trabajadores: '', director_ejecutivo: '', linkedin: '', comunidad_autonoma: '',
  });

  // Import state
  const [importData, setImportData] = useState<any[]>([]);
  const [importMapping, setImportMapping] = useState<Record<string, string>>({});

  // Link campaign state
  const [linkCampaignId, setLinkCampaignId] = useState('');
  const [linkCampaignNotes, setLinkCampaignNotes] = useState('');

  // Available campaigns
  const { data: availableCampaigns = [] } = useQuery({
    queryKey: ['valuation-campaigns-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('valuation_campaigns')
        .select('id, name')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  // ===== HANDLERS =====
  const handleSelectAll = () => {
    setSelectedIds(selectedIds.length === companies.length ? [] : companies.map(c => c.id));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`¿Eliminar ${selectedIds.length} empresas de esta lista?`)) return;
    await deleteCompanies.mutateAsync(selectedIds);
    setSelectedIds([]);
  };

  const handleAddManual = async () => {
    if (!addForm.empresa.trim() || !listId) return;
    await addCompany.mutateAsync({
      list_id: listId,
      empresa: addForm.empresa.trim(),
      contacto: addForm.contacto.trim() || null,
      email: addForm.email.trim() || null,
      telefono: addForm.telefono.trim() || null,
      cif: addForm.cif.trim() || null,
      web: addForm.web.trim() || null,
      provincia: addForm.provincia.trim() || null,
      facturacion: parseSpanishNumber(addForm.facturacion),
      ebitda: parseSpanishNumber(addForm.ebitda),
      anios_datos: 1,
      notas: addForm.notas.trim() || null,
      num_trabajadores: addForm.num_trabajadores ? parseInt(addForm.num_trabajadores) || null : null,
      director_ejecutivo: addForm.director_ejecutivo.trim() || null,
      linkedin: addForm.linkedin.trim() || null,
      comunidad_autonoma: addForm.comunidad_autonoma.trim() || null,
    });
    setAddForm({ empresa: '', contacto: '', email: '', telefono: '', cif: '', web: '', provincia: '', facturacion: '', ebitda: '', notas: '', num_trabajadores: '', director_ejecutivo: '', linkedin: '', comunidad_autonoma: '' });
    setIsAddModalOpen(false);
    toast.success('Empresa añadida');
  };

  // ===== EXCEL IMPORT =====
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (json.length === 0) {
        toast.error('El archivo está vacío');
        return;
      }
      const headers = Object.keys(json[0] as any);
      const mapping: Record<string, string> = {};
      headers.forEach(h => {
        const norm = normalizeColumnName(h);
        const field = mapColumn(norm);
        if (field) mapping[h] = field;
      });
      setImportMapping(mapping);
      setImportData(json);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] },
    maxFiles: 1,
  });

  const handleConfirmImport = async () => {
    if (!listId || importData.length === 0) return;
    const rows = importData.map((row: any) => {
      const mapped: any = { list_id: listId, anios_datos: 1 };
      for (const [header, field] of Object.entries(importMapping)) {
        const val = row[header];
        if (field === 'facturacion' || field === 'ebitda') {
          mapped[field] = parseSpanishNumber(val);
        } else if (field === 'num_trabajadores' || field === 'anios_datos') {
          mapped[field] = val ? parseInt(String(val)) || null : null;
        } else {
          mapped[field] = val ? String(val).trim() : null;
        }
      }
      if (!mapped.empresa) mapped.empresa = mapped.cif || mapped.contacto || mapped.email || 'Sin nombre';
      return mapped;
    });

    await addCompanies.mutateAsync(rows);
    await supabase.from('outbound_lists' as any).update({ origen: 'excel', updated_at: new Date().toISOString() }).eq('id', listId);
    queryClient.invalidateQueries({ queryKey: ['contact-list-detail', listId] });
    setImportData([]);
    setImportMapping({});
    setIsImportModalOpen(false);
  };

  // ===== EXPORT EXCEL =====
  const handleExport = () => {
    if (companies.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(companies.map(c => ({
      'Nombre empresa': c.empresa,
      'CIF': c.cif || '',
      'Año datos': c.anios_datos || '',
      'Facturación': c.facturacion || '',
      'EBITDA': c.ebitda || '',
      'Nº Trabajadores': c.num_trabajadores || '',
      'Director Ejecutivo': c.director_ejecutivo || '',
      'Nombre Contacto': c.contacto || '',
      'Email': c.email || '',
      'LinkedIn': c.linkedin || '',
      'Teléfono': c.telefono || '',
      'Web': c.web || '',
      'Provincia': c.provincia || '',
      'Notas': c.notas || '',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Empresas');
    XLSX.writeFile(wb, `${list?.name || 'lista'}.xlsx`);
  };

  // ===== LINK CAMPAIGN =====
  const handleLinkCampaign = async () => {
    if (!linkCampaignId || !listId) return;
    const campaign = availableCampaigns.find(c => c.id === linkCampaignId);
    await linkCampaign.mutateAsync({
      list_id: listId,
      campaign_id: linkCampaignId,
      campaign_nombre: campaign?.name || '',
      notas: linkCampaignNotes.trim() || undefined,
      empresas_enviadas: companies.length,
    });
    setIsLinkCampaignOpen(false);
    setLinkCampaignId('');
    setLinkCampaignNotes('');
  };

  // ===== SAVE CONFIG =====
  const handleSaveConfig = async () => {
    if (!listId) return;
    await supabase.from('outbound_lists' as any).update({
      name: configName,
      description: configDesc || null,
      sector: configSector || null,
      tipo: configTipo,
      estado: configEstado,
      updated_at: new Date().toISOString(),
    }).eq('id', listId);
    queryClient.invalidateQueries({ queryKey: ['contact-list-detail', listId] });
    queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    toast.success('Configuración guardada');
  };

  const handleDeleteList = async () => {
    if (!confirm('¿Eliminar esta lista y todas sus empresas? Esta acción no se puede deshacer.')) return;
    await supabase.from('outbound_lists' as any).delete().eq('id', listId!);
    queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    navigate('/admin/listas-contacto');
    toast.success('Lista eliminada');
  };

  const handleEstadoChange = async (newEstado: string) => {
    if (!listId) return;
    await supabase.from('outbound_lists' as any).update({ estado: newEstado, updated_at: new Date().toISOString() }).eq('id', listId);
    queryClient.invalidateQueries({ queryKey: ['contact-list-detail', listId] });
    queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
  };

  if (isLoadingList) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!list) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Lista no encontrada</p></div>;
  }

  const estadoConfig = ESTADO_CONFIG[list.estado] || ESTADO_CONFIG.borrador;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/listas-contacto')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{list.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button>
                    <Badge variant="outline" className={cn('text-xs cursor-pointer', estadoConfig.className)}>
                      {estadoConfig.label}
                    </Badge>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background">
                  <DropdownMenuItem onClick={() => handleEstadoChange('borrador')}>Borrador</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEstadoChange('activa')}>Activa</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEstadoChange('archivada')}>Archivada</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {list.sector && <span>· {list.sector}</span>}
              <span>· {list.contact_count} empresas</span>
              <span>· {new Date(list.created_at).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="empresas">Empresas ({companies.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial de Campañas</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
        </TabsList>

        {/* TAB 1: Empresas */}
        <TabsContent value="empresas" className="mt-4 space-y-4">
          {/* Actions bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Descargar plantilla
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" /> Importar Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Añadir manualmente
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPoolModalOpen(true)}>
              <Filter className="h-4 w-4 mr-2" /> Filtrar del pool
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={companies.length === 0}>
              <Download className="h-4 w-4 mr-2" /> Exportar Excel
            </Button>
          </div>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedIds.length} seleccionadas</span>
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4 mr-1" /> Eliminar seleccionadas
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Cancelar</Button>
            </div>
          )}

          {/* Companies table */}
          <Card>
            <CardContent className="p-0">
              {isLoadingCompanies ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
              ) : companies.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay empresas en esta lista</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Descarga la plantilla, rellénala e impórtala</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox checked={selectedIds.length === companies.length && companies.length > 0} onCheckedChange={handleSelectAll} />
                        </TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>CIF</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Director Ejecutivo</TableHead>
                        <TableHead className="text-right">Facturación</TableHead>
                        <TableHead className="text-right">EBITDA</TableHead>
                        <TableHead className="text-right">Empleados</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map(company => (
                        <TableRow key={company.id}>
                          <TableCell onClick={e => e.stopPropagation()}>
                            <Checkbox checked={selectedIds.includes(company.id)} onCheckedChange={() => handleToggleSelect(company.id)} />
                          </TableCell>
                          <TableCell>
                            <button className="text-sm font-medium hover:underline text-left" onClick={() => setDrawerCompany(company)}>
                              {company.empresa}
                            </button>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{company.cif || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{company.contacto || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{company.email || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{company.director_ejecutivo || '—'}</TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            {company.facturacion ? `€${Number(company.facturacion).toLocaleString('es-ES')}` : '—'}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            {company.ebitda ? `€${Number(company.ebitda).toLocaleString('es-ES')}` : '—'}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            {company.num_trabajadores ?? '—'}
                          </TableCell>
                          <TableCell onClick={e => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background">
                                <DropdownMenuItem onClick={() => setEditingCompany(company)}>
                                  <Edit className="h-4 w-4 mr-2" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => deleteCompany.mutate(company.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Historial de Campañas */}
        <TabsContent value="historial" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsLinkCampaignOpen(true)}>
              <Link2 className="h-4 w-4 mr-2" /> Vincular a campaña existente
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {isLoadingCampaigns ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Esta lista aún no ha sido vinculada a ninguna campaña.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaña</TableHead>
                      <TableHead>Fecha de vinculación</TableHead>
                      <TableHead className="text-right">Nº empresas enviadas</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.campaign_nombre || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(c.fecha_vinculacion).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.empresas_enviadas}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.notas || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Configuración */}
        <TabsContent value="config" className="mt-4 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input value={configName} onChange={e => setConfigName(e.target.value)} />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea value={configDesc} onChange={e => setConfigDesc(e.target.value)} rows={3} />
              </div>
              <div>
                <Label>Tipo de lista</Label>
                <Select value={configTipo} onValueChange={(v) => setConfigTipo(v as ContactListTipo)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="compradores">Potenciales compradores</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sector</Label>
                <Input value={configSector} onChange={e => setConfigSector(e.target.value)} />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={configEstado} onValueChange={setConfigEstado}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="activa">Activa</SelectItem>
                    <SelectItem value="archivada">Archivada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveConfig}>Guardar cambios</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="font-medium text-destructive">Zona peligrosa</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Eliminar esta lista y todas las empresas asociadas. Esta acción no se puede deshacer.</p>
              <Button variant="destructive" onClick={handleDeleteList}>
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar lista
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== MODALS ===== */}

      {/* Add Manual Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Añadir empresa manualmente</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="col-span-2"><Label>Empresa *</Label><Input value={addForm.empresa} onChange={e => setAddForm(p => ({ ...p, empresa: e.target.value }))} /></div>
            <div><Label>CIF</Label><Input value={addForm.cif} onChange={e => setAddForm(p => ({ ...p, cif: e.target.value }))} /></div>
            <div><Label>Facturación (€)</Label><Input value={addForm.facturacion} onChange={e => setAddForm(p => ({ ...p, facturacion: e.target.value }))} /></div>
            <div><Label>EBITDA (€)</Label><Input value={addForm.ebitda} onChange={e => setAddForm(p => ({ ...p, ebitda: e.target.value }))} /></div>
            <div><Label>Nº Trabajadores</Label><Input type="number" value={addForm.num_trabajadores} onChange={e => setAddForm(p => ({ ...p, num_trabajadores: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Director Ejecutivo</Label><Input value={addForm.director_ejecutivo} onChange={e => setAddForm(p => ({ ...p, director_ejecutivo: e.target.value }))} /></div>
            <div><Label>Nombre Contacto</Label><Input value={addForm.contacto} onChange={e => setAddForm(p => ({ ...p, contacto: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>LinkedIn</Label><Input value={addForm.linkedin} onChange={e => setAddForm(p => ({ ...p, linkedin: e.target.value }))} /></div>
            <div><Label>Teléfono</Label><Input value={addForm.telefono} onChange={e => setAddForm(p => ({ ...p, telefono: e.target.value }))} /></div>
            <div><Label>Web</Label><Input value={addForm.web} onChange={e => setAddForm(p => ({ ...p, web: e.target.value }))} /></div>
            <div><Label>Provincia</Label><Input value={addForm.provincia} onChange={e => setAddForm(p => ({ ...p, provincia: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notas</Label><Textarea value={addForm.notas} onChange={e => setAddForm(p => ({ ...p, notas: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddManual} disabled={!addForm.empresa.trim()}>Añadir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Excel Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={(open) => { setIsImportModalOpen(open); if (!open) { setImportData([]); setImportMapping({}); } }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Importar desde Excel</DialogTitle></DialogHeader>
          {importData.length === 0 ? (
            <div className="space-y-3">
              <div {...getRootProps()} className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}>
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">Arrastra un archivo .xlsx aquí o haz clic para seleccionar</p>
              </div>
              <Button variant="link" size="sm" className="text-xs" onClick={downloadTemplate}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Descargar plantilla con las cabeceras correctas
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {importData.length} filas encontradas · {Object.keys(importMapping).length} columnas mapeadas
              </div>
              <div className="max-h-[300px] overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.entries(importMapping).map(([header, field]) => (
                        <TableHead key={header} className="text-xs">{field} <span className="text-muted-foreground/50">({header})</span></TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {Object.keys(importMapping).map(header => (
                          <TableCell key={header} className="text-xs">{String(row[header] ?? '—')}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {importData.length > 5 && <p className="text-xs text-muted-foreground">...y {importData.length - 5} filas más</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportData([]); setImportMapping({}); setIsImportModalOpen(false); }}>Cancelar</Button>
            {importData.length > 0 && (
              <Button onClick={handleConfirmImport} disabled={addCompanies.isPending}>
                {addCompanies.isPending ? 'Importando...' : `Importar ${importData.length} empresas`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pool Filter Modal */}
      <PoolFilterModal listId={listId!} open={isPoolModalOpen} onOpenChange={setIsPoolModalOpen} onAdd={async (rows) => {
        await addCompanies.mutateAsync(rows);
        setIsPoolModalOpen(false);
      }} isAdding={addCompanies.isPending} />

      {/* Link Campaign Modal */}
      <Dialog open={isLinkCampaignOpen} onOpenChange={setIsLinkCampaignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Vincular a campaña</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Campaña</Label>
              <Select value={linkCampaignId} onValueChange={setLinkCampaignId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar campaña..." /></SelectTrigger>
                <SelectContent className="bg-background">
                  {availableCampaigns.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={linkCampaignNotes} onChange={e => setLinkCampaignNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkCampaignOpen(false)}>Cancelar</Button>
            <Button onClick={handleLinkCampaign} disabled={!linkCampaignId || linkCampaign.isPending}>Vincular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      {editingCompany && (
        <EditCompanyDialog
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSave={async (updates) => {
            await updateCompany.mutateAsync({ id: editingCompany.id, ...updates });
            setEditingCompany(null);
          }}
          isSaving={updateCompany.isPending}
        />
      )}

      {/* Company Drawer */}
      <CompanyDrawer company={drawerCompany} onClose={() => setDrawerCompany(null)} onEdit={() => { setEditingCompany(drawerCompany); setDrawerCompany(null); }} />
    </div>
  );
}

// ===== POOL FILTER MODAL =====
function PoolFilterModal({ listId, open, onOpenChange, onAdd, isAdding }: {
  listId: string; open: boolean; onOpenChange: (v: boolean) => void;
  onAdd: (rows: any[]) => Promise<void>; isAdding: boolean;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const { data: poolCompanies = [], isLoading } = useQuery({
    queryKey: ['pool-companies-for-list', search],
    enabled: open,
    queryFn: async () => {
      let query = supabase
        .from('valuation_campaign_companies')
        .select('id, client_company, client_cif, client_sector, client_provincia, client_email, client_contact_name, client_revenue, client_ebitda, client_website')
        .order('client_company')
        .limit(100);
      if (search) query = query.ilike('client_company', `%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const handleAdd = async () => {
    const rows = poolCompanies.filter(c => selected.includes(c.id)).map(c => ({
      list_id: listId,
      empresa: c.client_company || 'Sin nombre',
      contacto: c.client_contact_name || null,
      email: c.client_email || null,
      cif: c.client_cif || null,
      web: c.client_website || null,
      provincia: c.client_provincia || null,
      facturacion: c.client_revenue || null,
      ebitda: c.client_ebitda || null,
      anios_datos: 1,
      telefono: null,
      notas: null,
      num_trabajadores: null,
      director_ejecutivo: null,
      linkedin: null,
      comunidad_autonoma: null,
    }));
    await onAdd(rows);
    setSelected([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Filtrar del pool de empresas</DialogTitle></DialogHeader>
        <Input placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="max-h-[350px] overflow-auto border rounded-lg">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox checked={selected.length === poolCompanies.length && poolCompanies.length > 0} onCheckedChange={() => setSelected(selected.length === poolCompanies.length ? [] : poolCompanies.map(c => c.id))} /></TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Provincia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poolCompanies.map(c => (
                  <TableRow key={c.id}>
                    <TableCell><Checkbox checked={selected.includes(c.id)} onCheckedChange={() => setSelected(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])} /></TableCell>
                    <TableCell className="text-sm">{c.client_company}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.client_sector || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.client_provincia || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleAdd} disabled={selected.length === 0 || isAdding}>
            {isAdding ? 'Añadiendo...' : `Añadir ${selected.length} seleccionadas`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== EDIT COMPANY DIALOG =====
function EditCompanyDialog({ company, onClose, onSave, isSaving }: {
  company: ContactListCompany; onClose: () => void;
  onSave: (updates: Partial<ContactListCompany>) => Promise<void>; isSaving: boolean;
}) {
  const [form, setForm] = useState({
    empresa: company.empresa,
    contacto: company.contacto || '',
    email: company.email || '',
    telefono: company.telefono || '',
    cif: company.cif || '',
    web: company.web || '',
    provincia: company.provincia || '',
    facturacion: company.facturacion ? String(company.facturacion) : '',
    ebitda: company.ebitda ? String(company.ebitda) : '',
    notas: company.notas || '',
    num_trabajadores: company.num_trabajadores ? String(company.num_trabajadores) : '',
    director_ejecutivo: company.director_ejecutivo || '',
    linkedin: company.linkedin || '',
    comunidad_autonoma: company.comunidad_autonoma || '',
  });

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Editar empresa</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          <div className="col-span-2"><Label>Empresa</Label><Input value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} /></div>
          <div><Label>CIF</Label><Input value={form.cif} onChange={e => setForm(p => ({ ...p, cif: e.target.value }))} /></div>
          <div><Label>Facturación</Label><Input value={form.facturacion} onChange={e => setForm(p => ({ ...p, facturacion: e.target.value }))} /></div>
          <div><Label>EBITDA</Label><Input value={form.ebitda} onChange={e => setForm(p => ({ ...p, ebitda: e.target.value }))} /></div>
          <div><Label>Nº Trabajadores</Label><Input type="number" value={form.num_trabajadores} onChange={e => setForm(p => ({ ...p, num_trabajadores: e.target.value }))} /></div>
          <div className="col-span-2"><Label>Director Ejecutivo</Label><Input value={form.director_ejecutivo} onChange={e => setForm(p => ({ ...p, director_ejecutivo: e.target.value }))} /></div>
          <div><Label>Contacto</Label><Input value={form.contacto} onChange={e => setForm(p => ({ ...p, contacto: e.target.value }))} /></div>
          <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div><Label>LinkedIn</Label><Input value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} /></div>
          <div><Label>Teléfono</Label><Input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} /></div>
          <div><Label>Web</Label><Input value={form.web} onChange={e => setForm(p => ({ ...p, web: e.target.value }))} /></div>
          <div><Label>Provincia</Label><Input value={form.provincia} onChange={e => setForm(p => ({ ...p, provincia: e.target.value }))} /></div>
          <div className="col-span-2"><Label>Notas</Label><Textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={isSaving} onClick={() => onSave({
            empresa: form.empresa,
            contacto: form.contacto || null,
            email: form.email || null,
            telefono: form.telefono || null,
            cif: form.cif || null,
            web: form.web || null,
            provincia: form.provincia || null,
            facturacion: parseSpanishNumber(form.facturacion),
            ebitda: parseSpanishNumber(form.ebitda),
            notas: form.notas || null,
            num_trabajadores: form.num_trabajadores ? parseInt(form.num_trabajadores) || null : null,
            director_ejecutivo: form.director_ejecutivo || null,
            linkedin: form.linkedin || null,
            comunidad_autonoma: form.comunidad_autonoma || null,
          })}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== COMPANY DRAWER =====
function CompanyDrawer({ company, onClose, onEdit }: {
  company: ContactListCompany | null; onClose: () => void; onEdit: () => void;
}) {
  const { data: history = [], isLoading } = useCompanyListHistory(company?.empresa);

  return (
    <Sheet open={!!company} onOpenChange={() => onClose()}>
      <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
        {company && (
          <>
            <SheetHeader>
              <SheetTitle>{company.empresa}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">CIF:</span> <span className="ml-1">{company.cif || '—'}</span></div>
                <div><span className="text-muted-foreground">Año datos:</span> <span className="ml-1">{company.anios_datos || '—'}</span></div>
                <div><span className="text-muted-foreground">Facturación:</span> <span className="ml-1">{company.facturacion ? `€${Number(company.facturacion).toLocaleString('es-ES')}` : '—'}</span></div>
                <div><span className="text-muted-foreground">EBITDA:</span> <span className="ml-1">{company.ebitda ? `€${Number(company.ebitda).toLocaleString('es-ES')}` : '—'}</span></div>
                <div><span className="text-muted-foreground">Empleados:</span> <span className="ml-1">{company.num_trabajadores ?? '—'}</span></div>
                <div><span className="text-muted-foreground">Director Ejecutivo:</span> <span className="ml-1">{company.director_ejecutivo || '—'}</span></div>
                <div><span className="text-muted-foreground">Contacto:</span> <span className="ml-1">{company.contacto || '—'}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="ml-1">{company.email || '—'}</span></div>
                <div><span className="text-muted-foreground">LinkedIn:</span> <span className="ml-1">{company.linkedin || '—'}</span></div>
                <div><span className="text-muted-foreground">Teléfono:</span> <span className="ml-1">{company.telefono || '—'}</span></div>
                <div><span className="text-muted-foreground">Web:</span> <span className="ml-1">{company.web || '—'}</span></div>
                <div><span className="text-muted-foreground">Provincia:</span> <span className="ml-1">{company.provincia || '—'}</span></div>
              </div>
              {company.notas && (
                <div className="text-sm"><span className="text-muted-foreground">Notas:</span> <p className="mt-1">{company.notas}</p></div>
              )}

              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" /> Editar empresa
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" /> Historial de aparición en listas
                </h4>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Solo aparece en esta lista</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((h: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{h.lista}</span>
                        <span className="text-muted-foreground">{new Date(h.fecha).toLocaleDateString('es-ES')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
