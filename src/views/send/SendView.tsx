import { FC, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const C = {
  surface: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(222, 160, 1, 0.1)',
  muted: '#7a8fa6',
} as const;

interface SendViewProps {
  solBalance: number;
}

export const SendView: FC<SendViewProps> = ({ solBalance }) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto py-4 animate-in fade-in duration-300">
      <h2 className="text-white text-2xl font-bold mb-6 px-1 tracking-tight">Send</h2>

      <div
        className="rounded-2xl p-6 md:p-8"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        {/* Asset Indicator */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-xl" style={{ backgroundColor: 'rgba(153, 69, 255, 0.06)', border: '1px solid rgba(153, 69, 255, 0.15)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ backgroundColor: 'rgba(153, 69, 255, 0.1)', borderColor: 'rgba(153, 69, 255, 0.2)' }}>
            <span className="text-[#9945FF] text-[11px] font-bold">SOL</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-[15px] font-semibold">Solana</p>
            <p className="text-[#7a8fa6] text-[13px] mt-0.5">Balance: {solBalance.toFixed(4)} SOL</p>
          </div>
        </div>

        {/* Destination Address */}
        <div className="mb-5">
          <label className="text-[#7a8fa6] text-[13px] block mb-2 font-medium">Destination Address</label>
          <input
            type="text"
            placeholder="Enter wallet address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl p-4 text-white text-[15px] outline-none placeholder:text-[#7a8fa6]/50"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
          />
        </div>

        {/* Amount */}
        <div className="mb-6">
          <label className="text-[#7a8fa6] text-[13px] block mb-2 font-medium">Amount</label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl p-4 pr-20 text-white text-[15px] outline-none placeholder:text-[#7a8fa6]/50"
              style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
            />
            <button
              onClick={() => setAmount(solBalance.toFixed(4))}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#dea001]/10 text-[#dea001] font-bold text-[12px] px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[#dea001]/20 transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Network Fee */}
        <div className="flex justify-between mb-8 px-1">
          <span className="text-[#7a8fa6] text-[13px]">Network fee estimate</span>
          <span className="text-[#7a8fa6] text-[13px]">~0.00005 SOL</span>
        </div>

        {/* Send Button */}
        <button className="w-full bg-[#dea001] text-[#10131c] rounded-2xl py-4 text-[16px] font-extrabold hover:brightness-110 transition-all border-none cursor-pointer flex items-center justify-center gap-2">
          <ArrowUpRight size={20} />
          Send Transaction
        </button>
      </div>
    </div>
  );
};
