import React, { useContext, useState, useEffect, useRef, ChangeEvent } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { AccountsContext } from "../accounts/AccountsContext";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ConnectWallets } from "../modals/ConnectWalletModalContext/ConnectWallets";
import { truncateMiddle } from "../utils/common";
import { disableElementInShadowDom } from "../utils/disableShadowDomButton";
import { Modal } from "../components/Modal";
import { SearchForm } from "./SearchForm/SearchForm";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import Web3AuthConnect from "./Web3Auth";

const Button = styled(NavLink)`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  background-color: #f0ad4e;
  text-decoration: none;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    opacity: 0.8;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 30px;

  @media (min-width: 940px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  @media (min-width: 1400px) {
    padding: 30px 0;
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 10px;
  min-width: 620px;
`;

const AccountSelectorWrapper = styled.div`
  position: relative;
  display: inline-block;
  margin: 0;
  margin-right: auto;
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
  min-width: 400px;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    opacity: 0.8;
  }
`;

const ButtonBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 30px;
`;

const ButtonBlockHeader = styled.div`
  font-size: 16px;
  font-weight: 600;
  padding: 8px 0;
`;

const StyledModalContent = styled.div`
  background-color: #1f1f1f;
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;

  h3 {
    margin-bottom: 20px;
    font-size: 24px;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  background-color: #2c2c2c;
  border: 1px solid #3a3a3a;
  color: #fff;
  font-size: 16px;
  box-sizing: border-box;
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const StyledButton = styled.button`
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
  }
`;

const StyledError = styled.p`
  color: #ff4d4d;
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 15px;
`;

const StyledLoading = styled.p`
  color: #fff;
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 15px;
`;

const HeaderWrapper = styled.div`
  .unique-modal {
    padding: 0;
  }
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  background-color: #007bff;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    opacity: 0.8;
  }
`;

const SearchFormWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const SearchFormAbsolute = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  z-index: 100;
  background: white;
  padding: 13px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

export const Header: React.FC = () => {
  const {
    accounts,
    setSelectedAccountId,
    selectedAccountId,
    selectedAccount,
    loginWithMagicLink,
    magic,
    setWeb3Auth,
    setProviderWeb3Auth,
  } = useContext(AccountsContext);
  const accountsArray = Array.from(accounts.values());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { open } = useWeb3Modal();
  const [isOpenChoseWalletModal, setIsOpenChoseWalletModal] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchFormVisible, setIsSearchFormVisible] = useState(false);
  const searchFormRef = useRef<HTMLDivElement | null>(null);

  const handlePolkadotClick = () => {
    setIsDropdownOpen(false);
    setIsOpenChoseWalletModal(true);
  };

  const handleWalletConnectClick = () => {
    setIsDropdownOpen(false);
    open();
    const timeoutId = setTimeout(() => {
      const modalElement = document.querySelector("w3m-modal");
      if (modalElement) {
        disableElementInShadowDom(modalElement, "wui-profile-button-v2", "copy-address");
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  };

  const handleMagicLinkClick = () => {
    setIsDropdownOpen(false);
    setIsEmailModalOpen(true);
  };

  const handleLogin = async () => {
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      if (!magic) throw Error("Magic instance not found");
      setIsLoading(true);
      setErrorMessage(null);
      await loginWithMagicLink(email);
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const onAccountSelect = (accountId: number) => {
    setSelectedAccountId(accountId);
    setIsDropdownOpen(false);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrorMessage(null);
  };

  const toggleSearchFormVisibility = () => {
    setIsSearchFormVisible((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (
        searchFormRef.current &&
        !searchFormRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".search-button")
      ) {
        setIsSearchFormVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x22B2",
          rpcTarget: process.env.REACT_APP_CHAIN_RPC_URL || '',
          displayName: process.env.REACT_APP_CHAIN_NAME || '',
          ticker: process.env.REACT_APP_CHAIN_NATIVE_CURRENCY_SYMBOL,
          tickerName: process.env.REACT_APP_CHAIN_NATIVE_CURRENCY_NAME,
        };

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig }
        });

        const web3AuthInstance = new Web3Auth({
          clientId: process.env.REACT_APP_WEB_3_AUTH_CLIENT_ID || '',
          web3AuthNetwork: "sapphire_devnet",
          chainConfig,
          privateKeyProvider,
        });

        setWeb3Auth(web3AuthInstance);
        await web3AuthInstance.initModal();

        if (web3AuthInstance.provider) {
          setProviderWeb3Auth(web3AuthInstance.provider);
        }

      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      }
    };

    initWeb3Auth();
  }, []);

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <AccountSelectorWrapper>
          <ConnectedAccountsButton onClick={toggleDropdown}>
            {selectedAccount ? truncateMiddle(selectedAccount.address, 22) : "Connect Account"}
          </ConnectedAccountsButton>
          {isDropdownOpen && (
            <AccountDropdown ref={dropdownRef}>
              {accountsArray.map((account, index) => (
                <AccountItem
                  key={account.address}
                  onClick={() => onAccountSelect(index)}
                  style={{
                    backgroundColor: index === selectedAccountId ? "#f0f0f0" : "white",
                  }}
                >
                  <span>
                    {account.name} ({account.address})
                  </span>
                </AccountItem>
              ))}
              <ButtonBlock>
                <ButtonBlockHeader>Connect new accounts: </ButtonBlockHeader>
                <ButtonConnect onClick={handlePolkadotClick}>POLKADOT Wallets</ButtonConnect>
                <ButtonConnect onClick={handleWalletConnectClick}>
                  ETHEREUM Wallets Wallet Connect
                </ButtonConnect>
                <ButtonConnect onClick={handleMagicLinkClick}>
                  ETHEREUM Wallets Magic link
                </ButtonConnect>
                <Web3AuthConnect />
              </ButtonBlock>
              <NavLinkWrapper onClick={() => setIsDropdownOpen(false)}>
                <NavLink to="/">Go to Accounts Page</NavLink>
              </NavLinkWrapper>
            </AccountDropdown>
          )}
        </AccountSelectorWrapper>
        <ButtonsWrapper>
          <Button to="/evm-test" onClick={() => setIsDropdownOpen(false)}>
            EVM Test
          </Button>
          <Button
            to="/account/5CMgqJntEgV87wpXsDKTGii2BdcndDqnsNMVNxDsHmiTybGg"
            onClick={() => setIsDropdownOpen(false)}
          >
            Test account
          </Button>
          <Button to="/collection/4091" onClick={() => setIsDropdownOpen(false)}>
            Test Collection
          </Button>
          <Button to="/token/4091/3" onClick={() => setIsDropdownOpen(false)}>
            Test NFT
          </Button>
          <SearchFormWrap>
            <SearchButton className="search-button" onClick={toggleSearchFormVisibility}>
              Search
            </SearchButton>
            {isSearchFormVisible && (
              <SearchFormAbsolute ref={searchFormRef}>
                <SearchForm />
              </SearchFormAbsolute>
            )}
          </SearchFormWrap>
        </ButtonsWrapper>
      </HeaderContainer>
      <ConnectWallets
        isOpenConnectWalletModal={isOpenChoseWalletModal}
        setIsOpenConnectWalletModal={(e) => setIsOpenChoseWalletModal(e)}
      />
      <Modal isVisible={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} isFlexible={true}>
        <StyledModalContent>
          <h3>Sign in with Magic Link</h3>
          <StyledInput
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
          />
          {errorMessage && <StyledError>{errorMessage}</StyledError>}
          {isLoading && <StyledLoading>Loading...</StyledLoading>}
          <StyledActions>
            <StyledButton onClick={handleLogin} disabled={isLoading}>
              Login
            </StyledButton>
            <StyledButton onClick={() => setIsEmailModalOpen(false)}>Cancel</StyledButton>
          </StyledActions>
        </StyledModalContent>
      </Modal>
    </HeaderWrapper>
  );
};