import { apiClient } from '@/api/client';
import type { OrderAck, OrderRequest, TradeRecord } from '@/types/trading';

export const tradingApi = {
  submitOrder: (order: OrderRequest) => apiClient.post<OrderAck>('/v1/paper/orders', order),

  cancelOrder: (orderId: string) => apiClient.del<OrderAck>(`/v1/paper/orders/${orderId}`),

  history: (symbol?: string, signal?: AbortSignal) =>
    apiClient.get<TradeRecord[]>(`/v1/paper/trades${symbol ? `?symbol=${symbol}` : ''}`, signal),
};
