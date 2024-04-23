//@ts-nocheck
import { UniqueFungibleFactory } from "@unique-nft/solidity-interfaces"
import { Address } from "@unique-nft/utils"
import { ChangeEvent, useContext, useState } from "react"
import { Account } from "../accounts/types"
import { Modal } from "../components/Modal"
import { SdkContext } from "../sdk/SdkContext"
import { ethers } from "ethers"
import { useConnectWallet } from "@subwallet-connect/react"
import { SubstrateProvider } from "@subwallet-connect/common";
import { substrateApi } from "../utils/substrateApi"
import { Sdk } from "@unique-nft/sdk/full"
import { SignerPayloadJSON, SignerPayloadRaw } from "@polkadot/types/types"

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

  const [{ wallet }] = useConnectWallet();

  const onSend = async () => {
    if(!receiverAddress || !amount || !sender) return;
    setIsLoading(true);
    if (!wallet) return;

    if(wallet?.type === "evm") {
      const evmProvider = new ethers.providers.Web3Provider(wallet.provider, 'any');
      const signer = evmProvider.getSigner(sender.address);
      const from = Address.extract.ethCrossAccountId(sender.address);
      const to = Address.extract.ethCrossAccountId(receiverAddress);
      const uniqueFungible = await UniqueFungibleFactory(0, signer);
      const amountRaw = BigInt(amount) * BigInt(10) ** BigInt(chainProperties?.decimals || 18);

      await (await uniqueFungible.transferFromCross(from, to, amountRaw, { from: sender.address })).wait();
    } else {
      let chainInfo = {
        id: "0xc87870ef90a438d574b8e320f17db372c50f62beb52e479c8ff6ee5b460670b9",
        label: "OPAL",
        decimal: 18,
        namespace: "substrate",
        token: "OPL",
        blockExplorerUrl: "scan.uniquenetwork.dev/opal/",
        wsProvider: "wss://ws-opal.unique.network",
      };

      const substrateProvider = new substrateApi(chainInfo.wsProvider);

      const getSigner = async () => {
        const provider = wallet.provider as SubstrateProvider;
        if (wallet.label === "Ledger") {
          wallet.signer = await substrateProvider?.getLedgerSigner(
            sender.address,
            provider
          );
        }
        if (wallet.label === "WalletConnect") {
          wallet.signer = await substrateProvider?.getWCSigner(
            sender.address,
            provider
          );
        }
        if (wallet.label === "Polkadot Vault") {
          wallet.signer = await substrateProvider?.getQrSigner(
            sender.address,
            provider,
            chainInfo.id
          );
        }
        return wallet.signer;
      };

      let signer = await getSigner();

      if (!signer) return;

      signer.sign = async (unsignedTxPayload: {
        signerPayloadJSON: SignerPayloadJSON;
        signerPayloadRaw: SignerPayloadRaw;
      }) => {
        if (unsignedTxPayload.signerPayloadJSON && signer.signPayload) {
          return signer.signPayload(unsignedTxPayload.signerPayloadJSON);
        } else if (unsignedTxPayload.signerPayloadRaw && signer.signRaw) {
          return signer.signRaw(unsignedTxPayload.signerPayloadRaw);
        } else {
          throw new Error("Signer methods are not available");
        }
      };

      const uniqueSdk = new Sdk({
        baseUrl: "https://rest.unique.network/opal/v1",
        signer,
      });

      await uniqueSdk.balance.transfer.submitWaitResult({
        address: sender.address,
        destination: receiverAddress,
        amount: +amount,
      });
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
    <div className="form-item">
      <button onClick={onSend} disabled={isLoading} >Send</button>
      <button onClick={onClose} >Cancel</button>
    </div>
  </Modal>
}