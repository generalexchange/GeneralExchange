export interface GrahamInput {
  price: number;
  eps: number;
  bvps: number;
  growthRate: number;
  aaaBondYield: number;
  currentAssets?: number;
  totalLiabilities?: number;
  sharesOutstanding?: number;
  currentRatio?: number;
  yearsPositiveEarnings?: number;
  pe?: number;
  pb?: number;
  paysDividend?: boolean;
}

export interface GrahamOutput {
  grahamNumber: number | null;
  intrinsicValue: number | null;
  ncavPerShare: number | null;
  netNet: boolean;
  marginOfSafety: number | null;
  undervaluedVsGrahamNumber: boolean;
  defensive: { checks: Record<string, boolean>; passed: number; total: number; score: number };
}

export function grahamNumber(eps: number, bvps: number): number | null {
  if (eps <= 0 || bvps <= 0) return null;
  return Math.round(Math.sqrt(22.5 * eps * bvps) * 100) / 100;
}

export function grahamIntrinsicValue(eps: number, growthRate: number, aaaYield: number): number | null {
  if (eps <= 0 || aaaYield <= 0) return null;
  return Math.round((eps * (8.5 + 2 * growthRate) * 4.4) / aaaYield * 100) / 100;
}

export function ncavPerShare(currentAssets: number, totalLiabilities: number, shares: number): number | null {
  if (shares <= 0) return null;
  return Math.round(((currentAssets - totalLiabilities) / shares) * 100) / 100;
}

export function analyzeGraham(input: GrahamInput): GrahamOutput {
  const intrinsic = grahamIntrinsicValue(input.eps, input.growthRate, input.aaaBondYield);
  const gnum = grahamNumber(input.eps, input.bvps);
  const ncav = ncavPerShare(
    input.currentAssets ?? 0,
    input.totalLiabilities ?? 0,
    input.sharesOutstanding ?? 0,
  );
  const mos =
    intrinsic && input.price > 0 ? (intrinsic - input.price) / intrinsic : null;

  const checks = {
    adequateCurrentRatio: (input.currentRatio ?? 0) >= 2,
    earningsStability10y: (input.yearsPositiveEarnings ?? 0) >= 10,
    dividendRecord: !!input.paysDividend,
    moderatePe: (input.pe ?? 0) > 0 && (input.pe ?? 0) <= 15,
    moderatePb: (input.pb ?? 0) > 0 && (input.pb ?? 0) <= 1.5,
    pePbProduct:
      (input.pe ?? 0) > 0 && (input.pb ?? 0) > 0 && (input.pe ?? 0) * (input.pb ?? 0) <= 22.5,
  };
  const passed = Object.values(checks).filter(Boolean).length;

  return {
    grahamNumber: gnum,
    intrinsicValue: intrinsic,
    ncavPerShare: ncav,
    netNet: ncav != null && input.price < ncav,
    marginOfSafety: mos != null ? Math.round(mos * 10000) / 10000 : null,
    undervaluedVsGrahamNumber: gnum != null && input.price < gnum,
    defensive: { checks, passed, total: Object.keys(checks).length, score: passed / Object.keys(checks).length },
  };
}
