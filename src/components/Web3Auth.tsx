import React, { useContext } from 'react';
import styled from 'styled-components';
import { AccountsContext } from '../accounts/AccountsContext';

const Web3AuthConnect: React.FC = () => {
  const { loginWithWeb3Auth } = useContext(AccountsContext);

  return (
    <ButtonConnect onClick={loginWithWeb3Auth}>
      Login with Web3Auth
    </ButtonConnect>
  );
};

export default Web3AuthConnect;

const ButtonConnect = styled.button`
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

