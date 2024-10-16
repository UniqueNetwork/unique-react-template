import { useCallback, useContext, useState } from "react";
import { AccountsContext } from "../accounts/AccountsContext";
import { Account } from "../accounts/types";
import { List } from "../components/List";
import { TransferAmountModal } from "../modals/TransferAmountModal";
import styled from "styled-components";
import { NavLink } from "react-router-dom";

export const AccountsPage = () => {
  const { accounts } = useContext(AccountsContext);
  const accountsArray = Array.from(accounts.values());
  const [currentAccount, setCurrentAccount] = useState<Account>();
  const [transferAmountIsVisible, setTransferAmountIsVisible] = useState(false);
  
  const onSend = useCallback(
    (account: Account) => () => {
      setCurrentAccount(account);
      setTransferAmountIsVisible(true);
    },
    []
  );

  const onCloseTransferAmount = useCallback(() => {
    setCurrentAccount(undefined);
    setTransferAmountIsVisible(false);
  }, []);

  return (
    <div className="page">
      <List>
        {accountsArray.map((account, index) => {
          return (
            <List.Item key={account.address}>
              <span>{account.signerType}</span>
              <span>{account.name}</span>
              <span>{account.address}</span>
              <span>{account.balance?.toFixed(2) || "0"} {process.env.REACT_APP_CHAIN_NATIVE_CURRENCY_SYMBOL}</span>
              <Button onClick={onSend(account)}>Send amount</Button>
              <ButtonLink to={`/account/${account.address}`}>
                Account data
              </ButtonLink>
            </List.Item>
          );
        })}
      </List>

      <TransferAmountModal
        isVisible={transferAmountIsVisible}
        sender={currentAccount}
        onClose={onCloseTransferAmount}
      />
    </div>
  );
};

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  background-color: #007bff;
  font-size: 16px;

  &:hover {
    opacity: 0.8;
  }
`;

const ButtonLink = styled(NavLink)`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  background-color: #007bff;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }
`;
