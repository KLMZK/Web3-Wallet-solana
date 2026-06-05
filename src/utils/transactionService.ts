import {
    Connection,
    PublicKey,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js';
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
} from '@solana/spl-token';

export interface TransferParams {
    connection: Connection;
    senderPublicKey: PublicKey;
    sendTransaction: (
        transaction: VersionedTransaction,
        connection: Connection
    ) => Promise<string>;
    type: 'sol' | 'spl';
    recipientAddress: string;
    amount: number;
    mintAddress?: string;
}

/**
 * Reusable service to perform SOL or SPL token transfers
 * compatible with the web interface (using Wallet Adapter).
 * 
 * @param params Transfer parameters
 * @returns The signature of the confirmed transaction
 */
export async function executeTransfer({
    connection,
    senderPublicKey,
    sendTransaction,
    type,
    recipientAddress,
    amount,
    mintAddress,
}: TransferParams): Promise<string> {
    // ── 1. INPUT VALIDATION ──────────────────────────────────────────
    let recipient: PublicKey;
    try {
        recipient = new PublicKey(recipientAddress);
    } catch (err) {
        throw new Error('Recipient address is not a valid Solana public key.');
    }

    if (amount <= 0) {
        throw new Error('Amount to send must be greater than zero.');
    }

    const instructions = [];

    // ── 2. INSTRUCTION CONSTRUCTION ─────────────────────────────────
    if (type === 'sol') {
        // Send native SOL
        const lamports = amount * 1_000_000_000; // 1 SOL = 10^9 Lamports
        instructions.push(
            SystemProgram.transfer({
                fromPubkey: senderPublicKey,
                toPubkey: recipient,
                lamports,
            })
        );
    } else {
        // Send SPL Token
        if (!mintAddress) {
            throw new Error('Mint address is required to send SPL tokens.');
        }

        let mint: PublicKey;
        try {
            mint = new PublicKey(mintAddress);
        } catch (err) {
            throw new Error('Mint address is not a valid Solana public key.');
        }

        // Derive Associated Token Account (ATA) addresses
        const senderATA = await getAssociatedTokenAddress(mint, senderPublicKey);
        const recipientATA = await getAssociatedTokenAddress(mint, recipient);

        // Check if recipient's ATA already exists
        const recipientATAInfo = await connection.getAccountInfo(recipientATA);
        if (recipientATAInfo === null) {
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    senderPublicKey, // Payer of the rent to open the account
                    recipientATA,      // Associated token account address to create
                    recipient,         // Owner (recipient)
                    mint               // Token Mint
                )
            );
        }

        // Default to 9 decimals for standard test tokens.
        // Note: In production, this can be fetched dynamically using getMint(connection, mint).
        const decimals = 9;
        const amountInMinUnits = amount * Math.pow(10, decimals);

        instructions.push(
            createTransferInstruction(
                senderATA,
                recipientATA,
                senderPublicKey,
                amountInMinUnits
            )
        );
    }

    // ── 3. MESSAGE AND VERSIONED TRANSACTION V0 CONSTRUCTION ─────────
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
        payerKey: senderPublicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);

    // ── 4. REQUEST SIGNATURE FROM WALLET ADAPTER AND SEND ────────────
    // sendTransaction handles calling the browser wallet (Phantom/Solflare),
    // requesting the user's signature, and sending it to the RPC node.
    const signature = await sendTransaction(transaction, connection);

    // ── 5. TRANSACTION CONFIRMATION ──────────────────────────────────
    await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
    }, 'confirmed');

    return signature;
}
