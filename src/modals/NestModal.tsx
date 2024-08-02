import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountsContext } from "../accounts/AccountsContext";
import { Account } from "../accounts/types";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { baseUrl } from "../sdk/SdkContext";

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

  const onSign = async () => {
    if (!selectedAccount || !collectionId || !tokenId) return;
    setIsLoading(true);

    try {
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

      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      console.error("Transfer failed:", error);
      setIsLoading(false);
      alert(error);
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
