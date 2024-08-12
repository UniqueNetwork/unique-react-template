import { ChangeEvent, useContext, useState } from "react";
import { Account, SignerTypeEnum } from "../accounts/types";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { AccountsContext } from "../accounts/AccountsContext";
import { baseUrl } from "../sdk/SdkContext";
import { Address } from "@unique-nft/utils";
import { useEthersSigner } from "../hooks/useSigner";
import { UniqueFungibleFactory } from "@unique-nft/solidity-interfaces";

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
  const [error, setError] = useState('');
  const signer = useEthersSigner();

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
    setError('')
    setIsLoading(true);

    if (sender.signerType === SignerTypeEnum.Ethereum) {

      try {
        const from = Address.extract.ethCrossAccountId(sender.address);
        const to = Address.extract.ethCrossAccountId(receiverAddress);
        //@ts-ignore
        const uniqueFungible = await UniqueFungibleFactory(0, signer);
        const amountRaw = BigInt(amount) * BigInt(10) ** BigInt(18);
  
        await(
          await uniqueFungible.transferFromCross(from, to, amountRaw, {
            from: sender.address,
          })
        ).wait();
      } catch (err) {
        console.log("ERROR CATCHED", err);
        console.error(err);
        setIsLoading(false);
        setError((err as Error).name || 'Unknown Error');
        return;
      }
    } else {
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
      setError((err as Error).name || 'Unknown Error');
    }
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
      {error && (
        <div className="form-item">
          <div>{error}</div>
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
