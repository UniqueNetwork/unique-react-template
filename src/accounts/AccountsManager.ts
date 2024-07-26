import { Account, SignerTypeEnum } from "./types";
import { Polkadot } from '@unique-nft/utils/extension';

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
