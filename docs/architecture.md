# Architecture — Stealth Address Payment System

## 1. Overview

The Stealth Address Payment System is a privacy-preserving payment layer built on top of BitGo wallets. It uses elliptic-curve Diffie-Hellman (ECDH) key derivation to generate one-time, unlinkable destination addresses for every payment so that blockchain observers cannot correlate multiple payments to the same receiver.

The system is structured as a **pnpm monorepo** with three deployable applications and four shared packages.

---

## 2. Monorepo Structure

```
stealth-address-payment-system/
├── apps/
│   ├── web/          # Next.js 14 frontend (TypeScript, Tailwind CSS, shadcn/ui)
│   ├── api/          # Express REST API (TypeScript)
│   └── scanner/      # Blockchain scanner / payment-detection daemon
├── packages/
│   ├── stealth-crypto/   # Pure-TS stealth address cryptographic primitives
│   ├── bitgo-client/     # BitGo SDK wrapper & wallet helpers
│   ├── db/               # Prisma ORM schema + generated client
│   └── shared/           # Shared TypeScript types, constants, utilities
├── docs/
├── scripts/
├── package.json          # Root workspace (pnpm)
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 3. System Context Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         End Users                                    │
│         (Sender Browser)            (Receiver Browser)               │
└───────────────┬──────────────────────────────┬───────────────────────┘
                │ HTTPS                        │ HTTPS
        ┌───────▼──────────────────────────────▼───────┐
        │              apps/web  (Next.js)              │
        │   Dashboard · Send · Receive · Scan           │
        └───────────────────────┬───────────────────────┘
                                │ REST/JSON
        ┌───────────────────────▼───────────────────────┐
        │              apps/api  (Express)               │
        │  /wallets  /stealth  /transactions  /scan      │
        └──────┬──────────────────────┬──────────────────┘
               │                      │
   ┌───────────▼──────┐   ┌───────────▼──────────────┐
   │  packages/db     │   │  packages/bitgo-client   │
   │  (Prisma/SQLite) │   │  (BitGo SDK wrapper)     │
   └──────────────────┘   └───────────┬──────────────┘
                                       │ BitGo API
                                ┌──────▼──────┐
                                │  BitGo Cloud │
                                └─────────────┘
               ↑
   ┌───────────┴────────────────────────────────────┐
   │           apps/scanner  (cron daemon)          │
   │  Polls bitcoin node / BitGo for new txns       │
   │  Runs stealth scan, writes detected payments   │
   └────────────────────────────────────────────────┘
               ↑
   ┌───────────┴────────────────────┐
   │  packages/stealth-crypto       │
   │  keygen · address · scan · spend│
   └────────────────────────────────┘
```

---

## 4. Application Layer Details

### 4.1 `apps/web` — Next.js Frontend

| Route | Purpose |
|---|---|
| `/` | Landing / marketing page |
| `/login` | Auth (wallet connect or API-key) |
| `/dashboard` | Wallet overview, balance, recent txns |
| `/receive` | Generate stealth address (QR + copy) |
| `/send` | Enter stealth address → derive one-time addr → broadcast |
| `/scan` | Manual blockchain scan trigger + results |

**Tech:** Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui · React Query

### 4.2 `apps/api` — REST API

Base URL: `http://localhost:4000/api/v1`

| Group | Endpoints |
|---|---|
| `/wallets` | `GET /`, `POST /`, `GET /:id`, `GET /:id/balance` |
| `/stealth` | `POST /keygen`, `POST /address`, `POST /verify` |
| `/transactions` | `POST /send`, `GET /history` |
| `/scan` | `POST /scan`, `GET /scan/results` |

**Tech:** Express · TypeScript · Zod validation · JWT middleware

### 4.3 `apps/scanner` — Scanner Daemon

- Runs as a background process / cron job (node-cron)
- Polls BitGo or a Bitcoin node for new unprocessed transactions
- For each transaction: extracts ephemeral key `R`, runs ECDH scan, writes detected payments to the DB
- Scalable: can run multiple instances offset by block-range

---

## 5. Package Layer Details

### 5.1 `packages/stealth-crypto`

Core cryptographic primitives (no BitGo dependency, pure secp256k1 + SHA-256).

```
src/
├── keygen.ts    # generateViewKeyPair(), generateSpendKeyPair()
├── address.ts   # deriveOneTimeAddress(R, A, B) → P
├── scan.ts      # scanTransaction(R, a, B) → { match: boolean, P }
├── spend.ts     # derivePrivateKey(S, b) → x
└── types.ts     # KeyPair, StealthAddress, ScanResult, ...
```

### 5.2 `packages/bitgo-client`

Thin wrapper around the BitGo SDK.

```
src/
├── wallet.ts        # createWallet(), getWallet(), getBalance()
├── transaction.ts   # buildTx(), signTx(), broadcastTx()
└── types.ts         # BitGoWallet, BitGoTx, ...
```

### 5.3 `packages/db`

Prisma schema + generated client exported as a singleton.

**Models:**

| Model | Key Fields |
|---|---|
| `User` | id, email, createdAt |
| `Wallet` | id, userId, bitgoWalletId, publicViewKey, publicSpendKey |
| `Transaction` | id, walletId, txHash, amount, ephemeralKey, status |
| `DetectedPayment` | id, walletId, txHash, oneTimeAddress, amount, spentAt |

### 5.4 `packages/shared`

- Shared TypeScript types used by both `api` and `web`
- Constants (network names, derivation paths, error codes)
- Small utility functions (formatting, hex encoding)

---

## 6. Cryptographic Flow

### 6.1 Key Generation (Receiver)
```
a  = random 256-bit private view key
b  = random 256-bit private spend key
A  = a·G   (public view key)
B  = b·G   (public spend key)
StealthAddress = { A, B }   ← published publicly (e.g. QR code)
```

### 6.2 Payment (Sender)
```
r  = random ephemeral private key
R  = r·G                     ← included in tx metadata
S  = H(r·A)                  ← ECDH shared secret (hash of r·A)
P  = S·G + B                 ← one-time destination address
→ broadcast tx: { to: P, ephemeralKey: R }
```

### 6.3 Detection (Scanner / Receiver)
```
For each tx with ephemeral key R:
  S'  = H(a·R)          ← a·R = a·r·G = r·a·G = r·A  ✓
  P'  = S'·G + B
  if P' === P → payment belongs to receiver
```

### 6.4 Spending (Receiver)
```
x = S + b    ← private key for one-time address P
sign tx spending P with x
```

---

## 7. Data Flow Diagrams

### Send Payment Flow
```
Sender → GET /stealth/address (receiver's stealth addr)
       → POST /stealth/address { stealthAddress, amount }
           ↓
         API: calls stealth-crypto.address.deriveOneTimeAddress()
           ↓
         API: calls bitgo-client.transaction.buildTx({ to: P, R })
           ↓
         API: broadcasts via BitGo
           ↓
         DB: writes Transaction record
       ← returns { txHash }
```

### Scan & Detect Flow
```
Scanner daemon (cron)
  → fetches new txns from BitGo / node
  → for each txn: stealth-crypto.scan.scanTransaction(R, a, B)
  → if match: writes DetectedPayment to DB
  → webhooks / SSE notification to web frontend
```

---

## 8. API Design Conventions

- **Versioned:** All routes prefixed `/api/v1/`
- **Auth:** Bearer JWT in `Authorization` header
- **Validation:** Zod schemas on every request body
- **Errors:** Standard `{ error: { code, message } }` envelope
- **Responses:** Standard `{ data: ..., meta: ... }` envelope

---

## 9. Environment & Configuration

```
# BitGo
BITGO_ENV=test
BITGO_ACCESS_TOKEN=
BITGO_ENTERPRISE_ID=

# Database
DATABASE_URL=file:./dev.db

# API
API_PORT=4000
JWT_SECRET=

# Scanner
SCAN_INTERVAL_MS=30000
SCAN_BLOCK_BATCH_SIZE=10

# Web
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 10. Deployment Topology (Production)

```
┌─────────────┐   ┌─────────────┐   ┌──────────────────┐
│  apps/web   │   │  apps/api   │   │  apps/scanner    │
│  Vercel /   │   │  Railway /  │   │  Railway worker / │
│  Netlify    │   │  Render     │   │  cron job        │
└──────┬──────┘   └──────┬──────┘   └────────┬─────────┘
       │ HTTPS            │ Prisma             │ Prisma
       └──────────────────▼────────────────────▼─────────┐
                     ┌────┴────┐                          │
                     │ SQLite  │ (dev) / Postgres (prod)  │
                     └─────────┘                          │
                          ↑ BitGo API ─────────────────────┘
```
