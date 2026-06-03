/**
 * Closed trade history — AG Grid.
 *
 * Every closed paper trade with entry/exit context, PnL, regime at entry, and
 * IV rank at entry. Read-only historical data, so rowData is set directly.
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { GE_GRID_CLASS, GE_GRID_DEFAULTS } from './agGridTheme';
import { PnlCell, PctCell, IvRankCell, SideCell } from './cellRenderers';
import type { ClosedTrade } from '../dashboard/terminal/terminalData';

const num = (d: number) => (p: { value: unknown }) =>
  Number.isFinite(Number(p.value)) ? Number(p.value).toFixed(d) : '';
const time = (p: { value: unknown }) =>
  new Date(Number(p.value)).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
const hold = (p: { value: unknown }) => {
  const m = Number(p.value);
  return m >= 1440 ? `${(m / 1440).toFixed(1)}d` : m >= 60 ? `${(m / 60).toFixed(1)}h` : `${m.toFixed(0)}m`;
};

export function TradeHistoryGrid({ trades }: { trades: ClosedTrade[] }) {
  const columnDefs = useMemo<ColDef<ClosedTrade>[]>(
    () => [
      { field: 'symbol', headerName: 'Symbol', width: 90, pinned: 'left', cellClass: 'text-zinc-100 font-semibold' },
      { field: 'type', headerName: 'C/P', width: 60, cellRenderer: SideCell },
      { field: 'strike', headerName: 'Strike', width: 82, valueFormatter: num(2) },
      { field: 'expiration', headerName: 'Exp', width: 78 },
      { field: 'entryTime', headerName: 'Entry', width: 130, valueFormatter: time },
      { field: 'exitTime', headerName: 'Exit', width: 130, valueFormatter: time },
      { field: 'entryPrice', headerName: 'Entry $', width: 80, valueFormatter: num(2) },
      { field: 'exitPrice', headerName: 'Exit $', width: 80, valueFormatter: num(2) },
      { field: 'pnl', headerName: 'PnL', width: 100, cellRenderer: PnlCell },
      { field: 'pnlPct', headerName: '%', width: 88, cellRenderer: PctCell },
      { field: 'holdMin', headerName: 'Hold', width: 76, valueFormatter: hold },
      { field: 'ivRankAtEntry', headerName: 'IVR@entry', width: 120, cellRenderer: IvRankCell },
      { field: 'regimeAtEntry', headerName: 'Regime @ entry', minWidth: 200, flex: 1 },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<ClosedTrade>>(() => ({ sortable: true, resizable: true }), []);
  const getRowId = useCallback((p: { data: ClosedTrade }) => p.data.id, []);

  return (
    <div className={`${GE_GRID_CLASS} h-full w-full`}>
      <AgGridReact<ClosedTrade>
        {...GE_GRID_DEFAULTS}
        rowData={trades}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
      />
    </div>
  );
}
