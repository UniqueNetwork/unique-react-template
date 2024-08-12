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

  const updateEthereumWallet = useCallback(async () => {
    if (!sdk || !address) return;

    const ethereumAddress = Address.extract.substrateOrMirrorIfEthereumNormalized(address);
    const account: Account = { address, signerType: SignerTypeEnum.Ethereum, name: '', signer: undefined };

    const balanceResponse = await sdk.balance.get({ address: ethereumAddress });
    account.balance = Number(
      balanceResponse.available / Math.pow(10, Number(balanceResponse.decimals))
    );

    setAccounts((prevAccounts) => {
      const newAccounts = new Map(prevAccounts);
      newAccounts.set(ethereumAddress, account);
      return newAccounts;
    });
  }, [sdk, address]);

  useEffect(() => {
    updateEthereumWallet();
  }, [updateEthereumWallet]);

  const fetchPolkadotAccounts = useCallback(async () => {
    if (!sdk) return;

    const polkadotAccounts = await getPolkadotAccounts();

    for (let [address, account] of polkadotAccounts) {
      account.signerType = SignerTypeEnum.Polkadot;
      const balanceResponse = await sdk.balance.get({ address });
      account.balance = Number(
        balanceResponse.available / Math.pow(10, Number(balanceResponse.decimals))
      );
      polkadotAccounts.set(address, account);
    }

    setAccounts((prevAccounts) => {
      const accountsToUpdate = new Map([...prevAccounts, ...polkadotAccounts]);
      return accountsToUpdate;
    });
  }, [sdk]);

  const contextValue = useMemo(
    () => ({
      accounts,
      setAccounts,
      selectedAccountId,
      setSelectedAccountId,
      selectedAccount,
      fetchPolkadotAccounts,
      updateEthereumWallet,
    }),
    [
      accounts,
      fetchPolkadotAccounts,
      selectedAccountId,
      setSelectedAccountId,
      selectedAccount,
      updateEthereumWallet,
    ]
  );

  return (
    <AccountsContext.Provider value={contextValue}>
      {children}
    </AccountsContext.Provider>
  );
};
