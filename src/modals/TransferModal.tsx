import { ChangeEvent, useState } from "react";
import { Address } from "@unique-nft/utils";
import { Modal } from "../components/Modal";
import { useParams } from "react-router-dom";
import { useAccountsContext } from "../accounts/AccountsContext";
import { SignerTypeEnum } from "../accounts/types";
import { useUniqueNFTFactory } from "../hooks/useUniqueNFTFactory";
import { ContentWrapper } from "./NestModal";
import { Button, ButtonWrapper, Loading } from "./UnnestModal";
import { switchNetwork } from "../utils/swithChain";
import { getCollection } from "../utils/getCollection";
import { useSdkContext } from "../sdk/SdkContext";

type TransferModalProps = {
  isVisible: boolean;
  onClose(): void;
};

export const TransferModal = ({
  isVisible,
  onClose,
}: TransferModalProps) => {
  const { selectedAccount, magic, providerWeb3Auth } = useAccountsContext();
  const {sdk} = useSdkContext();
  const [receiver, setReceiver] = useState<string>("");
  const { collectionId } = useParams<{ collectionId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getUniqueNFTFactory } = useUniqueNFTFactory(collectionId);

  const onMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReceiver(e.target.value);
  };

  const onSign = async () => {
    if (!sdk || !receiver || !selectedAccount || !collectionId) {
      setErrorMessage("All fields must be filled out.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (selectedAccount.signerType === SignerTypeEnum.Ethereum) {
        await switchNetwork();
        const collection = await getUniqueNFTFactory();
        if (!collection) {
          throw new Error("Failed to initialize the collection helper.");
        }
        const toCross = Address.extract.ethCrossAccountId(receiver.trim());

        await (
          await collection.changeCollectionOwnerCross(toCross)
        ).wait();
      } else  if (selectedAccount.signerType === SignerTypeEnum.Magiclink) {
        if (!magic) throw Error('No Magic')
        const collection = await getCollection(magic.rpcProvider, collectionId)
        const toCross = Address.extract.ethCrossAccountId(receiver.trim());
        await (
          await collection.changeCollectionOwnerCross(toCross)
        ).wait();
      } else  if (selectedAccount.signerType === SignerTypeEnum.Web3Auth) {
        if (!providerWeb3Auth) throw Error('No Web3Auth provider');
        const collection = await getCollection(providerWeb3Auth, collectionId);
        const toCross = Address.extract.ethCrossAccountId(receiver.trim());
        await (
          await collection.changeCollectionOwnerCross(toCross)
        ).wait();
      } else {
        await sdk.collection.transferCollection(
          {
            to: receiver.trim(),
            collectionId: +collectionId,
          },
          undefined,
          selectedAccount
        );
      }

      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      console.error("Transfer failed:", error);
      setErrorMessage("An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose} isFlexible={true}>
      <ContentWrapper>
        <h3>Transfer Collection</h3>
        <div className="form-item">
          <input
            type="text"
            placeholder="Enter address to transfer"
            value={receiver}
            onChange={onMessageChange}
          />
        </div>

        {errorMessage && (
          <div className="form-item">
            <div className="error-message">{errorMessage}</div>
          </div>
        )}

        {isLoading && <Loading>Processing...</Loading>}
        <ButtonWrapper>
          <Button onClick={onSign} disabled={isLoading}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ButtonWrapper>
      </ContentWrapper>
    </Modal>
  );
};
