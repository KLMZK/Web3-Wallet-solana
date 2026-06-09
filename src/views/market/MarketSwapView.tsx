import { FC, useState } from 'react';
import { ChevronDown, ArrowDown } from 'lucide-react';

const C = {
  bg: '#10131c',
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceSolid: '#181c27',
  gold: '#dea001',
  text: '#ffffff',
  muted: '#7a8fa6',
  border: 'rgba(222, 160, 1, 0.1)',
} as const;

interface MarketSwapViewProps {
  solBalance: number;
}

export const MarketSwapView: FC<MarketSwapViewProps> = ({ solBalance }) => {
  const [flipped, setFlipped] = useState(false);
  const payToken = flipped ? 'USDC' : 'SOL';
  const recToken = flipped ? 'SOL' : 'USDC';

  const payBalance = payToken === 'SOL' ? solBalance.toFixed(4) : '0.00';
  const recBalance = recToken === 'SOL' ? solBalance.toFixed(4) : '0.00';

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto py-4 animate-in fade-in duration-300">
      <h2 className="text-white text-2xl font-bold mb-6 px-1 tracking-tight">Swap</h2>

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
              className="bg-transparent border-none outline-none text-white text-4xl font-bold w-full p-0"
            />
            <button
              className="flex items-center gap-2 rounded-full px-3 py-2 border shrink-0 bg-[#181c27] hover:bg-white/5 transition-colors cursor-pointer"
              style={{ borderColor: C.border }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center border"
                style={{
                  backgroundColor: payToken === 'SOL' ? 'rgba(153, 69, 255, 0.1)' : 'rgba(39, 117, 202, 0.1)',
                  borderColor: payToken === 'SOL' ? 'rgba(153, 69, 255, 0.2)' : 'rgba(39, 117, 202, 0.2)',
                }}
              >
                <span
                  className="text-[9px] font-bold"
                  style={{ color: payToken === 'SOL' ? '#9945FF' : '#2775CA' }}
                >
                  {payToken}
                </span>
              </div>
              <span className="text-white text-[15px] font-bold">{payToken}</span>
              <ChevronDown size={16} className="text-[#7a8fa6]" />
            </button>
          </div>
          <p className="text-[#7a8fa6] text-[13px] mt-3 font-medium">
            Balance: {payBalance} {payToken}
          </p>
        </div>

        {/* Swap Flip Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => setFlipped(!flipped)}
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
              type="number"
              placeholder="0.00"
              readOnly
              className="bg-transparent border-none outline-none text-white text-4xl font-bold w-full p-0"
            />
            <button
              className="flex items-center gap-2 rounded-full px-3 py-2 border shrink-0 bg-[#181c27] hover:bg-white/5 transition-colors cursor-pointer"
              style={{ borderColor: C.border }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center border"
                style={{
                  backgroundColor: recToken === 'SOL' ? 'rgba(153, 69, 255, 0.1)' : 'rgba(39, 117, 202, 0.1)',
                  borderColor: recToken === 'SOL' ? 'rgba(153, 69, 255, 0.2)' : 'rgba(39, 117, 202, 0.2)',
                }}
              >
                <span
                  className="text-[9px] font-bold"
                  style={{ color: recToken === 'SOL' ? '#9945FF' : '#2775CA' }}
                >
                  {recToken}
                </span>
              </div>
              <span className="text-white text-[15px] font-bold">{recToken}</span>
              <ChevronDown size={16} className="text-[#7a8fa6]" />
            </button>
          </div>
          <p className="text-[#7a8fa6] text-[13px] mt-3 font-medium">
            Balance: {recBalance} {recToken}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center px-4 mb-8">
        <span className="text-[#7a8fa6] text-[14px] font-medium">Slippage Tolerance</span>
        <span className="text-white text-[14px] font-bold">0.5%</span>
      </div>

      <button className="w-full bg-[#dea001] text-[#10131c] rounded-2xl py-4 text-[16px] font-extrabold cursor-pointer hover:brightness-110 transition-all border-none">
        Review Swap
      </button>
    </div>
  );
};
