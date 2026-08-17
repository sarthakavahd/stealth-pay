# Claude Context — Stealth Address Payment System

> This file is the primary context document for AI assistants (Claude, Copilot, etc.) working in this codebase. Read this before making any changes.

---

## What This Project Is

A **stealth address payment system** layered on top of **BitGo** institutional wallet infrastructure. It enables privacy-preserving Bitcoin payments where every payment to the same receiver produces a fresh, unlinkable on-chain address. The cryptography mirrors Monero's stealth address scheme but applied to Bitcoin/secp256k1.

**Hackathon project** — optimise for clarity and working code over production-grade polish, but keep the architecture sound.

---

## Key Concepts You Must Understand

### Stealth Address Math (secp256k1)
| Symbol | Meaning |
|---|---|
| `G` | secp256k1 generator point |
| `a`, `b` | receiver private view key, private spend key |
| `A = a·G` | receiver public view key |
| `B = b·G` | receiver public spend key |
| `r` | sender random ephemeral private key |
| `R = r·G` | ephemeral public key (included in tx) |
| `S = H(r·A) = H(a·R)` | ECDH shared secret (same for both parties) |
| `P = S·G + B` | one-time destination address |
| `x = S + b` | private key for P (receiver can compute) |

The core invariant: `a·R = a·r·G = r·a·G = r·A` — this is why sender and receiver arrive at the same shared secret without communicating.

### Critical Rules
1. **Never reuse `r`** — a fresh random ephemeral key is mandatory per payment.
2. **`S` must be hashed** — use `H(r·A)` not raw `r·A` to prevent attacks.
3. **`R` must be published** — embed it in transaction OP_RETURN or metadata so the receiver's scanner can find it.
4. **Private keys never leave the API/scanner** — the frontend only ever deals with public keys and addresses.

---

## Repository Layout (Monorepo)

```
apps/
  web/       → Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui
  api/       → Express REST API · TypeScript · Zod · JWT
  scanner/   → node-cron daemon · polls BitGo · runs stealth scan
packages/
  stealth-crypto/  → pure-TS cryptographic primitives (secp256k1 + SHA-256)
  bitgo-client/    → BitGo SDK wrapper
  db/              → Prisma schema + client singleton
  shared/          → shared types, constants, utils
```

### Package Names (for cross-package imports)
| Dir | `name` in package.json |
|---|---|
| `packages/stealth-crypto` | `@stealth/crypto` |
| `packages/bitgo-client` | `@stealth/bitgo-client` |
| `packages/db` | `@stealth/db` |
| `packages/shared` | `@stealth/shared` |
| `apps/api` | `@stealth/api` |
| `apps/web` | `@stealth/web` |
| `apps/scanner` | `@stealth/scanner` |

---

## Coding Conventions

### TypeScript
- **Strict mode everywhere** (`"strict": true` in all tsconfig.json)
- Prefer `type` over `interface` for plain data shapes; use `interface` only when extending
- Always type function return values explicitly
- No `any` — use `unknown` and narrow, or open a GitHub issue

### File Naming
- Components: `PascalCase.tsx`
- Utilities / services / hooks: `camelCase.ts`
- Route files: `camelCase.ts` (e.g. `wallets.ts`)
- Types barrel: `types.ts` or `index.ts` per directory

### API Layer (apps/api)
- Every route handler is `async` and wrapped in `try/catch` via the global error middleware
- Validate request with Zod **before** reaching the controller
- Controllers are thin — business logic lives in services
- Services import from `@stealth/stealth-crypto`, `@stealth/bitgo-client`, `@stealth/db`

### Frontend (apps/web)
- Use **React Query** (`@tanstack/react-query`) for all server state
- All API calls go through `src/lib/api.ts` (Axios instance with base URL + auth interceptor)
- shadcn/ui components live in `src/components/ui/` — do not modify them directly, extend via composition
- Global state (auth, wallet selection) in Zustand store at `src/store/`

### Cryptography (packages/stealth-crypto)
- Use `@noble/secp256k1` — audited, pure-TS, no native deps
- Use `@noble/hashes` for SHA-256
- All key and point representations are `Uint8Array` (compressed 33-byte points, 32-byte scalars)
- Export both hex-string and Uint8Array variants of every function

---

## What NOT to Change Without Discussion

1. **Cryptographic primitives** in `packages/stealth-crypto` — get a second review before altering key derivation math
2. **Prisma schema migrations** — run `pnpm db:migrate` after any schema change; never edit the generated client
3. **BitGo wallet IDs in `.env`** — these point to real (test) wallets; be careful with destructive ops
4. **`turbo.json` pipeline config** — changing cache/dependency settings can break CI

---

## Common Tasks & Where to Look

| Task | File(s) |
|---|---|
| Add a new API endpoint | `apps/api/src/routes/`, `apps/api/src/controllers/`, `apps/api/src/services/` |
| Add a new page | `apps/web/src/app/<route>/page.tsx` |
| Add a new shadcn component | Run `pnpm dlx shadcn@latest add <component>` inside `apps/web/` |
| Change DB schema | `packages/db/prisma/schema.prisma` → `pnpm db:migrate` |
| Change stealth math | `packages/stealth-crypto/src/` |
| Change BitGo config | `packages/bitgo-client/src/` + `.env` |
| Debug scanner | `apps/scanner/src/` + check logs at `scanner.log` |

---

## Environment Variables

Copy `.env.example` → `.env` at the repo root. Each app reads from the root `.env` (via `dotenv`).

```
BITGO_ENV=test
BITGO_ACCESS_TOKEN=<from BitGo dashboard>
BITGO_ENTERPRISE_ID=<from BitGo dashboard>
DATABASE_URL=file:./dev.db
API_PORT=4000
JWT_SECRET=<min 32 chars random>
SCAN_INTERVAL_MS=30000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## Running the Project

```bash
# Install all deps
pnpm install

# Generate Prisma client
pnpm db:generate

# Run DB migrations
pnpm db:migrate

# Start everything (web + api + scanner in parallel)
pnpm dev

# Or individually:
pnpm --filter @stealth/web dev
pnpm --filter @stealth/api dev
pnpm --filter @stealth/scanner dev
```

---

## Testing Approach (Hackathon Scope)

- `packages/stealth-crypto` — unit tests with Vitest (most critical, pure functions)
- `apps/api` — integration tests with Supertest against a test DB
- `apps/web` — no automated UI tests (time constraint); manually verified
- Use `scripts/` for manual BitGo exploratory testing

---

## Dependencies Quick Reference

| Package | Purpose |
|---|---|
| `@noble/secp256k1` | secp256k1 elliptic curve operations |
| `@noble/hashes` | SHA-256 hashing |
| `bitgo` | BitGo institutional wallet SDK |
| `prisma` | ORM / DB migrations |
| `express` | REST API framework |
| `zod` | Runtime schema validation |
| `jsonwebtoken` | JWT auth |
| `node-cron` | Scanner job scheduling |
| `next` | React framework (App Router) |
| `tailwindcss` | Utility-first CSS |
| `shadcn/ui` | Accessible component library |
| `@tanstack/react-query` | Server state management |
| `axios` | HTTP client |
| `turbo` | Monorepo build orchestration |
