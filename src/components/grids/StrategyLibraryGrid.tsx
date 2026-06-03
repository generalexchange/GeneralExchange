/**
 * Strategy library browser — AG Grid (Enterprise).
 *
 * Published strategies with performance metrics, grouped by option structure
 * with aggregated Sharpe (avg) and forks (sum). Row grouping is an AG Grid
 * Enterprise feature; without a license it works in dev with a watermark.
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, RowClickedEvent } from 'ag-grid-community';
import { GE_GRID_CLASS, GE_GRID_DEFAULTS } from './agGridTheme';
import type { Strategy } from '../backtest/backtestData';

const num = (d: number) => (p: { value: unknown }) =>
  Number.isFinite(Number(p.value)) ? Number(p.value).toFixed(d) : '';

export function StrategyLibraryGrid({
  strategies,
  onSelect,
}: {
  strategies: Strategy[];
  onSelect?: (strategy: Strategy) => void;
}) {
  const columnDefs = useMemo<ColDef<Strategy>[]>(
    () => [
      { field: 'structure', headerName: 'Structure', rowGroup: true, hide: true },
      { field: 'name', headerName: 'Strategy', minWidth: 180, flex: 1, cellClass: 'text-zinc-100' },
      { field: 'symbol', headerName: 'Underlying', width: 110 },
      { field: 'version', headerName: 'Ver', width: 72 },
      { field: 'author', headerName: 'Author', width: 110 },
      { field: 'sharpe', headerName: 'Sharpe', width: 100, valueFormatter: num(2), aggFunc: 'avg', type: 'rightAligned' },
      { field: 'forks', headerName: 'Forks', width: 90, valueFormatter: num(0), aggFunc: 'sum', type: 'rightAligned' },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<Strategy>>(() => ({ sortable: true, resizable: true }), []);
  const autoGroupColumnDef = useMemo<ColDef>(() => ({ headerName: 'Structure', minWidth: 200, pinned: 'left' }), []);
  const getRowId = useCallback((p: { data: Strategy }) => p.data.id, []);
  const onRowClicked = useCallback(
    (e: RowClickedEvent<Strategy>) => {
      if (e.data && onSelect) onSelect(e.data);
    },
    [onSelect],
  );

  return (
    <div className={`${GE_GRID_CLASS} h-full w-full`}>
      <AgGridReact<Strategy>
        {...GE_GRID_DEFAULTS}
        rowData={strategies}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        autoGroupColumnDef={autoGroupColumnDef}
        groupDefaultExpanded={1}
        getRowId={getRowId}
        onRowClicked={onRowClicked}
      />
    </div>
  );
}
