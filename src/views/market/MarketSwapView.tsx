import { FC, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ChevronDown, ArrowDown } from 'lucide-react';

import { C } from '../../utils/theme';
import { getJupiterQuote, getJupiterTokens, JupiterQuoteResponse, JupiterToken, TOKENS } from '../../utils/solana/jupiter';
import { executeSwap } from '../../utils/solana/swap';
import { notify } from '../../utils/notifications';
import { handleError } from '../../utils/errorHandler';
import { ERROR_MESSAGES } from '../../utils/errorConstants';

interface MarketSwapViewProps {
  isOpen: boolean;
  onClose: () => void;
  solBalance: number;
}

export const MarketSwapView: FC<MarketSwapViewProps> = ({ isOpen, onClose, solBalance }) => {
  const [tokens, setTokens] = useState<JupiterToken[]>([]);
  const [payMint, setPayMint] = useState<string>(TOKENS.SOL.mint);
  const [recMint, setRecMint] = useState<string>(TOKENS.USDC.mint);

  const [amount, setAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(50); // 50 bps = 0.5%
  const [quoteResponse, setQuoteResponse] = useState<JupiterQuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  useEffect(() => {
    getJupiterTokens().then(setTokens);
  }, []);

  // ── Reset form whenever modal opens ──────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setQuoteResponse(null);
      setQuoteError(null);
    }
  }, [isOpen]);

  // ── Close on Escape key ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const payTokenInfo = tokens.find(t => t.address === payMint) || { symbol: 'SOL', decimals: 9 };
  const recTokenInfo = tokens.find(t => t.address === recMint) || { symbol: 'USDC', decimals: 6 };

  const handleFlip = () => {
    setPayMint(recMint);
    setRecMint(payMint);
  };

  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setQuoteResponse(null);
      setQuoteError(null);
      return;
    }

    setLoadingQuote(true);
    setQuoteError(null);
    setQuoteResponse(null);

    // Debounce: Only query Jupiter when the user stops typing for 500ms
    const timeoutId = setTimeout(async () => {
      try {
        const quote = await getJupiterQuote(payMint, recMint, numAmount, slippage, payTokenInfo.decimals);
        if (!quote) {
          setQuoteError(ERROR_MESSAGES.SLIPPAGE_TOO_LOW);
        } else {
          setQuoteResponse(quote);
        }
      } catch (err) {
        const walletError = handleError(err, 'getJupiterQuote');
        setQuoteError(walletError.message);
      } finally {
        setLoadingQuote(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [amount, payMint, recMint, slippage, payTokenInfo.decimals]);

  let receiveAmountDisplay = '';
  if (loadingQuote) {
    receiveAmountDisplay = '...';
  } else if (quoteResponse) {
    const outNum = Number(quoteResponse.outAmount) / Math.pow(10, recTokenInfo.decimals);
    receiveAmountDisplay = outNum.toFixed(6);
  }

  const priceImpact = quoteResponse ? Number(quoteResponse.priceImpactPct) * 100 : 0;

  const handleSwap = async () => {
    if (!publicKey) {
      notify({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }
    if (!quoteResponse) {
      notify({ type: 'error', message: 'Waiting for quote...' });
      return;
    }

    const numAmount = parseFloat(amount);
    if (payMint === TOKENS.SOL.mint && numAmount > solBalance) {
      notify({ type: 'error', message: ERROR_MESSAGES.INSUFFICIENT_FUNDS });
      return;
    }

    setIsSwapping(true);
    try {
      const signature = await executeSwap({
        connection,
        walletPublicKey: publicKey,
        sendTransaction,
        quoteResponse
      });
      notify({ type: 'success', message: 'Swap successful!', txid: signature });
      setAmount('');
      setQuoteResponse(null);
    } catch (err: any) {
      notify({ type: 'error', message: err.message || 'Swap failed' });
    } finally {
      setIsSwapping(false);
    }
  };

  if (!isOpen) return null;

  return (
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
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full max-w-md p-6 rounded-[28px] animate-in fade-in duration-300 relative"
        style={{
          backgroundColor: C.surfaceSolid || C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold tracking-tight">Swap Tokens</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background:   'none',
              border:       'none',
              color:        '#7a8fa6',
              cursor:       'pointer',
              fontSize:     22,
              lineHeight:   1,
              padding:      4,
              borderRadius: 6,
              transition:   'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#7a8fa6')}
          >
            ✕
          </button>
        </div>

        <div
          className="rounded-[28px] p-1.5 relative border mb-6"
          style={{ backgroundColor: C.surface, borderColor: C.border }}
        >
          {/* You Pay */}
          <div className="bg-black/20 rounded-[24px] p-5 pb-9">
            <label className="text-[#7a8fa6] text-[13px] font-medium block mb-3">You Pay</label>
            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-4xl font-bold w-full p-0"
              />
              <div className="flex bg-[#181c27] border rounded-full px-3 py-2 shrink-0 items-center gap-2" style={{ borderColor: C.border }}>
                <select
                  value={payMint}
                  onChange={(e) => setPayMint(e.target.value)}
                  className="bg-transparent text-white font-bold text-[15px] outline-none cursor-pointer border-none appearance-none pr-2"
                >
                  {tokens.length === 0 ? (
                    <option value={payMint}>{payTokenInfo.symbol}</option>
                  ) : (
                    tokens.map(t => (
                      <option key={t.address} value={t.address} className="bg-[#181c27]">
                        {t.symbol}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={16} className="text-[#7a8fa6]" />
              </div>
            </div>
            <p className="text-[#7a8fa6] text-[13px] mt-3 font-medium">
              Balance: {payMint === TOKENS.SOL.mint ? solBalance.toFixed(4) : '0.00'} {payTokenInfo.symbol}
            </p>
          </div>

          {/* Swap Flip Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={handleFlip}
              className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: C.surfaceSolid, border: `4px solid ${C.bg}` }}
            >
              <ArrowDown size={20} className="text-[#dea001]" />
            </button>
          </div>

          {/* You Receive */}
          <div className="bg-black/20 rounded-[24px] p-5 pt-9 mt-1.5">
            <label className="text-[#7a8fa6] text-[13px] font-medium block mb-3">You Receive</label>
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="0.00"
                value={receiveAmountDisplay}
                readOnly
                className="bg-transparent border-none outline-none text-white text-4xl font-bold w-full p-0 placeholder:text-[#7a8fa6]/30"
              />
              <div className="flex bg-[#181c27] border rounded-full px-3 py-2 shrink-0 items-center gap-2" style={{ borderColor: C.border }}>
                <select
                  value={recMint}
                  onChange={(e) => setRecMint(e.target.value)}
                  className="bg-transparent text-white font-bold text-[15px] outline-none cursor-pointer border-none appearance-none pr-2"
                >
                  {tokens.length === 0 ? (
                    <option value={recMint}>{recTokenInfo.symbol}</option>
                  ) : (
                    tokens.map(t => (
                      <option key={t.address} value={t.address} className="bg-[#181c27]">
                        {t.symbol}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={16} className="text-[#7a8fa6]" />
              </div>
            </div>
            {quoteError && (
              <p className="text-[#ff4a4a] text-[13px] mt-3 font-medium">
                {quoteError}
              </p>
            )}
            {!quoteError && (
              <p className="text-[#7a8fa6] text-[13px] mt-3 font-medium">
                Balance: {recMint === TOKENS.SOL.mint ? solBalance.toFixed(4) : '0.00'} {recTokenInfo.symbol}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-[#7a8fa6] text-[14px] font-medium">Slippage Tolerance</span>
            <div className="flex gap-2">
              {[10, 50, 100].map((bps) => (
                <button
                  key={bps}
                  onClick={() => setSlippage(bps)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-colors cursor-pointer ${
                    slippage === bps
                      ? 'bg-[#dea001]/10 text-[#dea001] border-[#dea001]/30'
                      : 'bg-transparent text-[#7a8fa6] border-transparent hover:bg-white/5'
                  }`}
                >
                  {bps / 100}%
                </button>
              ))}
            </div>
          </div>
          {quoteResponse && (
            <div className="flex justify-between items-center animate-in fade-in">
              <span className="text-[#7a8fa6] text-[14px] font-medium">Price Impact</span>
              <span
                className={`text-[14px] font-bold ${
                  priceImpact > 1 ? 'text-[#ff4a4a]' : 'text-[#4ade80]'
                }`}
              >
                {priceImpact < 0.01 ? '< 0.01%' : `~${priceImpact.toFixed(2)}%`}
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={handleSwap}
          disabled={isSwapping || !quoteResponse || !amount}
          className="w-full bg-[#dea001] text-[#10131c] rounded-2xl py-4 text-[16px] font-extrabold transition-all border-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:brightness-110"
        >
          {isSwapping ? 'Swapping...' : 'Execute Swap'}
        </button>
      </div>
    </div>
  );
};
