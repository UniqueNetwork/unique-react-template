import keyring from "@polkadot/ui-keyring";
import { AskPassphraseCallback, KeyringSigner } from "./KeyringSigner";
import { Account, SignerTypeEnum } from "./types";
import { Polkadot, Ethereum } from '@unique-nft/utils/extension';
import { ethers, Signer as EthersSigner } from "ethers";

keyring.loadAll({ type: 'ed25519' });

/**
 * @func getLocalAccounts
 * 
 * @param askPassphraseCallback
 * @returns Map<string, Account>
 */
export const getLocalAccounts = (askPassphraseCallback: AskPassphraseCallback) => {

  const keyringAddresses = keyring.getAccounts();
  
  return new Map<string, Account>(
    keyringAddresses.map(({ address, meta,  }) => {
      return [
        address, // address as map key
        {
            name: meta.name || "untitled",
            address: address,
            signerType: SignerTypeEnum.Local,
            signer: new KeyringSigner(address, askPassphraseCallback)
        }
      ]
    })
  );
};

/**
 * @func getPolkadotAccounts
 * @returns Map<string, Account>
 */
export const getPolkadotAccounts = async () => { 
  try {
    const { accounts } = await Polkadot.enableAndLoadAllWallets()

    return new Map<string, Account>(
      accounts.map(({ name, address, signer, signRaw }) => {
        return [
          address, // address as map key
          {
              name,
              address,
              signerType: SignerTypeEnum.Polkadot,
              signer: {
                ...signer,
                signMessage: signRaw
              },
          }
        ]
      })
    );

  } catch(e: any) {
    if (e.extensionNotFound) {
      alert(`Please install some polkadot.js compatible extension`)
    } else if (e.accountsNotFound) {
      if (e.userHasWalletsButHasNoAccounts) {
        alert(`Please, create an account in your wallet`)
      } else if (e.userHasBlockedAllWallets) {
        alert(`Please, grant access to at least one of your accounts`)
      }
    } else {
      alert(`Connection to polkadot extension failed: ${e.message}`)
    }
  }
  return new Map();
};

/**
 * @func getMetamaskAccount
 * @returns Map<string, Account>
 */
export const getMetamaskAccount = async () => { 
  try {
    const { address } = await Ethereum.getAccounts()
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new Map<string, Account>(
      [[
        address, // address as map key
        {
            name: "Metamask account",
            address,
            signerType: SignerTypeEnum.Metamask,
            signer: await provider.getSigner(address),
        }
      ]]
    );
  } catch(e: any) {
    if (e.extensionNotFound) {
      alert(`Please install Metamask extension`)
    } else if (e.accountsNotFound) {
      if (e.userHasWalletsButHasNoAccounts) {
        alert(`Please, create an account in your wallet`)
      } else if (e.userHasBlockedAllWallets) {
        alert(`Please, grant access to at least one of your accounts`)
      }
    } else {
      alert(`Connection to Metamask extension failed: ${e.message}`)
    }
  }
  return new Map();
};

export const isEthersSigner = (signer: any): signer is EthersSigner =>
  (signer instanceof EthersSigner);
