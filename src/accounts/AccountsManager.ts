import { AskPassphraseCallback, LocalAccountSigner, NONCE } from "./LocalAccountSigner";
import { Account, SignerTypeEnum } from "./types";
import { Polkadot } from '@unique-nft/utils/extension';
import { ethers, Signer as EthersSigner } from "ethers";
import { StringUtils } from '@unique-nft/utils'
import { secretbox } from 'tweetnacl-ts';
import { algorithms } from '@unique-nft/utils/address'
/**
 * @func getLocalAccounts
 * 
 * @param askPassphraseCallback
 * @returns Map<string, Account>
 */
export const getLocalAccounts = (askPassphraseCallback: AskPassphraseCallback) => {
  const accounts = new Map<string, Account>();
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if(key && /^account:/.test(key)){
      const value = localStorage.getItem(key);
      if(!value) break;
      const address = key.split(':')[1];
      const { name, secret } = JSON.parse(value);
      
      accounts.set(address,  {
        name,
        address,
        signerType: SignerTypeEnum.Local,
        signer: new LocalAccountSigner(secret, askPassphraseCallback)
      });
    }
  }

  return accounts;
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
    // Check if MetaMask is available
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      throw new Error("MetaMask is not installed.");
    }

    // Request access to the accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      alert("No accounts found. Please ensure MetaMask is unlocked and accounts are available.");
      throw new Error("No accounts found.");
    }

    const address = accounts[0];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(address);

    return new Map<string, Account>([
      [address, { // address as map key
        name: "Metamask account",
        address,
        signerType: SignerTypeEnum.Metamask,
        signer,
      }]
    ]);
  } catch (e: any) {
    alert(`Connection to Metamask extension failed: ${e.message}`)
  }
};

export const isEthersSigner = (signer: any): signer is EthersSigner =>
  (signer instanceof EthersSigner);

export const addLocalAccount = (address: string, name: string, mnemonicPhrase: string, passphrase: string) => {
  const passwordHash = algorithms.keccak_256(passphrase)
  const secret = secretbox(
    StringUtils.Utf8.stringToU8a(mnemonicPhrase), 
    NONCE, 
    passwordHash
  );

  localStorage.setItem(`account:${address}`, JSON.stringify({ 
    name, 
    secret: StringUtils.HexString.fromU8a(secret) 
  }));
}