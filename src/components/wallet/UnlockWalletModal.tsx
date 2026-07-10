import React, { FC, useState } from 'react';
import { C } from '../../utils/theme';
import { decryptMnemonic, deriveKeypairFromMnemonic } from '../../utils/cryptoUtils';
import { localWalletAdapter } from '../../wallet/LocalWalletAdapter';
import { notify } from '../../utils/notifications';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UnlockWalletModal: FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleUnlock = () => {
    try {
      const stored = localStorage.getItem('in_app_wallet');
      if (!stored) throw new Error('No local wallet found');

      const mnemonic = decryptMnemonic(stored, password);
      const keypair = deriveKeypairFromMnemonic(mnemonic);
      
      localWalletAdapter.completeUnlock(keypair);
      
      notify({ type: 'success', message: 'Wallet unlocked!' });
      onSuccess();
    } catch (e: any) {
      notify({ type: 'error', message: e.message || 'Incorrect password or corrupted wallet' });
    }
  };

  const handleClose = () => {
    localWalletAdapter.cancelUnlock();
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: C.surfaceSolid, border: `1px solid ${C.border}`,
          borderRadius: 20, padding: 28, width: '100%', maxWidth: 420,
          display: 'flex', flexDirection: 'column', gap: 20
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20, color: C.text }}>Unlock XpectreWallet</h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: C.muted, fontSize: 14 }}>
            Enter your password to unlock the wallet stored on this device.
          </p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            style={{
              padding: '12px 16px', borderRadius: 8, backgroundColor: C.bg,
              border: `1px solid ${C.border}`, color: C.text, width: '100%'
            }}
          />
          <button
            onClick={handleUnlock}
            style={{
              padding: '12px', borderRadius: 8, backgroundColor: C.gold,
              color: C.bg, border: 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
};
