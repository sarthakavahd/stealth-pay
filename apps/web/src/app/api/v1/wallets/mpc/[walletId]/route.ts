import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { unlinkWalletForUser } from '@/lib/wallets-mpc';

// DELETE /api/v1/wallets/mpc/:walletId
export async function DELETE(
  request: NextRequest,
  { params }: { params: { walletId: string } }
): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { walletId } = params;
  if (!walletId) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'walletId is required.' } },
      { status: 400 }
    );
  }

  try {
    await unlinkWalletForUser({ userId: auth.userId, walletId });
    return NextResponse.json({ data: { unlinked: true } });
  } catch (error) {
    console.error('[DELETE /api/v1/wallets/mpc/:walletId]', error);
    return NextResponse.json(
      { error: { code: 'UNLINK_FAILED', message: 'Failed to unlink wallet.' } },
      { status: 500 }
    );
  }
}
