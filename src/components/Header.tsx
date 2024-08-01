// Header.js
import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const Button = styled(NavLink)`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
	background-color: #f0ad4e;
	text-decoration: none;

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

export const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <ConnectedAccountsButton to="/">Connected accounts</ConnectedAccountsButton>
      <ButtonsWrapper>
        <Button to="/account/5CtN6sPY3WLKQT2nHejpKmfw6paqRGWYgRbngGpiYZimU9Cu">Test account</Button>
				<Button to="/collection/3128">Test Collection</Button>
				
        <Button to="/token/3128/3">Test NFT</Button>
      </ButtonsWrapper>
    </HeaderContainer>
  );
};

