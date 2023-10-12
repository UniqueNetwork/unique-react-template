import { AskPassphraseCallback } from "../accounts/LocalAccountSigner"

export interface SignByLocalSignerModalContextValue {
  openModal: AskPassphraseCallback
  closeModal(): void
}