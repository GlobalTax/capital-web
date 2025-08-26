import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play } from 'lucide-react';
import { useAdminVideos } from '@/hooks/useAdminVideos';

interface SmartVideoPlayerProps {
  category?: string;
  location?: string;
  selectedVideoId?: string;
  onVideoSelect?: (videoId: string) => void;
  className?: string;
  showSelector?: boolean;
  autoPlay?: boolean;
  poster?: string;
}

const SmartVideoPlayer: React.FC<SmartVideoPlayerProps> = ({
  category = 'company-story',
  location,
  selectedVideoId,
  onVideoSelect,
  className = '',
  showSelector = false,
  autoPlay = false,
  poster,
}) => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(selectedVideoId || null);
  
  const { getVideosByCategory, getVideosByLocation, incrementViewCount } = useAdminVideos();
  
  // Get videos based on category or location
  const categoryQuery = getVideosByCategory(category);
  const locationQuery = location ? getVideosByLocation(location) : { data: [] };
  
  const videos = location ? locationQuery.data : categoryQuery.data;
  const currentVideo = videos?.find(v => v.id === currentVideoId) || videos?.[0];

  useEffect(() => {
    if (videos && videos.length > 0 && !currentVideoId) {
      setCurrentVideoId(videos[0].id);
    }
  }, [videos, currentVideoId]);

  const handleVideoSelect = (videoId: string) => {
    setCurrentVideoId(videoId);
    onVideoSelect?.(videoId);
    setVideoPlaying(false);
  };

  const handlePlay = () => {
    const video = document.querySelector(`#video-${currentVideoId}`) as HTMLVideoElement;
    if (video) {
      video.play();
      setVideoPlaying(true);
      if (currentVideo) {
        incrementViewCount(currentVideo.id);
      }
    }
  };

  if (!videos || videos.length === 0) {
    return (
      <div className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-muted-foreground">No hay videos disponibles</p>
          {showSelector && (
            <p className="text-sm text-muted-foreground mt-2">
              Los administradores pueden subir videos desde el panel de administración
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showSelector && videos.length > 1 && (
        <div className="w-full max-w-xs">
          <Select value={currentVideoId || ''} onValueChange={handleVideoSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar video" />
            </SelectTrigger>
            <SelectContent>
              {videos.map((video) => (
                <SelectItem key={video.id} value={video.id}>
                  {video.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="aspect-video bg-muted relative rounded-lg overflow-hidden">
        {currentVideo && (
          <>
            <video
              id={`video-${currentVideo.id}`}
              className="w-full h-full object-cover"
              controls={videoPlaying}
              poster={poster || currentVideo.thumbnail_url}
              preload="metadata"
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              aria-label={`Video: ${currentVideo.title}`}
            >
              <source src={currentVideo.file_url} type={currentVideo.file_type} />
              <p className="text-muted-foreground p-4">
                Tu navegador no soporta la reproducción de video.
                <a 
                  href={currentVideo.file_url} 
                  className="text-primary underline ml-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver video
                </a>
              </p>
            </video>
            
            {!videoPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 cursor-pointer"
                onClick={handlePlay}
              >
                <div className="text-center">
                  <Button
                    size="lg"
                    className="mb-4 h-16 w-16 rounded-full p-0 shadow-lg hover:scale-105 transition-transform"
                  >
                    <Play className="h-6 w-6 ml-1" />
                  </Button>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">
                      {currentVideo.title}
                    </p>
                    {currentVideo.description && (
                      <p className="text-muted-foreground text-xs max-w-md mx-auto">
                        {currentVideo.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SmartVideoPlayer;