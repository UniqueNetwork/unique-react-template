import { ChangeEvent, useContext, useEffect, useState } from "react";
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
  const onMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReceiver(e.target.value);
  };

  useEffect(
    () => console.log(selectedAccount, "selectedAccount"),
    [selectedAccount]
  );
  const onSign = async () => {
    if (!receiver || !selectedAccount || !collectionId || !tokenId) return;
    setIsLoading(true);

    try {
      //@ts-ignore
      const sdk = await connectSdk(baseUrl, selectedAccount);

      await sdk.token.transfer({
        to: receiver.trim(),
        collectionId,
        tokenId: +tokenId,
      });

      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      console.error("Transfer failed:", error);
      setIsLoading(false);
      alert("An error occurred during the transfer. Please try again.");
    }
  };

  return (
    <Modal title="Transfer NFT" isVisible={isVisible} onClose={onClose}>
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
          Transfer
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};
