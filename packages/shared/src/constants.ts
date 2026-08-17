// ─── Network ──────────────────────────────────────────────────────────────────

export const NETWORKS = {
  TESTNET: 'tbtc',
  MAINNET: 'btc',
} as const;

export type Network = (typeof NETWORKS)[keyof typeof NETWORKS];

export const DEFAULT_NETWORK: Network = NETWORKS.TESTNET;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── API Error Codes ──────────────────────────────────────────────────────────

export const ERROR_CODES = {
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_STEALTH_ADDRESS: 'INVALID_STEALTH_ADDRESS',
  INVALID_WALLET_ID: 'INVALID_WALLET_ID',

  // Wallet
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  WALLET_CREATION_FAILED: 'WALLET_CREATION_FAILED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',

  // Transaction
  TX_BUILD_FAILED: 'TX_BUILD_FAILED',
  TX_BROADCAST_FAILED: 'TX_BROADCAST_FAILED',
  TX_NOT_FOUND: 'TX_NOT_FOUND',

  // Scanner
  SCAN_FAILED: 'SCAN_FAILED',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  PAYMENT_ALREADY_SPENT: 'PAYMENT_ALREADY_SPENT',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BITGO_ERROR: 'BITGO_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ─── Satoshi Conversion ───────────────────────────────────────────────────────

export const SATOSHIS_PER_BTC = 100_000_000;

// ─── Scanner ──────────────────────────────────────────────────────────────────

export const DEFAULT_SCAN_INTERVAL_MS = 30_000;
export const DEFAULT_SCAN_BLOCK_BATCH = 10;
