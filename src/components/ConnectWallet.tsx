import { FC } from 'react';
import dynamic from 'next/dynamic';
import HexLogo from './ui/HexLogo';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const ConnectWallet: FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-screen w-full relative z-10">
      {/* Hexagon Logo */}
      <div className="mb-6 flex items-center justify-center w-16 h-16">
        <HexLogo size={64} />
      </div>

      {/* Title */}
      <h1 className="text-white text-3xl font-extrabold text-center mb-10 tracking-tight">
        Access your Crypto
      </h1>

      {/* Connect Button — opens wallet adapter modal */}
      <WalletMultiButtonDynamic
        className="!w-full !max-w-[360px] !bg-[#dea001] !text-[#10131c] !border-none !rounded-2xl !py-4 !text-lg !font-extrabold !cursor-pointer hover:!brightness-110 !transition-all !shadow-none !h-auto !justify-center"
      >
        Connect Wallet
      </WalletMultiButtonDynamic>
    </div>
  );
};

export default ConnectWallet;
