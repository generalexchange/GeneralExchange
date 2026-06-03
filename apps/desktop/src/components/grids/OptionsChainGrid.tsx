import React, { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridApi, GridReadyEvent, RowClickedEvent, ValueGetterParams } from 'ag-grid-community';
import { GE_GRID_CLASS, GE_GRID_DEFAULTS } from './gridTheme';
import { DeltaCell, ThetaCell, IvRankCell, MoneynessCell, SideCell } from './cellRenderers';
import { useMarketStore } from '@/stores/marketStore';
import type { OptionRow } from '@/types/market';

function moneyness(row: OptionRow): string {
  if (Math.abs(row.moneyness) < 0.01) return 'ATM';
  return row.inTheMoney ? 'ITM' : 'OTM';
}

export const OptionsChainGrid: React.FC = () => {
  const apiRef = useRef<GridApi<OptionRow> | null>(null);
  const prevKeys = useRef<Set<string>>(new Set());
  const setSelected = useMarketStore((s) => s.setSelectedContract);

  const columnDefs = useMemo<ColDef<OptionRow>[]>(
    () => [
      { field: 'type', headerName: 'Side', width: 64, cellRenderer: SideCell, valueGetter: (p) => p.data?.type.toUpperCase() },
      { field: 'strike', headerName: 'Strike', width: 78, pinned: 'left', sort: 'asc', valueFormatter: (p) => Number(p.value).toFixed(2) },
      { field: 'bid', headerName: 'Bid', width: 66, valueFormatter: (p) => Number(p.value).toFixed(2) },
      { field: 'ask', headerName: 'Ask', width: 66, valueFormatter: (p) => Number(p.value).toFixed(2) },
      { field: 'last', headerName: 'Last', width: 66, valueFormatter: (p) => Number(p.value).toFixed(2) },
      { field: 'volume', headerName: 'Vol', width: 70 },
      { field: 'openInterest', headerName: 'OI', width: 76 },
      { field: 'impliedVolatility', headerName: 'IV', width: 64, valueFormatter: (p) => `${(Number(p.value) * 100).toFixed(1)}` },
      { headerName: 'IV Rk', width: 96, valueGetter: (p: ValueGetterParams<OptionRow>) => (p.data ? p.data.ivRank * 100 : 0), cellRenderer: IvRankCell },
      { field: 'delta', headerName: 'Δ', width: 70, cellRenderer: DeltaCell },
      { field: 'theta', headerName: 'Θ', width: 70, cellRenderer: ThetaCell },
      { headerName: 'Money', width: 70, valueGetter: (p: ValueGetterParams<OptionRow>) => (p.data ? moneyness(p.data) : ''), cellRenderer: MoneynessCell },
    ],
    [],
  );

  const getRowId = useCallback((p: { data: OptionRow }) => p.data.contractSymbol, []);

  const onGridReady = useCallback((e: GridReadyEvent<OptionRow>) => {
    apiRef.current = e.api;
    const rows = useMarketStore.getState().chainRows;
    e.api.setGridOption('rowData', rows);
    prevKeys.current = new Set(rows.map((r) => r.contractSymbol));
  }, []);

  // Live updates as transactions — never setRowData on a live grid.
  React.useEffect(() => {
    const unsub = useMarketStore.subscribe((state) => {
      const api = apiRef.current;
      if (!api) return;
      const rows = state.chainRows;
      const add: OptionRow[] = [];
      const update: OptionRow[] = [];
      const seen = new Set<string>();
      for (const r of rows) {
        seen.add(r.contractSymbol);
        if (prevKeys.current.has(r.contractSymbol)) update.push(r);
        else add.push(r);
      }
      const remove: OptionRow[] = [];
      prevKeys.current.forEach((k) => {
        if (!seen.has(k)) {
          const node = api.getRowNode(k);
          if (node?.data) remove.push(node.data);
        }
      });
      if (add.length || update.length || remove.length) {
        api.applyTransactionAsync({ add, update, remove });
        prevKeys.current = seen;
      }
    });
    return unsub;
  }, []);

  const onRowClicked = useCallback(
    (e: RowClickedEvent<OptionRow>) => {
      if (e.data) setSelected(e.data);
    },
    [setSelected],
  );

  return (
    <div className={`${GE_GRID_CLASS} h-full w-full`} data-tour="options-chain">
      <AgGridReact<OptionRow>
        columnDefs={columnDefs}
        defaultColDef={GE_GRID_DEFAULTS}
        getRowId={getRowId}
        onGridReady={onGridReady}
        onRowClicked={onRowClicked}
        rowSelection="single"
        animateRows={false}
        suppressCellFocus
        headerHeight={28}
        rowHeight={26}
      />
    </div>
  );
};
