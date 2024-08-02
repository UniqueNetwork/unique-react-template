import { ChangeEvent, useContext, useState } from "react";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { useParams } from "react-router-dom";
import { baseUrl } from "../sdk/SdkContext";
import { AccountsContext } from "../accounts/AccountsContext";

type SignMessageModalProps = {
  isVisible: boolean;
  onClose(): void;
};

export const TransferModal = ({
  isVisible,
  onClose,
}: SignMessageModalProps) => {
  const { selectedAccount } = useContext(AccountsContext);
  const [receiver, setReceiver] = useState<string>("");
  const { collectionId } = useParams<{ collectionId: string }>();
  const [isLoading, setIsLoading] = useState(false);

  const onMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReceiver(e.target.value);
  };

  const onSign = async () => {
    if (!receiver || !selectedAccount || !collectionId) return;
    setIsLoading(true);
    try {
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

      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      console.error("Transfer failed:", error);
      setIsLoading(false);
      alert(error);
    }
  };

  return (
    <Modal title="Transfer Collection" isVisible={isVisible} onClose={onClose}>
      <div className="form-item">
        <input
          type="text"
          placeholder="Enter address to transfer"
          value={receiver}
          onChange={onMessageChange}
        />
      </div>

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
    </Modal>
  );
};
