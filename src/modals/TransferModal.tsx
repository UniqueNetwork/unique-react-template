import { ChangeEvent, useContext, useState } from "react";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { useParams } from "react-router-dom";
import { baseUrl } from "../sdk/SdkContext";
import { AccountsContext } from "../accounts/AccountsContext";
import { SignerTypeEnum } from "../accounts/types";
import { Address } from "@unique-nft/utils";
import { useUniqueNFTFactory } from "../hooks/useUniqueNFTFactory";
import { ContentWrapper } from "./NestModal";

type TransferModalProps = {
  isVisible: boolean;
  onClose(): void;
};

export const TransferModal = ({
  isVisible,
  onClose,
}: TransferModalProps) => {
  const { selectedAccount } = useContext(AccountsContext);
  const [receiver, setReceiver] = useState<string>("");
  const { collectionId } = useParams<{ collectionId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getUniqueNFTFactory } = useUniqueNFTFactory(collectionId);

  const onMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReceiver(e.target.value);
  };

  const onSign = async () => {
    if (!receiver || !selectedAccount || !collectionId) {
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

        const toCross = Address.extract.ethCrossAccountId(receiver.trim());

        await (
          await collection.changeCollectionOwnerCross(toCross)
        ).wait();
      } else {
        //@ts-ignore
        const sdk = await connectSdk(baseUrl, selectedAccount);

        await sdk?.collection.transferCollection(
          {
            to: receiver.trim(),
            collectionId: +collectionId,
          },
          undefined,
          selectedAccount
        );
      }

      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      console.error("Transfer failed:", error);
      setErrorMessage("An error occurred during the transfer. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose} isFlexible={true}>
      <ContentWrapper>
        <h3>Transfer Collection</h3>
        <div className="form-item">
          <input
            type="text"
            placeholder="Enter address to transfer"
            value={receiver}
            onChange={onMessageChange}
          />
        </div>

        {errorMessage && (
          <div className="form-item">
            <div className="error-message">{errorMessage}</div>
          </div>
        )}

        {isLoading && (
          <div className="form-item">
            <div>Transferring...</div>
          </div>
        )}
        <div className="form-item">
          <button onClick={onSign} disabled={isLoading}>
            Sign
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </ContentWrapper>
    </Modal>
  );
};
