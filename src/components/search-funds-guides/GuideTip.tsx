import { LucideIcon, Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react';

type TipVariant = 'tip' | 'warning' | 'success' | 'info';

interface GuideTipProps {
  variant?: TipVariant;
  title?: string;
  children: React.ReactNode;
}

const variantConfig: Record<TipVariant, { icon: LucideIcon; className: string }> = {
  tip: {
    icon: Lightbulb,
    className: 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-100',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-100',
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-500/10 border-green-500/20 text-green-900 dark:text-green-100',
  },
  info: {
    icon: Info,
    className: 'bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-100',
  },
};

export const GuideTip = ({ variant = 'tip', title, children }: GuideTipProps) => {
  const config = variantConfig[variant];
  const Icon = config.icon;
  
  return (
    <div className={`rounded-xl border p-4 my-6 ${config.className}`}>
      <div className="flex gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
};
