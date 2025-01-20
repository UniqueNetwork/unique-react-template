import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { SdkContext } from "../sdk/SdkContext";
import { TransferModal } from "../modals/TransferModal";
import useIsOwner from "../hooks/useIsOwner";
import { Hint } from "./TokenPage";
import TokenList from "../components/TokenList/TokenList";
import { UniqueChainType } from "../sdk/connect";

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  background-color: #007bff;
  font-size: 16px;
  width: 160px;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
`;

const Title = styled.h3`
  margin-bottom: 0 16px;
  text-align: left;
`;

const Avatar = styled.div<{ imageUrl: string }>`
  width: 250px;
  height: 250px;
  background-color: #ccc;
  border-radius: 50%;
  margin: 20px 0;
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  background-position: center;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const InfoItem = styled.div`
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  width: 80%;
  justify-content: space-between;

  span:first-child {
    text-align: left;
    flex: 1;
  }

  span:last-child {
    text-align: right;
    flex: 1;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 20px;
`;

const SettingsContainer = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
`;

const TransferButton = styled(Button)`
  margin-top: 20px;
  width: 200px;
`;
export type NFTCollection = Awaited<ReturnType<UniqueChainType['collection']['get']>>;


const CollectionPage = () => {
  const { sdk } = useContext(SdkContext);
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collectionData, setCollectionData] = useState<NFTCollection | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [transferModalIsVisible, setTransferModalIsVisible] = useState(false);
  const isOwner = useIsOwner(collectionData?.owner);

  useEffect(() => {
    const fetchCollectionData = async () => {
      if (!sdk || !collectionId) return;
      try {
        const collection = await sdk.collection.get({
          collectionId: collectionId,
          withLimits: true,
        });
        setCollectionData(collection);
      } catch (error) {
        setError("Failed to fetch collection data. Please try again later.");
      }
    };

    fetchCollectionData();
  }, [collectionId, sdk]);

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!collectionData) {
    return <div>Loading...</div>;
  }

  const coverImageUrl = collectionData.info?.cover_image?.url || '';

  return (
    <Container>
      <Hint>
        Use Search button to see other collections
      </Hint>
      <Title>Collection information</Title>
      <Avatar imageUrl={coverImageUrl} />
      <InfoList>
        <InfoItem>
          <span>ID:</span> <span>{collectionData.collectionId}</span>
        </InfoItem>
        <InfoItem>
          <span>Name:</span> <span>{collectionData.name}</span>
        </InfoItem>
        <InfoItem>
          <span>Symbol:</span> <span>{collectionData.symbol}</span>
        </InfoItem>
        <InfoItem>
          <span>Description:</span> <span>{collectionData.description}</span>
        </InfoItem>
        <InfoItem>
          <span>Owner:</span> <span>{collectionData.owner}</span>
        </InfoItem>
        <InfoItem>
          <span>Collection EVM address:</span>{" "}
          <span>{collectionData.collectionAddress}</span>
        </InfoItem>
        <InfoItem>
          <span>SubScan UI link:</span>
          <a
            href={`${process.env.REACT_APP_SUBSCAN_LINK}unique_item?collection_id=${collectionData.collectionId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {collectionData.collectionId}
          </a>
        </InfoItem>
        <InfoItem>
          <span>Uniquescan UI link:</span>
          <a
            href={`${process.env.REACT_APP_UNIQUESCAN_LINK}collections/${collectionData.collectionId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {collectionData.collectionId}
          </a>
        </InfoItem>
      </InfoList>
      <SettingsContainer>
        <Title>Settings</Title>
        <InfoList>
          <InfoItem>
            <span>Collection size (max):</span>{" "}
            <span>{collectionData.limits?.tokenLimit}</span>
          </InfoItem>
          <InfoItem>
            <span>NFTs per account limit:</span>{" "}
            <span>{collectionData.limits?.accountTokenOwnershipLimit}</span>
          </InfoItem>
          <InfoItem>
            <span>NFT transfers permission:</span>{" "}
            <span>
              {collectionData.limits?.transfersEnabled ? "Allowed" : "Disabled"}
            </span>
          </InfoItem>
          <InfoItem>
            <span>Nesting Permissions:</span>
            <span>
              <div>Token Owner: {collectionData.permissions.nesting.tokenOwner ? "Yes" : "No"}</div>
              <div>Collection Admin: {collectionData.permissions.nesting.collectionAdmin ? "Yes" : "No"}</div>
            </span>
          </InfoItem>
          <InfoItem>
            <span>Sponsor:</span>{" "}
            <span>{collectionData.sponsorship.sponsor || "-"}</span>
          </InfoItem>
        </InfoList>
      </SettingsContainer>
      <SettingsContainer>
        <Title>Collection NFTs</Title>
        <TokenList />
      </SettingsContainer>
      <SettingsContainer>
        
        <Title>Actions</Title>
        {!isOwner && <>You are not collection's owner</>}
        <TransferButton
          onClick={() => setTransferModalIsVisible(true)}
          disabled={!isOwner}
        >
          Transfer
        </TransferButton>
      </SettingsContainer>

      <TransferModal
        isVisible={transferModalIsVisible}
        onClose={() => setTransferModalIsVisible(false)}
      />
    </Container>
  );
};

export default CollectionPage;
