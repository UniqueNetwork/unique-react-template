import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { AccountsContext } from "../accounts/AccountsContext";

const Button = styled(NavLink)`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  background-color: #f0ad4e;
  text-decoration: none;
  font-size: 16px;

  &:hover {
    opacity: 0.8;
  }
`;

const ConnectedAccountsButton = styled(Button)`
  background-color: #007bff;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 30px;
  width: 90vw;
  max-width: 1260px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Header: React.FC = () => {
  const { fetchPolkadotAccounts } = useContext(AccountsContext);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await sleep(1000);
      await fetchPolkadotAccounts();
      setHasFetched(true);
    };

    if (!hasFetched) {
      fetchData();
    }
  }, [fetchPolkadotAccounts, hasFetched]);

  return (
    <HeaderContainer>
      <ConnectedAccountsButton to="/">
        Connected accounts
      </ConnectedAccountsButton>
      <ButtonsWrapper>
        <Button to="/account/5CtN6sPY3WLKQT2nHejpKmfw6paqRGWYgRbngGpiYZimU9Cu">
          Test account
        </Button>
        <Button to="/collection/665">Test Collection</Button>
        <Button to="/token/665/14">Test NFT</Button>
      </ButtonsWrapper>
    </HeaderContainer>
  );
};
