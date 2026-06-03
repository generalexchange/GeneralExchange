import { apiClient } from '@/api/client';
import type { PortfolioState } from '@/types/portfolio';
import type { Position } from '@/types/trading';

export const portfolioApi = {
  state: (signal?: AbortSignal) => apiClient.get<PortfolioState>('/v1/paper/portfolio', signal),

  positions: (signal?: AbortSignal) => apiClient.get<Position[]>('/v1/paper/positions', signal),

  closePosition: (positionId: string) =>
    apiClient.post<{ ok: boolean }>(`/v1/paper/positions/${positionId}/close`),
};
