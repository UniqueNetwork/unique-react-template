import { Signer } from "@unique-nft/sdk";
import { SignerResult } from "@unique-nft/utils/extension";
import { Signer as EthersSigner } from "ethers";
import { Dispatch, SetStateAction } from "react";

export enum SignerTypeEnum {
  Local = 'Local',
  Polkadot = 'substrate',
  Metamask = 'evm'
}

export interface Account {
  name: string;
  address: string;
  signerType: 'evm' | 'substrate'; 
  // signer: (Signer | EthersSigner) & { signMessage?(message: string): Promise<string | SignerResult> | Uint8Array } ;
  balance?: number;
}

export interface AccountsContextValue {
  accounts: Map<string, Account>;
  setAccounts: Dispatch<SetStateAction<Map<string, Account>>>
  fetchAccounts(): Promise<void>;
}