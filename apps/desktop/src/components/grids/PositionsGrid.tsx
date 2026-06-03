import React, { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { GE_GRID_CLASS, GE_GRID_DEFAULTS } from './gridTheme';
import { PnlCell, PctCell, DeltaCell, ThetaCell, SideCell } from './cellRenderers';
import { usePortfolioStore } from '@/stores/portfolioStore';
import type { Position } from '@/types/trading';

export const PositionsGrid: React.FC = () => {
  const positions = usePortfolioStore((s) => s.positions);

  const columnDefs = useMemo<ColDef<Position>[]>(
    () => [
      { field: 'underlying', headerName: 'Sym', width: 72, pinned: 'left' },
      { field: 'side', headerName: 'Side', width: 64, cellRenderer: SideCell, valueGetter: (p) => (p.data?.side === 'buy' ? 'LONG' : 'SHORT') },
      { field: 'type', headerName: 'Type', width: 60, valueFormatter: (p) => String(p.value).toUpperCase() },
      { field: 'strike', headerName: 'Strike', width: 74, valueFormatter: (p) => Number(p.value).toFixed(2) },
      { field: 'expiration', headerName: 'Exp', width: 96 },
      { field: 'quantity', headerName: 'Qty', width: 56 },
      { field: 'avgPrice', headerName: 'Avg', width: 70, valueFormatter: (p) => Number(p.value).toFixed(2) },
      { field: 'markPrice', headerName: 'Mark', width: 70, valueFormatter: (p) => Number(p.value).toFixed(2) },
      { field: 'marketValue', headerName: 'Value', width: 92, valueFormatter: (p) => Number(p.value).toFixed(0) },
      { field: 'openPnl', headerName: 'Open P&L', width: 100, cellRenderer: PnlCell },
      { field: 'openPnlPct', headerName: '%', width: 80, cellRenderer: PctCell },
      { field: 'dayPnl', headerName: 'Day P&L', width: 100, cellRenderer: PnlCell },
      { field: 'delta', headerName: 'Δ', width: 70, cellRenderer: DeltaCell },
      { field: 'theta', headerName: 'Θ', width: 70, cellRenderer: ThetaCell },
    ],
    [],
  );

  const getRowId = useCallback((p: { data: Position }) => p.data.id, []);

  return (
    <div className={`${GE_GRID_CLASS} h-full w-full`}>
      <AgGridReact<Position>
        rowData={positions}
        columnDefs={columnDefs}
        defaultColDef={GE_GRID_DEFAULTS}
        getRowId={getRowId}
        suppressCellFocus
        animateRows={false}
        headerHeight={28}
        rowHeight={26}
        overlayNoRowsTemplate="<span class='text-zinc-600 text-xs'>No open positions</span>"
      />
    </div>
  );
};
