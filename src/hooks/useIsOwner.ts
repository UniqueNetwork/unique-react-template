import { useContext, useMemo } from "react";
import { AccountsContext } from "../accounts/AccountsContext";
import { Address } from "@unique-nft/utils";
import { compareEncodedAddresses } from "../utils/common";

const useIsOwner = (itemOwner: string | undefined) => {
  const { selectedAccount } = useContext(AccountsContext);

  return useMemo(() => {
    if (!selectedAccount?.address || !itemOwner) return false;

    const transformedItemOwner = Address.is.ethereumAddress(itemOwner)
      ? Address.mirror.ethereumToSubstrate(itemOwner)
      : itemOwner;

    const transformedAccountAddress = Address.is.ethereumAddress(selectedAccount.address)
      ? Address.mirror.ethereumToSubstrate(selectedAccount.address)
      : selectedAccount.address;

    if (
      !Address.is.substrateAddress(transformedAccountAddress) ||
      !Address.is.substrateAddress(transformedItemOwner)
    )
      return false;
      
    return compareEncodedAddresses(transformedAccountAddress, transformedItemOwner);
  }, [itemOwner, selectedAccount]);
};

export default useIsOwner;
