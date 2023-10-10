import { KeyringPair } from "@polkadot/keyring/types"

export interface SignByLocalSignerModalContextValue {
  openModal(pair: KeyringPair): Promise<void>
  closeModal(): void
}