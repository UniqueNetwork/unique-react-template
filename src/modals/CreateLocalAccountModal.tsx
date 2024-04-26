import { ChangeEvent, useContext, useState } from "react";
import { Modal } from "../components/Modal";
import { AccountsContext } from "../accounts/AccountsContext";
import { Sr25519Account } from '@unique-nft/sr25519';
import { addLocalAccount } from "../accounts/AccountsManager";

type CreateLocalAccountModalProps = {
  isVisible: boolean
  onClose(): void
}

export const CreateLocalAccountModal = ({isVisible, onClose}: CreateLocalAccountModalProps) => {
  const [mnemonicPhrase, setMnemonicPhrase] = useState<string>();
  const [name, setName] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const { fetchLocalAccounts } = useContext(AccountsContext)

  const onMnemonicPhraseChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMnemonicPhrase(e.target.value);
  }

  const onGenerateMnemonicClick = () => {
    const mnemonic = Sr25519Account.generateMnemonic()
    setMnemonicPhrase(mnemonic);
  }

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }

  const onCreate = async () => {
    if (!mnemonicPhrase || !name || !password) return;
    setIsLoading(true);
    const { address } = Sr25519Account.fromUri(mnemonicPhrase); 

    addLocalAccount(address, name, mnemonicPhrase, password);

    fetchLocalAccounts();

    setIsLoading(false)
    onClose();
  }

  return <Modal 
    title="Transfer"
    isVisible={isVisible} 
    onClose={onClose} 
  >
    <div className="form-item">
      <input type="text" placeholder="Mnemonic phrase" value={mnemonicPhrase} onChange={onMnemonicPhraseChange} />
    </div>
    <div className="form-item">
      <button onClick={onGenerateMnemonicClick} disabled={isLoading} >Generate</button>
    </div>
    <div className="form-item">
      <input type="text" placeholder="Name" value={name} onChange={onNameChange} />
    </div>
    <div className="form-item">
      <input type="password" placeholder="Password" value={password} onChange={onPasswordChange} />
    </div>
    <div className="form-item">
      <button onClick={onCreate} disabled={isLoading} >Create</button>
      <button onClick={onClose} >Cancel</button>
    </div>
  </Modal>
}