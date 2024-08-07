import React, { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { SdkContext } from "../sdk/SdkContext";
import { TokenSlider } from "../components/Slider/TokenSlider";
import { Picture } from "../components/Picture";
import { TransferNFTModal } from "../modals/TransferNFTModal";
import { BurnModal } from "../modals/BurnModal";
import { NestTModal } from "../modals/NestModal";
import { UnnestTModal } from "../modals/UnnestModal";
import useIsOwner from "../hooks/useIsOwner";

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

const Title = styled.h2`
  margin-bottom: 35px;
  text-align: left;
`;

const InfoContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;

  @media (max-width: 1260px) {
    flex-direction: column;
  }

  .picture {
    width: 500px;
    height: 500px;
  }
`;

const TokenInfoWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 20px;

  & > div {
    width: 100% !important;
  }

  @media (max-width: 1260px) {
    width: 80%;
    margin-left: 0;
  }
`;

const InfoItem = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
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

const NestedNftContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const NestedNft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

interface Attribute {
  trait_type: string;
  value: string;
}

interface Media {
  type: string;
  url: string;
}

interface Royalty {
  address: string;
  percent: number;
}

interface ParentToken {
  collectionId: number;
  tokenId: number;
}

interface Property {
  key: string;
  value: string;
  valueHex: string;
}

interface TokenData {
  name: string;
  description: string;
  schemaName?: string;
  schemaVersion?: string;
  image?: string;
  attributes?: Attribute[];
  media?: Record<string, Media>;
  royalties?: Royalty[];
  tokenId?: number;
  collectionId?: number;
  collectionAddress?: string;
  owner?: string;
  parentToken?: ParentToken;
  properties?: Property[];
  decodingError?: string | null;
  youtube_url?: string;
  animation_url?: string;
  tokenPrefix?: string;
}

enum TokenModalEnum {
  TRANSFER = "TRANSFER",
  NEST = "NEST",
  UNNEST = "UNNEST",
  BURN = "BURN",
}

const TokenPage: React.FC = () => {
  const { sdk } = useContext(SdkContext);
  const { tokenId, collectionId } = useParams<{
    tokenId: string;
    collectionId: string;
  }>();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<TokenModalEnum | null>(null);
  const isOwner = useIsOwner(tokenData?.owner);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const token = await sdk.token.get({
          collectionIdOrAddress: collectionId,
          tokenId,
        });
        setTokenData(token);
      } catch (error) {
        setError("Failed to fetch token data. Please try again later.");
      }
    };

    if (!sdk) return;
    if (tokenId) {
      fetchTokenData();
    }
  }, [tokenId, sdk, collectionId]);

  const { sliderItems, mediaTypes, attributesString, royaltiesString } =
    useMemo(() => {
      if (!tokenData)
        return {
          sliderItems: [],
          mediaTypes: "",
          attributesString: "",
          royaltiesString: "",
        };

      const sliderItems: { src: string; type: string; thumbnail?: string }[] =
        [];
      const {
        image,
        youtube_url,
        animation_url,
        media,
        attributes,
        royalties,
      } = tokenData;

      if (image) {
        sliderItems.push({ src: image, type: "image" });
      }
      if (youtube_url) {
        sliderItems.push({ src: youtube_url, type: "youtube_url" });
      }
      if (animation_url) {
        sliderItems.push({ src: animation_url, type: "animation_url" });
      }
      if (media) {
        const mediaItems = Object.values(media);
        const images = mediaItems.filter((item) => item.type === "image");
        const videos = mediaItems.filter((item) => item.type === "video");
        const audios = mediaItems.filter((item) => item.type === "audio");

        images.forEach((image) =>
          sliderItems.push({ src: image.url, type: "image" })
        );
        videos.forEach((video) =>
          sliderItems.push({ src: video.url, type: "video" })
        );
        audios.forEach((audio) =>
          sliderItems.push({ src: audio.url, type: "audio", thumbnail: image })
        );
      }

      const mediaTypesSet = new Set(sliderItems.map((item) => item.type));
      const mediaTypes = Array.from(mediaTypesSet).join(", ");

      const attributesString = attributes
        ? attributes
            .map((attr) => `${attr.trait_type || "-"}: ${attr.value || "-"}`)
            .join(", ")
        : "-";

      const royaltiesString = royalties
        ? royalties
            .map((royalty) => `${royalty.address}: ${royalty.percent}%`)
            .join(", ")
        : "-";

      return { sliderItems, mediaTypes, attributesString, royaltiesString };
    }, [tokenData]);

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!tokenData) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Title>NFT info - Change URL manually to see the other NFT</Title>
      <InfoContainer>
        {sliderItems.length > 1 ? (
          <TokenSlider
            items={sliderItems}
            isWearable={false}
            wearableSrc={""}
            baseSrc={""}
            badges={[]}
            previewMode={true}
          />
        ) : (
          <Picture
            size={500}
            alt={tokenId?.toString() || ""}
            src={sliderItems[0].src}
            badges={[]}
          />
        )}

        <TokenInfoWrap>
          <InfoItem>
            <span>Symbol:</span> <span>{tokenData.tokenPrefix || "-"}</span>
          </InfoItem>
          <InfoItem>
            <span>ID:</span>{" "}
            <span>
              {tokenData.tokenId !== undefined ? tokenData.tokenId : "-"}
            </span>
          </InfoItem>
          <InfoItem>
            <span>Owner:</span> <span>{tokenData.owner || "-"}</span>
          </InfoItem>
          <InfoItem>
            <span>Collection:</span>{" "}
            <span>{tokenData.collectionId || "-"}</span>
          </InfoItem>
        </TokenInfoWrap>
      </InfoContainer>

      <Title>Attributes</Title>
      <InfoItem>
        <span>Name:</span> <span>{tokenData.name || "-"}</span>
      </InfoItem>
      <InfoItem>
        <span>Description:</span> <span>{tokenData.description || "-"}</span>
      </InfoItem>
      <InfoItem>
        <span>Attributes:</span> <span>{attributesString}</span>
      </InfoItem>

      <Title>More info</Title>
      <InfoItem>
        <span>Media types:</span> <span>{mediaTypes || "-"}</span>
      </InfoItem>
      <InfoItem>
        <span>Nested NFTs:</span> <span>{"-"}</span>
      </InfoItem>
      <InfoItem>
        <span>Nested to:</span>{" "}
        <span>
          {tokenData.parentToken ? (
            <a
              href={`${process.env.REACT_APP_SUBSCAN_LINK}unique_item/${collectionId}-${tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {`${tokenData.parentToken.collectionId}-${tokenData.parentToken.tokenId}`}
            </a>
          ) : (
            "-"
          )}
        </span>
      </InfoItem>
      <InfoItem>
        <span>Royalty:</span> <span>{royaltiesString}</span>
      </InfoItem>
      <InfoItem>
        {/* <span>NFT EVM address:</span> <span>{tokenData.collectionAddress ? Address.mirror.substrateToEthereum(tokenData.collectionAddress) : '-'}</span> */}
      </InfoItem>
      <InfoItem>
        {/* <span>Created at:</span> <span>{tokenData.createdAt || "-"}</span> */}
      </InfoItem>
      <InfoItem>
        <span>SubScan UI link:</span>

        <a
          href={`${process.env.REACT_APP_SUBSCAN_LINK}unique_item/${collectionId}-${tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {`${collectionId}-${tokenId}`}
        </a>
      </InfoItem>

      {!isOwner && <>You are not NFT's owner</>}
      <ActionsContainer>
        <Button
          onClick={() => setOpenModal(TokenModalEnum.TRANSFER)}
          disabled={!isOwner}
        >
          Transfer
        </Button>
        <Button
          onClick={() => setOpenModal(TokenModalEnum.NEST)}
          disabled={!isOwner}
        >
          Nest
        </Button>
        <Button
          onClick={() => setOpenModal(TokenModalEnum.UNNEST)}
          disabled={!isOwner}
        >
          Unnest
        </Button>
        <Button
          onClick={() => setOpenModal(TokenModalEnum.BURN)}
          disabled={!isOwner}
        >
          Burn
        </Button>
      </ActionsContainer>

      <TransferNFTModal
        isVisible={openModal === TokenModalEnum.TRANSFER}
        onClose={() => setOpenModal(null)}
      />
      <NestTModal
        isVisible={openModal === TokenModalEnum.NEST}
        onClose={() => setOpenModal(null)}
      />
      <UnnestTModal
        isVisible={openModal === TokenModalEnum.UNNEST}
        onClose={() => setOpenModal(null)}
      />
      <BurnModal
        isVisible={openModal === TokenModalEnum.BURN}
        onClose={() => setOpenModal(null)}
      />
    </Container>
  );
};

export default TokenPage;
