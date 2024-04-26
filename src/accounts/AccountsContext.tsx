import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SdkContext } from "../sdk/SdkContext";
import { SignByLocalSignerModalContext } from "../signModal/SignByLocalSignerModalContext";
import { noop } from "../utils/common";
import { getLocalAccounts, getMetamaskAccount, getPolkadotAccounts } from "./AccountsManager";
import { Account, AccountsContextValue } from "./types";

export const AccountsContext = createContext<AccountsContextValue>({
  accounts: new Map(),
  setAccounts: noop,
  fetchPolkadotAccounts: noop,
  fetchMetamaskAccounts: noop,
  fetchLocalAccounts: noop,
});

export const AccountsContextProvider = ({ children }: PropsWithChildren) => {
  const [accounts, setAccounts] = useState<Map<string, Account>>(new Map());
  const { openModal } = useContext(SignByLocalSignerModalContext);
  const { sdk } = useContext(SdkContext);

  const fetchLocalAccounts = useCallback(async () => {
    if (!sdk) return;
    const localAccounts = getLocalAccounts(openModal);
    if (localAccounts) {
      for (let [address, account] of localAccounts) {
        const balanceResponse = await sdk.balance.get({ address });
        account.balance = Number(balanceResponse.availableBalance.amount);
        localAccounts.set(address, account);
      }
      const accountsToUpdate = new Map([...accounts, ...localAccounts]);
      setAccounts(accountsToUpdate);
    }
  }, [sdk, openModal, accounts]);

  const fetchMetamaskAccounts = useCallback(async () => {
    if (!sdk) return;
    const metamaskAccounts = await getMetamaskAccount();
    if (metamaskAccounts) {
      for (let [address, account] of metamaskAccounts) {
        const balanceResponse = await sdk.balance.get({ address });
        account.balance = Number(balanceResponse.availableBalance.amount);
        metamaskAccounts.set(address, account);
      }
      const accountsToUpdate = new Map([...accounts, ...metamaskAccounts]);
      setAccounts(accountsToUpdate);
    }
  }, [sdk, accounts]);

  const fetchPolkadotAccounts = useCallback(async () => {
    if (!sdk) return;
    const polkadotAccounts = await getPolkadotAccounts();
    for (let [address, account] of polkadotAccounts) {
      const balanceResponse = await sdk.balance.get({ address });
      account.balance = Number(balanceResponse.availableBalance.amount);
      polkadotAccounts.set(address, account);
    }
    const accountsToUpdate = new Map([...accounts, ...polkadotAccounts]);
    setAccounts(accountsToUpdate);
  }, [sdk, accounts]);

  useEffect(() => {
    fetchLocalAccounts();
  }, [sdk])

  const contextValue = useMemo(() => ({
    accounts,
    setAccounts,
    fetchMetamaskAccounts,
    fetchPolkadotAccounts,
    fetchLocalAccounts
  }), [accounts, fetchMetamaskAccounts, fetchPolkadotAccounts, fetchLocalAccounts]);

  return <AccountsContext.Provider value={contextValue}>{children}</AccountsContext.Provider>;
}