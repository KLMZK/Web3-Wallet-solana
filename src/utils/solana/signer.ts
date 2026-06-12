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
import { verify } from '@noble/ed25519';

// ── Types ──────────────────────────────────────────────────────────────────────

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

// ── Functions ──────────────────────────────────────────────────────────────────

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
    // 1. Input validation
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

    // 2. Instruction construction based on transfer type
    if (type === 'sol') {
        // Send native SOL: 1 SOL = 10^9 Lamports
        const lamports = amount * 1_000_000_000;
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

        // Derive Associated Token Account (ATA) addresses for both sides
        const senderATA = await getAssociatedTokenAddress(mint, senderPublicKey);
        const recipientATA = await getAssociatedTokenAddress(mint, recipient);

        // If recipient's ATA does not exist on-chain, create it atomically
        const recipientATAInfo = await connection.getAccountInfo(recipientATA);
        if (recipientATAInfo === null) {
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    senderPublicKey, // Payer of rent for the new account
                    recipientATA,    // New associated token account address
                    recipient,       // Owner (recipient wallet)
                    mint             // Token mint address
                )
            );
        }

        // Default to 9 decimals for standard tokens.
        // Note: In production, fetch dynamically using getMint(connection, mint).
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

    // 3. Build versioned transaction (V0 format)
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
        payerKey: senderPublicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);

    // 4. Request signature from Wallet Adapter (triggers browser wallet popup)
    const signature = await sendTransaction(transaction, connection);

    // 5. Wait for on-chain confirmation
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

    return signature;
}

/**
 * Verifies that a message was signed by the wallet matching the given public key.
 * Uses the @noble/ed25519 library for cryptographic verification.
 *
 * @param signature - The raw signature bytes returned by wallet.signMessage()
 * @param message   - The original message bytes that were signed
 * @param publicKey - The Solana PublicKey of the signer
 * @returns true if the signature is valid, false otherwise
 */
export async function verifyMessageSignature(
    signature: Uint8Array,
    message: Uint8Array,
    publicKey: PublicKey
): Promise<boolean> {
    return verify(signature, message, publicKey.toBytes());
}
