import React from 'react';
import { KPIWidget } from './KPIWidget';
import { ChartWidget } from './ChartWidget';
import { TableWidget } from './TableWidget';
import { TextWidget } from './TextWidget';
import { AlertWidget } from './AlertWidget';
import { RealtimeLeadsWidget } from './RealtimeLeadsWidget';
import { ActivityStreamWidget } from './ActivityStreamWidget';
import { BookingsWidget } from './BookingsWidget';

export interface BaseWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'text' | 'alert' | 'realtime-leads' | 'activity-stream' | 'bookings';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: Record<string, any>;
  permissions?: string[];
}

interface WidgetFactoryProps {
  widget: BaseWidget;
  isEditing?: boolean;
  onEdit?: (widget: BaseWidget) => void;
  onDelete?: (widgetId: string) => void;
  isDragging?: boolean;
}

export function WidgetFactory({ 
  widget, 
  isEditing = false, 
  onEdit, 
  onDelete, 
  isDragging = false 
}: WidgetFactoryProps) {
  const widgetProps = {
    widget,
    isEditing,
    onEdit,
    onDelete,
    isDragging
  };

  switch (widget.type) {
    case 'kpi':
      return <KPIWidget {...widgetProps} />;
    case 'chart':
      return <ChartWidget {...widgetProps} />;
    case 'table':
      return <TableWidget {...widgetProps} />;
    case 'text':
      return <TextWidget {...widgetProps} />;
    case 'alert':
      return <AlertWidget {...widgetProps} />;
    case 'realtime-leads':
      return <RealtimeLeadsWidget {...widgetProps} />;
    case 'activity-stream':
      return <ActivityStreamWidget {...widgetProps} />;
    case 'bookings':
      return <BookingsWidget {...widgetProps} />;
    default:
      return <div className="p-4 text-muted-foreground">Widget no reconocido: {widget.type}</div>;
  }
}