import { create } from 'zustand';
import type { ChartInterval } from '@/types/market';
import { DEFAULT_SYMBOL, DEFAULT_INTERVAL } from '@/lib/constants';

export type ConnectionState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';
export type BottomTab = 'chain' | 'positions' | 'history' | 'signals';

interface UiState {
  activeSymbol: string;
  activeInterval: ChartInterval;
  activeTab: BottomTab;
  connectionState: ConnectionState;
  tourCompleted: boolean;
  modalOpen: boolean;
  advancedView: boolean;

  updateAvailable: boolean;
  updateVersion: string | null;

  setActiveSymbol: (symbol: string) => void;
  setActiveInterval: (interval: ChartInterval) => void;
  setActiveTab: (tab: BottomTab) => void;
  setConnectionState: (state: ConnectionState) => void;
  setTourCompleted: (done: boolean) => void;
  setModalOpen: (open: boolean) => void;
  setAdvancedView: (advancedView: boolean) => void;
  setUpdate: (available: boolean, version: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeSymbol: DEFAULT_SYMBOL,
  activeInterval: DEFAULT_INTERVAL,
  activeTab: 'chain',
  connectionState: 'disconnected',
  tourCompleted: false,
  modalOpen: false,
  advancedView: false,
  updateAvailable: false,
  updateVersion: null,

  setActiveSymbol: (symbol) => set({ activeSymbol: symbol.toUpperCase() }),
  setActiveInterval: (interval) => set({ activeInterval: interval }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setConnectionState: (connectionState) => set({ connectionState }),
  setTourCompleted: (tourCompleted) => set({ tourCompleted }),
  setModalOpen: (modalOpen) => set({ modalOpen }),
  setAdvancedView: (advancedView) => set({ advancedView }),
  setUpdate: (updateAvailable, updateVersion) => set({ updateAvailable, updateVersion }),
}));
