import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountsContext } from "../accounts/AccountsContext";
import { Account } from "../accounts/types";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";

type SignMessageModalProps = {
  isVisible: boolean;
  account?: Account;
  onClose(): void;
};

export const UnnestTModal = ({ isVisible, onClose }: SignMessageModalProps) => {
  const { selectedAccount, selectedAccountId } = useContext(AccountsContext);

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
      const sdk = await connectSdk(process.env.REACT_APP_REST_URL, account);

      // await sdk?.token.unnest({
      //   parent: {
      //     collectionId: collectionParentId,
      //     tokenId: +tokenParentId,
      //   },
      //   nested: {
      //     collectionId,
      //     tokenId: +tokenId,
      //   },
      // });

      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      console.error("Transfer failed:", error);
      setIsLoading(false);
      alert(error);
    }
  };

  return (
    <Modal
      title="Confirm unnest this token"
      isVisible={isVisible}
      onClose={onClose}
    >
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
