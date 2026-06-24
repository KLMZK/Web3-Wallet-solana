import { FC } from 'react';
import {
  ShoppingCart,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import SkeletonRow from '../../components/ui/SkeletonRow';
import { Tab } from '../../components/layout/Sidebar';
import { C } from '../../utils/theme';

// Token brand colors for known SPL token symbols
const TOKEN_COLORS: Record<string, string> = {
  SOL: '#9945FF',
  USDC: '#2775CA',
  RAY: '#5AC4BE',
  BONK: '#F7931A',
  JUP: '#19FB9B',
  PYTH: '#6C4ED9',
  JITO: '#16C784',
  WIF: '#E44E9E',
};

export interface SPLToken {
  mint: string;
  symbol: string;
  amount: number;
  color: string;
}

export function tokenColor(symbol: string): string {
  return TOKEN_COLORS[symbol] ?? '#7a8fa6';
}

interface HomeContentProps {
  balance: number;
  solPrice: number | null;
  splTokens: SPLToken[];
  loadingTokens: boolean;
  setActiveTab: (t: Tab) => void;
  onSendClick: () => void;
  onSwapClick: () => void;
  onReceiveClick: () => void;
}

export const HomeContent: FC<HomeContentProps> = ({
  balance,
  solPrice,
  splTokens,
  loadingTokens,
  onSendClick,
  onSwapClick,
  onReceiveClick,
}) => {
  const fiatValue = solPrice ? (balance * solPrice).toFixed(2) : '0.00';

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
      {/* ── Balance Card ── */}
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        {/* Live price indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: solPrice ? C.green : C.muted }}
          />
          <span
            className="text-[13px] font-bold tracking-wide"
            style={{ color: solPrice ? C.green : C.muted }}
          >
            {solPrice ? `LIVE • 1 SOL = $${solPrice.toFixed(2)}` : 'Fetching price...'}
          </span>
        </div>

        {/* SOL Balance */}
        <p className="text-white text-5xl font-extrabold tracking-tight">
          {balance.toFixed(4)}{' '}
          <span className="text-[22px] font-medium text-[#7a8fa6]">SOL</span>
        </p>
        <p className="text-[#7a8fa6] text-lg mt-2 font-medium">${fiatValue} USD</p>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-4 sm:flex gap-3 sm:gap-4 mt-8 sm:max-w-xl">
          {[
            {
              label: 'Buy',
              icon: <ShoppingCart size={20} className="text-[#dea001]" />,
              onClick: () => {},
            },
            {
              label: 'Swap',
              icon: <ArrowLeftRight size={20} className="text-[#dea001]" />,
              onClick: onSwapClick,
            },
            {
              label: 'Send',
              icon: <ArrowUpRight size={20} className="text-[#dea001]" />,
              onClick: onSendClick,
            },
            {
              label: 'Receive',
              icon: <ArrowDownLeft size={20} className="text-[#dea001]" />,
              onClick: onReceiveClick,
            },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border bg-transparent hover:bg-white/[0.03] transition-colors cursor-pointer"
              style={{ borderColor: C.border }}
            >
              {a.icon}
              <span className="text-white text-[13px] font-semibold">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Your Assets ── */}
      <div>
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-white text-lg font-bold tracking-wide">Your Assets</h2>
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
        >
          {/* SOL — always first */}
          <div
            className="flex items-center gap-4 px-4 py-4 border-b hover:bg-white/[0.02] transition-colors"
            style={{ borderColor: C.border }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: 'rgba(153, 69, 255, 0.1)',
                borderColor: 'rgba(153, 69, 255, 0.2)',
              }}
            >
              <span className="text-[#9945FF] text-[11px] font-bold">SOL</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-[15px] font-semibold">Solana</p>
              <p className="text-[#7a8fa6] text-[13px] mt-0.5">{balance.toFixed(4)} SOL</p>
            </div>
            <div className="text-right">
              <p className="text-white text-[15px] font-semibold">${fiatValue}</p>
            </div>
          </div>

          {/* Loading skeleton */}
          {loadingTokens && (
            <>
              <SkeletonRow />
              <SkeletonRow />
            </>
          )}

          {/* Real SPL Tokens */}
          {!loadingTokens &&
            splTokens.map((token, i) => (
              <div
                key={token.mint}
                className={`flex items-center gap-4 px-4 py-4 hover:bg-white/[0.02] transition-colors ${
                  i < splTokens.length - 1 ? 'border-b' : ''
                }`}
                style={{ borderColor: C.border }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${token.color}1a`,
                    borderColor: `${token.color}33`,
                  }}
                >
                  <span className="text-[11px] font-bold" style={{ color: token.color }}>
                    {token.symbol.slice(0, 3)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-[15px] font-semibold">{token.symbol}</p>
                  <p className="text-[#7a8fa6] text-[12px] mt-0.5 font-mono">
                    {token.mint.slice(0, 8)}...
                  </p>
                </div>
                <p className="text-white text-[15px] font-semibold">
                  {token.amount.toLocaleString()}
                </p>
              </div>
            ))}

          {/* Empty state */}
          {!loadingTokens && splTokens.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-[#7a8fa6] text-[14px]">No tokens found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};