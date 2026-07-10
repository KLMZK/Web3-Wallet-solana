// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * Standardized error shape used across the entire wallet application.
 *
 * @property code    - Machine-readable identifier (e.g. 'INSUFFICIENT_FUNDS').
 *                     Useful for conditional logic based on the error type.
 * @property message - Human-readable description shown to the user.
 * @property raw     - The original thrown value, preserved for debugging.
 */
export interface WalletError {
    code: string;
    message: string;
    raw?: unknown;
}

// ── Internal helpers ───────────────────────────────────────────────────────────

const ERROR_CODES = {
    USER_REJECTED: 'USER_REJECTED',
    INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
    BLOCKHASH_EXPIRED: 'BLOCKHASH_EXPIRED',
    INVALID_ADDRESS: 'INVALID_ADDRESS',
    NETWORK_ERROR: 'NETWORK_ERROR',
    SLIPPAGE_TOO_LOW: 'SLIPPAGE_TOO_LOW',
    UNKNOWN_SOLANA_ERROR: 'UNKNOWN_SOLANA_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

const ERROR_MESSAGES = {
    USER_REJECTED: 'Transaction was cancelled from your wallet.',
    INSUFFICIENT_FUNDS: 'Insufficient funds to complete this operation.',
    BLOCKHASH_EXPIRED: 'The transaction expired. Please try again.',
    INVALID_ADDRESS: 'The address provided is not a valid Solana public key.',
    NETWORK_ERROR: 'Could not connect to the Solana network. Check your internet connection.',
    SLIPPAGE_TOO_LOW: 'No route found with the current slippage tolerance. Try increasing it.',
    UNKNOWN_SOLANA_ERROR: 'An unexpected error occurred on the Solana network. Please try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

const ERROR_PATTERNS = {
    USER_REJECTED: ['user rejected', 'transaction cancelled'],
    INSUFFICIENT_FUNDS: ['insufficient funds', '0x1'],
    BLOCKHASH_EXPIRED: ['blockhash not found', 'block height exceeded'],
    INVALID_ADDRESS: ['invalid public key', 'non-base58'],
    NETWORK_ERROR: ['network', 'fetch', 'econnrefused'],
    SLIPPAGE_TOO_LOW: ['could_not_find_any_route', 'could not find any route', 'no route found', 'route'],
} as const;

const ERROR_RULES: Array<{
    patterns: readonly string[];
    code: string;
    message: string;
}> = [
    {
        patterns: ERROR_PATTERNS.USER_REJECTED,
        code: ERROR_CODES.USER_REJECTED,
        message: ERROR_MESSAGES.USER_REJECTED,
    },
    {
        patterns: ERROR_PATTERNS.INSUFFICIENT_FUNDS,
        code: ERROR_CODES.INSUFFICIENT_FUNDS,
        message: ERROR_MESSAGES.INSUFFICIENT_FUNDS,
    },
    {
        patterns: ERROR_PATTERNS.BLOCKHASH_EXPIRED,
        code: ERROR_CODES.BLOCKHASH_EXPIRED,
        message: ERROR_MESSAGES.BLOCKHASH_EXPIRED,
    },
    {
        patterns: ERROR_PATTERNS.INVALID_ADDRESS,
        code: ERROR_CODES.INVALID_ADDRESS,
        message: ERROR_MESSAGES.INVALID_ADDRESS,
    },
    {
        patterns: ERROR_PATTERNS.NETWORK_ERROR,
        code: ERROR_CODES.NETWORK_ERROR,
        message: ERROR_MESSAGES.NETWORK_ERROR,
    },
    {
        patterns: ERROR_PATTERNS.SLIPPAGE_TOO_LOW,
        code: ERROR_CODES.SLIPPAGE_TOO_LOW,
        message: ERROR_MESSAGES.SLIPPAGE_TOO_LOW,
    },
];

/**
 * Inspects a raw error message string and maps known Solana / wallet-adapter
 * patterns to a structured { code, message } pair.
 *
 * Only the `code` and `message` fields are returned here; the `raw` field is
 * added by the caller (handleError) so the original error is never lost.
 */
function classifySolanaError(raw: string): Pick<WalletError, 'code' | 'message'> {
    const msg = raw.toLowerCase();

    for (const rule of ERROR_RULES) {
        if (rule.patterns.some((pattern) => msg.includes(pattern))) {
            return {
                code: rule.code,
                message: rule.message,
            };
        }
    }

    // Fallback for any unrecognised Solana error
    return {
        code: ERROR_CODES.UNKNOWN_SOLANA_ERROR,
        message: ERROR_MESSAGES.UNKNOWN_SOLANA_ERROR,
    };
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Central error handler for the wallet application.
 *
 * Accepts any thrown value (Error object, string, unknown) and returns a
 * consistent WalletError. Always logs the technical details to the browser
 * console so developers can inspect the root cause via DevTools (F12).
 *
 * Usage example:
 *   try {
 *     await executeTransfer(params);
 *   } catch (err) {
 *     const walletError = handleError(err, 'executeTransfer');
 *     notify({ type: 'error', message: walletError.message });
 *   }
 *
 * @param error   - The caught value (can be anything JavaScript throws).
 * @param context - Optional label describing where the error occurred.
 *                  Appears in the console prefix for easier filtering.
 * @returns       A normalised WalletError ready for display or logging.
 */
export function handleError(error: unknown, context?: string): WalletError {
    const prefix = context ? `[${context}]` : '[handleError]';

    // Always print the raw error so the developer can debug via DevTools
    console.error(`${prefix}`, error);

    // ── Case 1: Standard JavaScript Error object ───────────────────────────
    if (error instanceof Error) {
        const classified = classifySolanaError(error.message);
        return {
            ...classified,
            raw: error,
        };
    }

    // ── Case 2: Plain string was thrown (e.g. throw "something failed") ───
    if (typeof error === 'string') {
        const classified = classifySolanaError(error);
        return {
            ...classified,
            raw: error,
        };
    }

    // ── Case 3: Completely unknown shape (object, null, number, etc.) ──────
    return {
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
        raw: error,
    };
}
