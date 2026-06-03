/**
 * AG Grid theme integration.
 *
 * Every grid in the authenticated experience uses the Quartz Dark base theme
 * (class `ag-theme-quartz-dark`) with the general.exchange CSS-variable
 * overrides defined in globals.css under `.ge-grid`. Import the Quartz CSS once
 * here so any grid module that imports this file pulls the stylesheet, and use
 * GE_GRID_CLASS as the wrapper className.
 *
 * AG Grid is pinned to v32, which uses the legacy CSS theme files (the v33
 * Theming API would require a different override mechanism).
 */

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export const GE_GRID_CLASS = 'ag-theme-quartz-dark ge-grid';

/** Defaults shared by every grid: virtualization on, sensible sizing. */
export const GE_GRID_DEFAULTS = {
  animateRows: false,
  suppressColumnVirtualisation: false,
  rowBuffer: 10,
  suppressCellFocus: true,
  enableCellTextSelection: true,
  headerHeight: 30,
  rowHeight: 28,
} as const;
