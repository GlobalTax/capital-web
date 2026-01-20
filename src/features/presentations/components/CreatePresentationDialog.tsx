import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTemplates, useCreatePresentation } from '../hooks/usePresentations';
import { PRESENTATION_TYPE_LABELS, type PresentationType } from '../types/presentation.types';
import { FileText, Presentation, Users, FileBarChart } from 'lucide-react';

interface CreatePresentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_ICONS: Record<PresentationType, React.ReactNode> = {
  teaser_sell: <FileBarChart className="w-5 h-5" />,
  firm_deck: <Presentation className="w-5 h-5" />,
  client_deck: <Users className="w-5 h-5" />,
  one_pager: <FileText className="w-5 h-5" />,
  mandate_deck: <FileBarChart className="w-5 h-5" />,
  custom: <FileText className="w-5 h-5" />,
};

export const CreatePresentationDialog: React.FC<CreatePresentationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { data: templates } = useTemplates();
  const createPresentation = useCreatePresentation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [projectCode, setProjectCode] = useState('');

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  const handleCreate = async () => {
    if (!title.trim()) return;

    const result = await createPresentation.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      type: selectedTemplate?.type || 'custom',
      template_id: selectedTemplateId || undefined,
      client_name: clientName.trim() || undefined,
      project_code: projectCode.trim() || undefined,
    });

    onOpenChange(false);
    navigate(`/admin/presentations/${result.id}/edit`);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSelectedTemplateId('');
    setClientName('');
    setProjectCode('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Presentation</DialogTitle>
          <DialogDescription>
            Choose a template to get started quickly, or create a blank presentation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Project Alpha - Teaser"
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Template</Label>
            <RadioGroup
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              className="grid grid-cols-2 gap-3"
            >
              {templates?.map((template) => (
                <label
                  key={template.id}
                  className={`
                    flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all
                    ${selectedTemplateId === template.id 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'hover:border-primary/50'}
                  `}
                >
                  <RadioGroupItem value={template.id} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {TYPE_ICONS[template.type]}
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(template.slides_config as unknown[])?.length || 0} slides
                    </p>
                  </div>
                </label>
              ))}
              
              {/* Blank option */}
              <label
                className={`
                  flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all
                  ${selectedTemplateId === '' 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                    : 'hover:border-primary/50'}
                `}
              >
                <RadioGroupItem value="" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Blank</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start from scratch with a blank presentation
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectCode">Project Code</Label>
              <Input
                id="projectCode"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                placeholder="e.g., Project Alpha"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the presentation..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!title.trim() || createPresentation.isPending}
          >
            {createPresentation.isPending ? 'Creating...' : 'Create Presentation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePresentationDialog;
