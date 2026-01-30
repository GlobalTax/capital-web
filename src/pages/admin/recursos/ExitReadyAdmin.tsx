import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  ClipboardList, 
  Users, 
  TrendingUp, 
  Search, 
  RefreshCw,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Download
} from 'lucide-react';
import { useExitReadinessAdmin, ExitReadinessTestAdmin } from '@/hooks/useExitReadinessAdmin';
import { useExitReadinessQuestions } from '@/hooks/useExitReadinessQuestions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { sanitizeRichText } from '@/shared/utils/sanitize';

const ExitReadyAdmin: React.FC = () => {
  const { tests, stats, isLoading, regenerateReport, markAsContacted, updateTest } = useExitReadinessAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<ExitReadinessTestAdmin | null>(null);
  const [notes, setNotes] = useState('');

  const filteredTests = tests.filter(test => 
    test.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getReadinessLevelBadge = (level: string) => {
    switch (level) {
      case 'ready':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Preparado</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">En Progreso</Badge>;
      case 'needs_work':
        return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">Necesita Trabajo</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getReportStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Generado</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/20 text-blue-700"><Clock className="w-3 h-3 mr-1" />Procesando</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-700"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
    }
  };

  const handleOpenDetail = (test: ExitReadinessTestAdmin) => {
    setSelectedTest(test);
    setNotes(test.admin_notes || '');
  };

  const handleSaveNotes = () => {
    if (selectedTest) {
      updateTest({ id: selectedTest.id, updates: { admin_notes: notes } });
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Nombre', 'Empresa', 'Teléfono', 'Puntuación', 'Nivel', 'Fecha', 'Contactado'];
    const rows = tests.map(t => [
      t.email,
      t.name || '',
      t.company_name || '',
      t.phone || '',
      t.total_score.toString(),
      t.readiness_level,
      format(new Date(t.created_at), 'dd/MM/yyyy'),
      t.contacted_at ? 'Sí' : 'No'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `exit-ready-tests-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Exit-Ready</h1>
          <p className="text-muted-foreground">Gestiona los tests completados y las preguntas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button asChild>
            <Link to="/admin/recursos/exit-ready/preguntas">
              <Settings className="w-4 h-4 mr-2" />
              Editar Preguntas
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Tests</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Preparados</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">En Progreso</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Necesita Trabajo</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.needsWork}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Score Medio</span>
            </div>
            <p className="text-2xl font-bold">{stats.averageScore}/100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Contactados</span>
            </div>
            <p className="text-2xl font-bold">{stats.contacted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tests Completados</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por email, nombre..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Informe IA</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map(test => (
                <TableRow key={test.id} className={test.contacted_at ? 'bg-muted/30' : ''}>
                  <TableCell className="font-medium">{test.email}</TableCell>
                  <TableCell>{test.name || '-'}</TableCell>
                  <TableCell>{test.company_name || '-'}</TableCell>
                  <TableCell>
                    <span className="font-bold">{test.total_score}</span>/100
                  </TableCell>
                  <TableCell>{getReadinessLevelBadge(test.readiness_level)}</TableCell>
                  <TableCell>{getReportStatusBadge(test.ai_report_status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(test.created_at), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenDetail(test)}
                      >
                        <FileText className="w-3 h-3" />
                      </Button>
                      {!test.contacted_at && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsContacted(test.id)}
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                      )}
                      {test.ai_report_status !== 'processing' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => regenerateReport(test.id)}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredTests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron tests
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Detail Dialog */}
      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Test</DialogTitle>
          </DialogHeader>
          
          {selectedTest && (
            <div className="space-y-6">
              {/* Lead Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{selectedTest.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nombre</label>
                  <p className="font-medium">{selectedTest.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Empresa</label>
                  <p className="font-medium">{selectedTest.company_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Teléfono</label>
                  <p className="font-medium">{selectedTest.phone || '-'}</p>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">{selectedTest.total_score}</p>
                  <p className="text-sm text-muted-foreground">/ 100 puntos</p>
                </div>
                {getReadinessLevelBadge(selectedTest.readiness_level)}
              </div>

              {/* Responses */}
              <div>
                <h4 className="font-medium mb-2">Respuestas</h4>
                <div className="space-y-2">
                  {Array.isArray(selectedTest.responses) && 
                    (selectedTest.responses as Array<{ question_id: number; question_key: string; answer: string; points: number }>).map((response, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm">Pregunta {response.question_id}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{response.answer}</span>
                          <Badge variant="outline">{response.points} pts</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* AI Report */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Informe IA</h4>
                  {getReportStatusBadge(selectedTest.ai_report_status)}
                </div>
                {selectedTest.ai_report_content ? (
                  <div className="bg-muted/50 rounded-lg p-4 prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: sanitizeRichText(
                        selectedTest.ai_report_content
                          .replace(/## /g, '<h3>')
                          .replace(/### /g, '<h4>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>')
                      )
                    }} />
                  </div>
                ) : selectedTest.ai_report_error ? (
                  <p className="text-red-500 text-sm">{selectedTest.ai_report_error}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">El informe aún no ha sido generado.</p>
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <h4 className="font-medium mb-2">Notas del Administrador</h4>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añadir notas sobre este lead..."
                  rows={3}
                />
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={handleSaveNotes}
                >
                  Guardar Notas
                </Button>
              </div>

              {/* UTM Info */}
              {(selectedTest.utm_source || selectedTest.utm_medium || selectedTest.utm_campaign) && (
                <div>
                  <h4 className="font-medium mb-2">Atribución</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTest.utm_source && <Badge variant="outline">Source: {selectedTest.utm_source}</Badge>}
                    {selectedTest.utm_medium && <Badge variant="outline">Medium: {selectedTest.utm_medium}</Badge>}
                    {selectedTest.utm_campaign && <Badge variant="outline">Campaign: {selectedTest.utm_campaign}</Badge>}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExitReadyAdmin;
