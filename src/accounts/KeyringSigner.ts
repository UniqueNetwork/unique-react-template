import { KeyringPair } from "@polkadot/keyring/types";
import keyring from "@polkadot/ui-keyring";
import { Signer, SignTxResultResponse, UnsignedTxPayloadBody } from "@unique-nft/sdk";
import { HexString } from '@unique-nft/utils/string'

export type AskPassphraseCallback = (keyringPair: KeyringPair) => Promise<void>;

/**
 * Signer for local accounts
 */
export class KeyringSigner implements Signer {
  address: string;
  askPassphraseCallback: AskPassphraseCallback;

  /**
   * Constructor function
   * @param address - Account address
   * @param askPassphraseCallback - callback for asking passphrase 
   */
  constructor(address: string, askPassphraseCallback: AskPassphraseCallback) {
    this.address = address;
    this.askPassphraseCallback = askPassphraseCallback;
  }

  /**
   * Sign the SDK payload 
   * @param unsignedTxPayload 
   * @returns 
   */
  public async sign(unsignedTxPayload: UnsignedTxPayloadBody): Promise<SignTxResultResponse> {
    const keyringPair = keyring.getPair(this.address);
    if (keyringPair.isLocked && this.askPassphraseCallback) {
      await this.askPassphraseCallback(keyringPair);
    }

    const signature = keyringPair.sign(
      unsignedTxPayload.signerPayloadHex,
      {
        withType: true
      }
    );
    keyringPair.lock();

    return {
      signature: HexString.fromU8a(signature),
      signatureType: keyringPair.type
    };
  }

  /**
   * Sign a text message with the signature
   * @param message - text message
   * @returns 
   */
  public async signMessage(message: string): Promise<string> {
    const keyringPair = keyring.getPair(this.address);
    if (keyringPair.isLocked && this.askPassphraseCallback) {
      await this.askPassphraseCallback(keyringPair);
    }
    const signature = keyringPair.sign(
      message,
      {
        withType: true
      }
    );
    keyringPair.lock();

    return HexString.fromU8a(signature);
  }
}