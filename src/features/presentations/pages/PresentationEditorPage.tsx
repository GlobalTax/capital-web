import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePresentation } from '../hooks/usePresentations';
import { PresentationEditor } from '../components/PresentationEditor';
import { SharePresentationDialog } from '../components/SharePresentationDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const PresentationEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: presentation, isLoading, error } = usePresentation(id);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Presentation not found</p>
        <Button variant="outline" onClick={() => navigate('/admin/presentations')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Presentations
        </Button>
      </div>
    );
  }

  return (
    <>
      <PresentationEditor
        presentation={presentation}
        onSave={() => navigate('/admin/presentations')}
        onShare={() => setShareDialogOpen(true)}
      />

      <SharePresentationDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        projectId={presentation.id}
        projectTitle={presentation.title}
      />
    </>
  );
};

export default PresentationEditorPage;
