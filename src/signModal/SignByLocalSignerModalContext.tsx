import { ChangeEvent, createContext, PropsWithChildren, useCallback, useMemo, useRef, useState } from "react";
import { SignByLocalSignerModalContextValue } from "./types";
import { noop } from "../utils/common";
import { Modal } from "../components/Modal";
import { AskPassphraseCallback } from "../accounts/LocalAccountSigner";

export const SignByLocalSignerModalContext = createContext<SignByLocalSignerModalContextValue>({
  openModal: noop,
  closeModal: noop
})

export const SignByLocalSignerModalProvider = ({ children }: PropsWithChildren) => {
  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState<string>();
  const [hasError, setHasError] = useState(false);

  const openCallback = useRef<(passphrase: string) => boolean>();
  const onSignByLocalSigner = useRef<() => void>()
  const onClose = useRef<() => void>()

  const openModal = useCallback<AskPassphraseCallback>(async (cb) => {
    setIsVisible(true);
    openCallback.current = cb;
    await new Promise<void>((resolve, reject) => {
      onSignByLocalSigner.current = resolve;
      onClose.current = reject;
    });
  }, []);

  const onSign = useCallback(() => {
    if(!password) {
      setHasError(true);
      return
    }
    if(openCallback.current?.(password)) {
      onSignByLocalSigner.current?.();
      setIsVisible(false);
      return
    }
    setHasError(true);
  }, [password])

  const closeModal = useCallback(() => {
    onClose.current?.();
    setIsVisible(false);
  }, []);

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value || '');
  }

  const contextValue = useMemo(() => ({
    openModal, closeModal
  }), [openModal, closeModal]);

  return <SignByLocalSignerModalContext.Provider value={contextValue}>
    {children}
    <Modal isVisible={isVisible} onClose={closeModal}>
      <div className="form-item">
        <input type="password" placeholder="password" value={password} onChange={onPasswordChange} />
      </div>
      {hasError && <div className="form-item">
        <span className="form-error">Unable to decode using the supplied passphrase</span> 
      </div>}
      <div>
        <button onClick={onSign}>Sign</button>
        <button onClick={closeModal} >Cancel</button>
      </div>
    </Modal>
  </SignByLocalSignerModalContext.Provider>
}