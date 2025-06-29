
export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  sectors: string[];
  searchQuery: string;
}

export interface FilterOptions {
  availableSectors: string[];
}

export const getDefaultFilters = (): DashboardFilters => ({
  dateRange: {
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1), // últimos 6 meses
    end: new Date()
  },
  sectors: [],
  searchQuery: ''
});
