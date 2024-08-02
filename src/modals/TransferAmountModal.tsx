import { ChangeEvent, useContext, useState } from "react";
import { Account } from "../accounts/types";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { AccountsContext } from "../accounts/AccountsContext";
import { baseUrl } from "../sdk/SdkContext";

type TransferAmountModalProps = {
  isVisible: boolean;
  sender?: Account;
  onClose(): void;
};

export const TransferAmountModal = ({
  isVisible,
  sender,
  onClose,
}: TransferAmountModalProps) => {
  const { fetchPolkadotAccounts } = useContext(AccountsContext);
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [amount, setAmount] = useState<number | string>("");
  const [isLoading, setIsLoading] = useState(false);

  const onReceiverAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReceiverAddress(e.target.value);
  };

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || Number(value)) {
      setAmount(value);
    }
  };

  const onSend = async () => {
    if (!receiverAddress || !amount || !sender) return;
    setIsLoading(true);
    try {
      //@ts-ignore
      const sdk = await connectSdk(baseUrl, sender);

      await sdk?.balance.transfer({
        to: receiverAddress.trim(),
        amount: `${amount}`,
        isAmountInCoins: true,
      });
      setIsLoading(false);

      //refetch accounts balances
      fetchPolkadotAccounts();
    } catch (err) {
      setIsLoading(false);
    }

    onClose();
  };

  if (!sender) return null;

  return (
    <Modal title="Transfer" isVisible={isVisible} onClose={onClose}>
      <div className="form-item">
        <input
          type="text"
          placeholder="Receiver address"
          value={receiverAddress}
          onChange={onReceiverAddressChange}
        />
      </div>
      <div className="form-item">
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={onAmountChange}
        />
      </div>
      {isLoading && (
        <div className="form-item">
          <div>Transferring...</div>
        </div>
      )}
      <div className="form-item">
        <button onClick={onSend} disabled={isLoading}>
          Send
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};
