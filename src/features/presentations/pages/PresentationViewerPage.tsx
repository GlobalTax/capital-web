import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePresentation } from '../hooks/usePresentations';
import { PresentationViewer } from '../components/PresentationViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const PresentationViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: presentation, isLoading, error } = usePresentation(id);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-900">
        <p className="text-white/70">Presentation not found</p>
        <Button variant="outline" onClick={() => navigate('/admin/presentations')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Presentations
        </Button>
      </div>
    );
  }

  return (
    <PresentationViewer
      presentation={presentation}
      showControls={true}
      allowDownload={true}
    />
  );
};

export default PresentationViewerPage;
