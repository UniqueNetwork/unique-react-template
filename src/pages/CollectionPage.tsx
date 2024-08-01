import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { SdkContext } from "../sdk/SdkContext";

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  background-color: #007bff;
  font-size: 24px;
  width: 250px;

  &:hover {
    opacity: 0.8;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  margin-bottom: 35px;
  text-align: left;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  border-radius: 50%;
  margin: 20px 0;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const InfoItem = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  display: flex;
  width: 80%;
  justify-content: space-between;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 20px;
`;

const SettingsContainer = styled.div`
  margin-top: 20px;
`;

const TransferButton = styled(Button)`
  margin-top: 20px;
  width: 200px;
`;

const CollectionPage = () => {
  const { sdk } = useContext(SdkContext);
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collectionData, setCollectionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const collection = await sdk.collection.get({
          idOrAddress: collectionId,
        });
        console.log(collection, 'COLLECTION');
        setCollectionData(collection);
      } catch (error) {
        console.error("Error fetching collection data:", error);
        setError("Failed to fetch collection data. Please try again later.");
      }
    };

    if (!sdk) return;
    if (collectionId) {
      fetchCollectionData();
    }
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

  return (
    <Container>
      <Title>Collection information</Title>
      <Avatar />
      <InfoList>
        <InfoItem>
          <span>ID:</span> <span>{collectionData.collectionAddress}</span>
        </InfoItem>
        <InfoItem>
          <span>Name:</span> <span>{collectionData.name}</span>
        </InfoItem>
        <InfoItem>
          <span>Symbol:</span> <span>{collectionData.tokenPrefix}</span>
        </InfoItem>
        <InfoItem>
          <span>Description:</span> <span>{collectionData.description}</span>
        </InfoItem>
        <InfoItem>
          <span>Owner:</span> <span>{collectionData.owner}</span>
        </InfoItem>
        <InfoItem>
          <span>Created at:</span> <span>{collectionData.createdAt}</span>
        </InfoItem>
        <InfoItem>
          <span>Collection EVM address:</span> <span>{collectionData.evmAddress}</span>
        </InfoItem>
        <InfoItem>
          <span>SubScan UI link:</span>
          <a href={collectionData.subScanLink} target="_blank" rel="noopener noreferrer">
            {collectionData.subScanLink}
          </a>
        </InfoItem>
        <InfoItem>
          <span>Uniquescan UI link:</span>
          <a href={collectionData.uniqueScanLink} target="_blank" rel="noopener noreferrer">
            {collectionData.uniqueScanLink}
          </a>
        </InfoItem>
      </InfoList>
      <SettingsContainer>
        <Title>Settings</Title>
        <InfoList>
          <InfoItem>
            <span>Collection size (max):</span> <span>{collectionData.collectionSizeMax}</span>
          </InfoItem>
          <InfoItem>
            <span>NFTs per account limit:</span> <span>{collectionData.nftsPerAccountLimit}</span>
          </InfoItem>
          <InfoItem>
            <span>NFT transfers permission:</span> <span>{collectionData.nftTransfersPermission}</span>
          </InfoItem>
          <InfoItem>
            <span>Nesting permission:</span> <span>{collectionData.nestingPermission}</span>
          </InfoItem>
          <InfoItem>
            <span>Sponsor:</span> <span>{collectionData.sponsor}</span>
          </InfoItem>
        </InfoList>
      </SettingsContainer>
      <TransferButton>Transfer</TransferButton>
    </Container>
  );
};

export default CollectionPage;
