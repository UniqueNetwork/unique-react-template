import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { web3Enable } from '@polkadot/extension-dapp';
import SubWalletIcon from '../../static/icons/subwallet.svg';
import EnkriptIcon from '../../static/icons/enkrypt.svg';
import useDeviceSize, { DeviceSize } from '../../hooks/useDeviceSize';
import { ConnectedWalletsName } from '../../accounts/useWalletCenter';
import { Modal } from '../../components/Modal';
import { Icon } from '../../components/UI/Icon';
import { ExtensionMissingModal } from './ExtensionMissing';
import { AccountsContext } from '../../accounts/AccountsContext';

enum AccountModal {
  EXTENSION_MISSING = 'extensionMissing',
}

export const ConnectWallets = ({ isOpenConnectWalletModal, setIsOpenConnectWalletModal }: { isOpenConnectWalletModal: boolean, setIsOpenConnectWalletModal: (e: boolean) => void }) => {
  const [currentModal, setCurrentModal] = useState<AccountModal | undefined>();
  const [missingExtension, setMissingExtension] = useState<ConnectedWalletsName>();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const { setPolkadotAccountsWithBalance } = useContext(AccountsContext);

  const handleConnectToPolkadotExtension = (walletName: ConnectedWalletsName = 'polkadot-js') => async () => {
    try {
      await setPolkadotAccountsWithBalance(walletName);
    } catch (e: any) {
      setCurrentModal(AccountModal.EXTENSION_MISSING);
    } finally {
      setIsOpenConnectWalletModal(false);
    }
  };

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const extensions = await web3Enable('Account React Example');
      setAvailableWallets(extensions.map(ext => ext.name));
      setIsFetching(false);
    })();
  }, []);

  const noAvailableWallets = availableWallets.length === 0;

  return (
    <ModalWrapper>
      <Modal
        isVisible={isOpenConnectWalletModal}
        onClose={() => setIsOpenConnectWalletModal(false)}
        isClosable
      >
        <ModalHeader>Connect wallet</ModalHeader>
        <ModalParagraph>Choose available polkadot extension</ModalParagraph>
        <Wallets>
          {availableWallets.includes('polkadot-js') && <WalletItem onClick={handleConnectToPolkadotExtension()}>
            <Icon size={40} name='polkadot-wallet' /> <span>Polkadot.js</span>
          </WalletItem>}
          {availableWallets.includes('talisman') && <WalletItem onClick={handleConnectToPolkadotExtension('talisman')}>
            <Icon size={40} name='talisman-wallet' /> <span>Talisman</span>
          </WalletItem>}
          {(availableWallets.includes('subwallet-js') || noAvailableWallets) && <WalletItem
            onClick={handleConnectToPolkadotExtension('subwallet-js')}
          >
            <Icon file={SubWalletIcon} size={40} />
            <span>SubWallet</span>
          </WalletItem>}
          {availableWallets.includes('enkrypt') && <WalletItem
            onClick={handleConnectToPolkadotExtension('enkrypt')}
          >
            <Icon file={EnkriptIcon} size={40} />
            <span>Enkrypt</span>
          </WalletItem>}
        </Wallets>
      </Modal>
      <ExtensionMissingModal
        isVisible={currentModal === AccountModal.EXTENSION_MISSING}
        missingExtension={missingExtension}
        onFinish={() => setCurrentModal(undefined)}
      />
    </ModalWrapper>
  );
};

const ModalWrapper = styled.div`
  .unique-modal {
    width: 360px;
    border-radius: 34px;
    background-color: color-mix( in srgb, #fff 0%, #121313 );
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

  svg, img {
    width: 40px;
    height: 40px;
  }
`;
