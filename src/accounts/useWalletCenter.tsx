import { useCallback, useState } from 'react';
import { PolkadotWallet, PolkadotWalletName } from './PolkadotWallet';
import { BaseWalletType } from './types';

/**
 * Represents the names of supported wallets that can be connected.
 */
export type ConnectedWalletsName = 'polkadot-js' | 'keyring' | 'metamask' | 'talisman' | 'subwallet-js' | 'enkrypt' | 'novawallet';

const wallets = new Map<
  ConnectedWalletsName,
  typeof PolkadotWallet 
>([
  ['polkadot-js', PolkadotWallet],
  ['talisman', PolkadotWallet],
  ['subwallet-js', PolkadotWallet],
  ['enkrypt', PolkadotWallet],
  ['novawallet', PolkadotWallet],
]);

/**
 * Key used for storing the type of connected wallet in localStorage.
 * 
 * @constant
 */
export const CONNECTED_WALLET_TYPE = 'connected-wallet-type';

/**
 * Custom React hook for managing wallet connections.
 * 
 * @returns An object containing:
 * - `connectWallet`: A function to connect a wallet of the specified type.
 * - `connectedWallets`: A Map of connected wallets and their respective accounts.
 * 
 * @example
 * ```typescript
 * const { connectWallet, connectedWallets } = useWalletCenter();
 * 
 * // Connect to a Polkadot.js wallet
 * await connectWallet('polkadot-js');
 * 
 * // Access the connected wallets and their accounts
 * console.log(connectedWallets);
 * ```
 */
export const useWalletCenter = (chainProperties?: any) => {
  const [connectedWallets, setConnectedWallets] = useState(
    new Map<ConnectedWalletsName, Map<string, BaseWalletType<any>>>([])
  );

  const connectWallet = useCallback(
    async (typeWallet: ConnectedWalletsName) => {
      try {
        const wallet = new (wallets.get(typeWallet)!)(typeWallet as PolkadotWalletName);
        const currentWallets = await wallet.getAccounts();
        const connectedWallets =
          localStorage.getItem(CONNECTED_WALLET_TYPE)?.split(';') || [];

        if (!connectedWallets.includes(typeWallet)) {
          connectedWallets.push(typeWallet);
          localStorage.setItem(CONNECTED_WALLET_TYPE, connectedWallets.join(';'));
        }

        setConnectedWallets((prev) => new Map([...prev, [typeWallet, currentWallets]]));
        return currentWallets;
      } catch (e: any) {
        const connectedWallets =
          localStorage.getItem(CONNECTED_WALLET_TYPE)?.split(';') || [];
        if (connectedWallets.includes(typeWallet)) {
          localStorage.setItem(
            CONNECTED_WALLET_TYPE,
            connectedWallets.filter((type) => type !== typeWallet).join(';')
          );
        }
        throw e;
      }
    },
    []
  );

  return {
    connectWallet,
    connectedWallets
  } as const;
};
