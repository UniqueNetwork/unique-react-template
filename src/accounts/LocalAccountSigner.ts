import { Signer, SignTxResultResponse, UnsignedTxPayloadBody } from "@unique-nft/sdk";
import { Sr25519Account } from '@unique-nft/sr25519';
import { secretbox_open } from 'tweetnacl-ts';
import { StringUtils, Address } from "@unique-nft/utils";

export const NONCE = new Uint8Array(Array.from(Array.from(Array(24).keys())));

export type AskPassphraseCallback = (open: (passphrase: string) => boolean) => Promise<void>;

/**
 * Signer for local accounts
 */
export class LocalAccountSigner implements Signer {
  secret: string;
  askPassphraseCallback: AskPassphraseCallback;


  /**
   * Constructor function
   * @param address - Account address
   * @param askPassphraseCallback - callback for asking passphrase 
   */
  constructor(secret: string, askPassphraseCallback: AskPassphraseCallback) {
    this.secret = secret;
    this.askPassphraseCallback = askPassphraseCallback;
  }

  /**
   * Call askPassphraseCallback function and 
   * @returns Account
   */
  private async getAccount() {
    let mnemonicPhrase: string | undefined;

    await this.askPassphraseCallback?.((passphrase: string) => {
      const passwordHash = Address.algorithms.keccak_256(passphrase)
      const mnemonicPhraseU8a = secretbox_open(
        StringUtils.HexString.toU8a(this.secret),
        NONCE,
        passwordHash
      );

      if (mnemonicPhraseU8a) {
        mnemonicPhrase = StringUtils.Utf8.u8aToString(mnemonicPhraseU8a);
      }

      return !!mnemonicPhrase;
    });
    if(!mnemonicPhrase) return;
    return Sr25519Account.fromUri(mnemonicPhrase);
  }

  /**
   * Sign the SDK payload 
   * @param unsignedTxPayload 
   * @returns 
   */
  public async sign(unsignedTxPayload: UnsignedTxPayloadBody): Promise<SignTxResultResponse> {
    const account = await this.getAccount();
    if(!account) throw new Error('No account');

    return await account.signer.sign(unsignedTxPayload);
  }

  /**
   * Sign a text message with the signature
   * @param message - text message
   * @returns 
   */
  public async signMessage(message: string): Promise<string> {
    const account = await this.getAccount();
    if(!account) throw new Error('No account');
    const signatureU8a = account.sign(message);
    return StringUtils.HexString.fromU8a(signatureU8a);
  }
}