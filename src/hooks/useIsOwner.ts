import { useContext, useMemo } from "react";
import { AccountsContext } from "../accounts/AccountsContext";
import { Address } from "@unique-nft/utils";
import { compareEncodedAddresses } from "../utils/common";

const useIsOwner = (itemOwner: string | undefined) => {
  const { selectedAccount } = useContext(AccountsContext);

  return useMemo(() => {
    if (!selectedAccount?.address || !itemOwner) return false;
    if (
      !Address.is.substrateAddress(selectedAccount.address) ||
      !Address.is.substrateAddress(itemOwner)
    )
      return false;
    return compareEncodedAddresses(selectedAccount.address, itemOwner);
  }, [itemOwner, selectedAccount]);
};

export default useIsOwner;
