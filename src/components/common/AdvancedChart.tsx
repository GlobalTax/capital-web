// ============= ADVANCED CHART COMPONENT =============
// Componente de gráficos avanzado con múltiples tipos y interactividad

import React, { useMemo, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  Line,
  Area,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, TrendingUp, TrendingDown } from 'lucide-react';

export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'scatter';

export interface ChartDataPoint {
  [key: string]: any;
}

export interface ChartSeries {
  key: string;
  name: string;
  color: string;
  type?: ChartType;
  yAxisId?: string;
}

export interface ChartConfig {
  type: ChartType;
  data: ChartDataPoint[];
  series: ChartSeries[];
  xAxisKey: string;
  yAxisKey?: string;
  title?: string;
  subtitle?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  responsive?: boolean;
  colors?: string[];
  referenceLines?: Array<{
    value: number;
    label: string;
    color?: string;
    strokeDasharray?: string;
  }>;
  formatters?: {
    xAxis?: (value: any) => string;
    yAxis?: (value: any) => string;
    tooltip?: (value: any, name: string) => [string, string];
  };
}

export interface AdvancedChartProps extends ChartConfig {
  onDataPointClick?: (data: ChartDataPoint, series: string) => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

const defaultColors = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00c49f',
  '#ffbb28',
  '#ff8042'
];

const AdvancedChart: React.FC<AdvancedChartProps> = ({
  type,
  data,
  series,
  xAxisKey,
  yAxisKey,
  title,
  subtitle,
  height = 400,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  responsive = true,
  colors = defaultColors,
  referenceLines = [],
  formatters = {},
  onDataPointClick,
  onExport,
  loading = false,
  error,
  className = ''
}) => {
  const [chartType, setChartType] = useState<ChartType>(type);
  const [selectedSeries, setSelectedSeries] = useState<string[]>(
    series.map(s => s.key)
  );

  // Calcular estadísticas básicas
  const stats = useMemo(() => {
    if (!data.length || !series.length) return null;

    const firstSeries = series[0];
    const values = data.map(d => Number(d[firstSeries.key]) || 0);
    
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calcular tendencia (diferencia entre último y primer valor)
    const trend = values.length > 1 ? values[values.length - 1] - values[0] : 0;
    
    return {
      total,
      average,
      min,
      max,
      trend,
      count: values.length
    };
  }, [data, series]);

  // Preparar datos filtrados por series seleccionadas
  const filteredData = useMemo(() => {
    return data.map(item => {
      const filtered: ChartDataPoint = { [xAxisKey]: item[xAxisKey] };
      selectedSeries.forEach(seriesKey => {
        if (item[seriesKey] !== undefined) {
          filtered[seriesKey] = item[seriesKey];
        }
      });
      return filtered;
    });
  }, [data, selectedSeries, xAxisKey]);

  const handleSeriesToggle = useCallback((seriesKey: string) => {
    setSelectedSeries(prev => 
      prev.includes(seriesKey)
        ? prev.filter(key => key !== seriesKey)
        : [...prev, seriesKey]
    );
  }, []);

  const handleDataPointClick = useCallback((data: any) => {
    if (onDataPointClick) {
      onDataPointClick(data.payload, data.dataKey || '');
    }
  }, [onDataPointClick]);

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const renderXAxis = () => (
      <XAxis 
        dataKey={xAxisKey}
        tickFormatter={formatters.xAxis}
        stroke="hsl(var(--muted-foreground))"
      />
    );

    const renderYAxis = () => (
      <YAxis 
        tickFormatter={formatters.yAxis}
        stroke="hsl(var(--muted-foreground))"
      />
    );

    const renderTooltip = () => showTooltip && (
      <Tooltip
        contentStyle={{
          backgroundColor: 'hsl(var(--popover))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px'
        }}
        formatter={formatters.tooltip}
      />
    );

    const renderLegend = () => showLegend && <Legend />;

    const renderGrid = () => showGrid && (
      <CartesianGrid 
        strokeDasharray="3 3" 
        stroke="hsl(var(--border))"
        opacity={0.3}
      />
    );

    const renderReferenceLines = () => 
      referenceLines.map((ref, index) => (
        <ReferenceLine
          key={index}
          y={ref.value}
          label={ref.label}
          stroke={ref.color || 'hsl(var(--muted-foreground))'}
          strokeDasharray={ref.strokeDasharray || '5 5'}
        />
      ));

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {renderReferenceLines()}
            {series.filter(s => selectedSeries.includes(s.key)).map((s, index) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color || colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, onClick: handleDataPointClick }}
                name={s.name}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {renderReferenceLines()}
            {series.filter(s => selectedSeries.includes(s.key)).map((s, index) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color || colors[index % colors.length]}
                fill={s.color || colors[index % colors.length]}
                fillOpacity={0.3}
                name={s.name}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {renderReferenceLines()}
            {series.filter(s => selectedSeries.includes(s.key)).map((s, index) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={s.color || colors[index % colors.length]}
                name={s.name}
                onClick={handleDataPointClick}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        const pieData = series.filter(s => selectedSeries.includes(s.key)).map((s, index) => ({
          name: s.name,
          value: data.reduce((sum, item) => sum + (Number(item[s.key]) || 0), 0),
          fill: s.color || colors[index % colors.length]
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              nameKey="name"
              onClick={handleDataPointClick}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>
            {renderTooltip()}
            {renderLegend()}
          </PieChart>
        );

      default:
        return <div>Tipo de gráfico no soportado</div>;
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error al cargar el gráfico: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Selector de tipo de gráfico */}
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Línea</SelectItem>
                <SelectItem value="area">Área</SelectItem>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="pie">Circular</SelectItem>
              </SelectContent>
            </Select>

            {onExport && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onExport('png')}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {stats && (
          <div className="flex gap-4 mt-4">
            <Badge variant="outline">
              Total: {stats.total.toLocaleString()}
            </Badge>
            <Badge variant="outline">
              Promedio: {stats.average.toFixed(1)}
            </Badge>
            <Badge variant={stats.trend >= 0 ? "default" : "destructive"}>
              {stats.trend >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}
            </Badge>
          </div>
        )}

        {/* Control de series */}
        <div className="flex flex-wrap gap-2 mt-4">
          {series.map(s => (
            <Button
              key={s.key}
              variant={selectedSeries.includes(s.key) ? "default" : "outline"}
              size="sm"
              onClick={() => handleSeriesToggle(s.key)}
              style={{ borderColor: s.color }}
            >
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: s.color }}
              />
              {s.name}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedChart;