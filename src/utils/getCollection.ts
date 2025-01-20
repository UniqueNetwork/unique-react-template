import { UniqueNFTFactory } from '@unique-nft/solidity-interfaces';
import { ethers } from 'ethers';

export async function getCollection(authProvider: ethers.Eip1193Provider, collectionId: string) {
  if (!authProvider) throw new Error('No provider');

  const provider = new ethers.BrowserProvider(authProvider);
  const signer = await provider.getSigner();

  const collection = await UniqueNFTFactory(+collectionId, signer);

  if (!collection) {
    throw new Error("Failed to initialize the collection helper.");
  }

  return collection;
}

