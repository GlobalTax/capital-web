import React from 'react';
import { useParams } from 'react-router-dom';
import { usePresentationByToken } from '../hooks/usePresentations';
import { PresentationViewer } from '../components/PresentationViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, AlertCircle } from 'lucide-react';

export const SharedPresentationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = usePresentationByToken(token);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
          <p className="text-white/70">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Unable to Access</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'This link is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Please contact the sender for a new link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { project, permission } = data;
  const allowDownload = permission === 'download_pdf' || permission === 'edit';

  return (
    <>
      {/* Confidential Notice */}
      {project.is_confidential && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm">
          <Lock className="w-4 h-4" />
          Confidential Document
        </div>
      )}

      <PresentationViewer
        presentation={project}
        showControls={true}
        allowDownload={allowDownload}
      />
    </>
  );
};

export default SharedPresentationPage;
