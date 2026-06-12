import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Fetches the SOL balance for a given wallet address from the Solana network.
 * Converts the result from lamports (smallest unit) to SOL.
 *
 * @param publicKey  - The wallet's public key to query
 * @param connection - An active RPC connection to the Solana cluster
 * @returns The wallet's balance in SOL (e.g. 1.5), or 0 on error
 */
export async function getUserSOLBalance(
    publicKey: PublicKey,
    connection: Connection
): Promise<number> {
    try {
        const balanceLamports = await connection.getBalance(publicKey, 'confirmed');
        // LAMPORTS_PER_SOL = 1_000_000_000 (10^9)
        return balanceLamports / LAMPORTS_PER_SOL;
    } catch (e) {
        console.error('Error fetching SOL balance:', e);
        return 0;
    }
}
