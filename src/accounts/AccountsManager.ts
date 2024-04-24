import { Account, SignerTypeEnum } from "./types";
import { Polkadot } from '@unique-nft/utils/extension';
import { Signer as EthersSigner } from "ethers";
/**
 * @func getLocalAccounts
 * 
 * @param askPassphraseCallback
 * @returns Map<string, Account>
 */
// export const getLocalAccounts = (askPassphraseCallback: AskPassphraseCallback) => {
//   const accounts = new Map<string, Account>();
//   for (let index = 0; index < localStorage.length; index++) {
//     const key = localStorage.key(index);
//     if(key && /^account:/.test(key)){
//       const value = localStorage.getItem(key);
//       if(!value) break;
//       const address = key.split(':')[1];
//       const { name, secret } = JSON.parse(value);
      
//       accounts.set(address,  {
//         name,
//         address,
//         signerType: SignerTypeEnum.Local,
//         signer: new LocalAccountSigner(secret, askPassphraseCallback)
//       });
//     }
//   }

//   return accounts;
// };

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
// export const getMetamaskAccount = async () => { 
//   try {
//     const { address } = await Ethereum.getAccounts()
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     return new Map<string, Account>(
//       [[
//         address, // address as map key
//         {
//             name: "Metamask account",
//             address,
//             signerType: SignerTypeEnum.Metamask,
//             signer: await provider.getSigner(address),
//         }
//       ]]
//     );
//   } catch(e: any) {
//     if (e.extensionNotFound) {
//       alert(`Please install Metamask extension`)
//     } else if (e.accountsNotFound) {
//       if (e.userHasWalletsButHasNoAccounts) {
//         alert(`Please, create an account in your wallet`)
//       } else if (e.userHasBlockedAllWallets) {
//         alert(`Please, grant access to at least one of your accounts`)
//       }
//     } else {
//       alert(`Connection to Metamask extension failed: ${e.message}`)
//     }
//   }
//   return new Map();
// };

export const isEthersSigner = (signer: any): signer is EthersSigner =>
  (signer instanceof EthersSigner);
