import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { linkWalletForUser } from '@/lib/wallets-mpc';

const linkWalletSchema = z.object({
  walletId: z.string().trim().min(1, 'walletId is required'),
});

async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// POST /api/v1/wallets/mpc/link
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = await readJsonBody(request);
  const parsed = linkWalletSchema.safeParse(body);

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
    const linked = await linkWalletForUser({
      userId: auth.userId,
      walletId: parsed.data.walletId,
    });

    if (!linked.summary.isMpc) {
      return NextResponse.json(
        {
          data: {
            wallet: linked.summary,
            mpcVerified: false,
            warning: linked.summary.warning,
          },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        data: {
          wallet: linked.summary,
          metadata: linked.metadata,
          mpcVerified: true,
          custodyNotice:
            "This wallet is created using BitGo's MPC (Multi-Party Computation) infrastructure. Private keys are split into cryptographic shares and never exist in a single place. Our platform does not store private keys and cannot move funds independently.",
        },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/v1/wallets/mpc/link]', error);
    return NextResponse.json(
      { error: { code: 'WALLET_LOOKUP_FAILED', message: 'Failed to lookup wallet.' } },
      { status: 502 }
    );
  }
}
