import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { TokenData } from '../pages/TokenPage';

const NestedNftContainer = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f8f8f8;
  width: fit-content;
  text-decoration: none;
  color: inherit;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-left: 15px;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`;

const NftImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
`;

const Badge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 12px;
  text-transform: uppercase;
`;

const MediaBadge = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 4px;
  border-radius: 5px;
`;

const InfoItem = styled.div`
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  width: 100%;

  span:first-child {
    text-align: left;
    flex: 1;
  }

  span:last-child {
    text-align: right;
    flex: 1;
  }
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
`;

interface NestedNftItemProps {
  child: TokenData;
  isNested?: boolean;
}

const NestedNftItem: React.FC<NestedNftItemProps> = ({ child, isNested }) => {
  // const mediaIcons = Object.values(child.media || {}).map((mediaItem, index) => (
  //   <Icon key={index} src={mediaItem.url} alt="media icon" />
  // ));

  return (
    <NestedNftContainer to={`/token/${child.collectionId}/${child.tokenId}`}>
      <ImageWrapper>
        <NftImage src={child.image || ''} alt={child.name || 'NFT Image'} />
        {isNested && <Badge>NESTED</Badge>}
        {child.isBundle && <Badge>BUNDLE</Badge>}
        {/* {mediaIcons.length > 0 && <MediaBadge>{mediaIcons}</MediaBadge>} */}
      </ImageWrapper>
      <ContentWrapper>
        <InfoItem>
          <span>Symbol:</span>
          <span>{child.tokenPrefix || '-'}</span>
        </InfoItem>
        <InfoItem>
          <span>ID:</span>
          <span>{child.tokenId || '-'}</span>
        </InfoItem>
        <InfoItem>
          <span>Collection:</span>
          <span>{child.collectionId || '-'}</span>
        </InfoItem>
      </ContentWrapper>
    </NestedNftContainer>
  );
};

export default NestedNftItem;
