/**
 * Backtest trades — AG Grid.
 *
 * Every individual trade in a backtest run with entry/exit, PnL, delta and IV
 * rank at entry, regime at entry, and the captured signal context. Read-only.
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, RowClickedEvent } from 'ag-grid-community';
import { GE_GRID_CLASS, GE_GRID_DEFAULTS } from './agGridTheme';
import { PnlCell, DeltaCell, IvRankCell, SideCell } from './cellRenderers';
import type { BTTrade } from '../backtest/backtestData';

const num = (d: number) => (p: { value: unknown }) =>
  Number.isFinite(Number(p.value)) ? Number(p.value).toFixed(d) : '';
const time = (p: { value: unknown }) =>
  new Date(Number(p.value)).toLocaleString('en-US', {
    year: '2-digit',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });

export function BacktestTradesGrid({
  trades,
  onSelectTrade,
}: {
  trades: BTTrade[];
  onSelectTrade?: (trade: BTTrade) => void;
}) {
  const columnDefs = useMemo<ColDef<BTTrade>[]>(
    () => [
      { field: 'n', headerName: '#', width: 64, pinned: 'left', type: 'rightAligned' },
      { field: 'entryTime', headerName: 'Entry', width: 138, valueFormatter: time },
      { field: 'exitTime', headerName: 'Exit', width: 138, valueFormatter: time },
      { field: 'type', headerName: 'C/P', width: 60, cellRenderer: SideCell },
      { field: 'strike', headerName: 'Strike', width: 80, valueFormatter: num(0) },
      { field: 'entryPrice', headerName: 'Entry $', width: 82, valueFormatter: num(2) },
      { field: 'exitPrice', headerName: 'Exit $', width: 82, valueFormatter: num(2) },
      { field: 'pnl', headerName: 'PnL', width: 100, cellRenderer: PnlCell },
      { field: 'deltaAtEntry', headerName: 'Δ@entry', width: 90, cellRenderer: DeltaCell },
      { field: 'ivRankAtEntry', headerName: 'IVR@entry', width: 120, cellRenderer: IvRankCell },
      { field: 'signalType', headerName: 'Signal', width: 150 },
      { field: 'regimeAtEntry', headerName: 'Regime @ entry', minWidth: 200, flex: 1 },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<BTTrade>>(() => ({ sortable: true, resizable: true }), []);
  const getRowId = useCallback((p: { data: BTTrade }) => p.data.id, []);
  const onRowClicked = useCallback(
    (e: RowClickedEvent<BTTrade>) => {
      if (e.data && onSelectTrade) onSelectTrade(e.data);
    },
    [onSelectTrade],
  );

  return (
    <div className={`${GE_GRID_CLASS} h-full w-full`}>
      <AgGridReact<BTTrade>
        {...GE_GRID_DEFAULTS}
        rowData={trades}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        onRowClicked={onRowClicked}
      />
    </div>
  );
}
