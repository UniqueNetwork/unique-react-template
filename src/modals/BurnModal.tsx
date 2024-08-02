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

export const BurnModal = ({ isVisible, onClose }: SignMessageModalProps) => {
  const { selectedAccount } = useContext(AccountsContext);
  const { tokenId, collectionId } = useParams<{
    tokenId: string;
    collectionId: string;
  }>();
  const [receiver, setReceiver] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const onSign = async () => {
    if (!selectedAccount || !collectionId || !tokenId) return;
    setIsLoading(true);

    try {
      //@ts-ignore
      const sdk = await connectSdk(baseUrl, selectedAccount);

      await sdk.token.burn({
        collectionId,
        tokenId: +tokenId,
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
    <Modal title="Burn token" isVisible={isVisible} onClose={onClose}>
      {isLoading && (
        <div className="form-item">
          <div>Burn in progress...</div>
        </div>
      )}
      <div className="form-item">
        <button onClick={onSign} disabled={isLoading}>
          Burn
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};
