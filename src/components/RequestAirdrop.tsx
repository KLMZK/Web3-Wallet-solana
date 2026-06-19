import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FC, useCallback, useState } from 'react';
import { notify } from '../utils/notifications';
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import { useNetworkConfiguration } from '../contexts/NetworkConfigurationProvider';
import { requestAirdrop } from '../utils/solana/airdrop';

export const RequestAirdrop: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const { getUserSOLBalance } = useUserSOLBalanceStore();
    const { networkConfiguration } = useNetworkConfiguration();
    const [loading, setLoading] = useState(false);

    const onClick = useCallback(async () => {
        if (!publicKey) {
            notify({ type: 'error', message: 'Wallet not connected!', description: 'Connect your wallet first.' });
            return;
        }

        setLoading(true);
        try {
            const { signature, method } = await requestAirdrop(publicKey, connection, networkConfiguration);
            const label = method === 'localnet' ? '🏠 (local)' : method === 'faucet' ? '(via faucet.solana.com)' : '';
            notify({ type: 'success', message: `Airdrop successful! ${label}`, txid: signature });
            getUserSOLBalance(publicKey, connection);
        } catch (err: any) {
            // err is already a WalletError from handleError inside requestAirdrop
            const is429 = err?.message?.includes('429') || err?.code === 429;
            if (is429) {
                notify({
                    type: 'error',
                    message: 'Airdrop rate limit reached (429)',
                    description: 'The devnet faucet is saturated. Visit faucet.solana.com to get test SOL.',
                });
            } else {
                notify({ type: 'error', message: err?.message ?? 'Airdrop failed!' });
            }
        } finally {
            setLoading(false);
        }
    }, [publicKey, connection, getUserSOLBalance, networkConfiguration]);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex flex-row justify-center">
                <div className="relative group items-center">
                    <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500
                    rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <button
                        className="px-8 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onClick}
                        disabled={loading}
                    >
                        <span>{loading ? 'Requesting...' : 'Airdrop 1 SOL'}</span>
                    </button>
                </div>
            </div>
            <p className="text-xs text-gray-400">
                Rate limit reached? Get SOL at{' '}
                <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer"
                    className="text-indigo-400 underline hover:text-indigo-300">
                    faucet.solana.com
                </a>
                {' '}or{' '}
                <a href="https://solfaucet.com" target="_blank" rel="noopener noreferrer"
                    className="text-indigo-400 underline hover:text-indigo-300">
                    solfaucet.com
                </a>
            </p>
        </div>
    );
};
