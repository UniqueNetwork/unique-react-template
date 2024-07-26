import { useCallback, useContext, useState } from "react";
import { AccountsContext } from "../accounts/AccountsContext";
import { Account } from "../accounts/types";
import { List } from "../components/List";
import { SignMessageModal } from "../modals/SignMessageModal";
import { TransferAmountModal } from "../modals/TransferAmountModal";

export const AccountsPage = () => {
  const { accounts, fetchPolkadotAccounts } = useContext(AccountsContext);
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

  const onSignMessage = useCallback((account: Account) => () => {
    setCurrentAccount(account);
    setSignMessageIsVisible(true);
  }, []);

  const onCloseSignMessage = useCallback(() => {
    setCurrentAccount(undefined);
    setSignMessageIsVisible(false);
  }, []);

  return <div className="page">
    <div className="top-bar">
      <button onClick={fetchPolkadotAccounts}>Connect Polkadot Wallet</button>
    </div>
    <List>
      {accountsArray.map(account => {
        return <List.Item key={account.address}>
            <span>{account.signerType}</span>
            <span>{account.name}</span>
            <span>{account.address}</span>
            <span>{account.balance?.toFixed(2) || '0'}</span>
              <button onClick={onSend(account)}>Send amount</button>
              <button onClick={onSignMessage(account)}>Sign message</button>
        </List.Item>
      })}
    </List>
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
