import { useState } from "react";
import { useParams } from "react-router-dom";
import { Account, SignerTypeEnum } from "../accounts/types";
import { Modal } from "../components/Modal";
import { useUniqueNFTFactory } from "../hooks/useUniqueNFTFactory";
import { Button, ButtonWrapper, Loading } from "./UnnestModal";
import { switchNetwork } from "../utils/swithChain";
import { getCollection } from "../utils/getCollection";
import { useAccountsContext } from "../accounts/AccountsContext";
import { useSdkContext } from "../sdk/SdkContext";

type BurnModalProps = {
  isVisible: boolean;
  account?: Account;
  onClose(): void;
};

export const BurnModal = ({ isVisible, onClose }: BurnModalProps) => {
  const { selectedAccount, magic, providerWeb3Auth } = useAccountsContext();
  const { sdk } = useSdkContext();
  const { tokenId, collectionId } = useParams<{
    tokenId: string;
    collectionId: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { getUniqueNFTFactory } = useUniqueNFTFactory(collectionId);

  const onSign = async () => {
    if (!sdk || !selectedAccount || !collectionId || !tokenId) {
      setErrorMessage("All fields must be filled out.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (selectedAccount.signerType === SignerTypeEnum.Ethereum) {
        await switchNetwork();
        const collection = await getUniqueNFTFactory();
        if (!collection) {
          throw new Error("Failed to initialize the collection helper.");
        }
        await (await collection.burn(tokenId)).wait();
      } else if (selectedAccount.signerType === SignerTypeEnum.Magiclink) {
        if (!magic) throw Error('No Magic')
        const collection = await getCollection(magic.rpcProvider, collectionId);
        await (await collection.burn(tokenId)).wait();
      } else if (selectedAccount.signerType === SignerTypeEnum.Web3Auth) {
        if (!providerWeb3Auth) throw Error('No Web3Auth provider')
        const collection = await getCollection(providerWeb3Auth, collectionId);
        await (await collection.burn(tokenId)).wait();
      } else {
        await sdk.token.burn({
          collectionId,
          tokenId: +tokenId,
        });
      }

      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      console.error("Burn failed:", error);
      setErrorMessage("An error occurred during the burn process. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose} isFlexible={true}>
      <h3>Burn token</h3>
      {errorMessage && (
        <div className="form-item">
          <div className="error-message">{errorMessage}</div>
        </div>
      )}

      {isLoading && <Loading>Processing...</Loading>}
      <ButtonWrapper>
        <Button onClick={onSign} disabled={isLoading}>
          Submit
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </ButtonWrapper>
    </Modal>
  );
};
