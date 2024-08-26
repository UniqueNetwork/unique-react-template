import React, { useContext, useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { AccountsContext } from "../accounts/AccountsContext";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ConnectWallets } from "../modals/ConnectWalletModalContext/ConnectWallets";

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

const ConnectedAccountsButton = styled.button`
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

const AccountSelectorWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const AccountDropdown = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 10px;
  min-width: 200px;
`;

const AccountItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const NavLinkWrapper = styled.div`
  margin-top: 20px;
`;

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

const ButtonBlock = styled.div`
  display: flex;
  gap: 10px;
  padding: 0 30px;
`;

export const Header: React.FC = () => {
  const { accounts, setSelectedAccountId, selectedAccountId } =
    useContext(AccountsContext);
  const accountsArray = Array.from(accounts.values());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { open } = useWeb3Modal();
  const [isOpenChoseWalletModal, setIsOpenChoseWalletModal] = useState(false);

  const handlePolkadotClick = () => {
    setIsDropdownOpen(false);
    setIsOpenChoseWalletModal(true);
  };

  const handleWalletConnectClick = () => {
    setIsDropdownOpen(false);
    open();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const onAccountSelect = (accountId: number) => {
    setSelectedAccountId(accountId);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <HeaderContainer>
      <AccountSelectorWrapper>
        <ConnectedAccountsButton onClick={toggleDropdown}>
          Connected account
        </ConnectedAccountsButton>
        {isDropdownOpen && (
          <AccountDropdown ref={dropdownRef}>
            {accountsArray.map((account, index) => (
              <AccountItem
                key={account.address}
                onClick={() => onAccountSelect(index)}
                style={{
                  backgroundColor:
                    index === selectedAccountId ? "#f0f0f0" : "white",
                }}
              >
                <span>
                  {account.name} ({account.address})
                </span>
              </AccountItem>
            ))}

            <ButtonBlock>
              <ButtonConnect onClick={handlePolkadotClick}>
                POLKADOT Wallets
              </ButtonConnect>
              <ButtonConnect onClick={handleWalletConnectClick}>
                ETHEREUM Wallets
              </ButtonConnect>
            </ButtonBlock>
            <NavLinkWrapper>
              <NavLink to="/">Go to Accounts Page</NavLink>
            </NavLinkWrapper>
          </AccountDropdown>
        )}
      </AccountSelectorWrapper>
      <ButtonsWrapper>
        <Button to="/account/5CtN6sPY3WLKQT2nHejpKmfw6paqRGWYgRbngGpiYZimU9Cu">
          Test account
        </Button>
        <Button to="/collection/665">Test Collection</Button>
        <Button to="/token/665/14">Test NFT</Button>
      </ButtonsWrapper>

      <ConnectWallets
        isOpenConnectWalletModal={isOpenChoseWalletModal}
        setIsOpenConnectWalletModal={(e) => setIsOpenChoseWalletModal(e)}
      />
    </HeaderContainer>
  );
};
