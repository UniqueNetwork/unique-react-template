import { ChangeEvent, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountsContext } from "../accounts/AccountsContext";
import { Account, SignerTypeEnum } from "../accounts/types";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { baseUrl } from "../sdk/SdkContext";
import { Address } from "@unique-nft/utils";
import { useUniqueNFTFactory } from "../hooks/useUniqueNFTFactory";
import { ContentWrapper } from "./NestModal";

type SignMessageModalProps = {
  isVisible: boolean;
  account?: Account;
  onClose(): void;
};

export const TransferNFTModal = ({
  isVisible,
  onClose,
}: SignMessageModalProps) => {
  const { selectedAccount } = useContext(AccountsContext);
  const { tokenId, collectionId } = useParams<{
    tokenId: string;
    collectionId: string;
  }>();
  const [receiver, setReceiver] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReceiver(e.target.value);
  };

  const { getUniqueNFTFactory } = useUniqueNFTFactory(collectionId);

  const onSign = async () => {
    if (!receiver || !selectedAccount || !collectionId || !tokenId) {
      setErrorMessage("All fields must be filled out.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (selectedAccount.signerType === SignerTypeEnum.Ethereum) {
        const collection = await getUniqueNFTFactory();
        if (!collection) {
          setErrorMessage("Failed to initialize NFT collection.");
          setIsLoading(false);
          return;
        }

        const fromCross = Address.extract.ethCrossAccountId(
          selectedAccount.address
        );
        const toCross = Address.extract.ethCrossAccountId(receiver.trim());
        await (
          await collection.transferFromCross(fromCross, toCross, +tokenId)
        ).wait();
      } else {
        //@ts-ignore
        const sdk = await connectSdk(baseUrl, selectedAccount);
        await sdk.token.transfer({
          to: receiver.trim(),
          collectionId,
          tokenId: +tokenId,
        });
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
    <Modal isVisible={isVisible} onClose={onClose}>
      <ContentWrapper>
        <h3>Transfer NFT</h3>
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
            Transfer
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </ContentWrapper>
    </Modal>
  );
};
