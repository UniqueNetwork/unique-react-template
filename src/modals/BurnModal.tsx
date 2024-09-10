import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountsContext } from "../accounts/AccountsContext";
import { Account, SignerTypeEnum } from "../accounts/types";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { baseUrl } from "../sdk/SdkContext";
import { useUniqueNFTFactory } from "../hooks/useUniqueNFTFactory";
import { Button, ButtonWrapper, Loading } from "./UnnestModal";

type BurnModalProps = {
  isVisible: boolean;
  account?: Account;
  onClose(): void;
};

export const BurnModal = ({ isVisible, onClose }: BurnModalProps) => {
  const { selectedAccount } = useContext(AccountsContext);
  const { tokenId, collectionId } = useParams<{
    tokenId: string;
    collectionId: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { getUniqueNFTFactory } = useUniqueNFTFactory(collectionId);

  const onSign = async () => {
    if (!selectedAccount || !collectionId || !tokenId) {
      setErrorMessage("All fields must be filled out.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (selectedAccount.signerType === SignerTypeEnum.Ethereum) {
        const collection = await getUniqueNFTFactory();
        if (!collection) {
          throw new Error("Failed to initialize the collection helper.");
        }

        await (await collection.burn(tokenId)).wait();
      } else {
        const sdk = await connectSdk(baseUrl, selectedAccount);
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
