// ─── Stealth Address Types ────────────────────────────────────────────────────

export interface KeyPair {
  privateKey: string; // 32-byte hex
  publicKey: string; // 33-byte compressed hex
}

export interface StealthAddress {
  publicViewKey: string; // A = a·G  (33-byte hex)
  publicSpendKey: string; // B = b·G  (33-byte hex)
}

export interface StealthKeys {
  viewKey: KeyPair;
  spendKey: KeyPair;
  stealthAddress: StealthAddress;
}

export interface EphemeralKey {
  privateKey: string; // r (32-byte hex)
  publicKey: string; // R = r·G (33-byte hex)
}

export interface DerivedOneTimeAddress {
  oneTimeAddress: string; // P = S·G + B (33-byte compressed hex)
  ephemeralPublicKey: string; // R (33-byte compressed hex) — must be embedded in tx
  sharedSecret: string; // S = H(r·A) (32-byte hex) — for deriving spending key
}

export interface ScanResult {
  match: boolean;
  oneTimeAddress?: string; // P' if match
  sharedSecret?: string; // S' if match
}

// ─── Wallet Types ─────────────────────────────────────────────────────────────

export interface WalletSummary {
  id: string;
  label: string;
  bitgoWalletId: string;
  network: 'tbtc' | 'btc';
  stealthAddress: StealthAddress;
  createdAt: string;
}

export interface WalletBalance {
  walletId: string;
  confirmed: number; // satoshis
  unconfirmed: number; // satoshis
  spendable: number; // satoshis
}

// ─── Transaction Types ────────────────────────────────────────────────────────

export type TxStatus = 'pending' | 'confirmed' | 'failed';

export interface SendPaymentRequest {
  senderWalletId: string;
  receiverStealthAddress: StealthAddress;
  amountSats: number;
  note?: string;
}

export interface SendPaymentResponse {
  txHash: string;
  oneTimeAddress: string;
  ephemeralPublicKey: string;
  amountSats: number;
  status: TxStatus;
}

export interface Transaction {
  id: string;
  walletId: string;
  txHash: string;
  direction: 'send' | 'receive';
  amountSats: number;
  ephemeralPublicKey?: string;
  oneTimeAddress?: string;
  status: TxStatus;
  note?: string;
  createdAt: string;
  confirmedAt?: string;
}

// ─── Detected Payment ─────────────────────────────────────────────────────────

export interface DetectedPayment {
  id: string;
  walletId: string;
  txHash: string;
  oneTimeAddress: string;
  amountSats: number;
  ephemeralPublicKey: string;
  spentAt?: string;
  createdAt: string;
}

// ─── Scanner Types ────────────────────────────────────────────────────────────

export interface ScanRequest {
  walletId: string;
  fromBlock?: number;
  toBlock?: number;
}

export interface ScanResponse {
  walletId: string;
  scannedTxCount: number;
  detectedPayments: DetectedPayment[];
  lastScannedBlock: number;
}

// ─── API Envelope ─────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  meta?: {
    timestamp: string;
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
}
