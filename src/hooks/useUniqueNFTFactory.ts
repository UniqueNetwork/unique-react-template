import { useEthersSigner } from "./useSigner";
import { UniqueNFTFactory } from "@unique-nft/solidity-interfaces";

//TO DO - can be update to use also magicLink & web3Auth
export const useUniqueNFTFactory = (collectionId?: string) => {
  const signer = useEthersSigner();

  const getUniqueNFTFactory = async () => {
    if (!collectionId || !signer) return null;
    return await UniqueNFTFactory(+collectionId, signer);
  };

  return { getUniqueNFTFactory };
};
