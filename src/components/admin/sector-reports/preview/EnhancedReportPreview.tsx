
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, Download, Copy, FileText, Edit3, Save, Undo, Eye, 
  BookOpen, MessageSquare, Share2, Version, ChartBar 
} from 'lucide-react';
import { SectorReportResult } from '@/types/sectorReports';
import { useToast } from '@/hooks/use-toast';

interface EnhancedReportPreviewProps {
  report: SectorReportResult;
  onClose: () => void;
  onSave?: (updatedContent: string) => void;
  onAddComment?: (section: string, comment: string) => void;
  onShare?: (permissions: any) => void;
}

const EnhancedReportPreview: React.FC<EnhancedReportPreviewProps> = ({ 
  report, 
  onClose, 
  onSave, 
  onAddComment,
  onShare 
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(report.content);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: 'executive-summary', title: 'Resumen Ejecutivo', content: report.sections.executiveSummary },
    { id: 'market-analysis', title: 'Análisis de Mercado', content: report.sections.marketAnalysis },
    { id: 'opportunities', title: 'Oportunidades', content: report.sections.opportunities },
    { id: 'conclusions', title: 'Conclusiones', content: report.sections.conclusions }
  ];

  const handleSave = () => {
    if (onSave) {
      onSave(editedContent);
    }
    setIsEditing(false);
    toast({
      title: "Cambios guardados",
      description: "El contenido del reporte ha sido actualizado",
    });
  };

  const handleAddComment = () => {
    if (selectedSection && newComment.trim() && onAddComment) {
      onAddComment(selectedSection, newComment);
      setNewComment('');
      toast({
        title: "Comentario añadido",
        description: "Tu comentario ha sido agregado al reporte",
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadingTime = (wordCount: number) => {
    return Math.ceil(wordCount / 200); // Asumiendo 200 palabras por minuto
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{report.title}</CardTitle>
            <CardDescription className="mt-1">
              Generado el {report.generatedAt.toLocaleDateString('es-ES')} • 
              {getReadingTime(report.wordCount)} min de lectura
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary">{report.sector}</Badge>
          <Badge variant="outline">{report.wordCount.toLocaleString()} palabras</Badge>
          {report.metadata.confidence && (
            <Badge variant="outline">
              {Math.round(report.metadata.confidence * 100)}% confianza
            </Badge>
          )}
        </div>
      </CardHeader>

      <Separator />

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="index">
              <BookOpen className="h-4 w-4 mr-1" />
              Índice
            </TabsTrigger>
            <TabsTrigger value="edit">
              <Edit3 className="h-4 w-4 mr-1" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="h-4 w-4 mr-1" />
              Comentarios
            </TabsTrigger>
            <TabsTrigger value="visualizations">
              <ChartBar className="h-4 w-4 mr-1" />
              Gráficos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-auto">
            <div className="p-4 space-y-6" ref={contentRef}>
              {sections.map((section) => (
                <div key={section.id} id={section.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{section.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSection(section.id);
                        setActiveTab('comments');
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {section.content}
                      </pre>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{getWordCount(section.content)} palabras</span>
                    {report.collaboration?.comments.filter(c => c.section === section.id).length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {report.collaboration.comments.filter(c => c.section === section.id).length} comentarios
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="index" className="flex-1 overflow-auto">
            <div className="p-4">
              <h3 className="font-medium mb-4">Índice del Reporte</h3>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setActiveTab('preview');
                      setTimeout(() => scrollToSection(section.id), 100);
                    }}
                  >
                    <div>
                      <div className="font-medium text-sm">{index + 1}. {section.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getWordCount(section.content)} palabras • {getReadingTime(getWordCount(section.content))} min
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Ver sección →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="flex-1 overflow-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Editor de Contenido</h3>
                <div className="flex gap-2">
                  {isEditing && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditedContent(report.content);
                          setIsEditing(false);
                        }}
                      >
                        <Undo className="h-4 w-4 mr-1" />
                        Descartar
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </Button>
                    </>
                  )}
                  {!isEditing && (
                    <Button
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-96 font-mono text-sm"
                  placeholder="Edita el contenido del reporte..."
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {editedContent}
                  </pre>
                </div>
              )}

              <div className="text-xs text-gray-500">
                {getWordCount(editedContent)} palabras • {getReadingTime(getWordCount(editedContent))} min de lectura
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 overflow-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Comentarios y Colaboración</h3>
                <Button variant="outline" size="sm" onClick={() => onShare?.({})}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartir
                </Button>
              </div>

              {/* Agregar nuevo comentario */}
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Agregar comentario:</label>
                  <select
                    value={selectedSection || ''}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="">Seleccionar sección</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </div>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="text-sm"
                  rows={2}
                />
                <Button size="sm" onClick={handleAddComment} disabled={!selectedSection || !newComment.trim()}>
                  Agregar Comentario
                </Button>
              </div>

              {/* Lista de comentarios existentes */}
              <div className="space-y-3">
                {report.collaboration?.comments.map((comment) => (
                  <div key={comment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        {comment.section && (
                          <Badge variant="outline" className="text-xs">
                            {sections.find(s => s.id === comment.section)?.title}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {comment.createdAt.toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualizations" className="flex-1 overflow-auto">
            <div className="p-4 space-y-4">
              <h3 className="font-medium">Visualizaciones del Reporte</h3>
              
              {report.visualizations ? (
                <div className="space-y-6">
                  {report.visualizations.charts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Gráficos</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {report.visualizations.charts.map((chart) => (
                          <Card key={chart.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{chart.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500">Gráfico {chart.type}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.visualizations.infographics.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Infografías</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {report.visualizations.infographics.map((infographic) => (
                          <Card key={infographic.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{infographic.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500">Infografía</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ChartBar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay visualizaciones en este reporte</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Generar Visualizaciones
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Barra de acciones inferior */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-1" />
              Copiar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Version className="h-4 w-4 mr-1" />
              Versiones
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReportPreview;
