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
 * Servicio reutilizable para realizar transferencias de SOL o tokens SPL
 * de forma compatible con la interfaz web (usando Wallet Adapter).
 * 
 * @param params Parámetros de la transferencia
 * @returns La firma (signature) de la transacción confirmada
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
    // ── 1. VALIDACIÓN DE INPUTS ──────────────────────────────────────
    let recipient: PublicKey;
    try {
        recipient = new PublicKey(recipientAddress);
    } catch (err) {
        throw new Error('La dirección del destinatario no es una clave pública de Solana válida.');
    }

    if (amount <= 0) {
        throw new Error('La cantidad a enviar debe ser mayor a cero.');
    }

    const instructions = [];

    // ── 2. CONSTRUCCIÓN DE INSTRUCCIONES ─────────────────────────────
    if (type === 'sol') {
        // Enviar SOL nativo
        const lamports = amount * 1_000_000_000; // 1 SOL = 10^9 Lamports
        instructions.push(
            SystemProgram.transfer({
                fromPubkey: senderPublicKey,
                toPubkey: recipient,
                lamports,
            })
        );
    } else {
        // Enviar token SPL
        if (!mintAddress) {
            throw new Error('Se requiere el Mint Address para enviar tokens SPL.');
        }

        let mint: PublicKey;
        try {
            mint = new PublicKey(mintAddress);
        } catch (err) {
            throw new Error('El Mint Address no es una clave pública de Solana válida.');
        }

        // Derivar las direcciones de las Cuentas Asociadas (ATA)
        const senderATA = await getAssociatedTokenAddress(mint, senderPublicKey);
        const recipientATA = await getAssociatedTokenAddress(mint, recipient);

        // Verificar si el ATA del destinatario ya existe
        const recipientATAInfo = await connection.getAccountInfo(recipientATA);
        if (recipientATAInfo === null) {
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    senderPublicKey, // Quien paga la renta por abrir la cuenta
                    recipientATA,      // Dirección de la cuenta asociada
                    recipient,         // Propietario (destinatario)
                    mint               // Token Mint
                )
            );
        }

        // 9 decimales por defecto para tokens de prueba estándar. 
        // Nota: En producción, se puede consultar dinámicamente con getMint(connection, mint).
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

    // ── 3. CONSTRUCCIÓN DEL MENSAJE Y TRANSACCIÓN V0 ──────────────────
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
        payerKey: senderPublicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);

    // ── 4. SOLICITAR FIRMA AL WALLET ADAPTER Y ENVIAR ──────────────────
    // sendTransaction se encarga de llamar al Wallet del navegador (Phantom/Solflare),
    // solicitar la firma del usuario y transmitirla al nodo RPC.
    const signature = await sendTransaction(transaction, connection);

    // ── 5. CONFIRMACIÓN DE LA TRANSACCIÓN ─────────────────────────────
    await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
    }, 'confirmed');

    return signature;
}
