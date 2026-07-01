import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import CryptoJS from 'crypto-js';

// ── Mnemonic Generation & Keypair Derivation ────────────────────────────────

/**
 * Generates a standard 12-word BIP39 mnemonic (seed phrase).
 */
export function generateMnemonic(): string {
  return bip39.generateMnemonic(128); // 128 bits = 12 words
}

/**
 * Verifies if a given string is a valid BIP39 mnemonic.
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * Derives a Solana Keypair from a BIP39 mnemonic.
 * Uses the standard Solana derivation path: m/44'/501'/0'/0'
 */
export function deriveKeypairFromMnemonic(mnemonic: string): Keypair {
  const seed = bip39.mnemonicToSeedSync(mnemonic, ''); // no password for seed derivation
  // Solana standard derivation path
  const derivationPath = `m/44'/501'/0'/0'`;
  const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;
  return Keypair.fromSeed(derivedSeed);
}

// ── AES Encryption for Local Storage ─────────────────────────────────────────

export interface EncryptedWalletData {
  encryptedMnemonic: string;
  salt: string;
  iv: string;
  // Note: we store the mnemonic, not just the private key, so the user can back it up later
}

/**
 * Encrypts a mnemonic string using AES-GCM (simulated via CryptoJS AES which uses CBC)
 * Returns a JSON string containing the cipher text, salt, and IV.
 */
export function encryptMnemonic(mnemonic: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  
  // Key derivation using PBKDF2
  const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
    keySize: 256 / 32,
    iterations: 1000
  });

  const encrypted = CryptoJS.AES.encrypt(mnemonic, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  const payload: EncryptedWalletData = {
    encryptedMnemonic: encrypted.toString(), // Base64
    salt: salt,
    iv: iv.toString() // Hex
  };

  return JSON.stringify(payload);
}

/**
 * Decrypts the stored payload using the password.
 * Throws an error if decryption fails (wrong password).
 */
export function decryptMnemonic(payloadJson: string, password: string): string {
  try {
    const payload: EncryptedWalletData = JSON.parse(payloadJson);
    
    // Recreate the key from the stored salt
    const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(payload.salt), {
      keySize: 256 / 32,
      iterations: 1000
    });

    const decrypted = CryptoJS.AES.decrypt(
      payload.encryptedMnemonic,
      key,
      {
        iv: CryptoJS.enc.Hex.parse(payload.iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      }
    );

    const mnemonic = decrypted.toString(CryptoJS.enc.Utf8);
    if (!mnemonic) {
      throw new Error('Invalid password');
    }
    return mnemonic;
  } catch (err) {
    throw new Error('Failed to decrypt wallet. Invalid password or corrupted data.');
  }
}
