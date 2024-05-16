import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Address } from "@unique-nft/utils";
import { SdkContext } from "../sdk/SdkContext";
import { noop } from "../utils/common";
import { Account, AccountsContextValue } from "./types";
import { useConnectWallet } from "@subwallet-connect/react";
import { useAccount } from "wagmi";

export const AccountsContext = createContext<AccountsContextValue>({
  accounts: new Map(),
  setAccounts: noop,
  fetchAccounts: noop,
});

export const AccountsContextProvider = ({ children }: PropsWithChildren) => {
  const [accounts, setAccounts] = useState<Map<string, Account>>(new Map());
  const { sdk } = useContext(SdkContext);
  const { address } = useAccount();

  const [{ wallet }] = useConnectWallet();

  const fetchAccounts = useCallback(async () => {
    if (!sdk) return;
    // const wallet = connectedWallets[0];
    console.log(wallet, "WALLET");
    const polkadotWallets =
      wallet?.accounts.map(({ address }) => ({ address, type: "sub" })) || [];
    const ethereumWallets = address ? [{ address, type: "evm" }] : [];
    const accsAddresses = [...polkadotWallets, ...ethereumWallets];

    // if (!wallet || !Array.isArray(wallet.accounts)) return;
    let accs: Map<string, Account>;
    console.log(address, "AFFR");
    //@ts-ignore
    accs = new Map(
      accsAddresses.map(({ address, type }, index) => [
        //@ts-ignore
        Address.extract.substrateOrMirrorIfEthereumNormalized(address),
        {
          name: `${++index}`,
          address,
          signerType: type,
          balance: 0,
        },
      ])
    );

    //get balances
    await Promise.all(
      accsAddresses.map(
        ({ address }) => address && sdk.balance.get({ address })
      )
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
  }, [sdk, address, wallet]);

  useEffect(() => {
    if (!sdk) return;
    fetchAccounts();
  }, [sdk, address, wallet]);

  const contextValue = useMemo(
    () => ({
      accounts,
      setAccounts,
      fetchAccounts,
    }),
    [accounts, fetchAccounts]
  );

  return (
    <AccountsContext.Provider value={contextValue}>
      {children}
    </AccountsContext.Provider>
  );
};
