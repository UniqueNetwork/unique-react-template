import { Sr25519Account } from "@unique-nft/sr25519";

export const getAccountFromMnemonic = (mnemonic: string) => {
  return Sr25519Account.fromUri(mnemonic);
}

// export const getAccountFromSecretKeyBytes = (secret: string) => {
//   Sr25519Account.other.fromSecretKeyBytes(secret);
// }

export const getRandomAccount = () => {
  return getAccountFromMnemonic(Sr25519Account.generateMnemonic());
}