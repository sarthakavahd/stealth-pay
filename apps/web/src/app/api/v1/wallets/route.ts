import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateRandomStealthMetaAddress } from '@scopelift/stealth-address-sdk';
import { getBitGoCoin } from '@/lib/bitgo';
import { getSupabaseAdmin } from '@stealth/db';

type WalletRow = {
  id: string;
  label: string;
  bitgo_wallet_id: string;
  network: string;
  public_view_key: string;
  public_spend_key: string;
  created_at: Date | string;
};

type UserIdRow = {
  user_id: string;
};

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

function internalError(message = 'An internal error occurred.'): NextResponse {
  return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
}

// GET /api/v1/wallets
export async function GET(): Promise<NextResponse> {
  const admin = getSupabaseAdmin();

  try {
    const { data: wallets, error } = await (admin as any)
      .from('wallets')
      .select('id, label, bitgo_wallet_id, network, public_view_key, public_spend_key, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      data: wallets ?? [],
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[GET /api/v1/wallets]', error);
    return internalError('Failed to fetch wallets.');
  }
}

// POST /api/v1/wallets
export async function POST(request: NextRequest): Promise<NextResponse> {
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

  const { label, passphrase } = parsed.data;
  const network = process.env.BITGO_COIN ?? 'tbtc';
  const admin = getSupabaseAdmin();

  try {
    const { data: firstWallet } = await (admin as any)
      .from('wallets')
      .select('user_id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    const ownerUserId = (firstWallet as UserIdRow | null)?.user_id;
    if (!ownerUserId) {
      return NextResponse.json(
        {
          error: {
            code: 'WALLET_CREATION_FAILED',
            message: 'No simulated user context found. Seed at least one wallet/user record first.',
          },
        },
        { status: 500 }
      );
    }

    const { viewingPrivateKey, viewingPublicKey, spendingPrivateKey, spendingPublicKey } =
      generateRandomStealthMetaAddress();

    const coin = await getBitGoCoin(network);
    const bitgoWalletResult = await coin.wallets().generateWallet({
      label,
      passphrase,
      enterprise: process.env.BITGO_ENTERPRISE_ID,
      passcodeEncryptionCode: passphrase,
    });
    const bitgoWalletId = bitgoWalletResult.wallet.id();

    const { data: inserted, error: insertErr } = await (admin as any)
      .from('wallets')
      .insert({
        user_id: ownerUserId,
        label,
        bitgo_wallet_id: bitgoWalletId,
        network,
        encrypted_view_priv_key: viewingPrivateKey,
        encrypted_spend_priv_key: spendingPrivateKey,
        public_view_key: viewingPublicKey,
        public_spend_key: spendingPublicKey,
      })
      .select('id, label, bitgo_wallet_id, network, public_view_key, public_spend_key, created_at')
      .single();

    if (insertErr || !inserted) {
      return internalError('Failed to persist wallet.');
    }

    const wallet = inserted as WalletRow;

    return NextResponse.json(
      {
        data: {
          id: wallet.id,
          label: wallet.label,
          bitgoWalletId: wallet.bitgo_wallet_id,
          stealthAddress: {
            publicViewKey: wallet.public_view_key,
            publicSpendKey: wallet.public_spend_key,
          },
        },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/wallets]', error);
    return NextResponse.json(
      { error: { code: 'WALLET_CREATION_FAILED', message: 'Failed to create wallet.' } },
      { status: 500 }
    );
  }
}
