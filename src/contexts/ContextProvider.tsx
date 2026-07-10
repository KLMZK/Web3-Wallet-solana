import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    UnsafeBurnerWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { localWalletAdapter } from '../wallet/LocalWalletAdapter';
import { Cluster, clusterApiUrl } from '@solana/web3.js';
import { FC, ReactNode, useCallback, useMemo, useState, useEffect } from 'react';
import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';
import { notify } from "../utils/notifications";
import { NetworkConfigurationProvider, useNetworkConfiguration } from './NetworkConfigurationProvider';
import dynamic from "next/dynamic";
import { CreateWalletModal } from '../components/wallet/CreateWalletModal';
import { UnlockWalletModal } from '../components/wallet/UnlockWalletModal';

const ReactUIWalletModalProviderDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
  { ssr: false }
);

const LocalWalletWrapper: FC<{ children: ReactNode }> = ({ children }) => {
    const [showCreate, setShowCreate] = useState(false);
    const [showUnlock, setShowUnlock] = useState(false);

    useEffect(() => {
        const handleUnlockRequest = () => {
            if (localStorage.getItem('in_app_wallet')) {
                setShowUnlock(true);
            } else {
                setShowCreate(true);
            }
        };

        window.addEventListener('request-local-wallet-unlock', handleUnlockRequest);
        return () => window.removeEventListener('request-local-wallet-unlock', handleUnlockRequest);
    }, []);

    return (
        <>
            {children}
            <CreateWalletModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSuccess={() => setShowCreate(false)}
            />
            <UnlockWalletModal
                isOpen={showUnlock}
                onClose={() => setShowUnlock(false)}
                onSuccess={() => setShowUnlock(false)}
            />
        </>
    );
};

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { autoConnect } = useAutoConnect();
    const { networkConfiguration } = useNetworkConfiguration();
    const network = networkConfiguration as WalletAdapterNetwork;

    // ── RPC Endpoint Resolution ───────────────────────────────────────────────
    // Priority: Helius private RPC (from .env.local) → public clusterApiUrl fallback.
    // Helius endpoints provide dedicated rate limits, preventing 429 errors.
    const endpoint = useMemo(() => {
        if (networkConfiguration === 'localnet') {
            return 'http://127.0.0.1:8899';
        }
        if (networkConfiguration === 'mainnet-beta') {
            return process.env.NEXT_PUBLIC_MAINNET_RPC_URL || clusterApiUrl('mainnet-beta');
        }
        if (networkConfiguration === 'devnet') {
            return process.env.NEXT_PUBLIC_DEVNET_RPC_URL || clusterApiUrl('devnet');
        }
        // Testnet or any unknown network: fall back to clusterApiUrl
        return clusterApiUrl(network);
    }, [network, networkConfiguration]);

    if (process.env.NODE_ENV === 'development') {
        console.log(network);
    }

    const wallets = useMemo(
        () => [
            new UnsafeBurnerWalletAdapter(),
            localWalletAdapter,
        ],
        [network]
    );

    const onError = useCallback(
        (error: WalletError) => {
            if (error.name === 'WalletWindowClosedError') {
                return;
            }
            if (error.message?.includes('Wallet not unlocked')) {
                return;
            }
            notify({ type: 'error', message: error.message ? `${error.name}: ${error.message}` : error.name });
            console.error(error);
        },
        []
    );

    const isLocalWalletSelected = typeof window !== 'undefined' && localStorage.getItem('walletName')?.includes('XpectreWallet');
    const effectiveAutoConnect = isLocalWalletSelected ? false : autoConnect;

    return (
        // TODO: updates needed for updating and referencing endpoint: wallet adapter rework
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={effectiveAutoConnect}>
                <ReactUIWalletModalProviderDynamic>
                    <LocalWalletWrapper>
                        {children}
                    </LocalWalletWrapper>
                </ReactUIWalletModalProviderDynamic>
			</WalletProvider>
        </ConnectionProvider>
    );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <>
            <NetworkConfigurationProvider>
                <AutoConnectProvider>
                    <WalletContextProvider>{children}</WalletContextProvider>
                </AutoConnectProvider>
            </NetworkConfigurationProvider>
        </>
    );
};
