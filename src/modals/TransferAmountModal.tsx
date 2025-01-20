import { ChangeEvent, useContext, useState } from "react";
import { Account, SignerTypeEnum } from "../accounts/types";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { baseUrl } from "../sdk/SdkContext";
import { Address } from "@unique-nft/utils";
import { useEthersSigner } from "../hooks/useSigner";
import { UniqueFungibleFactory } from "@unique-nft/solidity-interfaces";
import { AccountsContext } from "../accounts/AccountsContext";
import { ContentWrapper } from "./NestModal";
import { Button, ButtonWrapper, Loading } from "./UnnestModal";
import { switchNetwork } from "../utils/swithChain";
import { ethers } from "ethers";

type TransferAmountModalProps = {
  isVisible: boolean;
  sender?: Account;
  onClose(): void;
};

export const TransferAmountModal = ({
  isVisible,
  sender,
  onClose,
}: TransferAmountModalProps) => {
  const { reinitializePolkadotAccountsWithBalance, magic, providerWeb3Auth } =
    useContext(AccountsContext);
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const signer = useEthersSigner();

  const handleReceiverAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReceiverAddress(e.target.value);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || !isNaN(Number(value))) {
      setAmount(value);
    }
  };

  const handleSend = async () => {
    if (!receiverAddress || !amount || !sender) return;

    setError("");
    setIsLoading(true);

    console.log(sender, 'SENDER')
    try {
      if (sender.signerType === SignerTypeEnum.Ethereum) {
        await sendEthereumTransaction();
      } else if (sender.signerType === SignerTypeEnum.Polkadot) {
        await sendPolkadotTransaction();
      } else if (sender.signerType === SignerTypeEnum.Magiclink) {
        await sendMagicLinkTransaction();
      } else if (sender.signerType === SignerTypeEnum.Web3Auth) {
        await sendWeb3AuthTx();
      }

      reinitializePolkadotAccountsWithBalance();
      onClose();
    } catch (err) {
      handleError(err);
    }
  };

  const sendEthereumTransaction = async () => {

    if (!signer) return;
    await switchNetwork();
    const from = Address.extract.ethCrossAccountId(sender!.address);
    const to = Address.extract.ethCrossAccountId(receiverAddress);
    const uniqueFungible = await UniqueFungibleFactory(0, signer);
    const amountRaw = BigInt(amount) * BigInt(10) ** BigInt(18);

    try{
      await (
        await uniqueFungible.transferFromCross(from, to, amountRaw, {
          from: sender!.address,
        })
      ).wait();
    } catch (err) {
      console.log(err, 'ERROR')
    }

    setIsLoading(false);
  };


  const sendMagicLinkTransaction = async () => {
    const from = Address.extract.ethCrossAccountId(sender!.address);
    const to = Address.extract.ethCrossAccountId(receiverAddress);

    if (!magic) throw Error('No Magic')

    try {
      const provider = new ethers.BrowserProvider(magic.rpcProvider as any);
      const magicSigner = await provider.getSigner();

      const amountRaw = BigInt(amount) * BigInt(10) ** BigInt(18);

      const uniqueFungible = await UniqueFungibleFactory(0, magicSigner);

      const tx = await uniqueFungible.transferFromCross(from, to, amountRaw)
    
      await tx.wait();
    } catch (err) {
      console.error("Magic link transaction error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendWeb3AuthTx = async () => {
    const from = Address.extract.ethCrossAccountId(sender!.address);
    const to = Address.extract.ethCrossAccountId(receiverAddress);
    if (!providerWeb3Auth) throw Error('No WEB3AUTH provider');

    try {
      const provider = new ethers.BrowserProvider(providerWeb3Auth as any);
      const web3AuthSigner = await provider.getSigner();
      const amountRaw = BigInt(amount) * BigInt(10) ** BigInt(18);
      const uniqueFungible = await UniqueFungibleFactory(0, web3AuthSigner);
      const tx = await uniqueFungible.transferFromCross(from, to, amountRaw);
      await tx.wait();
    } catch (err) {
      console.error("Magic link transaction error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  const sendPolkadotTransaction = async () => {
    const sdk = await connectSdk(baseUrl, sender);
    await sdk?.balance.transfer({
      to: receiverAddress.trim(),
      amount: `${amount}`,
      isAmountInCoins: true,
    });
    setIsLoading(false);
  };

  const handleError = (err: any) => {
    console.error(err);
    setIsLoading(false);
    setError(err?.name || "Unknown Error");
  };

  if (!sender) return null;

  return (
    <Modal isVisible={isVisible} onClose={onClose} isFlexible={true}>
      <ContentWrapper>
        <h3>Transfer Amount</h3>
        <div className="form-item">
          <input
            type="text"
            placeholder="Receiver address"
            value={receiverAddress}
            onChange={handleReceiverAddressChange}
          />
        </div>
        <div className="form-item">
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
  
        {error && <div className="form-item">{error}</div>}
        {isLoading && <Loading>Processing...</Loading>}
        <ButtonWrapper>
          <Button onClick={handleSend} disabled={isLoading}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ButtonWrapper>
      </ContentWrapper>
    </Modal>
  );
};
