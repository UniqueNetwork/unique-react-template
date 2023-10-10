import { ChangeEvent, useContext, useState } from "react"
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Modal } from "../components/Modal"
import keyring from "@polkadot/ui-keyring";
import { AccountsContext } from "../accounts/AccountsContext";

type CreateLocalAccountModalProps = {
  isVisible: boolean
  onClose(): void
}

export const CreateLocalAccountModal = ({isVisible, onClose}: CreateLocalAccountModalProps) => {
  const [mnemonicPhrase, setMnemonicPhrase] = useState<string>();
  const [name, setName] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const { fetchAccounts } = useContext(AccountsContext)

  const onMnemonicPhraseChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMnemonicPhrase(e.target.value);
  }

  const onGenerateMnemonicClick = () => {
    setMnemonicPhrase(mnemonicGenerate(12));
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

    keyring.addUri(mnemonicPhrase, password, { name });

    await fetchAccounts();

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