import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Address } from "@unique-nft/utils"
import { SdkContext } from "../sdk/SdkContext";
import { SignByLocalSignerModalContext } from "../signModal/SignByLocalSignerModalContext";
import { noop } from "../utils/common";
import { Account, AccountsContextValue } from "./types";
import { useWallets } from "@subwallet-connect/react";

export const AccountsContext = createContext<AccountsContextValue>({
  accounts: new Map(),
  setAccounts: noop,
  fetchAccounts: noop
});

export const AccountsContextProvider = ({ children }: PropsWithChildren) => {
  const [accounts, setAccounts] = useState<Map<string, Account>>(new Map());
  const { openModal } = useContext(SignByLocalSignerModalContext);
  const { sdk } = useContext(SdkContext);
  const connectedWallets = useWallets();

  const fetchAccounts = useCallback(async () => {
    if (!sdk) return;
    const wallet = connectedWallets[0];
    if (connectedWallets.length === 0) {
      setAccounts(new Map());
      return;
    }

    if (!wallet || !Array.isArray(wallet.accounts)) return;

    const accs: Map<string, Account> = new Map(
      wallet.accounts.map(({ address }, index) => [
        Address.extract.substrateOrMirrorIfEthereumNormalized(address),
        {
          name: `${++index}`,
          address,
          signerType: wallet.type,
          balance: 0,
        },
      ])
    );

    //get balances
    await Promise.all(
      [...wallet.accounts].map(({ address }) => sdk.balance.get({ address }))
    ).then((responses) => {
      //for eth case amount included
      //@ts-ignore
      responses.forEach(({ address, availableBalance, amount, ...res }) => {
        const account = accs.get(address);
        if (account) {
          account.balance = Number(availableBalance.amount || amount);
        }
        //create balance subscription
      });
    });
    setAccounts(accs);
  }, [openModal, sdk, connectedWallets]);

  useEffect(() => {
    if (!sdk) return;
    void fetchAccounts();
  }, [sdk, connectedWallets]);

  const contextValue = useMemo(() => ({
    accounts,
    setAccounts,
    fetchAccounts
  }), [accounts, fetchAccounts]);

  return <AccountsContext.Provider value={contextValue} >{children}</AccountsContext.Provider>
}