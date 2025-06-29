
export interface TouchPoint {
  id: string;
  timestamp: Date;
  channel: string;
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  page: string;
  companyDomain: string;
  sessionId: string;
  eventType: 'page_view' | 'form_submission' | 'calculator_use' | 'download' | 'contact';
  value?: number;
}

export interface AttributionModel {
  name: string;
  type: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' | 'data_driven';
  weights: number[];
}

export interface ConversionPath {
  companyDomain: string;
  touchPoints: TouchPoint[];
  conversionEvent: TouchPoint;
  totalValue: number;
  pathLength: number;
  timeToConversion: number; // in hours
  channels: string[];
  attribution: Map<string, number>; // channel -> attributed value
}

export class AttributionEngine {
  private touchPoints: TouchPoint[] = [];
  private conversionPaths: ConversionPath[] = [];
  
  private attributionModels: AttributionModel[] = [
    {
      name: 'First Touch',
      type: 'first_touch',
      weights: [1.0]
    },
    {
      name: 'Last Touch', 
      type: 'last_touch',
      weights: [1.0]
    },
    {
      name: 'Linear',
      type: 'linear',
      weights: [] // Equal weights
    },
    {
      name: 'Time Decay',
      type: 'time_decay',
      weights: [] // Calculated dynamically
    },
    {
      name: 'Position Based (40-20-40)',
      type: 'position_based',
      weights: [0.4, 0.2, 0.4] // First, Middle, Last
    }
  ];

  addTouchPoint(touchPoint: TouchPoint): void {
    this.touchPoints.push(touchPoint);
    console.log('Attribution: New touchpoint added', touchPoint);
    
    // Check if this is a conversion event
    if (this.isConversionEvent(touchPoint)) {
      this.processConversion(touchPoint);
    }
  }

  private isConversionEvent(touchPoint: TouchPoint): boolean {
    return touchPoint.eventType === 'form_submission' || 
           touchPoint.eventType === 'contact' ||
           (touchPoint.eventType === 'calculator_use' && touchPoint.page.includes('calculadora'));
  }

  private processConversion(conversionEvent: TouchPoint): void {
    // Find all touchpoints for this company leading to conversion
    const companyTouchPoints = this.touchPoints
      .filter(tp => tp.companyDomain === conversionEvent.companyDomain)
      .filter(tp => tp.timestamp <= conversionEvent.timestamp)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (companyTouchPoints.length === 0) return;

    const firstTouch = companyTouchPoints[0];
    const timeToConversion = (conversionEvent.timestamp.getTime() - firstTouch.timestamp.getTime()) / (1000 * 60 * 60);
    
    const conversionPath: ConversionPath = {
      companyDomain: conversionEvent.companyDomain,
      touchPoints: companyTouchPoints,
      conversionEvent,
      totalValue: conversionEvent.value || 1000, // Default conversion value
      pathLength: companyTouchPoints.length,
      timeToConversion,
      channels: [...new Set(companyTouchPoints.map(tp => tp.channel))],
      attribution: new Map()
    };

    // Calculate attribution for each model
    this.calculateAttribution(conversionPath);
    this.conversionPaths.push(conversionPath);

    console.log('Attribution: New conversion path created', conversionPath);
  }

  private calculateAttribution(path: ConversionPath): void {
    const touchPoints = path.touchPoints;
    const totalValue = path.totalValue;

    // Linear Attribution
    const linearValue = totalValue / touchPoints.length;
    touchPoints.forEach(tp => {
      const current = path.attribution.get(tp.channel) || 0;
      path.attribution.set(tp.channel, current + linearValue);
    });
  }

  getAttributionReport(model: AttributionModel['type'] = 'linear', dateRange?: { start: Date; end: Date }): any {
    let paths = this.conversionPaths;
    
    if (dateRange) {
      paths = paths.filter(path => 
        path.conversionEvent.timestamp >= dateRange.start && 
        path.conversionEvent.timestamp <= dateRange.end
      );
    }

    const channelAttribution = new Map<string, { value: number; conversions: number; touchPoints: number }>();
    
    paths.forEach(path => {
      path.attribution.forEach((value, channel) => {
        const current = channelAttribution.get(channel) || { value: 0, conversions: 0, touchPoints: 0 };
        channelAttribution.set(channel, {
          value: current.value + value,
          conversions: current.conversions + 1,
          touchPoints: current.touchPoints + path.touchPoints.filter(tp => tp.channel === channel).length
        });
      });
    });

    return {
      totalConversions: paths.length,
      totalValue: paths.reduce((sum, path) => sum + path.totalValue, 0),
      averagePathLength: paths.reduce((sum, path) => sum + path.pathLength, 0) / paths.length,
      averageTimeToConversion: paths.reduce((sum, path) => sum + path.timeToConversion, 0) / paths.length,
      channelPerformance: Array.from(channelAttribution.entries()).map(([channel, data]) => ({
        channel,
        attributedValue: data.value,
        conversions: data.conversions,
        touchPoints: data.touchPoints,
        valuePerConversion: data.value / data.conversions,
        costPerConversion: 0 // To be integrated with ad spend data
      })),
      topConversionPaths: this.getTopConversionPaths(paths),
      channelAssist: this.calculateChannelAssist(paths)
    };
  }

  private getTopConversionPaths(paths: ConversionPath[]): any[] {
    const pathPatterns = new Map<string, { count: number; value: number; examples: ConversionPath[] }>();
    
    paths.forEach(path => {
      const pattern = path.channels.join(' → ');
      const current = pathPatterns.get(pattern) || { count: 0, value: 0, examples: [] };
      pathPatterns.set(pattern, {
        count: current.count + 1,
        value: current.value + path.totalValue,
        examples: [...current.examples.slice(0, 2), path] // Keep max 3 examples
      });
    });

    return Array.from(pathPatterns.entries())
      .map(([pattern, data]) => ({
        path: pattern,
        conversions: data.count,
        totalValue: data.value,
        averageValue: data.value / data.count,
        examples: data.examples
      }))
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 10);
  }

  private calculateChannelAssist(paths: ConversionPath[]): any[] {
    const channelStats = new Map<string, { 
      lastTouch: number; 
      assist: number; 
      firstTouch: number;
      totalTouches: number;
    }>();

    paths.forEach(path => {
      const touchPoints = path.touchPoints;
      const lastChannel = touchPoints[touchPoints.length - 1]?.channel;
      const firstChannel = touchPoints[0]?.channel;

      // Count touches for each channel
      touchPoints.forEach((tp, index) => {
        const current = channelStats.get(tp.channel) || { 
          lastTouch: 0, assist: 0, firstTouch: 0, totalTouches: 0 
        };
        
        current.totalTouches++;
        
        if (index === 0) current.firstTouch++;
        if (index === touchPoints.length - 1) current.lastTouch++;
        if (index > 0 && index < touchPoints.length - 1) current.assist++;
        
        channelStats.set(tp.channel, current);
      });
    });

    return Array.from(channelStats.entries()).map(([channel, stats]) => ({
      channel,
      ...stats,
      assistRate: stats.totalTouches > 0 ? (stats.assist / stats.totalTouches) * 100 : 0
    }));
  }

  getFunnelAnalysis(): any {
    const funnelStages = [
      { name: 'Visitantes', events: ['page_view'] },
      { name: 'Interés', events: ['page_view'], pages: ['/calculadora', '/valoraciones', '/servicios'] },
      { name: 'Consideración', events: ['calculator_use', 'download'] },
      { name: 'Intención', events: ['form_submission', 'contact'] },
      { name: 'Conversión', events: ['contact'] }
    ];

    const uniqueCompanies = new Set(this.touchPoints.map(tp => tp.companyDomain));
    const funnelData = funnelStages.map(stage => {
      let count = 0;
      
      if (stage.pages) {
        count = new Set(
          this.touchPoints
            .filter(tp => stage.events.includes(tp.eventType))
            .filter(tp => stage.pages!.some(page => tp.page.includes(page)))
            .map(tp => tp.companyDomain)
        ).size;
      } else {
        count = new Set(
          this.touchPoints
            .filter(tp => stage.events.includes(tp.eventType))
            .map(tp => tp.companyDomain)
        ).size;
      }

      return {
        stage: stage.name,
        count,
        percentage: uniqueCompanies.size > 0 ? (count / uniqueCompanies.size) * 100 : 0
      };
    });

    return {
      totalVisitors: uniqueCompanies.size,
      stages: funnelData,
      conversionRate: funnelData.length > 0 ? 
        (funnelData[funnelData.length - 1].count / funnelData[0].count) * 100 : 0
    };
  }

  getCustomerJourneyMap(): any {
    const journeyStages = new Map<string, Map<string, number>>();
    
    this.conversionPaths.forEach(path => {
      path.touchPoints.forEach((tp, index) => {
        const stage = this.getJourneyStage(tp, index, path.touchPoints.length);
        const channelMap = journeyStages.get(stage) || new Map<string, number>();
        channelMap.set(tp.channel, (channelMap.get(tp.channel) || 0) + 1);
        journeyStages.set(stage, channelMap);
      });
    });

    return Array.from(journeyStages.entries()).map(([stage, channels]) => ({
      stage,
      channels: Array.from(channels.entries()).map(([channel, count]) => ({
        channel,
        count,
        percentage: (count / Array.from(channels.values()).reduce((a, b) => a + b, 0)) * 100
      }))
    }));
  }

  private getJourneyStage(touchPoint: TouchPoint, index: number, totalLength: number): string {
    if (index === 0) return 'Awareness';
    if (index / totalLength < 0.33) return 'Interest';
    if (index / totalLength < 0.66) return 'Consideration';
    if (index === totalLength - 1) return 'Conversion';
    return 'Intent';
  }

  // Public getters for dashboard
  getAllTouchPoints(): TouchPoint[] {
    return [...this.touchPoints];
  }

  getAllConversionPaths(): ConversionPath[] {
    return [...this.conversionPaths];
  }
}
