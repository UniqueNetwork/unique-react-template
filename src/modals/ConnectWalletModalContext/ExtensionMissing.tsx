import styled from 'styled-components';
import smile from '../../static/images/hmm.png';
import { ConnectedWalletsName } from '../../accounts/useWalletCenter';
import { Modal } from '../../components/Modal';

type Props = {
  isVisible?: boolean;
  onFinish?: () => void;
  missingExtension?: ConnectedWalletsName;
};

const extensionSourceLinks: Record<ConnectedWalletsName, string> = {
  'polkadot-js': 'https://polkadot.js.org/extension/',
  'subwallet-js': 'https://www.subwallet.app/download.html',
  talisman: 'https://www.talisman.xyz/',
  metamask: 'https://metamask.io/download/',
  novawallet: 'https://novawallet.io',
  enkrypt: 'https://www.enkrypt.com',
  keyring: ''
};

export const ExtensionMissingModal = ({
  isVisible,
  onFinish,
  missingExtension
}: Props) => {
  if (!missingExtension) {
    return null;
  }
  return (
    <Modal
      isVisible={!!isVisible}
      isClosable
      onClose={() => {
        onFinish?.();
      }}
    >
      <ModalContent>
        <SmileImg src={smile} alt='something wrong'></SmileImg>
        {/* <Text color='grey-500'> */}
          {missingExtension} extension is not installed or disabled. Please{' '}
          {/* <Link href={extensionSourceLinks[missingExtension]} target='_blank'>
            install
          </Link>{' '} */}
          it or activate in your browser settings.
        {/* </Text> */}
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: calc(var(--prop-gap) * 1.5);
  padding: 0 calc(var(--prop-gap) * 1.5) calc(var(--prop-gap) * 2);
  .unique-text {
    text-align: center;
  }
  .unique-link.primary {
    font-size: 16px;
  }
`;

const SmileImg = styled.img`
  height: 80px;
  width: 80px;
`;
