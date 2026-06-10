import { FC } from 'react';
import { Copy, RefreshCcw, LogOut } from 'lucide-react';
import Toggle from '../../components/ui/Toggle';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import WalletButton from '../../components/ui/WalletButton';

import { C } from '../../utils/theme';

type NetworkUI = 'Mainnet' | 'Devnet' | 'Testnet';

interface SettingsViewProps {
  publicKeyStr: string;
  networkUI: NetworkUI;
  setNetworkUI: (n: NetworkUI) => void;
  autoConnect: boolean;
  setAutoConnect: (v: boolean) => void;
  onDisconnect: () => void;
}

export const SettingsView: FC<SettingsViewProps> = ({
  publicKeyStr,
  networkUI,
  setNetworkUI,
  autoConnect,
  setAutoConnect,
  onDisconnect,
}) => {
  const { copy } = useCopyToClipboard();

  const handleCopy = () => {
    copy(publicKeyStr, 'Address copied!');
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto animate-in fade-in duration-300">
      {/* Wallet Management */}
      <div>
        <h2 className="text-white text-lg font-bold mb-4 px-1 tracking-wide">Wallet Management</h2>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: C.surface, borderColor: C.border }}
        >
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-between p-4 bg-transparent border-none border-b border-[#dea001]/10 text-white cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <span className="flex items-center gap-3 text-[15px] font-semibold">
              <Copy size={18} className="text-[#7a8fa6]" /> Copy address
            </span>
          </button>

          <div className="border-b border-[#dea001]/10">
            <WalletButton
              className="!w-full !flex !items-center !justify-start !gap-3 !p-4 !bg-transparent !border-none !text-white !cursor-pointer hover:!bg-white/[0.02] !transition-colors !rounded-none !h-auto !text-[15px] !font-semibold !shadow-none"
            >
              <RefreshCcw size={18} className="text-[#7a8fa6]" />
              <span>Change wallet</span>
            </WalletButton>
          </div>

          <button
            onClick={onDisconnect}
            className="w-full flex items-center justify-between p-4 bg-transparent border-none text-[#ff4a4a] cursor-pointer hover:bg-[#ff4a4a]/5 transition-colors"
          >
            <span className="flex items-center gap-3 text-[15px] font-semibold">
              <LogOut size={18} /> Disconnect
            </span>
          </button>
        </div>
      </div>

      {/* Networks & Nodes */}
      <div>
        <h2 className="text-white text-lg font-bold mb-4 px-1 tracking-wide">Networks & Nodes</h2>
        <div
          className="rounded-2xl border p-4"
          style={{ backgroundColor: C.surface, borderColor: C.border }}
        >
          <div className="flex gap-2">
            {(['Mainnet', 'Devnet', 'Testnet'] as NetworkUI[]).map((net) => (
              <button
                key={net}
                onClick={() => setNetworkUI(net)}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] cursor-pointer border transition-colors"
                style={{
                  backgroundColor: networkUI === net ? C.gold : 'transparent',
                  color: networkUI === net ? '#10131c' : C.text,
                  borderColor: networkUI === net ? C.gold : C.border,
                }}
              >
                {net}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h2 className="text-white text-lg font-bold mb-4 px-1 tracking-wide">Preferences</h2>
        <div
          className="rounded-2xl border p-5 flex items-center justify-between"
          style={{ backgroundColor: C.surface, borderColor: C.border }}
        >
          <div>
            <span className="text-white text-[15px] font-semibold">Autoconnect</span>
            <p className="text-[#7a8fa6] text-[12px] mt-1">
              Automatically reconnect wallet on page reload
            </p>
          </div>
          <Toggle checked={autoConnect} onChange={() => setAutoConnect(!autoConnect)} />
        </div>
      </div>

      {/* Version Footer */}
      <p className="text-[#7a8fa6] text-[11px] text-center">
        Xpectre Labs v1.0 · Build 2026.06
      </p>
    </div>
  );
};
