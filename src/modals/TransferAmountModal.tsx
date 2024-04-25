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
import { SignerPayloadJSON, SignerPayloadRaw } from "@polkadot/types/types"
import { AccountsContext } from "../accounts/AccountsContext"

type TransferAmountModalProps = {
  isVisible: boolean
  sender?: Account
  onClose(): void
}

export const TransferAmountModal = ({isVisible, sender, onClose}: TransferAmountModalProps) => {
  const { sdk, chainProperties } = useContext(SdkContext);
  const { fetchAccounts } = useContext(AccountsContext);
  const [receiverAddress, setReceiverAddress] = useState<string>();
  const [amount, setAmount] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    setError('')
;   setIsLoading(true);

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
      if (!sdk) return;

      const substrateProvider = new substrateApi(chainProperties?.wsUrl);

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
            chainProperties?.genesisHash || ''
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

      try {
        await sdk.balance.transfer.submitWaitResult(
          {
            address: sender.address,
            destination: receiverAddress,
            amount: +amount,
          },
          { signer }
        );

        fetchAccounts();
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        setError(err.name);
        return;
      }
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
    {error && <div style={{ color: 'red' }}>{error}</div>}
    <div className="form-item">
      <button onClick={onSend} disabled={isLoading} >Send</button>
      <button onClick={onClose} >Cancel</button>
    </div>
  </Modal>
}