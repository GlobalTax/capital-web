interface GuideMetricProps {
  value: string;
  label: string;
  description?: string;
}

export const GuideMetric = ({ value, label, description }: GuideMetricProps) => {
  return (
    <div className="p-4 rounded-xl bg-card border text-center">
      <div className="text-3xl font-bold text-primary mb-1">{value}</div>
      <div className="font-medium text-sm">{label}</div>
      {description && (
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      )}
    </div>
  );
};

interface GuideMetricsGridProps {
  metrics: GuideMetricProps[];
}

export const GuideMetricsGrid = ({ metrics }: GuideMetricsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {metrics.map((metric, index) => (
        <GuideMetric key={index} {...metric} />
      ))}
    </div>
  );
};
