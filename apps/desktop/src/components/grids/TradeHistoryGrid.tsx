import React, { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { GE_GRID_CLASS, GE_GRID_DEFAULTS } from './gridTheme';
import { PnlCell, PctCell, SideCell } from './cellRenderers';
import type { TradeRecord } from '@/types/trading';

interface Props {
  trades: TradeRecord[];
}

export const TradeHistoryGrid: React.FC<Props> = ({ trades }) => {
  const columnDefs = useMemo<ColDef<TradeRecord>[]>(
    () => [
      { field: 'underlying', headerName: 'Sym', width: 72, pinned: 'left' },
      { field: 'contractSymbol', headerName: 'Contract', flex: 1, minWidth: 160 },
      { field: 'side', headerName: 'Side', width: 64, cellRenderer: SideCell },
      { field: 'quantity', headerName: 'Qty', width: 56 },
      { field: 'entryPrice', headerName: 'Entry', width: 74, valueFormatter: (p) => Number(p.value).toFixed(2) },
      { field: 'exitPrice', headerName: 'Exit', width: 74, valueFormatter: (p) => Number(p.value).toFixed(2) },
      { field: 'realizedPnl', headerName: 'Realized', width: 100, cellRenderer: PnlCell },
      { field: 'realizedPnlPct', headerName: '%', width: 80, cellRenderer: PctCell },
      { field: 'closedAt', headerName: 'Closed', width: 150, valueFormatter: (p) => new Date(Number(p.value)).toLocaleString('en-US') },
    ],
    [],
  );

  const getRowId = useCallback((p: { data: TradeRecord }) => p.data.id, []);

  return (
    <div className={`${GE_GRID_CLASS} h-full w-full`}>
      <AgGridReact<TradeRecord>
        rowData={trades}
        columnDefs={columnDefs}
        defaultColDef={GE_GRID_DEFAULTS}
        getRowId={getRowId}
        suppressCellFocus
        animateRows={false}
        headerHeight={28}
        rowHeight={26}
        overlayNoRowsTemplate="<span class='text-zinc-600 text-xs'>No trade history</span>"
      />
    </div>
  );
};
