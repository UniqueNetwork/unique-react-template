import { UniqueFungibleFactory } from "@unique-nft/solidity-interfaces"
import { Address } from "@unique-nft/utils"
import { ChangeEvent, useContext, useState } from "react"
import { isEthersSigner } from "../accounts/AccountsManager"
import { Account } from "../accounts/types"
import { Modal } from "../components/Modal"
import { SdkContext } from "../sdk/SdkContext"

type TransferAmountModalProps = {
  isVisible: boolean
  sender?: Account
  onClose(): void
}

export const TransferAmountModal = ({isVisible, sender, onClose}: TransferAmountModalProps) => {
  const { sdk, chainProperties } = useContext(SdkContext);

  const [receiverAddress, setReceiverAddress] = useState<string>();
  const [amount, setAmount] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);

  const onReceiverAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReceiverAddress(e.target.value);
  }

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    if(!Number(e.target.value)) return;
    setAmount(Number(e.target.value));
  }

  const onSend = async () => {
    if(!receiverAddress || !amount || !sender) return;
    setIsLoading(true);

    if(isEthersSigner(sender.signer)) {
      const from = Address.extract.ethCrossAccountId(sender.address);
      const to = Address.extract.ethCrossAccountId(receiverAddress);
      const uniqueFungible = await UniqueFungibleFactory(0, sender.signer);
      const amountRaw = BigInt(amount) * BigInt(10) ** BigInt(chainProperties?.decimals || 18);

      await (await uniqueFungible.transferFromCross(from, to, amountRaw, { from: sender.address })).wait();
    } else {
      await sdk?.balance.transfer.submitWaitResult({
        address: sender.address,
        destination: receiverAddress,
        amount,
      }, {
        signer: sender.signer
      })
    }

    setIsLoading(false)
    onClose();
  }

  if(!sender) return null;

  return <Modal 
    title="Transfer"
    isVisible={isVisible} 
    onClose={onClose} 
  >
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
    {isLoading && <div className="form-item">
      <div>Transferring...</div>
    </div>}
    <div className="form-item">
      <button onClick={onSend} disabled={isLoading} >Send</button>
      <button onClick={onClose} >Cancel</button>
    </div>

  </Modal>
}