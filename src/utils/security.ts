/**
 * Security utilities for the Xpectre Solana Wallet.
 * Focuses on Input Sanitization, Address Validation, Phishing Protection, and Transaction Limits.
 */

// ── 1. Input Sanitization (XSS & Injection Protection) ───────────────────────

/**
 * Sanitizes input string to prevent basic XSS or script injection attempts.
 * Removes HTML tags and potentially dangerous javascript: URIs.
 */
export function sanitizeInput(value: string): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip javascript: protocol
    .trim();
}

// ── 2. Address Validation (Base58 & Solana Format Checks) ───────────────────

/**
 * Validates if a string is in the proper Solana Base58 public key format.
 * Solana addresses are between 32 and 44 characters long and only contain Base58 characters.
 */
export function isValidBase58Address(address: string): boolean {
  const trimmed = address.trim();
  // Solana Base58 regex: Length between 32 and 44, only Base58 alphabet
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(trimmed);
}

// ── 3. Phishing Protection (Blacklisted Addresses) ──────────────────────────

/**
 * List of known mock phishing / malicious addresses for safety checks.
 */
export const PHISHING_BLACKLIST = [
  'ScamAddress1111111111111111111111111111111',
  'PhishXpectreScamAddress999999999999999999',
  '9ux8WkMtfH8n6gUXzCjMhX9q8N8kC2mQ1w2e3r4t5y6u',
];

/**
 * Checks if a destination address is in the phishing blacklist.
 */
export function isPhishingAddress(address: string): boolean {
  const trimmed = address.trim();
  return PHISHING_BLACKLIST.includes(trimmed);
}

// ── 4. Large Transaction Verification ────────────────────────────────────────

export const LARGE_TRANSACTION_THRESHOLDS = {
  SOL: 10,  // Warn for SOL transfers > 10
  SPL: 1000 // Warn for SPL transfers > 1000
};

/**
 * Checks if a transaction amount exceeds the large transaction safety limit.
 */
export function isLargeTransaction(amount: number, type: 'sol' | 'spl'): boolean {
  if (isNaN(amount) || amount <= 0) return false;
  if (type === 'sol') {
    return amount > LARGE_TRANSACTION_THRESHOLDS.SOL;
  }
  return amount > LARGE_TRANSACTION_THRESHOLDS.SPL;
}
