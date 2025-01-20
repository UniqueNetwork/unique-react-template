import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { BN } from "@polkadot/util";
import { IEthereumExtensionResultSafe } from "@unique-nft/utils/extension";
import { ConnectedWalletsName } from "./useWalletCenter";
import { Eip1193Provider, Signer as EthSigner } from "ethers";
import { PolkadotWalletName } from "./PolkadotWallet";
import { Magic } from "magic-sdk";

export enum SignerTypeEnum {
  Polkadot = "Polkadot",
  Ethereum = "Ethereum",
  Magiclink = 'Magiclink',
  Web3Auth = 'Web3Auth',
}

export type Signer = any | EthSigner;

export type BaseWalletType<T> = {
  name: string;
  address: string;
  balance?: number;
  normalizedAddress: string;
  signerType: SignerTypeEnum;
  signer: Signer;
  sign?(data: any, account?: any, meta?: any): any;
};

export type BaseWalletEntity<T> = {
  getAccounts(): Promise<Map<string, BaseWalletType<T>>>;
};

export type WalletsType =
  | InjectedAccountWithMeta
  | IEthereumExtensionResultSafe["result"];

export type AccountBalance = {
  raw: BN;
  parsed: string;
};

export type AccountBalances = {
  proper: AccountBalance;
  ethMirror: AccountBalance;
};

export type Account<T extends WalletsType = WalletsType> = BaseWalletType<T> & {
  balances?: AccountBalances;
  fungibleBalances?: Map<string, any>;
  walletType?: PolkadotWalletName;
};

export interface AccountsContextValue {
  accounts: Map<string, Account>;
  setAccounts: React.Dispatch<React.SetStateAction<Map<string, Account>>>;
  selectedAccountId: number;
  setSelectedAccountId: React.Dispatch<React.SetStateAction<number>>;
  selectedAccount: Account | undefined;
  setPolkadotAccountsWithBalance: (walletName?: ConnectedWalletsName) => Promise<void>;
  updateEthereumWallet: () => Promise<void>;
  reinitializePolkadotAccountsWithBalance: () => Promise<void>;
  clearAccounts: () => void;
  loginWithMagicLink: (email: string) => Promise<void>;
  logoutMagicLink: () => Promise<void>;
  loginWithWeb3Auth: () => Promise<void>,
  logoutWeb3Auth: () => Promise<void>,
  providerWeb3Auth: Eip1193Provider | null,
  magic: Magic | null;


  setWeb3Auth: any,
  setProviderWeb3Auth: any,

}