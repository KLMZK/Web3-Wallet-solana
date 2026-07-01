import React, { FC, useState } from 'react';
import { C } from '../../utils/theme';
import { generateMnemonic, encryptMnemonic, deriveKeypairFromMnemonic } from '../../utils/cryptoUtils';
import { localWalletAdapter } from '../../wallet/LocalWalletAdapter';
import { notify } from '../../utils/notifications';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateWalletModal: FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  if (!isOpen) return null;

  const handleNextToSeed = () => {
    if (password.length < 6) {
      notify({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }
    const generated = generateMnemonic();
    setMnemonic(generated);
    setStep(2);
  };

  const handleComplete = () => {
    try {
      const encrypted = encryptMnemonic(mnemonic, password);
      localStorage.setItem('in_app_wallet', encrypted);
      
      const keypair = deriveKeypairFromMnemonic(mnemonic);
      localWalletAdapter.completeUnlock(keypair);
      
      notify({ type: 'success', message: 'Wallet created securely!' });
      onSuccess();
    } catch (e: any) {
      notify({ type: 'error', message: e.message || 'Failed to create wallet' });
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
          <h2 style={{ margin: 0, fontSize: 20, color: C.text }}>Create XpectreWallet</h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: C.muted, fontSize: 14 }}>
              Enter a password to encrypt your new wallet on this device.
            </p>
            <input
              type="password"
              placeholder="Strong Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                padding: '12px 16px', borderRadius: 8, backgroundColor: C.bg,
                border: `1px solid ${C.border}`, color: C.text, width: '100%'
              }}
            />
            <button
              onClick={handleNextToSeed}
              style={{
                padding: '12px', borderRadius: 8, backgroundColor: C.gold,
                color: C.bg, border: 'none', cursor: 'pointer', fontWeight: 600
              }}
            >
              Generate Seed Phrase
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: C.red, fontSize: 14, fontWeight: 'bold' }}>
              ⚠️ Write these 12 words down! Do not share them!
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
              backgroundColor: C.bg, padding: 16, borderRadius: 8
            }}>
              {mnemonic.split(' ').map((word, i) => (
                <div key={i} style={{ color: C.text, fontSize: 14 }}>
                  <span style={{ color: C.muted, marginRight: 8 }}>{i + 1}.</span>{word}
                </div>
              ))}
            </div>
            <button
              onClick={handleComplete}
              style={{
                padding: '12px', borderRadius: 8, backgroundColor: C.gold,
                color: C.bg, border: 'none', cursor: 'pointer', fontWeight: 600
              }}
            >
              I Saved It. Complete Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
