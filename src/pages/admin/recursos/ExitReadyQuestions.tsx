import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  GripVertical, 
  Edit, 
  ArrowLeft,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { useExitReadinessQuestions, ExitReadinessQuestionDB } from '@/hooks/useExitReadinessQuestions';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const ExitReadyQuestions: React.FC = () => {
  const { questions, isLoading, updateQuestion, reorderQuestions, toggleQuestion, isUpdating } = useExitReadinessQuestions();
  const [editingQuestion, setEditingQuestion] = useState<ExitReadinessQuestionDB | null>(null);
  const [editForm, setEditForm] = useState({
    question_text: '',
    recommendation_if_low: '',
    options: [] as Array<{ label: string; value: string; points: number }>
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    reorderQuestions(items.map(q => q.id));
  };

  const handleEditClick = (question: ExitReadinessQuestionDB) => {
    setEditingQuestion(question);
    setEditForm({
      question_text: question.question_text,
      recommendation_if_low: question.recommendation_if_low || '',
      options: [...question.options]
    });
  };

  const handleSaveQuestion = () => {
    if (editingQuestion) {
      updateQuestion({
        id: editingQuestion.id,
        updates: {
          question_text: editForm.question_text,
          recommendation_if_low: editForm.recommendation_if_low,
          options: editForm.options
        }
      });
      setEditingQuestion(null);
    }
  };

  const handleOptionChange = (index: number, field: string, value: string | number) => {
    const newOptions = [...editForm.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setEditForm({ ...editForm, options: newOptions });
  };

  const handleAddOption = () => {
    setEditForm({
      ...editForm,
      options: [...editForm.options, { label: '', value: '', points: 0 }]
    });
  };

  const handleRemoveOption = (index: number) => {
    setEditForm({
      ...editForm,
      options: editForm.options.filter((_, i) => i !== index)
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando preguntas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/recursos/exit-ready">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Preguntas del Test Exit-Ready</h1>
            <p className="text-muted-foreground">Edita las preguntas, opciones y puntuaciones</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Instrucciones:</strong> Arrastra las preguntas para reordenarlas. 
            Haz clic en el icono de edición para modificar el texto, opciones y puntuaciones.
            Usa el switch para activar/desactivar preguntas.
          </p>
        </CardContent>
      </Card>

      {/* Questions List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {questions.map((question, index) => (
                <Draggable key={question.id} draggableId={question.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${snapshot.isDragging ? 'shadow-lg' : ''} ${!question.is_active ? 'opacity-50' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Drag Handle */}
                          <div {...provided.dragHandleProps} className="mt-1 cursor-grab">
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                          </div>
                          
                          {/* Question Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{question.question_order}</Badge>
                              <span className="text-xs text-muted-foreground">{question.question_key}</span>
                            </div>
                            <p className="font-medium mb-3">{question.question_text}</p>
                            
                            {/* Options Preview */}
                            <div className="flex flex-wrap gap-2">
                              {question.options.map((option, optIndex) => (
                                <Badge 
                                  key={optIndex} 
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {option.label} ({option.points} pts)
                                </Badge>
                              ))}
                            </div>
                            
                            {question.recommendation_if_low && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                💡 {question.recommendation_if_low}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={question.is_active}
                              onCheckedChange={(checked) => toggleQuestion({ id: question.id, isActive: checked })}
                            />
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleEditClick(question)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Pregunta</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Question Text */}
            <div className="space-y-2">
              <Label>Texto de la Pregunta</Label>
              <Textarea
                value={editForm.question_text}
                onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                rows={2}
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Opciones de Respuesta</Label>
                <Button size="sm" variant="outline" onClick={handleAddOption}>
                  <Plus className="w-3 h-3 mr-1" />
                  Añadir Opción
                </Button>
              </div>
              
              {editForm.options.map((option, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      placeholder="Etiqueta"
                      value={option.label}
                      onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="Valor"
                      value={option.value}
                      onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Puntos"
                      value={option.points}
                      onChange={(e) => handleOptionChange(index, 'points', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleRemoveOption(index)}
                      disabled={editForm.options.length <= 2}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="space-y-2">
              <Label>Recomendación (si la puntuación es baja)</Label>
              <Textarea
                value={editForm.recommendation_if_low}
                onChange={(e) => setEditForm({ ...editForm, recommendation_if_low: e.target.value })}
                rows={2}
                placeholder="Consejo para mejorar en esta área..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveQuestion} disabled={isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExitReadyQuestions;
