import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountsContext } from "../accounts/AccountsContext";
import { Account, SignerTypeEnum } from "../accounts/types";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { baseUrl } from "../sdk/SdkContext";
import { Address } from "@unique-nft/utils";
import { useUniqueNFTFactory } from "../hooks/useUniqueNFTFactory";
import styled from "styled-components";
import { Button, ButtonWrapper, Loading } from "./UnnestModal";
import { switchNetwork } from "../utils/swithChain";
import { UniqueNFTFactory } from "@unique-nft/solidity-interfaces";
import { ethers } from "ethers";


type NestTModalProps = {
  isVisible: boolean;
  account?: Account;
  onClose(): void;
};

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const NestTModal = ({ isVisible, onClose }: NestTModalProps) => {
  const { selectedAccount, magic } = useContext(AccountsContext);
  const { tokenId, collectionId } = useParams<{
    tokenId: string;
    collectionId: string;
  }>();
  const [tokenParentId, setTokenParentId] = useState<string>("");
  const [collectionParentId, setCollectionParentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getUniqueNFTFactory } = useUniqueNFTFactory(collectionId);

  const onSign = async () => {
    if (!selectedAccount || !collectionId || !tokenId) {
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

        await transferToken(collection);
      } else if (selectedAccount.signerType === SignerTypeEnum.Magiclink) {
        if (!magic) throw Error('No Magic')

        const provider = new ethers.BrowserProvider(magic.rpcProvider as any);
        const magicSigner = await provider.getSigner();

        const collection = await UniqueNFTFactory(+collectionId, magicSigner);

        if (!collection) {
          throw new Error("Failed to initialize the collection helper.");
        }

        await transferToken(collection);
      } else {
        const sdk = await connectSdk(baseUrl, selectedAccount);

        await sdk?.token.nest({
          parent: {
            collectionId: +collectionParentId,
            tokenId: +tokenParentId,
          },
          nested: {
            collectionId: +collectionId,
            tokenId: +tokenId,
          },
        });
      }

      setIsLoading(false);
      window.location.reload();
    } catch (error) {

      console.error("Transfer failed:", error);
      setErrorMessage("An error occurred");
      setIsLoading(false);
    }
  };

  const transferToken = async (collection: any) => {
    if (!selectedAccount || !tokenId) return;
    const newParentTokenAddress = Address.nesting.idsToAddress(
      +collectionParentId,
      +tokenParentId
    );
    const fromCross = Address.extract.ethCrossAccountId(selectedAccount.address);
  
    const tx = await collection.transferFrom(
      fromCross.eth,
      newParentTokenAddress,
      +tokenId
    );
    await tx.wait();
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose} isFlexible={true}>
      <ContentWrapper>
        <h3>Nest token</h3>
        <div className="form-item">
          <input
            type="text"
            placeholder="Enter parent collection Id"
            value={collectionParentId}
            onChange={(e) => setCollectionParentId(e.target.value)}
          />
        </div>
        <div className="form-item">
          <input
            type="text"
            placeholder="Enter parent token Id"
            value={tokenParentId}
            onChange={(e) => setTokenParentId(e.target.value)}
          />
        </div>

        {errorMessage && (
          <div className="form-item">
            <div className="error-message">{errorMessage}</div>
          </div>
        )}

        {isLoading && <Loading>Transferring...</Loading>}
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
