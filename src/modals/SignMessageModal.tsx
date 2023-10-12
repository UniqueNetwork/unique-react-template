import { SignerResult } from "@unique-nft/utils/extension"
import { ChangeEvent, useState } from "react"
import { LocalAccountSigner } from "../accounts/LocalAccountSigner"
import { Account, SignerTypeEnum } from "../accounts/types"
import { Modal } from "../components/Modal"
import { Signer as EthersSigner } from "ethers"

type SignMessageModalProps = {
  isVisible: boolean
  account?: Account
  onClose(): void
}

export const SignMessageModal = ({isVisible, account, onClose}: SignMessageModalProps) => {
  const [message, setMessage] = useState<string>();
  const [result, setResult] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const onMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }

  const onSign = async () => {
    if(!message || !account) return;
    setIsLoading(true);

    let signature: string;

    switch (account.signerType) {
      case SignerTypeEnum.Local: 
        signature = await (account.signer as LocalAccountSigner).signMessage(message); 
        break;
      case SignerTypeEnum.Polkadot: 
        const result = await account.signer.signMessage?.(message) as SignerResult; 
        signature = result.signature;
        break;
      case SignerTypeEnum.Metamask: 
        signature = await (account.signer as EthersSigner).signMessage(message); 
    }
  
    setResult(signature);
    setIsLoading(false);
  }

  if(!account) return null;

  return <Modal 
    title="Transfer"
    isVisible={isVisible} 
    onClose={onClose} 
  >
    <div className="form-item">
      <input type="text" placeholder="message" value={message} onChange={onMessageChange} />
    </div>
    <div className="form-item">
      <input type="text" placeholder="Result" value={result} />
    </div>
    {isLoading && <div className="form-item">
      <div>Transferring...</div>
    </div>}
    <div className="form-item">
      <button onClick={onSign} disabled={isLoading} >Sign</button>
      <button onClick={onClose} >Cancel</button>
    </div>
  </Modal>
}