import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountsContext } from "../accounts/AccountsContext";
import { Account, SignerTypeEnum } from "../accounts/types";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { baseUrl } from "../sdk/SdkContext";
import { Address } from "@unique-nft/utils";
import { useUniqueNFTFactory } from "../hooks/useUniqueNFTFactory";

type SignMessageModalProps = {
  isVisible: boolean;
  account?: Account;
  onClose(): void;
};

export const NestTModal = ({ isVisible, onClose }: SignMessageModalProps) => {
  const { selectedAccount } = useContext(AccountsContext);
  const { tokenId, collectionId } = useParams<{
    tokenId: string;
    collectionId: string;
  }>();
  const [tokenParentId, setTokenParentId] = useState<string>("");
  const [collectionParentId, setCollectionParentId] = useState<string>("");
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

        const newParentTokenAddress = Address.nesting.idsToAddress(
          +collectionParentId,
          +tokenParentId
        );
        const fromCross = Address.extract.ethCrossAccountId(
          selectedAccount.address
        );

        await (
          await collection.transferFrom(
            fromCross.eth,
            newParentTokenAddress,
            +tokenId
          )
        ).wait();
      } else {
        //@ts-ignore
        const sdk = await connectSdk(baseUrl, selectedAccount);

        await sdk?.token.nest({
          parent: {
            collectionId: +collectionParentId,
            tokenId: +tokenParentId,
          },
          nested: {
            collectionId: +collectionId,
            tokenId: +tokenId,
          },
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
    <Modal title="Nest token" isVisible={isVisible} onClose={onClose}>
      <div className="form-item">
        <input
          type="text"
          placeholder="Enter parent collection Id"
          value={collectionParentId}
          onChange={(e) => setCollectionParentId(e.target.value)}
        />
      </div>
      <div className="form-item">
        <input
          type="text"
          placeholder="Enter parent token Id"
          value={tokenParentId}
          onChange={(e) => setTokenParentId(e.target.value)}
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
          Submit
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};
