/**
 * ADMIN LAYOUT CONFIGURATION
 * Centralized constants for admin table layouts
 * All values in this file affect the entire admin panel
 */

export const ADMIN_LAYOUT = {
  // === SPACING (in Tailwind units) ===
  spacing: {
    xs: 1,      // gap-1, py-1 (4px)
    sm: 2,      // gap-2, py-2 (8px)
    md: 4,      // gap-4, py-4 (16px)
    lg: 6,      // gap-6, py-6 (24px)
  },

  // === TABLE DIMENSIONS (in pixels) ===
  table: {
    rowHeight: 40,
    headerHeight: 32,
    minHeight: 200,
    bottomMargin: 8,
  },

  // === BARS (in pixels) ===
  bars: {
    stats: {
      height: 24,
      paddingY: '0.125rem',  // py-0.5
      gap: 3,
    },
    filter: {
      height: 32,
      paddingY: '0.25rem',   // py-1
      gap: 2,
    },
    header: {
      height: 32,
      paddingBottom: '0.25rem', // pb-1
    },
  },

  // === COLUMN WIDTHS (in pixels, for table consistency) ===
  columns: {
    checkbox: 36,
    star: 32,
    contact: 170,
    company: 140,
    origin: 95,
    channel: 120,
    province: 70,
    sector: 90,
    status: 110,
    revenue: 70,
    ebitda: 70,
    apollo: 75,
    date: 75,
    actions: 40,
  },
} as const;

/**
 * Helper to calculate table container height
 * Uses flexbox approach - returns CSS class instead of pixel value
 */
export const getTableContainerHeight = (topOffset: number): number => {
  return Math.max(
    ADMIN_LAYOUT.table.minHeight,
    window.innerHeight - topOffset - ADMIN_LAYOUT.table.bottomMargin
  );
};

/**
 * CSS class names for admin table layouts
 * Use these for consistent styling across all admin tables
 */
export const ADMIN_TABLE_CLASSES = {
  container: 'admin-table-layout',
  headerZone: 'admin-table-header-zone',
  contentZone: 'admin-table-content-zone',
  compactRow: 'admin-compact-row',
} as const;

export type AdminLayoutConfig = typeof ADMIN_LAYOUT;
