/**
 * General Exchange token economics — loaded from env / config, not hardcoded on-chain values.
 */

export type PaymentMethod = 'USDC' | 'SOL';

export const TOKEN_ECONOMICS = {
  /** Display name */
  tokenName: process.env.NEXT_PUBLIC_GE_TOKEN_NAME ?? 'General Exchange Token',
  tokenSymbol: process.env.NEXT_PUBLIC_GE_TOKEN_SYMBOL ?? 'GEX',
  /** USD per token for purchase estimates (configurable, not on-chain price oracle) */
  usdPerToken: Number(process.env.NEXT_PUBLIC_GE_USD_PER_TOKEN ?? '1.00'),
  /** Minimum purchase */
  minTokens: Number(process.env.NEXT_PUBLIC_GE_MIN_TOKENS ?? '10'),
  /** Supply metrics — update via env or future API */
  totalSupply: Number(process.env.NEXT_PUBLIC_GE_TOTAL_SUPPLY ?? '100000000'),
  circulatingSupply: Number(process.env.NEXT_PUBLIC_GE_CIRCULATING_SUPPLY ?? '12500000'),
  treasuryBalance: Number(process.env.NEXT_PUBLIC_GE_TREASURY_BALANCE ?? '87500000'),
  tokensBurned: Number(process.env.NEXT_PUBLIC_GE_TOKENS_BURNED ?? '250000'),
  /** Solana cluster */
  cluster: (process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? 'devnet') as 'devnet' | 'mainnet-beta' | 'testnet',
  /** RPC — no hardcoded addresses; set in env for production */
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
  /** Token mint — set when SPL mint is deployed */
  tokenMintAddress: process.env.NEXT_PUBLIC_GE_TOKEN_MINT ?? '',
  /** Treasury wallet for purchases */
  treasuryAddress: process.env.NEXT_PUBLIC_GE_TREASURY_ADDRESS ?? '',
  /** USDC mint for Solana payments */
  usdcMintAddress: process.env.NEXT_PUBLIC_USDC_MINT ?? '',
} as const;

export const TOKEN_UTILITY = [
  {
    id: 'research',
    title: 'Research Access',
    description: 'Use tokens to unlock premium market intelligence and research features.',
  },
  {
    id: 'storage',
    title: 'Storage Credits',
    description: 'Pay for Filecoin-based storage: strategy archives, historical datasets, and user-owned research assets.',
  },
  {
    id: 'marketplace',
    title: 'Marketplace Access',
    description: 'Future support for purchasing, licensing, and accessing marketplace content.',
  },
  {
    id: 'api',
    title: 'API Consumption',
    description: 'Future support for API usage and premium data requests.',
  },
] as const;

export const INFRA_CARDS = [
  {
    id: 'solana',
    title: 'Solana',
    items: ['Wallet connectivity', 'Token ownership', 'Transaction settlement', 'Marketplace permissions'],
  },
  {
    id: 'filecoin',
    title: 'Filecoin',
    items: ['Decentralized storage', 'Archived strategies', 'Historical market datasets', 'User-owned research assets'],
  },
  {
    id: 'circle',
    title: 'Circle',
    items: ['Stablecoin purchases', 'Payment settlement', 'Future fiat on-ramp support'],
  },
] as const;

export const COMPLIANCE_DISCLAIMER =
  'General Exchange tokens provide access to platform services and utility features. Tokens are not equity, ownership interests, investment contracts, or securities. Users should evaluate applicable laws and regulations before participating.';
