import { useCallback, useContext, useState } from "react";
import { AccountsContext } from "../accounts/AccountsContext";
import { Account } from "../accounts/types";
import { useBalances } from "../balances/useBalances";
import { List } from "../components/List";
import { SignMessageModal } from "../modals/SignMessageModal";
import { TransferAmountModal } from "../modals/TransferAmountModal";
import { useConnectWallet, useWallets } from "@subwallet-connect/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export const AccountsPage = () => {
  const { accounts } = useContext(AccountsContext);
  useBalances();

  const accountsArray = Array.from(accounts.values());
  const [currentAccount, setCurrentAccount] = useState<Account>();
  const [transferAmountIsVisible, setTransferAmountIsVisible] = useState(false);
  const [signMessageIsVisible, setSignMessageIsVisible] = useState(false);

  const onSend = useCallback((account: Account) => () => {
    setCurrentAccount(account);
    setTransferAmountIsVisible(true);
  }, []);

  const onCloseTransferAmount = useCallback(() => {
    setCurrentAccount(undefined);
    setTransferAmountIsVisible(false);
  }, []);

  const onCloseSignMessage = useCallback(() => {
    setCurrentAccount(undefined);
    setSignMessageIsVisible(false);
  }, []);

  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const connectedWallets = useWallets();
  const disconnectWallet = () =>  wallet && disconnect({label: wallet?.label, type: wallet?.type});
  const { open } = useWeb3Modal()

  return <div className="page">
    <List>
      {accountsArray.map(account => {
        return <List.Item key={account?.address}>
            <span>{account?.signerType}</span>
            <span>{account?.name}</span>
            <span>{account?.address}</span>
            <span>{account?.balance?.toFixed(2) || '0'}</span>
              <button onClick={onSend(account)}>Send amount</button>
              {/* <button onClick={onSignMessage(account)}>Sign message</button> */}
        </List.Item>
      })}
    </List>
    <div className="top-bar">
      {connectedWallets?.length > 0 ? <button onClick={disconnectWallet}>POLKADOT Disconnect</button> : <button onClick={() => connect()}>POLKADOT wallets</button>}
      <button onClick={() => open()}>ETHEREUM Wallets</button>
    </div>
    <TransferAmountModal 
      isVisible={transferAmountIsVisible} 
      sender={currentAccount}
      onClose={onCloseTransferAmount}
    />
    <SignMessageModal 
      isVisible={signMessageIsVisible} 
      account={currentAccount}
      onClose={onCloseSignMessage}
    />
  </div>;
}