import { useEffect, useState } from "react";
import styled from "styled-components";
import { web3Enable } from "@polkadot/extension-dapp";
import PolkadotJsIcon from "../../static/icons/polkadot-wallet.svg";
import TalismanIcon from "../../static/icons/talisman-wallet.svg";
import SubWalletIcon from "../../static/icons/subwallet.svg";
import EnkriptIcon from "../../static/icons/enkrypt.svg";
import { ConnectedWalletsName } from "../../accounts/useWalletCenter";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/UI/Icon";
import { useAccountsContext } from "../../accounts/AccountsContext";

const extensionSourceLinks: Record<ConnectedWalletsName, string> = {
  "polkadot-js": "https://polkadot.js.org/extension/",
  "subwallet-js": "https://www.subwallet.app/download.html",
  talisman: "https://www.talisman.xyz/",
  metamask: "https://metamask.io/download/",
  novawallet: "https://novawallet.io",
  enkrypt: "https://www.enkrypt.com",
  keyring: "",
};

const walletOptions: {
  name: ConnectedWalletsName;
  icon: string;
  label: string;
}[] = [
  { name: "polkadot-js", icon: PolkadotJsIcon, label: "Polkadot.js" },
  { name: "talisman", icon: TalismanIcon, label: "Talisman" },
  { name: "subwallet-js", icon: SubWalletIcon, label: "SubWallet" },
  { name: "enkrypt", icon: EnkriptIcon, label: "Enkrypt" },
];

export const ConnectWallets = ({
  isOpenConnectWalletModal,
  setIsOpenConnectWalletModal,
}: {
  isOpenConnectWalletModal: boolean;
  setIsOpenConnectWalletModal: (e: boolean) => void;
}) => {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const { setPolkadotAccountsWithBalance } = useAccountsContext();

  const handleConnectToPolkadotExtension =
    (walletName: ConnectedWalletsName) => async () => {
      try {
        await setPolkadotAccountsWithBalance(walletName);
      } finally {
        setIsOpenConnectWalletModal(false);
      }
    };

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const extensions = await web3Enable("Account React Example");
      setAvailableWallets(extensions.map((ext) => ext.name));
      setIsFetching(false);
    })();
  }, []);

  const goToInstallExtension = (walletName: ConnectedWalletsName) => {
    const url = extensionSourceLinks[walletName];
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <ModalWrapper>
      <Modal
        isVisible={isOpenConnectWalletModal}
        onClose={() => setIsOpenConnectWalletModal(false)}
        isClosable
      >
        <WalletListWrap>
        <ModalHeader>Connect wallet</ModalHeader>
        <ModalParagraph>Choose available polkadot extension</ModalParagraph>
        <Wallets>
          {walletOptions.map((wallet) =>
            availableWallets.includes(wallet.name) ? (
              <WalletItem
                key={wallet.name}
                onClick={handleConnectToPolkadotExtension(wallet.name)}
              >
                <Icon size={40} file={wallet.icon} />{" "}
                <span>{wallet.label}</span>
              </WalletItem>
            ) : (
              <WalletItem
                key={wallet.name}
                onClick={() => goToInstallExtension(wallet.name)}
              >
                <Icon size={40} file={wallet.icon} />{" "}
                <span>Install {wallet.label}</span>
              </WalletItem>
            )
          )}
        </Wallets>
        </WalletListWrap>
      </Modal>
    </ModalWrapper>
  );
};

const ModalWrapper = styled.div`
  .unique-modal {
    width: 360px;
    border-radius: 12px;
    background-color: color-mix(in srgb, #fff 0%, #121313);
  }

  .close-button {
    fill: white;
    top: 10px !important;
    right: 10px !important;
  }
`;

const ModalHeader = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
`;

const ModalParagraph = styled.p`
  font-size: 16px;
  color: #b0b0b0;
  line-height: 1.6;
`;

const WalletListWrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;

const Wallets = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
`;

const WalletItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #2c2c2c;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #383838;
  }

  span {
    margin-left: 15px;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
  }

  svg,
  img {
    width: 40px;
    height: 40px;
  }
`;
