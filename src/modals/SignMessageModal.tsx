import { SignerResult } from "@unique-nft/utils/extension";
import { ChangeEvent, useState } from "react";
import { Account } from "../accounts/types";
import { Modal } from "../components/Modal";
import { ContentWrapper } from "./NestModal";

type SignMessageModalProps = {
  isVisible: boolean;
  account?: Account;
  onClose(): void;
};

export const SignMessageModal = ({
  isVisible,
  account,
  onClose,
}: SignMessageModalProps) => {
  const [message, setMessage] = useState<string>();
  const [result, setResult] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const onMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const onSign = async () => {
    if (!message || !account) return;
    setIsLoading(true);

    const result = (await account.signer.signMessage?.(
      message
    )) as SignerResult;
    const signature = result.signature;

    setResult(signature);
    setIsLoading(false);
  };

  if (!account) return null;

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <ContentWrapper>
        <h3>Transfer</h3>
        <div className="form-item">
          <input
            type="text"
            placeholder="message"
            value={message}
            onChange={onMessageChange}
          />
        </div>
        <div className="form-item">
          <input type="text" placeholder="Result" value={result} />
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
      </ContentWrapper>
    </Modal>
  );
};
