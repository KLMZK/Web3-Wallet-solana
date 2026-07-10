// src/views/receive/ReceiveModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Receive modal — displays a QR code encoding the wallet's public key and
// provides a one-click "Copy Address" button with visual feedback.
//
// Architecture mirrors SendModal / MarketSwapView:
//   - Fixed backdrop (z-100) with blur + click-to-close
//   - Escape key listener
//   - Early return when closed
//   - Uses shared theme tokens from utils/theme
// ─────────────────────────────────────────────────────────────────────────────

import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { C } from '../../utils/theme';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReceiveModalProps {
  /** Controls whether the modal is visible */
  isOpen: boolean;
  /** Called when the user closes the modal (X button or backdrop click) */
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ReceiveModal: FC<ReceiveModalProps> = ({ isOpen, onClose }) => {
  const { publicKey } = useWallet();
  const { copy } = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  // ── Reset copied state whenever modal opens ─────────────────────────────
  useEffect(() => {
    if (isOpen) setCopied(false);
  }, [isOpen]);

  // ── Close on Escape key ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── Don't render anything when closed ───────────────────────────────────
  if (!isOpen) return null;

  const address = publicKey?.toBase58() ?? '';

  const handleCopy = () => {
    if (!address) return;
    copy(address, 'Wallet address copied!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // ── Backdrop — clicking outside the card closes the modal ─────────────
    <div
      onClick={onClose}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          100,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter:  'blur(4px)',
        padding:         '0 16px',
      }}
    >
      {/* ── Modal card — stopPropagation prevents backdrop from firing ── */}
      <div
        onClick={e => e.stopPropagation()}
        className="animate-in fade-in duration-300"
        style={{
          backgroundColor: C.surfaceSolid,
          border:          `1px solid ${C.border}`,
          borderRadius:    20,
          padding:         28,
          width:           '100%',
          maxWidth:        420,
          display:         'flex',
          flexDirection:   'column',
          gap:             24,
          boxShadow:       '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ color: C.text, fontSize: 20, fontWeight: 800, margin: 0 }}>
            Receive
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background:   'none',
              border:       'none',
              color:        C.muted,
              cursor:       'pointer',
              fontSize:     22,
              lineHeight:   1,
              padding:      4,
              borderRadius: 6,
              transition:   'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = C.text)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        {!publicKey ? (
          /* Edge case: wallet disconnected */
          <div
            style={{
              padding:        '40px 16px',
              textAlign:      'center',
              color:          C.muted,
              fontSize:       14,
              fontWeight:     500,
            }}
          >
            Please connect your wallet to view your address.
          </div>
        ) : (
          <>
            {/* ── QR Code ── */}
            <div
              style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                padding:         24,
                borderRadius:    16,
                backgroundColor: C.surface,
                border:          `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  padding:         16,
                  borderRadius:    12,
                  backgroundColor: '#ffffff',
                  display:         'inline-flex',
                }}
              >
                <QRCodeSVG
                  value={address}
                  size={180}
                  level="H"
                  fgColor="#10131c"
                  bgColor="#ffffff"
                />
              </div>
            </div>

            {/* ── Full address display ── */}
            <div
              style={{
                padding:         '12px 16px',
                borderRadius:    12,
                backgroundColor: C.surface,
                border:          `1px solid ${C.border}`,
              }}
            >
              <p
                style={{
                  color:      C.muted,
                  fontSize:   12,
                  fontWeight: 600,
                  marginBottom: 6,
                  margin:     '0 0 6px 0',
                }}
              >
                Your Solana Address
              </p>
              <p
                style={{
                  color:      C.text,
                  fontSize:   13,
                  fontFamily: 'monospace',
                  wordBreak:  'break-all',
                  lineHeight: 1.6,
                  margin:     0,
                }}
              >
                {address}
              </p>
            </div>

            {/* ── Copy Address button ── */}
            <button
              onClick={handleCopy}
              style={{
                width:           '100%',
                padding:         '16px 0',
                backgroundColor: copied ? C.green : C.gold,
                color:           C.bg,
                border:          'none',
                borderRadius:    14,
                fontSize:        16,
                fontWeight:      800,
                cursor:          'pointer',
                transition:      'all 0.18s',
                letterSpacing:   '0.3px',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                gap:             8,
              }}
              onMouseEnter={e => { if (!copied) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Address
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
