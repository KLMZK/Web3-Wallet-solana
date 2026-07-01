import {
  BaseMessageSignerWalletAdapter,
  WalletName,
  WalletReadyState,
  WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import * as nacl from 'tweetnacl';

export const LocalWalletName = 'In-App Wallet' as WalletName<'In-App Wallet'>;

export class LocalWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = LocalWalletName;
  url = 'https://localhost';
  icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTJWMjdIM3YtNW0xOCAwSDNWMiIvPjxwYXRoIGQ9Ik0yMSAyMkgzIi8+PC9zdmc+'; // Placeholder icon
  
  readonly supportedTransactionVersions = new Set(['legacy', 0] as const);
  readyState = WalletReadyState.Installed;

  private _keypair: Keypair | null = null;
  private _publicKey: PublicKey | null = null;
  private _connecting: boolean = false;
  
  private _unlockResolver: (() => void) | null = null;
  private _unlockRejecter: ((reason?: any) => void) | null = null;

  constructor(keypair?: Keypair) {
    super();
    if (keypair) {
      this._keypair = keypair;
      this._publicKey = keypair.publicKey;
    }
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  completeUnlock(keypair: Keypair) {
    this._keypair = keypair;
    if (this._unlockResolver) {
      this._unlockResolver();
      this._unlockResolver = null;
      this._unlockRejecter = null;
    } else {
      this._publicKey = keypair.publicKey;
      this.emit('connect', this._publicKey);
    }
  }

  cancelUnlock() {
    if (this._unlockRejecter) {
      this._unlockRejecter(new WalletWindowClosedError('User cancelled wallet unlock'));
      this._unlockResolver = null;
      this._unlockRejecter = null;
    }
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      
      this._connecting = true;
      
      if (!this._keypair) {
        window.dispatchEvent(new Event('request-local-wallet-unlock'));
        
        await new Promise<void>((resolve, reject) => {
          this._unlockResolver = resolve;
          this._unlockRejecter = reject;
        });
      }

      this._publicKey = this._keypair!.publicKey;
      this.emit('connect', this._publicKey);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    this._keypair = null;
    this._publicKey = null;
    this.emit('disconnect');
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (!this._keypair) throw new Error('Wallet not connected');
    if ('version' in transaction) {
      transaction.sign([this._keypair]);
    } else {
      transaction.partialSign(this._keypair);
    }
    return transaction;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    return Promise.all(transactions.map((t) => this.signTransaction(t)));
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this._keypair) throw new Error('Wallet not connected');
    return nacl.sign.detached(message, this._keypair.secretKey);
  }
}

export const localWalletAdapter = new LocalWalletAdapter();
