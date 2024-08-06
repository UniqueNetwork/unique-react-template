import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SdkContext } from "../sdk/SdkContext";
import { noop } from "../utils/common";
import { getPolkadotAccounts } from "./AccountsManager";
import { Account, AccountsContextValue, SignerTypeEnum } from "./types";
import { useAccount } from "wagmi";
import { Address } from "@unique-nft/utils";

export const AccountsContext = createContext<AccountsContextValue>({
  accounts: new Map(),
  setAccounts: noop,
  selectedAccountId: 0,
  selectedAccount: null,
  setSelectedAccountId: noop,
  fetchPolkadotAccounts: noop,
});

export const AccountsContextProvider = ({ children }: PropsWithChildren) => {
  const { address } = useAccount();
  const [accounts, setAccounts] = useState<Map<string, Account>>(new Map());
  const [selectedAccountId, setSelectedAccountId] = useState<number>(() => {
    const savedId = localStorage.getItem("selectedAccountId");
    return savedId ? Number(savedId) : 0;
  });

  const selectedAccount = useMemo(
    () => [...accounts.values()][selectedAccountId],
    [selectedAccountId, accounts]
  );
  const { sdk } = useContext(SdkContext);

  useEffect(() => {
    localStorage.setItem("selectedAccountId", String(selectedAccountId));
  }, [selectedAccountId]);

  useEffect(() => {
    const updateEthereumWallet = async () => {
      if (!sdk) return;

      if (!address) {
        setAccounts((prevAccounts) => {
          const newAccounts = new Map(prevAccounts);
          for (let [key, account] of newAccounts) {
            //@ts-ignore
            if (account.type === "evm") {
              newAccounts.delete(key);
            }
          }
          return newAccounts;
        });
      } else {
        const ethereumAddress = Address.extract.substrateOrMirrorIfEthereumNormalized(address);
        //@ts-ignore
        const account: Account = { address, signerType: SignerTypeEnum.ethereum };

        const balanceResponse = await sdk.balance.get({ address: ethereumAddress });
        account.balance = Number(
          balanceResponse.available / Math.pow(10, Number(balanceResponse.decimals))
        );

        setAccounts((prevAccounts) => {
          const newAccounts = new Map(prevAccounts);
          newAccounts.set(ethereumAddress, account);
          return newAccounts;
        });
      }
    };

    updateEthereumWallet();
  }, [address, sdk]);

  const fetchPolkadotAccounts = useCallback(async () => {
    if (!sdk) return;
    const polkadotAccounts = await getPolkadotAccounts();

    for (let [address, account] of polkadotAccounts) {
      account.type = "sub";
      const balanceResponse = await sdk.balance.get({ address });
      account.balance = Number(
        balanceResponse.available / Math.pow(10, Number(balanceResponse.decimals))
      );
      polkadotAccounts.set(address, account);
    }

    const accountsToUpdate = new Map([...accounts, ...polkadotAccounts]);
    setAccounts(accountsToUpdate);
  }, [sdk, accounts]);

  const contextValue = useMemo(
    () => ({
      accounts,
      setAccounts,
      selectedAccountId,
      setSelectedAccountId,
      selectedAccount,
      fetchPolkadotAccounts,
    }),
    [
      accounts,
      fetchPolkadotAccounts,
      selectedAccountId,
      setSelectedAccountId,
      selectedAccount,
    ]
  );

  return (
    <AccountsContext.Provider value={contextValue}>
      {children}
    </AccountsContext.Provider>
  );
};
