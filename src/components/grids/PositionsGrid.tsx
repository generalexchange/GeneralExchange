/**
 * Open positions — AG Grid.
 *
 * Live unrealized PnL on every portfolio state update. Use applyPositionsTransaction
 * (applyTransactionAsync) for WebSocket-driven mark updates; never setRowData.
 */

'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { GE_GRID_CLASS, GE_GRID_DEFAULTS } from './agGridTheme';
import { PnlCell, PctCell, ThetaCell, DeltaCell, IvRankCell, SideCell } from './cellRenderers';
import type { Position } from '../dashboard/terminal/terminalData';

const num = (d: number) => (p: { value: unknown }) =>
  Number.isFinite(Number(p.value)) ? Number(p.value).toFixed(d) : '';

export function applyPositionsTransaction(
  api: GridApi<Position>,
  delta: { add?: Position[]; update?: Position[]; remove?: Position[] },
): void {
  api.applyTransactionAsync(delta);
}

export function PositionsGrid({ positions }: { positions: Position[] }) {
  const apiRef = useRef<GridApi<Position> | null>(null);

  const columnDefs = useMemo<ColDef<Position>[]>(
    () => [
      { field: 'symbol', headerName: 'Symbol', width: 90, pinned: 'left', cellClass: 'text-zinc-100 font-semibold' },
      { field: 'type', headerName: 'C/P', width: 64, cellRenderer: SideCell },
      { field: 'strike', headerName: 'Strike', width: 84, valueFormatter: num(2) },
      { field: 'expiration', headerName: 'Exp', width: 84 },
      { field: 'qty', headerName: 'Qty', width: 64, valueFormatter: num(0) },
      { field: 'entryPrice', headerName: 'Entry', width: 80, valueFormatter: num(2) },
      { field: 'markPrice', headerName: 'Mark', width: 80, valueFormatter: num(2) },
      { field: 'unrealizedPnl', headerName: 'Unreal. PnL', width: 110, cellRenderer: PnlCell },
      { field: 'unrealizedPct', headerName: '%', width: 88, cellRenderer: PctCell },
      { field: 'delta', headerName: 'Δ', width: 78, cellRenderer: DeltaCell },
      { field: 'theta', headerName: 'Θ', width: 84, cellRenderer: ThetaCell },
      { field: 'ivRank', headerName: 'IV Rank', width: 120, cellRenderer: IvRankCell, flex: 1 },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<Position>>(() => ({ sortable: true, resizable: true }), []);
  const onGridReady = useCallback((e: GridReadyEvent<Position>) => {
    apiRef.current = e.api;
  }, []);
  const getRowId = useCallback((p: { data: Position }) => p.data.id, []);

  return (
    <div className={`${GE_GRID_CLASS} h-full w-full`}>
      <AgGridReact<Position>
        {...GE_GRID_DEFAULTS}
        rowData={positions}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        onGridReady={onGridReady}
      />
    </div>
  );
}
