import { PublicKey } from '@solana/web3.js'

// ─────────────────────────────────────────────────────────────────────────────
// getExplorerUrl
//
// Builds a Solana Explorer URL for a given transaction, address, or block.
//
// Why substring matching instead of exact string comparison:
//   Private RPC providers like Helius use URLs such as:
//     https://mainnet.helius-rpc.com/?api-key=...
//     https://devnet.helius-rpc.com/?api-key=...
//   These URLs contain 'mainnet' or 'devnet' as substrings, so we can detect
//   the cluster reliably without hard-coding a specific provider's domain.
// ─────────────────────────────────────────────────────────────────────────────

export function getExplorerUrl(
    endpoint: string,
    viewTypeOrItemAddress: 'inspector' | PublicKey | string,
    itemType = 'address' // | 'tx' | 'block'
  ) {
    const getClusterUrlParam = () => {
      const ep = endpoint.toLowerCase();

      if (ep === 'localnet' || ep.includes('127.0.0.1') || ep.includes('localhost')) {
        // Local validator: point Explorer to a custom cluster
        return `?cluster=custom&customUrl=${encodeURIComponent('http://127.0.0.1:8899')}`;
      }

      if (ep.includes('devnet')) {
        return '?cluster=devnet';
      }

      if (ep.includes('testnet')) {
        return '?cluster=testnet';
      }

      // mainnet-beta or any unknown endpoint → Explorer defaults to mainnet, no param needed
      return '';
    }
  
    return `https://explorer.solana.com/${itemType}/${viewTypeOrItemAddress}${getClusterUrlParam()}`
  }