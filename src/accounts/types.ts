//import { Signer } from "@unique-nft/sdk";
import { SignerResult } from "@unique-nft/utils/extension";
import { Dispatch, SetStateAction } from "react";

export enum SignerTypeEnum {
  Polkadot = 'Polkadot',
}

export interface Account {
  name: string;
  address: string;
  signerType: SignerTypeEnum;
  //TO DO change after SDK types implementation
  signer: (any) & { signMessage?(message: string): Promise<string | SignerResult> | Uint8Array } ;
  balance?: number;
}

export interface AccountsContextValue {
  accounts: Map<string, Account>;
  setAccounts: Dispatch<SetStateAction<Map<string, Account>>>
  fetchPolkadotAccounts(): Promise<void>;
}