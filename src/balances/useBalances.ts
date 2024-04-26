import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef } from "react"
import { AccountsContext } from "../accounts/AccountsContext"
import { SdkContext } from "../sdk/SdkContext";
import { SocketClient, SubscriptionEvents } from '@unique-nft/sdk/full';
import { Account } from "../accounts/types";
import { Address } from "@unique-nft/utils";
import { getAddress, getSubstrateMirrorAddress } from "./utils";

export const useBalances = () => {
  const { accounts, setAccounts } = useContext(AccountsContext);
  const { sdk, chainProperties } = useContext(SdkContext);

  const sdkSocketClient = useRef<SocketClient>();

  const subscribeBalancesChanges = useCallback(async (
    accounts: Map<string, Account>,
    setAccounts: Dispatch<SetStateAction<Map<string, Account>>>
  ) => {
    if(!sdk) return;
    const client: SocketClient = sdk.subscription.connect({
      transports: ['websocket']
    });

    sdkSocketClient.current = client;

    [...accounts.values()].forEach((account) => {
      if (Address.is.substrateAddress(account.address)) { // for substrate addresses
        client.subscribeAccountCurrentBalance({ address: Address.is.substrateAddress(account.address)
          ? Address.normalize.substrateAddress(account.address, chainProperties?.SS58Prefix)
          : account.address });

        const ethMirror = Address.mirror.substrateToEthereum(account.address);
        client.subscribeAccountCurrentBalance({ address: Address.mirror.ethereumToSubstrate(ethMirror, chainProperties?.SS58Prefix) });
      } else { // for Metamask
        const substrateMirror = Address.mirror.ethereumToSubstrate(account.address, chainProperties?.SS58Prefix);
        client.subscribeAccountCurrentBalance({ address: substrateMirror });
      }
    });

    client.on(SubscriptionEvents.ACCOUNT_CURRENT_BALANCE, (_, { balance }) => {
      const { address, availableBalance } = balance;
      
      setAccounts((accounts) => {
        const accountsCopy = new Map(accounts);
        const addresses = [...accountsCopy.keys()];
        let accountAddress = getAddress(addresses, address, chainProperties?.SS58Prefix);

        if (accountAddress) {
          const account = accountsCopy.get(accountAddress);
          if (account) {
            account.balance = Number(availableBalance.amount);
            return accountsCopy;
          }
        }

        accountAddress = getSubstrateMirrorAddress(addresses, address, chainProperties?.SS58Prefix);

        if (accountAddress) {
          const account = accountsCopy.get(accountAddress);

          if (!account) {
            return accountsCopy;
          }

          account.balance = Number(availableBalance);
        }

        return accountsCopy;
      })
    });
  }, [])

  useEffect(() => {
    if(!sdk) return;

    subscribeBalancesChanges(accounts, setAccounts);

    return () => {
      sdkSocketClient.current?.unsubscribeAccountCurrentBalance({ address: '*' });
    }
  }, [sdk, accounts, subscribeBalancesChanges, setAccounts]);
}