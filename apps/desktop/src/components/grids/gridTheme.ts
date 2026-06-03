// AG Grid Quartz-dark base styles. The palette override lives in index.css
// under `.ge-grid.ag-theme-quartz-dark`, matching the web dashboard.
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import type { ColDef } from 'ag-grid-community';

export const GE_GRID_CLASS = 'ag-theme-quartz-dark ge-grid';

export const GE_GRID_DEFAULTS: ColDef = {
  sortable: true,
  resizable: true,
  suppressMovable: true,
  cellClass: 'tabular',
};
