import { Buffer } from 'buffer';
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { JupiterQuoteResponse, getJupiterSwapTransaction } from './jupiter';
import { handleError } from '../errorHandler';

export interface SwapParams {
    connection: Connection;
    walletPublicKey: PublicKey;
    sendTransaction: (
        transaction: VersionedTransaction,
        connection: Connection
    ) => Promise<string>;
    quoteResponse: JupiterQuoteResponse;
}

/**
 * Orchestrates the execution of a Jupiter swap.
 * It fetches the transaction, deserializes it, and sends it via the wallet.
 */
export async function executeSwap({
    connection,
    walletPublicKey,
    sendTransaction,
    quoteResponse
}: SwapParams): Promise<string> {
    // 1. Request the transaction from Jupiter (in base64 format)
    const swapTransactionBase64 = await getJupiterSwapTransaction(
        quoteResponse,
        walletPublicKey.toBase58()
    );

    if (!swapTransactionBase64) {
        throw handleError(
            new Error('Failed to retrieve swap transaction from Jupiter API.'),
            'executeSwap — getJupiterSwapTransaction'
        );
    }

    // 2. Deserialize the base64 string into a VersionedTransaction object
    // Buffer is a Node.js concept used in Web3 to handle raw binary data.
    const swapTransactionBuf = Buffer.from(swapTransactionBase64, 'base64');
    let transaction: VersionedTransaction;
    try {
        transaction = VersionedTransaction.deserialize(new Uint8Array(swapTransactionBuf));
    } catch (err) {
        throw handleError(err, 'executeSwap — deserialization');
    }

    // 3. Send and confirm the transaction through the user's wallet
    try {
        // This triggers the Phantom popup requesting the user's signature
        const signature = await sendTransaction(transaction, connection);
        
        // Wait for the Solana network to confirm the transaction was processed
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        }, 'confirmed');

        return signature;
    } catch (err) {
        throw handleError(err, 'executeSwap — send & confirm');
    }
}
