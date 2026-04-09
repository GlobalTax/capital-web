import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Pause, Play, X, CheckCircle2, AlertCircle, Loader2, Server } from 'lucide-react';
import { useOutboundQueue, OutboundQueueJob } from '@/hooks/useOutboundQueue';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  pending: { label: 'Programado', variant: 'secondary', icon: Clock },
  running: { label: 'En curso', variant: 'default', icon: Loader2 },
  paused: { label: 'Pausado', variant: 'outline', icon: Pause },
  completed: { label: 'Completado', variant: 'secondary', icon: CheckCircle2 },
  failed: { label: 'Fallido', variant: 'destructive', icon: AlertCircle },
  cancelled: { label: 'Cancelado', variant: 'outline', icon: X },
};

const SEND_TYPE_LABELS: Record<string, string> = {
  initial: 'Envío inicial',
  document: 'Envío documento',
  followup: 'Follow-up',
};

function JobCard({ job, onPause, onResume, onCancel }: {
  job: OutboundQueueJob;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  const progress = job.progress_total > 0
    ? Math.round((job.progress_current / job.progress_total) * 100)
    : 0;

  const isActive = job.status === 'pending' || job.status === 'running';
  const isPaused = job.status === 'paused';

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
      <div className="flex-shrink-0">
        <Icon className={`h-5 w-5 ${job.status === 'running' ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {SEND_TYPE_LABELS[job.send_type] || job.send_type}
          </span>
          <Badge variant={config.variant} className="text-[10px] px-1.5">
            {config.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {job.progress_current}/{job.progress_total} emails
          </span>
          <span>·</span>
          <span>
            {format(new Date(job.scheduled_at), "dd MMM HH:mm", { locale: es })}
          </span>
          {job.last_processed_at && (
            <>
              <span>·</span>
              <span>
                Último: {format(new Date(job.last_processed_at), "HH:mm:ss", { locale: es })}
              </span>
            </>
          )}
        </div>

        {(isActive || isPaused) && (
          <Progress value={progress} className="h-1.5" />
        )}

        {job.error_message && (
          <p className="text-xs text-destructive truncate">{job.error_message}</p>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {job.status === 'running' && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPause(job.id)} title="Pausar">
            <Pause className="h-3.5 w-3.5" />
          </Button>
        )}
        {isPaused && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onResume(job.id)} title="Reanudar">
            <Play className="h-3.5 w-3.5" />
          </Button>
        )}
        {(isActive || isPaused) && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onCancel(job.id)} title="Cancelar">
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface Props {
  campaignId: string;
}

export function OutboundQueueMonitor({ campaignId }: Props) {
  const { jobs, activeJobs, updateJobStatus } = useOutboundQueue(campaignId);

  const handlePause = (id: string) => updateJobStatus.mutate({ jobId: id, status: 'paused' });
  const handleResume = (id: string) => updateJobStatus.mutate({ jobId: id, status: 'running' });
  const handleCancel = (id: string) => updateJobStatus.mutate({ jobId: id, status: 'cancelled' });

  // Only show if there are any jobs
  if (jobs.length === 0) return null;

  // Show max 5 recent jobs
  const visibleJobs = jobs.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          Cola de envío server-side
          {activeJobs.length > 0 && (
            <Badge variant="default" className="text-[10px] px-1.5">
              {activeJobs.length} activo{activeJobs.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {visibleJobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
          />
        ))}
      </CardContent>
    </Card>
  );
}
