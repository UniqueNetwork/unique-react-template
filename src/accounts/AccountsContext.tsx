import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SdkContext } from "../sdk/SdkContext";
import { SignByLocalSignerModalContext } from "../signModal/SignByLocalSignerModalContext";
import { noop } from "../utils/common";
import { getLocalAccounts, getMetamaskAccount, getPolkadotAccounts } from "./AccountsManager";
import { Account, AccountsContextValue } from "./types";

export const AccountsContext = createContext<AccountsContextValue>({
  accounts: new Map(),
  setAccounts: noop,
  fetchAccounts: noop
});

export const AccountsContextProvider = ({ children }: PropsWithChildren) => {
  const [accounts, setAccounts] = useState<Map<string, Account>>(new Map());
  const { openModal } = useContext(SignByLocalSignerModalContext);
  const { sdk } = useContext(SdkContext);

  const fetchAccounts = useCallback(async () => {
    if (!sdk) return;
    const localAccounts = getLocalAccounts(openModal)
    const polkadotAccounts = await getPolkadotAccounts();
    const metamaskAccounts = await getMetamaskAccount();

    //all accounts
    const accounts = new Map([...localAccounts, ...polkadotAccounts, ...metamaskAccounts]);

    //get balances
    await Promise.all([...accounts.keys()]
      .map((address) => sdk.balance.get({ address })))
      .then((responses) => {
      responses.forEach(({ address, availableBalance }) => {
        const account =  accounts.get(address);
        if (account) { 
          account.balance = Number(availableBalance.amount);
        }
      })
    })

    setAccounts(accounts);
  }, [openModal, sdk]);

  useEffect(() => {
    if (!sdk) return;
    void fetchAccounts();
  }, [sdk]);

  const contextValue = useMemo(() => ({
    accounts,
    setAccounts,
    fetchAccounts
  }), [accounts, fetchAccounts]);

  return <AccountsContext.Provider value={contextValue} >{children}</AccountsContext.Provider>
}