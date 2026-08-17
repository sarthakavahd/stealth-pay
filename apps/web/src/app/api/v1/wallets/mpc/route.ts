import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import {
  createWalletForUser,
  getUserWalletMetadata,
  getUserWalletSummaries,
} from '@/lib/wallets-mpc';

const createWalletSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(100),
  passphrase: z.string().min(8, 'Passphrase must be at least 8 characters'),
});

async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// GET /api/v1/wallets/mpc
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const [metadata, wallets] = await Promise.all([
      getUserWalletMetadata(auth.userId),
      getUserWalletSummaries(auth.userId),
    ]);

    return NextResponse.json({
      data: {
        metadata,
        wallets,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[GET /api/v1/wallets/mpc]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch MPC wallets.' } },
      { status: 500 }
    );
  }
}

// POST /api/v1/wallets/mpc
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = await readJsonBody(request);
  const parsed = createWalletSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid request body.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const created = await createWalletForUser({
      userId: auth.userId,
      label: parsed.data.label,
      passphrase: parsed.data.passphrase,
    });

    return NextResponse.json(
      {
        data: {
          wallet: created.summary,
          metadata: created.metadata,
          custodyNotice:
            "This wallet is created using BitGo's MPC (Multi-Party Computation) infrastructure. Private keys are split into cryptographic shares and never exist in a single place. Our platform does not store private keys and cannot move funds independently.",
        },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/wallets/mpc]', error);
    return NextResponse.json(
      { error: { code: 'WALLET_CREATION_FAILED', message: 'Failed to create MPC wallet.' } },
      { status: 500 }
    );
  }
}
