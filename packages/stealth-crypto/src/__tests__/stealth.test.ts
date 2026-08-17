import * as secp from '@noble/secp256k1';
import { describe, it, expect } from 'vitest';
import {
  generateStealthKeys,
  generateEphemeralKeyPair,
  generateKeyPair,
  addScalars,
  hashPoint,
  pointAdd,
  scalarMult,
  scalarBaseMultHex,
} from '../keygen.js';
import { deriveOneTimeAddress } from '../address.js';
import { scanTransaction } from '../scan.js';
import { deriveSpendingKey } from '../spend.js';
import { bytesToHex, hexToBytes } from '@stealth/shared';

describe('Stealth Address Crypto', () => {
  it('generates distinct key pairs each call', () => {
    const k1 = generateStealthKeys();
    const k2 = generateStealthKeys();
    expect(k1.viewKey.privateKey).not.toBe(k2.viewKey.privateKey);
    expect(k1.spendKey.privateKey).not.toBe(k2.spendKey.privateKey);
  });

  it('derives a one-time address from stealth address', () => {
    const keys = generateStealthKeys();
    const eph = generateEphemeralKeyPair();
    const derived = deriveOneTimeAddress(eph.privateKey, keys.stealthAddress);

    // output format: all three fields must be valid compressed-point / scalar hex
    expect(derived.ephemeralPublicKey).toMatch(/^(02|03)[0-9a-f]{64}$/);
    expect(derived.oneTimeAddress).toMatch(/^(02|03)[0-9a-f]{64}$/);
    expect(derived.sharedSecret).toMatch(/^[0-9a-f]{64}$/); // 32-byte scalar

    // ephemeral public key must equal r·G
    expect(derived.ephemeralPublicKey).toBe(eph.publicKey);

    // P must differ from both B and from any other run (randomness check)
    expect(derived.oneTimeAddress).not.toBe(keys.stealthAddress.publicSpendKey);

    // algebraic correctness: P = S·G + B  ↔  P + (−B) = S·G
    const SG = secp.ProjectivePoint.BASE.multiply(BigInt('0x' + derived.sharedSecret));
    const B = secp.ProjectivePoint.fromHex(keys.stealthAddress.publicSpendKey);
    const P = secp.ProjectivePoint.fromHex(derived.oneTimeAddress);
    expect(bytesToHex(P.add(B.negate()).toRawBytes(true))).toBe(bytesToHex(SG.toRawBytes(true)));
  });

  it('sender and receiver derive the same shared secret (ECDH symmetry)', () => {
    // sender computes S = H(r·A); receiver computes S' = H(a·R)
    // they must be equal for any subsequent spending-key derivation to work
    const keys = generateStealthKeys();
    const eph = generateEphemeralKeyPair();
    const derived = deriveOneTimeAddress(eph.privateKey, keys.stealthAddress);

    const result = scanTransaction(
      derived.ephemeralPublicKey,
      keys.viewKey.privateKey,
      keys.stealthAddress,
      derived.oneTimeAddress
    );

    expect(result.match).toBe(true);
    expect(result.sharedSecret).toBe(derived.sharedSecret);
  });

  it('scanner detects a sent payment (ECDH symmetry)', () => {
    const keys = generateStealthKeys();
    const eph = generateEphemeralKeyPair();
    const derived = deriveOneTimeAddress(eph.privateKey, keys.stealthAddress);

    const result = scanTransaction(
      derived.ephemeralPublicKey,
      keys.viewKey.privateKey,
      keys.stealthAddress,
      derived.oneTimeAddress
    );

    expect(result.match).toBe(true);
    expect(result.oneTimeAddress).toBe(derived.oneTimeAddress);
  });

  it('scanner rejects unrelated outputs', () => {
    const keys = generateStealthKeys();
    const otherKeys = generateStealthKeys();
    const eph = generateEphemeralKeyPair();
    const derived = deriveOneTimeAddress(eph.privateKey, keys.stealthAddress);

    const result = scanTransaction(
      derived.ephemeralPublicKey,
      otherKeys.viewKey.privateKey, // wrong view key → wrong shared secret
      otherKeys.stealthAddress,
      derived.oneTimeAddress
    );

    expect(result.match).toBe(false);
  });

  it('two payments to same receiver produce different one-time addresses', () => {
    const keys = generateStealthKeys();
    const e1 = generateEphemeralKeyPair();
    const e2 = generateEphemeralKeyPair();

    const d1 = deriveOneTimeAddress(e1.privateKey, keys.stealthAddress);
    const d2 = deriveOneTimeAddress(e2.privateKey, keys.stealthAddress);

    expect(d1.oneTimeAddress).not.toBe(d2.oneTimeAddress);
  });

  it('receiver can derive spending key from shared secret', () => {
    const keys = generateStealthKeys();
    const eph = generateEphemeralKeyPair();
    const derived = deriveOneTimeAddress(eph.privateKey, keys.stealthAddress);

    const result = scanTransaction(
      derived.ephemeralPublicKey,
      keys.viewKey.privateKey,
      keys.stealthAddress,
      derived.oneTimeAddress
    );

    expect(result.match).toBe(true);
    const spendingKey = deriveSpendingKey(result.sharedSecret!, keys.spendKey.privateKey);
    const spendingPublicKey = bytesToHex(secp.getPublicKey(spendingKey, true));

    expect(spendingKey).toBeTruthy();
    expect(spendingKey.length).toBe(64); // 32-byte hex
    expect(spendingPublicKey).toBe(derived.oneTimeAddress); // derived privkey must reproduce the one-time address
  });
});

// ─── keygen primitives ────────────────────────────────────────────────────────

describe('keygen primitives', () => {
  it('generateKeyPair: output formats are valid', () => {
    const { privateKey, publicKey } = generateKeyPair();
    expect(privateKey).toMatch(/^[0-9a-f]{64}$/);
    expect(publicKey).toMatch(/^(02|03)[0-9a-f]{64}$/);
  });

  it('generateKeyPair: publicKey equals privateKey·G', () => {
    const { privateKey, publicKey } = generateKeyPair();
    const expected = bytesToHex(secp.getPublicKey(hexToBytes(privateKey), true));
    expect(publicKey).toBe(expected);
  });

  it('scalarMult with base point equals scalarBaseMultHex (consistency check)', () => {
    const { privateKey } = generateKeyPair();
    const G = bytesToHex(secp.ProjectivePoint.BASE.toRawBytes(true));
    expect(scalarMult(privateKey, G)).toBe(scalarBaseMultHex(privateKey));
  });

  it('pointAdd is commutative', () => {
    const A = generateKeyPair().publicKey;
    const B = generateKeyPair().publicKey;
    expect(pointAdd(A, B)).toBe(pointAdd(B, A));
  });

  it('addScalars: known-value addition', () => {
    const one = '0000000000000000000000000000000000000000000000000000000000000001';
    const two = '0000000000000000000000000000000000000000000000000000000000000002';
    const three = '0000000000000000000000000000000000000000000000000000000000000003';
    expect(addScalars(one, two)).toBe(three);
  });

  it('addScalars: wraps around the curve order', () => {
    // secp256k1 order n; (n-1) + 2 must equal 1
    const nMinus1 = 'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140';
    const two = '0000000000000000000000000000000000000000000000000000000000000002';
    const one = '0000000000000000000000000000000000000000000000000000000000000001';
    expect(addScalars(nMinus1, two)).toBe(one);
  });

  it('hashPoint: deterministic and produces 32 bytes', () => {
    const point = secp.ProjectivePoint.BASE.toRawBytes(true);
    const h1 = hashPoint(point);
    const h2 = hashPoint(point);
    expect(h1).toHaveLength(32);
    expect(bytesToHex(h1)).toBe(bytesToHex(h2));
  });
});

// ─── scan.ts specific ────────────────────────────────────────────────────────

describe('scanTransaction', () => {
  it('rejects when publicSpendKey is wrong even if view key is correct', () => {
    const keys = generateStealthKeys();
    const otherKeys = generateStealthKeys();
    const eph = generateEphemeralKeyPair();
    const derived = deriveOneTimeAddress(eph.privateKey, keys.stealthAddress);

    // correct private view key (a) + wrong public spend key (B') → derived P' ≠ P
    const result = scanTransaction(
      derived.ephemeralPublicKey,
      keys.viewKey.privateKey,
      {
        publicViewKey: keys.stealthAddress.publicViewKey,
        publicSpendKey: otherKeys.stealthAddress.publicSpendKey,
      },
      derived.oneTimeAddress
    );

    expect(result.match).toBe(false);
  });

  it('returns no sharedSecret on non-match', () => {
    const keys = generateStealthKeys();
    const eph = generateEphemeralKeyPair();
    const derived = deriveOneTimeAddress(eph.privateKey, keys.stealthAddress);

    const result = scanTransaction(
      derived.ephemeralPublicKey,
      keys.viewKey.privateKey,
      keys.stealthAddress,
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' // not a real address
    );

    expect(result.match).toBe(false);
    expect(result.sharedSecret).toBeUndefined();
  });
});
