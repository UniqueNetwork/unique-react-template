import { Address } from "@unique-nft/utils";

export const getSubstrateMirrorAddress = (addresses: string[], address: string, ss58Format: number | undefined) => {
  return addresses
        .filter(Address.is.substrateAddressInAnyForm)
        .find((substrateAddress) => {
          const ethMirror = Address.mirror.substrateToEthereum(substrateAddress);
          const substrateMirror = Address.mirror.ethereumToSubstrate(ethMirror, ss58Format);
          return Address.compare.substrateAddresses(substrateMirror, address);
        });
};

export const getAddress = (addresses: string[], address: string, ss58Format: number | undefined) => {
  if (addresses.length === 0) {
    return undefined;
  }
  if (!address) {
    return undefined;
  }

  if (addresses.map(
    (addr) => addr.toLowerCase()
  ).includes(address.toLowerCase())) {
    return address;
  }
  return addresses
          .filter(Address.is.ethereumAddressInAnyForm)
          .find((ethAddress) => {
            const substrateMirror = Address.mirror.ethereumToSubstrate(ethAddress, ss58Format);
            return Address.compare.substrateAddresses(substrateMirror, address);
          });
};