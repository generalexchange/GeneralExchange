import React, { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, RowClickedEvent } from 'ag-grid-community';
import { GE_GRID_CLASS, GE_GRID_DEFAULTS } from './gridTheme';
import { PctCell, SparklineCell } from './cellRenderers';

export interface WatchRow {
  symbol: string;
  last: number;
  changePct: number;
  spark: number[];
}

interface Props {
  rows: WatchRow[];
  activeSymbol: string;
  onSelect: (symbol: string) => void;
}

export const WatchlistGrid: React.FC<Props> = ({ rows, activeSymbol, onSelect }) => {
  const columnDefs = useMemo<ColDef<WatchRow>[]>(
    () => [
      { field: 'symbol', headerName: 'Sym', width: 58, pinned: 'left' },
      { field: 'last', headerName: 'Last', width: 66, valueFormatter: (p) => Number(p.value).toFixed(2) },
      { field: 'changePct', headerName: 'Chg%', width: 70, cellRenderer: PctCell },
      { field: 'spark', headerName: '', width: 72, cellRenderer: SparklineCell, sortable: false },
    ],
    [],
  );

  const getRowId = useCallback((p: { data: WatchRow }) => p.data.symbol, []);
  const onRowClicked = useCallback((e: RowClickedEvent<WatchRow>) => e.data && onSelect(e.data.symbol), [onSelect]);

  const getRowClass = useCallback(
    (p: { data?: WatchRow }) => (p.data?.symbol === activeSymbol ? 'ag-row-active-symbol' : ''),
    [activeSymbol],
  );

  return (
    <div className={`${GE_GRID_CLASS} h-full w-full`}>
      <AgGridReact<WatchRow>
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={GE_GRID_DEFAULTS}
        getRowId={getRowId}
        getRowClass={getRowClass}
        onRowClicked={onRowClicked}
        rowSelection="single"
        suppressCellFocus
        animateRows={false}
        headerHeight={26}
        rowHeight={28}
      />
    </div>
  );
};
