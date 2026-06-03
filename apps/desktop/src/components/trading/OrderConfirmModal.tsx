import React from 'react';
import type { OrderRequest } from '@/types/trading';
import { formatCurrency } from '@/lib/format';

interface Props {
  order: OrderRequest;
  estimatedPremium: number;
  maxRisk: number | 'uncapped';
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const TYPE_LABEL: Record<string, string> = { market: 'Market', limit: 'Limit', stop_limit: 'Stop limit' };

export const OrderConfirmModal: React.FC<Props> = ({ order, estimatedPremium, maxRisk, submitting, onConfirm, onCancel }) => {
  const isBuy = order.side === 'buy';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[340px] rounded-lg border border-brass/40 bg-dark-gray p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500">Confirm order</p>
        <p className={`mt-1 text-lg font-semibold ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
          {isBuy ? 'Buy' : 'Sell'} {order.quantity} × {order.contractSymbol}
        </p>

        <div className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-zinc-500">Type</span>
            <span className="text-zinc-200">{TYPE_LABEL[order.type]}</span>
          </div>
          {order.limitPrice != null && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Limit</span>
              <span className="tabular text-zinc-200">{formatCurrency(order.limitPrice)}</span>
            </div>
          )}
          {order.stopPrice != null && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Stop</span>
              <span className="tabular text-zinc-200">{formatCurrency(order.stopPrice)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-zinc-500">Est. premium</span>
            <span className="tabular text-zinc-300">{formatCurrency(estimatedPremium)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Max risk</span>
            <span className="tabular text-zinc-300">{maxRisk === 'uncapped' ? 'Uncapped' : formatCurrency(maxRisk)}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-md border border-white/10 py-2 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className={`flex-1 rounded-md py-2 text-sm font-semibold text-charcoal disabled:opacity-60 ${
              isBuy ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-red-400 hover:bg-red-300'
            }`}
          >
            {submitting ? 'Submitting…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
