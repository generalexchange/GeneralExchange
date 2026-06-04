/**
 * Options chain — AG Grid.
 *
 * The full per-contract chain with first- and second-order Greeks. Strike is
 * Strike pinned; rows sorted by expiration. Live updates via applyChainTransaction.
 */

'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridApi, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import { GE_GRID_CLASS, GE_GRID_DEFAULTS } from './agGridTheme';
import { DeltaCell, ThetaCell, IvRankCell, MoneynessCell, SideCell } from './cellRenderers';
import type { OptionRow } from '../dashboard/terminal/terminalData';

export interface ChainGridRow extends OptionRow {
  expiration: string;
}

const num = (d: number) => (p: { value: unknown }) =>
  Number.isFinite(Number(p.value)) ? Number(p.value).toFixed(d) : '';
const compact = (p: { value: unknown }) =>
  Number.isFinite(Number(p.value))
    ? Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(p.value))
    : '';

/** Apply a live delta to a chain grid without disturbing scroll / sort state. */
export function applyChainTransaction(
  api: GridApi<ChainGridRow>,
  delta: { add?: ChainGridRow[]; update?: ChainGridRow[]; remove?: ChainGridRow[] },
): void {
  api.applyTransaction(delta);
}

export function OptionsChainGrid({
  chain,
  expiration = 'Jun 20',
  onSelectRow,
  onApiReady,
}: {
  chain: OptionRow[];
  expiration?: string;
  onSelectRow?: (row: OptionRow) => void;
  onApiReady?: (api: GridApi<ChainGridRow>) => void;
}) {
  const apiRef = useRef<GridApi<ChainGridRow> | null>(null);

  const rowData = useMemo<ChainGridRow[]>(() => {
    const rows = chain.map((r) => {
      const expMatch = r.id.match(/(\d{4}-\d{2}-\d{2})/);
      return { ...r, expiration: expMatch?.[1] ?? expiration };
    });
    return rows.sort((a, b) => {
      const exp = a.expiration.localeCompare(b.expiration);
      if (exp !== 0) return exp;
      if (a.strike !== b.strike) return a.strike - b.strike;
      return a.type.localeCompare(b.type);
    });
  }, [chain, expiration]);

  const columnDefs = useMemo<ColDef<ChainGridRow>[]>(
    () => [
      { field: 'expiration', headerName: 'Exp', width: 100, pinned: 'left', sort: 'asc' },
      { field: 'type', headerName: 'C/P', width: 64, cellRenderer: SideCell, filter: true },
      {
        field: 'strike',
        headerName: 'Strike',
        width: 92,
        pinned: 'left',
        valueFormatter: num(2),
        cellClass: 'text-zinc-100 font-semibold',
        sort: 'asc',
      },
      { field: 'bid', headerName: 'Bid', width: 80, valueFormatter: num(2) },
      { field: 'ask', headerName: 'Ask', width: 80, valueFormatter: num(2) },
      { field: 'mid', headerName: 'Mid', width: 80, valueFormatter: num(2) },
      { field: 'lastTraded', headerName: 'Last', width: 80, valueFormatter: num(2) },
      { field: 'volume', headerName: 'Vol', width: 70, valueFormatter: compact },
      { field: 'openInterest', headerName: 'OI', width: 70, valueFormatter: compact },
      { field: 'iv', headerName: 'IV%', width: 72, valueFormatter: num(1) },
      { field: 'ivRank', headerName: 'IV Rank', width: 110, cellRenderer: IvRankCell },
      { field: 'moneyness', headerName: 'Mny', width: 64, cellRenderer: MoneynessCell },
      { field: 'delta', headerName: 'Δ', width: 78, cellRenderer: DeltaCell },
      { field: 'gamma', headerName: 'Γ', width: 84, valueFormatter: num(4) },
      { field: 'theta', headerName: 'Θ', width: 84, cellRenderer: ThetaCell },
      { field: 'vega', headerName: 'ν', width: 78, valueFormatter: num(3) },
      { field: 'charm', headerName: 'Charm', width: 92, valueFormatter: num(5) },
      { field: 'vanna', headerName: 'Vanna', width: 90, valueFormatter: num(4) },
      { field: 'volga', headerName: 'Volga', width: 90, valueFormatter: num(3) },
      { field: 'zomma', headerName: 'Zomma', width: 92, valueFormatter: num(4) },
      { field: 'color', headerName: 'Color', width: 92, valueFormatter: num(6) },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<ChainGridRow>>(
    () => ({ sortable: true, resizable: true, suppressMovable: false }),
    [],
  );

  const onGridReady = useCallback(
    (e: GridReadyEvent<ChainGridRow>) => {
      apiRef.current = e.api;
      onApiReady?.(e.api);
    },
    [onApiReady],
  );

  const getRowId = useCallback((p: { data: ChainGridRow }) => `${p.data.id}`, []);

  const onRowClicked = useCallback(
    (e: RowClickedEvent<ChainGridRow>) => {
      if (e.data && onSelectRow) onSelectRow(e.data);
    },
    [onSelectRow],
  );

  return (
    <div className={`${GE_GRID_CLASS} h-full w-full`}>
      <AgGridReact<ChainGridRow>
        {...GE_GRID_DEFAULTS}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        onGridReady={onGridReady}
        onRowClicked={onRowClicked}
      />
    </div>
  );
}
