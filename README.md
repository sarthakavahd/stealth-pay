# Stealth Address Payment System

Privacy-preserving payment system using stealth addresses on top of BitGo MPC wallets and Supabase.

Live app: https://stealth-address-payment-system-web-weld.vercel.app/

## What This Project Does

- Derives a unique, one-time destination address for each payment.
- Keeps receiver identity unlinkable on-chain.
- Uses real wallet infrastructure (BitGo MPC), not just a crypto prototype.
- Provides a full web app and API in Next.js App Router.

Core standards and primitives:

- ERC-5564 / ERC-6538 concepts
- secp256k1 elliptic-curve cryptography
- @scopelift/stealth-address-sdk

## Monorepo Layout

```text
apps/
  web/       Next.js app (UI + API routes)
  scanner/   Background scanner for announcements
packages/
  stealth-crypto/  Core stealth primitives
  bitgo-client/    BitGo SDK wrapper
  db/              Supabase client/types
  shared/          Shared types and helpers
docs/              Architecture and API docs
scripts/           Utility scripts
```

## Tech Stack

- Next.js 14, React 18, TypeScript, Tailwind
- Supabase (PostgreSQL + Auth)
- BitGo SDK
- Zustand, React Query, Zod
- pnpm workspaces + Turborepo
- Vitest + fast-check

## Prerequisites

- Node.js 20+
- pnpm 10+
- BitGo API token
- Supabase project

Install pnpm if needed:

```bash
npm install -g pnpm
```

## Quick Start

```bash
git clone <repo-url>
cd stealth-address-payment-system
pnpm install
cp .env.example .env
pnpm dev
```

Main local endpoints:

- App: http://localhost:3000
- API: http://localhost:3000/api/v1
- Stealth endpoints: http://localhost:3000/api/stealth

## Environment Variables

Create .env in the repository root.

Required:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_SECRET_KEY
- BITGO_ACCESS_TOKEN

Common optional:

- BITGO_ENV=test
- BITGO_ENTERPRISE_ID
- RPC_URL=https://eth.llamarpc.com
- STEALTH_CHAIN_ID=1
- ERC5564_ANNOUNCER_ADDRESS=0x55649E01B5Df198D18D95b5cc5051630cfD45564
- NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
- SCAN_INTERVAL_MS=30000
- SCAN_BLOCK_BATCH_SIZE=10

## Scripts

```bash
pnpm dev            # Run all apps in dev mode
pnpm dev:web        # Run web app only
pnpm dev:scanner    # Run scanner only
pnpm build          # Build all packages/apps
pnpm test           # Run tests
pnpm lint           # Type/lint checks
pnpm check-ports    # Check dev ports
pnpm kill-ports     # Kill dev port processes
```

## API Highlights

Main routes live under /api/v1:

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET/POST /api/v1/wallets
- POST /api/v1/transactions/send
- POST/GET /api/v1/scan

Stealth utility routes:

- POST /api/stealth/keygen
- POST /api/stealth/id
- POST /api/stealth/address

## Deployment Notes (Vercel)

- Build command: turbo run build
- Ensure all required env vars are set in Vercel.
- Node 20 LTS is recommended for consistent native dependency behavior.

## More Documentation

See detailed docs in:

- docs/architecture.md
- docs/api.md
- docs/payments-api.md
- docs/srs.md

## License

ISC
