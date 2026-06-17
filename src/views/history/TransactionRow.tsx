// src/views/history/TransactionRow.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Individual transaction row component.
//
// Responsibilities:
//   - Display a single transaction in the history list
//   - Show transaction icon (sent/received)
//   - Display address (truncated), amount, and confirmation status
//   - Provide explorer link on click
//
// Each row is clickable and opens the transaction on Solana Explorer.
// ─────────────────────────────────────────────────────────────────────────────

import { FC } from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { ParsedTransaction, truncateAddress } from '../../hooks/useTransactionHistory';
import { C } from '../../utils/theme';

interface TransactionRowProps {
  transaction: ParsedTransaction;
  onClick: () => void;
}

export const TransactionRow: FC<TransactionRowProps> = ({
  transaction,
  onClick,
}) => {
  const { type, amount, address, confirmationStatus, symbol } = transaction;

  // Determine icon and colors based on transaction type
  const isReceived = type === 'received';
  const isFailed = type === 'unknown';

  const iconBg = isReceived
    ? 'rgba(74, 222, 128, 0.1)'
    : isFailed
      ? 'rgba(255, 74, 74, 0.1)'
      : 'rgba(255, 74, 74, 0.1)';

  const iconColor = isReceived ? C.green : C.red;

  const icon = isReceived ? (
    <ArrowDownLeft size={18} />
  ) : (
    <ArrowUpRight size={18} />
  );

  // Format confirmation badge
  const confirmationColor =
    confirmationStatus === 'finalized'
      ? C.green
      : confirmationStatus === 'confirmed'
        ? 'rgba(74, 222, 128, 0.6)'
        : 'rgba(122, 143, 166, 0.6)';

  const confirmationLabel =
    confirmationStatus === 'finalized'
      ? 'Finalized'
      : confirmationStatus === 'confirmed'
        ? 'Confirmed'
        : 'Processing';

  // Format address label
  const addressLabel =
    address === 'Contract Interaction'
      ? 'Contract'
      : address === 'Unknown' || address === 'Failed TX' || address === 'Parse Error'
        ? address
        : truncateAddress(address);

  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer border-0 text-left bg-transparent"
    >
      {/* Transaction type icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
        style={{
          backgroundColor: iconBg,
          borderColor: `${iconColor}33`,
        }}
      >
        <div style={{ color: iconColor }}>{icon}</div>
      </div>

      {/* Transaction details */}
      <div className="flex-1 min-w-0">
        {/* Type and address */}
        <div className="flex items-center gap-2 mb-1">
          <p className="text-white text-[15px] font-semibold">
            {isReceived ? 'Received' : isFailed ? 'Failed' : 'Sent'}
          </p>
          <p className="text-[#7a8fa6] text-[13px]">
            {isFailed ? 'Error:' : isReceived ? 'from' : 'to'} {addressLabel}
          </p>
        </div>

        {/* Confirmation status */}
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md"
            style={{
              backgroundColor: `${confirmationColor}1a`,
              color: confirmationColor,
            }}
          >
            {confirmationLabel}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p
          className="text-[15px] font-semibold"
          style={{ color: isReceived ? C.green : C.text }}
        >
          {isReceived ? '+' : '-'}{amount.toFixed(4)} {symbol}
        </p>
      </div>

      {/* Explorer link icon */}
      <div
        className="p-2 hover:bg-white/5 rounded transition-colors"
        style={{ color: C.muted }}
      >
        <ExternalLink size={16} />
      </div>
    </button>
  );
};
