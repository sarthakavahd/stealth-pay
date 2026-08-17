import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  createWalletForUserMock: vi.fn(),
  getUserWalletMetadataMock: vi.fn(),
  getUserWalletSummariesMock: vi.fn(),
  linkWalletForUserMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  requireAuth: mocks.requireAuthMock,
}));

vi.mock('@/lib/wallets-mpc', () => ({
  createWalletForUser: mocks.createWalletForUserMock,
  getUserWalletMetadata: mocks.getUserWalletMetadataMock,
  getUserWalletSummaries: mocks.getUserWalletSummariesMock,
  linkWalletForUser: mocks.linkWalletForUserMock,
}));

import { GET as getMpcWallets, POST as postMpcWallet } from '../wallets/mpc/route';
import { POST as postMpcWalletLink } from '../wallets/mpc/link/route';

function jsonPost(url: string, body: unknown): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer token' },
    body: JSON.stringify(body),
  });
}

describe('MPC wallet API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/v1/wallets/mpc returns UNAUTHORIZED when auth fails', async () => {
    mocks.requireAuthMock.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED' } }), { status: 401 }),
    });

    const res = await getMpcWallets(new Request('http://localhost/api/v1/wallets/mpc') as never);

    expect(res.status).toBe(401);
  });

  it('GET /api/v1/wallets/mpc returns metadata and summary', async () => {
    mocks.requireAuthMock.mockResolvedValueOnce({ ok: true, userId: 'u1', email: 'a@b.com' });
    mocks.getUserWalletMetadataMock.mockResolvedValueOnce([{ id: 'w1' }]);
    mocks.getUserWalletSummariesMock.mockResolvedValueOnce([{ walletId: 'bw1', balance: '42' }]);

    const res = await getMpcWallets(new Request('http://localhost/api/v1/wallets/mpc') as never);
    const body = (await res.json()) as { data: { metadata: Array<{ id: string }> } };

    expect(res.status).toBe(200);
    expect(body.data.metadata[0]?.id).toBe('w1');
  });

  it('POST /api/v1/wallets/mpc validates payload', async () => {
    mocks.requireAuthMock.mockResolvedValueOnce({ ok: true, userId: 'u1', email: 'a@b.com' });

    const res = await postMpcWallet(
      jsonPost('http://localhost/api/v1/wallets/mpc', { label: '', passphrase: '123' }) as never
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/wallets/mpc creates wallet', async () => {
    mocks.requireAuthMock.mockResolvedValueOnce({ ok: true, userId: 'u1', email: 'a@b.com' });
    mocks.createWalletForUserMock.mockResolvedValueOnce({
      summary: { walletId: 'bw1', multisigType: 'tss' },
      metadata: { id: 'w1' },
    });

    const res = await postMpcWallet(
      jsonPost('http://localhost/api/v1/wallets/mpc', {
        label: 'TBTC MPC Wallet',
        passphrase: 'password123',
      }) as never
    );
    const body = (await res.json()) as { data: { metadata: { id: string } } };

    expect(res.status).toBe(201);
    expect(body.data.metadata.id).toBe('w1');
  });

  it('POST /api/v1/wallets/mpc/link warns for non-MPC wallet', async () => {
    mocks.requireAuthMock.mockResolvedValueOnce({ ok: true, userId: 'u1', email: 'a@b.com' });
    mocks.linkWalletForUserMock.mockResolvedValueOnce({
      summary: {
        walletId: 'bw-legacy',
        isMpc: false,
        warning: 'not MPC',
      },
      metadata: { id: '' },
    });

    const res = await postMpcWalletLink(
      jsonPost('http://localhost/api/v1/wallets/mpc/link', { walletId: 'bw-legacy' }) as never
    );
    const body = (await res.json()) as { data: { mpcVerified: boolean } };

    expect(res.status).toBe(200);
    expect(body.data.mpcVerified).toBe(false);
  });
});
