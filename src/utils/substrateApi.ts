import { ApiPromise, WsProvider } from '@polkadot/api';
import type { Signer, SignerPayloadJSON, SignerResult } from '@polkadot/types/types';
import { SubstrateProvider } from "@subwallet-connect/common";
import { blake2AsU8a } from '@polkadot/util-crypto'

export type RequestArguments  ={
  method: string;
  params?: object | unknown[] | Record<string, unknown> | undefined;
}

export class substrateApi {
  private readonly api ?: ApiPromise;

  constructor (chainEndpoint: string){
    this.api = new ApiPromise({
      provider: new WsProvider(chainEndpoint),
    });
  }

  public async getWCSigner (senderAddress: string, provider: SubstrateProvider) : Promise<Signer > {
    if(!this.api) return {} ;

    return {
      signPayload : async (payload: SignerPayloadJSON): Promise<SignerResult>  => {
        const args = {} as RequestArguments;

        args.method = 'polkadot_signTransaction';
        args.params = {
          address: senderAddress,
          transactionPayload: payload
        };

        const { signature }  = (await provider.request(args)) as Pick<SignerResult, 'signature'>;
        return { id: 0, signature };
      }
    }
  }

  public async getQrSigner ( senderAddress: string, provider: SubstrateProvider, chainId: string) : Promise<Signer> {
    if(!this.api) return {} ;

    return {
      signPayload : async (payload: SignerPayloadJSON): Promise<SignerResult>  => {
        const raw = this.api?.registry.createType('ExtrinsicPayload', payload, { version: payload.version });
        const args = {} as RequestArguments;
        args.method = 'polkadot_sendTransaction';
        const isQrHashed = (payload.method.length > 5000);
        const qrPayload = isQrHashed
          ? blake2AsU8a(raw?.toU8a(true) || '')
          : raw?.toU8a();
        args.params = {
          transactionPayload: qrPayload,
          genesisHash: chainId,
          address: senderAddress
        };
        const { signature }   = (await provider.request(args)) as any
        return { id: 0, signature };
      }
    }
  }
}


