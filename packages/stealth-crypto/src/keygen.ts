import * as secp from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import type { KeyPair, StealthKeys } from '@stealth/shared';
import { bytesToHex, hexToBytes } from '@stealth/shared';

/**
 * Generate a random secp256k1 key pair.
 */
export function generateKeyPair(): KeyPair {
  const privateKey = secp.utils.randomPrivateKey();
  const publicKey = secp.getPublicKey(privateKey, true); // compressed
  return {
    privateKey: bytesToHex(privateKey),
    publicKey: bytesToHex(publicKey),
  };
}

/**
 * Generate the receiver's full stealth key set:
 * - view key pair  (a, A = a·G)
 * - spend key pair (b, B = b·G)
 */
export function generateStealthKeys(): StealthKeys {
  const viewKey = generateKeyPair();
  const spendKey = generateKeyPair();
  return {
    viewKey,
    spendKey,
    stealthAddress: {
      publicViewKey: viewKey.publicKey,
      publicSpendKey: spendKey.publicKey,
    },
  };
}

/**
 * Derive an ephemeral key pair for the sender:
 * r = random, R = r·G
 */
export function generateEphemeralKeyPair(): KeyPair {
  return generateKeyPair();
}

/**
 * Hash a secp256k1 point for use as shared secret material.
 * S = SHA-256(point_bytes)
 */
export function hashPoint(point: Uint8Array): Uint8Array {
  return sha256(point);
}

/**
 * Add two scalars modulo the curve order.
 * Used for: x = S + b
 */
export function addScalars(a: string, b: string): string {
  const n = secp.CURVE.n;
  const sum =
    (hexToBytes(a).reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n) +
      hexToBytes(b).reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n)) %
    n;
  return sum.toString(16).padStart(64, '0');
}

/**
 * Multiply a compressed public key by a scalar.
 * Returns compressed point hex.
 */
export function scalarMult(scalarHex: string, compressedPointHex: string): string {
  const point = secp.ProjectivePoint.fromHex(compressedPointHex);
  const scalar = BigInt('0x' + scalarHex);
  const result = point.multiply(scalar);
  return bytesToHex(result.toRawBytes(true));
}

/**
 * Add two compressed public key points.
 * Returns compressed point hex.
 */
export function pointAdd(pointAHex: string, pointBHex: string): string {
  const a = secp.ProjectivePoint.fromHex(pointAHex);
  const b = secp.ProjectivePoint.fromHex(pointBHex);
  return bytesToHex(a.add(b).toRawBytes(true));
}

/**
 * Derive the generator point multiplied by a scalar.
 * Returns S·G as compressed hex.
 */
export function scalarBaseMultHex(scalarHex: string): string {
  const result = secp.ProjectivePoint.BASE.multiply(BigInt('0x' + scalarHex));
  return bytesToHex(result.toRawBytes(true));
}
