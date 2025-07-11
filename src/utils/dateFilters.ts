import { supabase } from '@/integrations/supabase/client';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateFilterOptions {
  includeComparison?: boolean;
  granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export class DateFilterService {
  static getPresetRanges(): Array<{ label: string; value: DateRange; key: string }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        key: 'today',
        label: 'Hoy',
        value: {
          from: today,
          to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      },
      {
        key: 'yesterday',
        label: 'Ayer',
        value: {
          from: new Date(today.getTime() - 24 * 60 * 60 * 1000),
          to: new Date(today.getTime() - 1)
        }
      },
      {
        key: 'last_7_days',
        label: 'Últimos 7 días',
        value: {
          from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          to: new Date()
        }
      },
      {
        key: 'last_30_days',
        label: 'Últimos 30 días',
        value: {
          from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          to: new Date()
        }
      },
      {
        key: 'last_90_days',
        label: 'Últimos 90 días',
        value: {
          from: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
          to: new Date()
        }
      },
      {
        key: 'this_week',
        label: 'Esta semana',
        value: {
          from: this.getStartOfWeek(now),
          to: new Date()
        }
      },
      {
        key: 'last_week',
        label: 'Semana pasada',
        value: {
          from: this.getStartOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
          to: this.getEndOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
        }
      },
      {
        key: 'this_month',
        label: 'Este mes',
        value: {
          from: new Date(now.getFullYear(), now.getMonth(), 1),
          to: new Date()
        }
      },
      {
        key: 'last_month',
        label: 'Mes pasado',
        value: {
          from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          to: new Date(now.getFullYear(), now.getMonth(), 0)
        }
      },
      {
        key: 'this_quarter',
        label: 'Este trimestre',
        value: {
          from: this.getStartOfQuarter(now),
          to: new Date()
        }
      },
      {
        key: 'last_quarter',
        label: 'Trimestre pasado',
        value: {
          from: this.getStartOfQuarter(new Date(now.getFullYear(), now.getMonth() - 3, 1)),
          to: this.getEndOfQuarter(new Date(now.getFullYear(), now.getMonth() - 3, 1))
        }
      },
      {
        key: 'this_year',
        label: 'Este año',
        value: {
          from: new Date(now.getFullYear(), 0, 1),
          to: new Date()
        }
      },
      {
        key: 'last_year',
        label: 'Año pasado',
        value: {
          from: new Date(now.getFullYear() - 1, 0, 1),
          to: new Date(now.getFullYear() - 1, 11, 31)
        }
      }
    ];
  }

  static getPreviousPeriod(dateRange: DateRange): DateRange {
    const duration = dateRange.to.getTime() - dateRange.from.getTime();
    return {
      from: new Date(dateRange.from.getTime() - duration),
      to: new Date(dateRange.from.getTime() - 1)
    };
  }

  static formatDateForSQL(date: Date): string {
    return date.toISOString();
  }

  static applyDateFilterToQuery(
    table: string,
    dateRange: DateRange,
    dateColumn: string = 'created_at'
  ) {
    return supabase
      .from(table as any)
      .select('*')
      .gte(dateColumn, this.formatDateForSQL(dateRange.from))
      .lte(dateColumn, this.formatDateForSQL(dateRange.to));
  }

  static async getFilteredData(
    table: string,
    dateRange: DateRange,
    options: DateFilterOptions = {},
    dateColumn: string = 'created_at'
  ) {
    const query = this.applyDateFilterToQuery(table, dateRange, dateColumn);
    const { data, error } = await query;

    if (error) {
      console.error(`Error filtering ${table}:`, error);
      return { data: [], comparison: null, error };
    }

    let comparison = null;
    if (options.includeComparison) {
      const previousPeriod = this.getPreviousPeriod(dateRange);
      const previousQuery = this.applyDateFilterToQuery(table, previousPeriod, dateColumn);
      const { data: previousData } = await previousQuery;
      comparison = previousData || [];
    }

    return { data: data || [], comparison, error: null };
  }

  static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  static formatPercentageChange(change: number): string {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  // Helper methods
  private static getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    return new Date(date.getFullYear(), date.getMonth(), diff);
  }

  private static getEndOfWeek(date: Date): Date {
    const startOfWeek = this.getStartOfWeek(date);
    return new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  }

  private static getStartOfQuarter(date: Date): Date {
    const quarter = Math.floor(date.getMonth() / 3);
    return new Date(date.getFullYear(), quarter * 3, 1);
  }

  private static getEndOfQuarter(date: Date): Date {
    const quarter = Math.floor(date.getMonth() / 3);
    return new Date(date.getFullYear(), quarter * 3 + 3, 0);
  }

  static isDateInRange(date: Date, range: DateRange): boolean {
    return date >= range.from && date <= range.to;
  }

  static mergeDateRanges(ranges: DateRange[]): DateRange | null {
    if (ranges.length === 0) return null;
    
    return {
      from: new Date(Math.min(...ranges.map(r => r.from.getTime()))),
      to: new Date(Math.max(...ranges.map(r => r.to.getTime())))
    };
  }

  static splitDateRangeByPeriod(
    dateRange: DateRange, 
    period: 'day' | 'week' | 'month'
  ): DateRange[] {
    const ranges: DateRange[] = [];
    let current = new Date(dateRange.from);
    
    while (current < dateRange.to) {
      let next: Date;
      
      switch (period) {
        case 'day':
          next = new Date(current.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'week':
          next = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          next = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
          break;
      }
      
      ranges.push({
        from: new Date(current),
        to: new Date(Math.min(next.getTime() - 1, dateRange.to.getTime()))
      });
      
      current = next;
    }
    
    return ranges;
  }
}