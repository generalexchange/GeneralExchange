import { useMemo } from 'react';
import { calculateFullGreeks, yearsToExpiration, type FullGreeks } from '@/lib/greeks';
import { RISK_FREE_RATE } from '@/lib/constants';
import type { OptionRow } from '@/types/market';

/**
 * Compute the full first- and second-order Greek set for a contract using the
 * Black-Scholes service. Mirrors the web project so the desktop reports the
 * same numbers. Memoized on the inputs that move the result.
 */
export function useGreeks(contract: OptionRow | null, spot: number | null): FullGreeks | null {
  return useMemo(() => {
    if (!contract || spot == null) return null;
    return calculateFullGreeks({
      strike: contract.strike,
      underlyingPrice: spot,
      riskFreeRate: RISK_FREE_RATE,
      impliedVolatility: contract.impliedVolatility,
      timeToExpiration: yearsToExpiration(contract.expiration),
      type: contract.type === 'call' ? 'CALL' : 'PUT',
    });
  }, [contract, spot]);
}
