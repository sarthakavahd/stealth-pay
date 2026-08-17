import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stealthClient } from '@/lib/stealthClient';
import { getSupabaseAdmin } from '@stealth/db';

// ERC5564Announcer contract address (override via env for non-mainnet).
const ERC5564_ADDRESS =
  (process.env.ERC5564_ANNOUNCER_ADDRESS as `0x${string}`) ??
  '0x55649E01B5Df198D18D95b5cc5051630cfD45564';

const scanSchema = z.object({
  walletId: z
    .string()
    .trim()
    .regex(/^(c[a-z0-9]{8,}|[0-9a-fA-F-]{36})$/, 'Invalid wallet id format'),
});

const scanQuerySchema = z.object({
  walletId: z
    .string()
    .trim()
    .regex(/^(c[a-z0-9]{8,}|[0-9a-fA-F-]{36})$/, 'Invalid wallet id format')
    .optional(),
});

type WalletKeysRow = {
  id: string;
  public_spend_key: string;
  encrypted_view_priv_key: string;
};

type DetectedPaymentRow = {
  id: string;
  wallet_id: string;
  tx_hash: string;
  one_time_address: string;
  ephemeral_public_key: string;
  amount_sats: number;
  created_at: Date | string;
};

async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// POST /api/v1/scan — trigger on-demand ERC-5564 announcement scan via SDK
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await readJsonBody(request);
  const parsed = scanSchema.safeParse(body);
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

  const admin = getSupabaseAdmin();

  const { data: walletRow } = await (admin as any)
    .from('wallets')
    .select('id, public_spend_key, encrypted_view_priv_key')
    .eq('id', parsed.data.walletId)
    .maybeSingle();

  const wallet = walletRow as WalletKeysRow | null;

  if (!wallet) {
    return NextResponse.json(
      { error: { code: 'WALLET_NOT_FOUND', message: 'Wallet not found.' } },
      { status: 404 }
    );
  }

  try {
    const detected: DetectedPaymentRow[] = [];

    // Use SDK to watch on-chain ERC-5564 announcements for this user.
    const unwatch = await stealthClient.watchAnnouncementsForUser({
      ERC5564Address: ERC5564_ADDRESS,
      args: {},
      spendingPublicKey: wallet.public_spend_key as `0x${string}`,
      viewingPrivateKey: wallet.encrypted_view_priv_key as `0x${string}`,
      handleLogsForUser: async (logs) => {
        for (const log of logs) {
          const ephemeralPublicKey = log.ephemeralPubKey as string | undefined;
          const stealthAddress = log.stealthAddress as string | undefined;
          const txHash = log.transactionHash ?? '';

          if (!ephemeralPublicKey || !stealthAddress || !txHash) continue;

          // Deduplicate by tx_hash.
          const { data: existing } = await (admin as any)
            .from('detected_payments')
            .select('id')
            .eq('tx_hash', txHash)
            .maybeSingle();

          if (!existing) {
            const { data: inserted } = await (admin as any)
              .from('detected_payments')
              .insert({
                wallet_id: wallet.id,
                tx_hash: txHash,
                one_time_address: stealthAddress,
                ephemeral_public_key: ephemeralPublicKey,
                amount_sats: 0,
              })
              .select(
                'id, wallet_id, tx_hash, one_time_address, ephemeral_public_key, amount_sats, created_at'
              )
              .single();

            if (inserted) detected.push(inserted as DetectedPaymentRow);
          }
        }
      },
      // Poll once then unwatch – suitable for on-demand endpoint.
      pollOptions: { pollingInterval: 0 },
    });

    // Stop watching after the first poll cycle.
    if (typeof unwatch === 'function') unwatch();

    return NextResponse.json({
      data: {
        walletId: wallet.id,
        detectedPayments: detected,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[POST /api/v1/scan]', err);
    return NextResponse.json(
      { error: { code: 'SCAN_FAILED', message: 'Scan failed.' } },
      { status: 500 }
    );
  }
}

// GET /api/v1/scan — list detected payments
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const parsedQuery = scanQuerySchema.safeParse({
    walletId: searchParams.get('walletId') ?? undefined,
  });
  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsedQuery.error.issues[0]?.message ?? 'Invalid query parameters.',
        },
      },
      { status: 400 }
    );
  }

  const walletId = parsedQuery.data.walletId;
  const admin = getSupabaseAdmin();

  try {
    let query = (admin as any)
      .from('detected_payments')
      .select(
        'id, wallet_id, tx_hash, one_time_address, ephemeral_public_key, amount_sats, created_at'
      )
      .order('created_at', { ascending: false });

    if (walletId) {
      query = query.eq('wallet_id', walletId);
    }

    const { data: payments, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: payments ?? [],
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[GET /api/v1/scan]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch detected payments.' } },
      { status: 500 }
    );
  }
}
