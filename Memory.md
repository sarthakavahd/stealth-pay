# Stealth Address Payment System - Interview Prep

## Quick Facts

- **What it does**: Privacy-preserving Bitcoin payments using stealth addresses + BitGo MPC
- **Model**: Non-custodial hybrid (BitGo for sender wallet, client-side spend keys)
- **Crypto**: ERC-5564/ERC-6538 concepts, secp256k1 ECDH, custom implementation
- **Stack**: Next.js + Supabase + BitGo SDK + @noble/secp256k1

## Architecture Overview

### Frontend (apps/web)

- React 18 + Next.js 14 App Router
- Two main pages: Send (sender) and Receive (receiver)
- Manages spend key locally (AES-GCM encrypted, PBKDF2 derived)
- Client-side sweep transaction building (bitcoinjs-lib PSBT)

### Backend API (apps/web/src/app/api)

- `/v1/stealth/*`: Stealth address derivation endpoints
- `/v1/transactions/send`: Bitcoin tx building via BitGo, records metadata
- `/v1/payments/scan`: ECDH-based payment detection for receiver
- `/v1/wallets/*`: BitGo wallet management

### Scanner (apps/scanner)

- Background service that runs scan cycles
- Detects payments across all users by running ECDH test on all recorded transactions
- Records matches in `detected_payments` table

### Packages

- **stealth-crypto**: Core primitives (keygen, address derivation, scanning, ECDH)
- **bitgo-client**: BitGo SDK wrapper (wallet fetch, transfers, TX broadcast)
- **db**: Supabase client + TypeScript types
- **shared**: Common types, utilities

## Core Crypto (packages/stealth-crypto)

### Key Generation (keygen.ts)

**Generates two secp256k1 key pairs:**

- View key: (a, A = a·G) — private/public view components
- Spend key: (b, B = b·G) — private/public spend components

Used by: `/api/v1/stealth/keygen-wallet` POST endpoint

### One-Time Address Derivation (address.ts)

**Sender side: creates a fresh address for each payment**

```
r  = random ephemeral key (fresh per transaction)
R  = r·G (ephemeral public key — embedded in tx)
S  = H(r·A) (ECDH shared secret)
P  = S·G + B (one-time Bitcoin address)
```

Returns: oneTimeAddress, ephemeralPublicKey, sharedSecret

Used by: `/api/v1/transactions/send` (via @scopelift/stealth-address-sdk)

**Receiver side: detects if a transaction belongs to them**

```
S' = H(a·R) (ECDH — same as sender's H(r·A))
P' = S'·G + B
if P' === outputAddress → match found!
```

Runs on: All transactions with ephemeral_public_key recorded
Used by: Scanner app + `/api/v1/payments/scan` endpoint

### Spending (spend.ts)

**Receiver derives private key for detected one-time address**

```
x = S + b (mod curve order)
```

This x is the private key for the one-time address P.

## End-to-End Flows

### 1. User Loads App

1. Next.js app boots
2. Frontend checks Supabase auth (Firebase-style email)
3. On login: Redirect to Supabase auth flow, callback to `/auth/callback`

### 2. Connect BitGo Wallet (Sender)

1. User creates MPC wallet via BitGo CLI or existing wallet
2. Frontend fetches wallet list: `GET /api/v1/wallets/mpc` → BitGo SDK
3. Displays wallet balance and metadata

### 3. Generate Stealth Keys (Receiver)

1. User clicks "Generate Stealth Keys" on Receive page
2. POST `/api/v1/stealth/keygen-wallet` with walletId
3. Backend: `generateStealthKeys()` creates view+spend keypairs
4. **Critical split**:
   - Server stores: `public_view_key`, `public_spend_key`, `encrypted_view_priv_key` (NOT encrypted, misleading var name!)
   - Client receives: `spendPrivKey` (one-time only disclosure)
5. Client: User enters passphrase, encrypts spend key locally with `encryptSpendKey()`
   - PBKDF2(passphrase, 200k iterations) → AES-256-GCM
   - Stores in localStorage as JSON: {salt, iv, ct}
6. Display stealth meta-address: `st:btctest:0x<66hex viewKey><66hex spendKey>`

### 4. Sender: Generate One-Time Address

1. Receiver shares stealth meta-address with sender (copy-paste, QR, etc.)
2. Sender navigates to Send page, pastes address
3. Frontend: `parseStealthMetaAddress()` extracts viewKey + spendKey
4. Sender selects wallet, enters amount, clicks "Prepare"
5. POST `/api/v1/payments/prepare`:
   - Extract publicViewKey, publicSpendKey from meta-address
   - Call `deriveOneTimeAddress()`:
     - Generate ephemeral key (r, R)
     - Compute ECDH: rA, S = H(rA), SG = S·G, P = SG + B
   - Returns: oneTimeAddress (Bitcoin address), ephemeralPublicKey, viewTag
   - BitGo converts this P to a Bitcoin address (P2WPKH on testnet)
6. Show confirmation with address, amount, fee estimate

### 5. Sender: Broadcast Transaction

1. Sender enters wallet passphrase, clicks "Send"
2. POST `/api/v1/transactions/send`:
   - Calls `BitGo.sendMany()` with:
     - Recipient: oneTimeAddress
     - Amount: amountSats
     - Comment: `stealth:ephemeral:${ephemeralPublicKey}` (embeds ephemeral for scanner)
   - BitGo signs transaction using MPC (2-of-3 multisig or TSS)
   - Returns txid
3. Backend records in `transactions` table:
   - tx_hash, one_time_address, ephemeral_public_key, direction='send'
4. **Optional**: If senderAddress provided, send ERC-5564 announcement to Ethereum announce contract
5. Frontend: Show success with txHash

### 6. Receiver: Scan for Payments

**Two options:**

**Option A: User-initiated scan** (`/api/v1/payments/scan`)

1. User clicks "Scan for Payments" on Receive page
2. POST with walletId
3. Backend:
   - Fetch all transactions with direction='send' AND ephemeral_public_key recorded
   - For each tx, run `scanTransaction()`:
     - aR = a·R (using encrypted_view_priv_key from DB)
     - S' = H(aR)
     - P' = S'·G + B
     - Compare P' to tx's one_time_address
   - On match: Add to response
4. Frontend displays matched payments with sharedSecret

**Option B: Background scanner** (apps/scanner)

1. Runs periodically (SCAN_INTERVAL_MS, default 30s)
2. Fetches all wallets from DB
3. For each wallet:
   - Fetch recent transfers from BitGo
   - Extract ephemeralPublicKey from transfer label/comment
   - Run scanTransaction() on each output
   - Write matches to `detected_payments` table
4. Client polls detected_payments or UI auto-refreshes

### 7. Receiver: Detect and Decrypt Sweep Key

1. Scanned payment shows: txHash, oneTimeAddress, sharedSecret
2. User clicks "Sweep to Wallet" button
3. Frontend prompts for passphrase
4. Call `decryptSpendKey(encryptedJson, passphrase)` from localStorage
5. Derive spending key: x = S + b (mod n)

### 8. Receiver: Build & Sign Sweep Transaction (Client-side)

1. Call `buildAndSignSweepTx(sharedSecret, spendPrivKey, oneTimeAddress, destinationAddress)`:
   - Derive x from S + b
   - Verify: publicKey(x) converts to oneTimeAddress (security check)
   - Fetch UTXOs at oneTimeAddress from Blockstream API
   - Build PSBT with all UTXOs as inputs
   - Calculate fee (vbyte-based)
   - Add single output to destinationAddress
   - Sign all inputs using private key x (bitcoinjs-lib PSBT)
   - Extract raw transaction hex
2. POST `/api/v1/payments/broadcast` with rawTxHex
3. Backend: Broadcast via Blockstream/mempool.space
4. Frontend: Show sweep txHash

### 9. Funds Arrive at Destination

1. Broadcast tx confirms on Bitcoin network
2. Balance updates in wallet (automatic via block explorer polling or manual refresh)

---

## Key Management Security

### Where Private Keys Live

| Key           | Storage                                | Why                      | Risk                                             |
| ------------- | -------------------------------------- | ------------------------ | ------------------------------------------------ |
| View key (a)  | Server (encrypted_view_priv_key)       | Needed for scanning      | **Not actually encrypted!** (TODO)               |
| Spend key (b) | **Client localStorage only** (AES-GCM) | Never stored server-side | Lost if browser cleared, weak if passphrase weak |
| Ephemeral (r) | Discarded after tx                     | Fresh per payment        | N/A                                              |

### Spend Key Protection

- **Generation**: POST `/api/v1/stealth/keygen-wallet` returns spendPrivKey once
- **Client**: `encryptSpendKey(spendPrivKey, userPassphrase)` → AES-256-GCM
  - Salt: 16 random bytes
  - IV: 12 random bytes
  - PBKDF2: 200k iterations (strong but slow)
- **Storage**: localStorage as JSON string: `{salt, iv, ct}`
- **Decryption**: On-demand when user wants to sweep
- **Passphrase**: Used 1x for keygen setup, then 1x per sweep attempt

**Threat Model**:

- ✅ Spend key never leaves browser (non-custodial)
- ✅ Passphrase needed to decrypt
- ❌ If attacker gets localStorage, can brute-force passphrase
- ❌ Malicious JavaScript can read plaintext after decryption
- ❌ View key on server is NOT encrypted (security issue)

### Non-Custodial vs Custodial

- **Sender side**: **Custodial** — BitGo holds the keys, user doesn't control them
- **Receiver side**: **Non-custodial** — Spend key only in browser, user controls spending
- **Overall**: **Hybrid** — Depends on role

---

## Stealth Address Format

### Meta-Address Format

```
st:<chain>:0x<66-hex viewKey><66-hex spendKey>

Example:
st:btctest:0x02a1b2c3...def (66 chars view + 66 chars spend = 132 hex)
```

### Why This Format?

- Follows ERC-5564 naming (stealth meta-address)
- **Not an on-chain address** — it's a key commitment
- Encodes both public keys in one shareable string
- Regex validated: `^st:[a-zA-Z0-9]+:0x[0-9a-fA-F]{132}$`
- Bitcoin-native (derived to P2WPKH, not Ethereum)

### Where Generated

- **Frontend** (`formatStealthMetaAddress()`)
- Takes publicViewKey + publicSpendKey from keygen response
- User can QR-encode or copy-paste to share

---

## Transaction Construction

### Sender's BitGo Flow

1. Derive one-time address P via ECDH (frontend or backend)
2. Call `BitGo.wallets().get(walletId).sendMany()`:
   ```javascript
   {
     recipients: [{ address: P, amount: String(amountSats) }],
     walletPassphrase,
     comment: `stealth:ephemeral:${ephemeralPublicKey}`,
     label: ephemeralPublicKey
   }
   ```
3. BitGo handles:
   - UTXO selection from wallet
   - Change address creation
   - MPC signing (2-of-3 multisig or TSS)
   - Broadcasting to Bitcoin network
4. Returns: txid

### MPC Details

- **Wallet Type**: TSS (Threshold Signature Scheme) or onchain multisig
- **Key Distribution**: 3 keys (user, backup, BitGo) — 2-of-3 to sign
- **User Key**: Generated and encrypted locally by user (during wallet setup, not stealth setup)
- **Approval**: Passphrase required to unlock user key for signing
- **Not needed for receiving**: Receiver never interacts with BitGo wallet

### Receiver's PSBT Flow (Client-side)

1. Have: spendPrivKey (decrypted), sharedSecret (from scan), oneTimeAddress
2. Derive: x = sharedSecret + spendPrivKey (mod n)
3. Build PSBT with bitcoinjs-lib:
   - Inputs: All UTXOs at oneTimeAddress
   - Outputs: Single output to destinationAddress
   - Witness script: P2WPKH derived from x
4. Sign: Custom signer using @noble/secp256k1
5. Finalize and extract raw tx
6. Broadcast via backend to Blockstream/mempool.space

### No MPC for Receiver

- Receiver doesn't use BitGo
- Just normal Bitcoin signing (single sig, no multisig)
- Could be enhanced to MPC but not currently

---

## Blockchain Scanning

### How Detection Works

**Two detection methods:**

**1. Server-Side Scanner (Background)**

- Runs `apps/scanner/src/scanner.ts` on a loop
- **Where it scans**: BitGo wallet transfer history (only transfers the wallet sent)
- **For each transfer**: Checks for ephemeral_public_key in label/comment
- **Runs ECDH**: `scanTransaction(ephemeralPublicKey, viewPrivKey, stealthAddress, outputAddress)`
- **Writes matches**: To `detected_payments` table
- **Advantage**: No user action needed
- **Disadvantage**: Doesn't detect payments from external senders (only app-recorded transactions)

**2. User-Initiated Scan**

- POST `/api/v1/payments/scan` with walletId
- **Scans**: All transactions in `transactions` table (app-wide, all users)
- **Sample**: Only tx with ephemeral_public_key (stealth txs)
- **Returns**: Matched payments with sharedSecret
- **Advantage**: On-demand, can be run multiple times

### Scanning Algorithm

**Input**: ephemeralPublicKey R
**Output**: Yes/No, and if yes: sharedSecret

```
a·R = scalar_mult(viewPrivKey, ephemeralPublicKey)
S = H(a·R)
P' = S·G + B
if P' == oneTimeAddress (on-chain address) → match!
```

### No Public Blockchain Scanning

- **NOT** scanning the public blockchain directly
- **Only** scanning app-recorded transactions
- Could be extended to full blockchain but would require:
  - Running full Bitcoin node or RPC
  - Scanning all transaction outputs
  - Much higher CPU/IO cost

---

## Custom vs Integrated

### Custom-Built (Your Code)

1. **Stealth crypto primitives** (`packages/stealth-crypto/`)
   - All ECDH, key derivation, scanning logic
   - Uses @noble/secp256k1 + @noble/hashes (not full SDK)
   - Bitcoin-focused (unlike @scopelift which is Ethereum-first)

2. **Key management** (`apps/web/src/lib/spend-key-storage.ts`)
   - WebCrypto-based encryption
   - PBKDF2 (200k iterations) + AES-256-GCM
   - Custom implementation (not Hardhat/Web3.js auth)

3. **Spend transaction building** (`apps/web/src/lib/client-sweep.ts`)
   - bitcoinjs-lib PSBT construction
   - @noble/secp256k1 signing
   - UTXO fetching from Blockstream
   - Custom fee estimation

4. **API endpoints** (`apps/web/src/app/api/v1/`)
   - All route handlers are custom
   - Stealth address derivation
   - Transaction recording
   - Payment scanning

5. **Scanner app** (`apps/scanner/`)
   - Background service loop
   - Wallet/transfer iteration
   - ECDH detection pipeline

6. **Stealth meta-address formatting** (`apps/web/src/lib/stealth-meta-address.ts`)
   - Custom parsing/formatting of st:chain:0x format

### Integrated (Libraries)

1. **@scopelift/stealth-address-sdk**
   - Used **only** for ERC-5564 announcements (Ethereum)
   - For `generateStealthAddress()` to create Ethereum-compatible announces
   - NOT used for Bitcoin stealth address logic

2. **BitGo SDK** (`packages/bitgo-client/`)
   - Wallet creation
   - Transfer history
   - Transaction broadcasting
   - MPC signing (black box)

3. **bitcoinjs-lib**
   - PSBT construction
   - P2WPKH payment script derivation
   - Transaction formatting

4. **@noble/secp256k1 + @noble/hashes**
   - Elliptic curve math
   - SHA-256, HMAC-SHA-256
   - Base library for crypto

5. **Supabase**
   - PostgreSQL database
   - User auth (email/password)
   - Table storage (wallets, transactions, detected_payments)

6. **Next.js + React**
   - Full-stack framework
   - UI rendering
   - API route handling

---

## Key Interview Points

### Architecture Strengths

- ✅ Truly non-custodial on receiver side (spend key never touches server)
- ✅ Real wallet infrastructure (BitGo MPC) for sender
- ✅ Clean separation of concerns (crypto, wallet, scanning, UI)
- ✅ ECDH-based detection (no false positives, receiver can independently verify)
- ✅ Bitcoin-native (not Ethereum shoehorned in)

### Weaknesses / TODOs

- ❌ View key not encrypted on server (security issue)
- ❌ Spend key in localStorage (vulnerable to XSS, weak passphrases)
- ❌ No full blockchain scanning (only app-recorded transactions)
- ❌ No privacy consideration for Ethereum announcements (reveals intent to chain)
- ❌ Server-side PBKDF2 is slow but not validated for security

### Data Flow Diagram

```
Sender                          Backend                    Receiver
─────────────────────────────────────────────────────────────────
Select wallet ──────────────────────────────────────────────────→
Paste stealth address ──────────────────────────────────────────→
Derive one-time P ←──────────── deriveOneTimeAddress() ───────── (from pubkeys)
Prepare TX ─────────────────────────────────────────────────────→
BitGo.sendMany(P) ─────────────────────────────────────────────→
Record TX + ephemeral ─────────── save to DB
Broadcast ─────────────────────→ Bitcoin network
                                                           ← Listen for payments
                                                           Fetch all TXs with ephemeral
                                                           Run ECDH scan
                                                           ← Match found!
                                                           Decrypt spend key (passphrase)
                                                           Build sweep PSBT
Send sweep TX ←────────── Broadcast ────────────────────── buildAndSignSweepTx()
                          Bitcoin network
                                                           ← Sweep confirms
```

---

## Notes for Interview Prep

**What to emphasize:**

1. ECDH is the core — enables deterministic one-time address without pre-communication
2. Non-custodial spend keys — receiver has full control
3. Server never sees spend key — security by design
4. Scanning is deterministic — receiver can independently verify any transaction
5. BitGo integration handles the hard part (MPC signing, key management for sender)

**What to be honest about:**

1. View key not encrypted is a known security gap
2. localStorage is weak threat model (XSS, weak passphrases)
3. Only detects app-recorded payments (not full blockchain scanning)
4. Ethereum announcements are optional (not privacy-preserving by design)

**Technical Q&A prep:**

- "How does receiver prove ownership?" → ECDH: a·R = r·A deterministically
- "What if passphrase is weak?" → Brute-force attack possible on AES-GCM in localStorage
- "What if view key is leaked?" → Sender privacy is compromised (who sent to you)
- "Can you double-spend?" → No, standard Bitcoin UTXOs once spent
- "Full blockchain scanning?" → Could be added but not currently implemented
