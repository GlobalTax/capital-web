import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, ExternalLink } from 'lucide-react';

const EmpresaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      window.open(`https://godeal.es/empresas/${id}`, '_blank');
    }
  }, [id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-lg text-muted-foreground">Abriendo perfil en GoDeal...</p>
      <a
        href={`https://godeal.es/empresas/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        Abrir manualmente
      </a>
    </div>
  );
};

export default EmpresaDetailPage;
