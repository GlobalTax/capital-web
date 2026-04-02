import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings2, ChevronDown, CalendarIcon, AlertTriangle, Clock, Gauge, Timer, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface SendScheduleSettings {
  intervalMs: number;
  maxPerHour: number | null;
  scheduledAt: Date | null;
  serverSide: boolean;
  includeValuationPdf: boolean;
  includeStudyPdf: boolean;
}

const INTERVAL_OPTIONS = [
  { value: '15000', label: '15 segundos' },
  { value: '30000', label: '30 segundos' },
  { value: '60000', label: '1 minuto' },
  { value: '120000', label: '2 minutos' },
  { value: '300000', label: '5 minutos' },
];

const HOUR_OPTIONS = ['20', '30', '50', '80', '100'];

interface Props {
  value: SendScheduleSettings;
  onChange: (settings: SendScheduleSettings) => void;
  disabled?: boolean;
}

export function SendScheduleConfig({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [noLimit, setNoLimit] = useState(value.maxPerHour === null);
  const [sendNow, setSendNow] = useState(value.scheduledAt === null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value.scheduledAt ?? undefined);
  const [timeStr, setTimeStr] = useState(value.scheduledAt ? format(value.scheduledAt, 'HH:mm') : '09:00');

  const updateScheduledAt = useCallback((date: Date | undefined, time: string) => {
    if (!date) { onChange({ ...value, scheduledAt: null }); return; }
    const [h, m] = time.split(':').map(Number);
    const dt = new Date(date);
    dt.setHours(h || 0, m || 0, 0, 0);
    onChange({ ...value, scheduledAt: dt });
  }, [value, onChange]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-dashed">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors rounded-t-lg disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              Configuración de envío
              {(value.intervalMs !== 30000 || value.maxPerHour !== null || value.scheduledAt !== null) && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Personalizado</Badge>
              )}
            </span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 space-y-5">
            {/* 1. Interval */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                Intervalo entre emails
              </Label>
              <Select
                value={String(value.intervalMs)}
                onValueChange={(v) => onChange({ ...value, intervalMs: Number(v) })}
                disabled={disabled}
              >
                <SelectTrigger className="w-48 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVAL_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Tiempo de espera entre cada email enviado
              </p>
            </div>

            {/* 2. Hourly limit */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                Límite por hora
              </Label>
              <div className="flex items-center gap-3">
                <Select
                  value={noLimit ? 'none' : String(value.maxPerHour ?? '50')}
                  onValueChange={(v) => {
                    if (v === 'none') {
                      setNoLimit(true);
                      onChange({ ...value, maxPerHour: null });
                    } else {
                      setNoLimit(false);
                      onChange({ ...value, maxPerHour: Number(v) });
                    }
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-48 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin límite</SelectItem>
                    {HOUR_OPTIONS.map(v => (
                      <SelectItem key={v} value={v}>{v} emails/hora</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {noLimit
                  ? 'Se enviarán todos sin restricción horaria'
                  : `Máximo ${value.maxPerHour} emails cada 60 minutos. Al alcanzar el límite, se pausa automáticamente.`
                }
              </p>
            </div>

            {/* 3. Server-side mode */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Modo de envío
              </Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="send-mode"
                    checked={!value.serverSide}
                    onChange={() => onChange({ ...value, serverSide: false, scheduledAt: null })}
                    disabled={disabled}
                    className="accent-primary"
                  />
                  Desde el navegador
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="send-mode"
                    checked={value.serverSide}
                    onChange={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate());
                      tomorrow.setHours(tomorrow.getHours(), tomorrow.getMinutes() + 5, 0, 0);
                      setSendNow(false);
                      setSelectedDate(tomorrow);
                      setTimeStr(format(tomorrow, 'HH:mm'));
                      onChange({ ...value, serverSide: true, scheduledAt: tomorrow });
                    }}
                    disabled={disabled}
                    className="accent-primary"
                  />
                  Server-side (automático)
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {value.serverSide
                  ? 'Los emails se enviarán automáticamente en segundo plano. Puedes cerrar el navegador.'
                  : 'La pestaña del navegador debe permanecer abierta durante el envío.'
                }
              </p>
            </div>

            {/* 4. Schedule (only for server-side or manual future schedule) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Programar envío
              </Label>
              {value.serverSide ? (
                <div className="flex items-center gap-2 pl-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className={cn("w-44 justify-start text-left font-normal", !selectedDate && "text-muted-foreground")} disabled={disabled}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {selectedDate ? format(selectedDate, 'dd MMM yyyy', { locale: es }) : 'Seleccionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => {
                          setSelectedDate(d);
                          updateScheduledAt(d, timeStr);
                        }}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={timeStr}
                    onChange={(e) => {
                      setTimeStr(e.target.value);
                      updateScheduledAt(selectedDate, e.target.value);
                    }}
                    className="w-28 h-9"
                    disabled={disabled}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="send-schedule"
                        checked={sendNow}
                        onChange={() => {
                          setSendNow(true);
                          onChange({ ...value, scheduledAt: null });
                        }}
                        disabled={disabled}
                        className="accent-primary"
                      />
                      Enviar ahora
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="send-schedule"
                        checked={!sendNow}
                        onChange={() => {
                          setSendNow(false);
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          tomorrow.setHours(9, 0, 0, 0);
                          setSelectedDate(tomorrow);
                          setTimeStr('09:00');
                          onChange({ ...value, scheduledAt: tomorrow });
                        }}
                        disabled={disabled}
                        className="accent-primary"
                      />
                      Programar para…
                    </label>
                  </div>

                  {!sendNow && (
                    <div className="flex items-center gap-2 pl-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className={cn("w-44 justify-start text-left font-normal", !selectedDate && "text-muted-foreground")} disabled={disabled}>
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {selectedDate ? format(selectedDate, 'dd MMM yyyy', { locale: es }) : 'Seleccionar'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d) => {
                              setSelectedDate(d);
                              updateScheduledAt(d, timeStr);
                            }}
                            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        value={timeStr}
                        onChange={(e) => {
                          setTimeStr(e.target.value);
                          updateScheduledAt(selectedDate, e.target.value);
                        }}
                        className="w-28 h-9"
                        disabled={disabled}
                      />
                    </div>
                  )}

                  {!sendNow && (
                    <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        La pestaña del navegador debe permanecer abierta para que el envío se ejecute a la hora programada. Para envío automático sin navegador, usa el modo "Server-side".
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/**
 * Utility: Create a delay function that respects hourly limits.
 * Returns a function that should be called after each email send.
 * It will resolve after the appropriate delay, or wait longer if hourly limit is hit.
 */
export function createSendThrottle(settings: SendScheduleSettings) {
  const sendTimestamps: number[] = [];

  return async (
    onWaiting?: (waitMs: number) => void
  ): Promise<void> => {
    const now = Date.now();
    sendTimestamps.push(now);

    // Check hourly limit
    if (settings.maxPerHour !== null) {
      const oneHourAgo = now - 3600000;
      const recentSends = sendTimestamps.filter(t => t > oneHourAgo);

      if (recentSends.length >= settings.maxPerHour) {
        // Wait until the oldest send in the window expires
        const oldestInWindow = recentSends[0];
        const waitUntil = oldestInWindow + 3600000;
        const waitMs = waitUntil - Date.now();
        if (waitMs > 0) {
          onWaiting?.(waitMs);
          await new Promise(r => setTimeout(r, waitMs));
        }
      }
    }

    // Apply interval delay
    await new Promise(r => setTimeout(r, settings.intervalMs));
  };
}
