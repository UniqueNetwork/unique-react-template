import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Address } from "@unique-nft/utils"
import { SdkContext } from "../sdk/SdkContext";
import { noop } from "../utils/common";
import { Account, AccountsContextValue } from "./types";
import { useWallets } from "@subwallet-connect/react";
import { useAccount } from "wagmi";
import { useWalletInfo } from "@web3modal/wagmi/react";

export const AccountsContext = createContext<AccountsContextValue>({
  accounts: new Map(),
  setAccounts: noop,
  fetchAccounts: noop
});

export const AccountsContextProvider = ({ children }: PropsWithChildren) => {
  const [accounts, setAccounts] = useState<Map<string, Account>>(new Map());
  const { sdk } = useContext(SdkContext);

  const connectedWallets = useWallets();

  const { walletInfo } = useWalletInfo()
  const accountWalletConnect = useAccount()


  const fetchAccounts = useCallback(async () => {
    if (!sdk) return;
    const accs: Map<string, Account> = new Map(
      [accountWalletConnect].map(({ address }, index) => [
        Address.extract.substrateOrMirrorIfEthereumNormalized(address ?? ''),
        {
          name: `${++index}`,
          address: address ?? '',
          signerType: 'evm',
          balance: 0,
        },
      ])
    );


    console.log(accs, 'ACCS')

    //get balances
    await Promise.all(
      [accountWalletConnect].map(({ address }) => address && sdk.balance.get({ address }))
    ).then((responses) => {
      //for eth case amount included
      if (!responses) return;
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
  }, [sdk, accounts]);

  useEffect(() => {
    if (!sdk) return;
    fetchAccounts();
  }, [sdk]);

  const contextValue = useMemo(() => ({
    accounts,
    setAccounts,
    fetchAccounts
  }), [accounts, fetchAccounts]);

  return <AccountsContext.Provider value={contextValue} >{children}</AccountsContext.Provider>
}