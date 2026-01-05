import { ExternalLink, Download, FileText, Video, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LibraryItemProps {
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'podcast' | 'article';
  source: string;
  url: string;
  isExternal?: boolean;
}

const typeIcons = {
  pdf: FileText,
  video: Video,
  podcast: Headphones,
  article: FileText,
};

const typeLabels = {
  pdf: 'PDF',
  video: 'Video',
  podcast: 'Podcast',
  article: 'Artículo',
};

export const LibraryItem = ({ title, description, type, source, url, isExternal = true }: LibraryItemProps) => {
  const Icon = typeIcons[type];

  return (
    <div className="flex items-start gap-4 p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {typeLabels[type]}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{source}</span>
        </div>
        
        <h4 className="font-semibold mb-1 truncate">{title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="flex-shrink-0"
      >
        <a href={url} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
          {isExternal ? (
            <ExternalLink className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </a>
      </Button>
    </div>
  );
};
