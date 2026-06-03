import React, { useEffect, useMemo, useState } from 'react';
import { useMarketStore } from '@/stores/marketStore';
import { useUiStore } from '@/stores/uiStore';
import { useToast } from '@/hooks/useToast';
import { tradingApi } from '@/api/trading';
import { CONTRACT_MULTIPLIER } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';
import type { OrderRequest, OrderSide, OrderType } from '@/types/trading';
import { OrderConfirmModal } from './OrderConfirmModal';

const ORDER_TYPES: { id: OrderType; label: string }[] = [
  { id: 'market', label: 'Market' },
  { id: 'limit', label: 'Limit' },
  { id: 'stop_limit', label: 'Stop' },
];

export const OrderEntryPanel: React.FC = () => {
  const contract = useMarketStore((s) => s.selectedContract);
  const setModalOpen = useUiStore((s) => s.setModalOpen);
  const { toast } = useToast();

  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [side, setSide] = useState<OrderSide | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Default the limit price to the relevant side of the spread on focus changes.
  useEffect(() => {
    if (!contract) return;
    if ((orderType === 'limit' || orderType === 'stop_limit') && limitPrice === '') {
      setLimitPrice((side === 'sell' ? contract.bid : contract.ask).toFixed(2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, orderType, side]);

  const estimatedPremium = useMemo(() => {
    if (!contract) return 0;
    const px = orderType === 'market' ? contract.mid : Number(limitPrice) || contract.mid;
    return quantity * CONTRACT_MULTIPLIER * px;
  }, [contract, orderType, limitPrice, quantity]);

  const maxRisk: number | 'uncapped' = side === 'sell' ? 'uncapped' : estimatedPremium;

  const canSubmit = Boolean(contract) && side != null && quantity >= 1 &&
    (orderType === 'market' || (Number(limitPrice) > 0)) &&
    (orderType !== 'stop_limit' || Number(stopPrice) > 0);

  const order: OrderRequest | null = useMemo(() => {
    if (!contract || !side) return null;
    return {
      contractSymbol: contract.contractSymbol,
      underlying: contract.underlying,
      side,
      type: orderType,
      quantity,
      limitPrice: orderType === 'market' ? undefined : Number(limitPrice),
      stopPrice: orderType === 'stop_limit' ? Number(stopPrice) : undefined,
    };
  }, [contract, side, orderType, quantity, limitPrice, stopPrice]);

  const openConfirm = () => {
    if (!canSubmit) return;
    setConfirming(true);
    setModalOpen(true);
  };

  const closeConfirm = () => {
    setConfirming(false);
    setModalOpen(false);
  };

  const submit = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      const ack = await tradingApi.submitOrder(order);
      toast({ kind: 'success', title: 'Order submitted', message: `${order.side.toUpperCase()} ${order.quantity} ${order.contractSymbol} · ${ack.status}` });
      setSide(null);
      setQuantity(1);
      setLimitPrice('');
      setStopPrice('');
    } catch (e) {
      const message = e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Order failed';
      toast({ kind: 'error', title: 'Order rejected', message });
    } finally {
      setSubmitting(false);
      closeConfirm();
    }
  };

  return (
    <div className="border-b border-white/[0.06] px-3 py-3" data-tour="order-entry">
      <p className="tabular text-center font-display text-xl text-neutral-50">
        {contract ? contract.contractSymbol : '—'}
      </p>
      <p className="mb-3 text-center text-[10px] uppercase tracking-wider text-zinc-500">
        {contract ? `${contract.type.toUpperCase()} · ${contract.strike} · ${contract.expiration}` : 'Select a contract'}
      </p>

      <div className="mb-2 grid grid-cols-3 gap-1">
        {ORDER_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setOrderType(t.id)}
            className={`rounded py-1.5 text-[12px] font-medium ${
              orderType === t.id ? 'bg-brass/20 text-tan' : 'border border-white/10 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide('buy')}
          className={`rounded-md py-3 text-sm font-bold transition-colors ${
            side === 'buy' ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/60' : 'border border-emerald-500/20 text-emerald-400/70 hover:bg-emerald-500/10'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`rounded-md py-3 text-sm font-bold transition-colors ${
            side === 'sell' ? 'bg-red-500/25 text-red-300 ring-1 ring-red-500/60' : 'border border-red-500/20 text-red-400/70 hover:bg-red-500/10'
          }`}
        >
          Sell
        </button>
      </div>

      <label className="mb-2 block">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">Contracts</span>
        <div className="mt-1 flex items-center gap-1">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded border border-white/10 text-zinc-300 hover:bg-white/5">−</button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
            className="tabular h-8 flex-1 rounded border border-white/10 bg-black/30 text-center text-sm text-neutral-100 outline-none focus:border-brass/50"
          />
          <button onClick={() => setQuantity((q) => q + 1)} className="h-8 w-8 rounded border border-white/10 text-zinc-300 hover:bg-white/5">+</button>
        </div>
      </label>

      {(orderType === 'limit' || orderType === 'stop_limit') && (
        <label className="mb-2 block">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Limit price</span>
          <input
            type="number"
            step="0.01"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="tabular mt-1 h-8 w-full rounded border border-white/10 bg-black/30 px-2 text-sm text-neutral-100 outline-none focus:border-brass/50"
          />
        </label>
      )}

      {orderType === 'stop_limit' && (
        <label className="mb-2 block">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Stop price</span>
          <input
            type="number"
            step="0.01"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            className="tabular mt-1 h-8 w-full rounded border border-white/10 bg-black/30 px-2 text-sm text-neutral-100 outline-none focus:border-brass/50"
          />
        </label>
      )}

      <div className="mb-3 space-y-1 border-t border-white/[0.06] pt-2">
        <div className="flex justify-between text-[12px]">
          <span className="text-zinc-500">Estimated premium</span>
          <span className="tabular text-zinc-400">{formatCurrency(estimatedPremium)}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-zinc-500">Estimated max risk</span>
          <span className="tabular text-zinc-400">{maxRisk === 'uncapped' ? 'Uncapped' : formatCurrency(maxRisk)}</span>
        </div>
      </div>

      <button
        onClick={openConfirm}
        disabled={!canSubmit}
        className="w-full rounded-md bg-tan py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-tan-muted disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500"
      >
        Submit Order
      </button>

      {confirming && order && (
        <OrderConfirmModal
          order={order}
          estimatedPremium={estimatedPremium}
          maxRisk={maxRisk}
          submitting={submitting}
          onConfirm={submit}
          onCancel={closeConfirm}
        />
      )}
    </div>
  );
};
