/**
 * Watchlist — compact AG Grid for the left sidebar.
 *
 * Symbol, last price, day change %, and a sparkline rendered as a lightweight
 * inline SVG cell (deliberately NOT an ECharts instance — one cheap SVG per row
 * keeps the sidebar fast).
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, RowClickedEvent } from 'ag-grid-community';
import { GE_GRID_CLASS } from './agGridTheme';
import { PctCell, SparklineCell } from './cellRenderers';
import type { WatchItem } from '../dashboard/terminal/terminalData';

const num = (d: number) => (p: { value: unknown }) =>
  Number.isFinite(Number(p.value)) ? Number(p.value).toFixed(d) : '';

export function WatchlistGrid({
  items,
  selected,
  onSelect,
}: {
  items: WatchItem[];
  selected?: string;
  onSelect?: (symbol: string) => void;
}) {
  const columnDefs = useMemo<ColDef<WatchItem>[]>(
    () => [
      { field: 'symbol', headerName: 'Sym', width: 58, cellClass: 'text-zinc-100 font-semibold' },
      { field: 'price', headerName: 'Last', width: 66, valueFormatter: num(2), type: 'rightAligned' },
      { field: 'changePct', headerName: 'Chg%', width: 70, cellRenderer: PctCell },
      { field: 'spark', headerName: '', width: 76, cellRenderer: SparklineCell, sortable: false },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<WatchItem>>(() => ({ sortable: true, resizable: false, suppressMovable: true }), []);
  const getRowId = useCallback((p: { data: WatchItem }) => p.data.symbol, []);
  const onRowClicked = useCallback(
    (e: RowClickedEvent<WatchItem>) => {
      if (e.data && onSelect) onSelect(e.data.symbol);
    },
    [onSelect],
  );
  const getRowClass = useCallback(
    (p: { data?: WatchItem }) => (p.data?.symbol === selected ? 'ag-row-selected' : ''),
    [selected],
  );

  return (
    <div className={`${GE_GRID_CLASS} h-full w-full`}>
      <AgGridReact<WatchItem>
        headerHeight={26}
        rowHeight={30}
        suppressCellFocus
        rowData={items}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        getRowClass={getRowClass}
        onRowClicked={onRowClicked}
      />
    </div>
  );
}
