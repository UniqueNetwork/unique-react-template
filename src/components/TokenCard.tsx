import styled, { keyframes, css } from "styled-components";
import { Token } from "../utils/types";

const swing = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
`;

const TokenCardWrapper = styled.div<{ $isActive: boolean }>`
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  overflow: hidden;
  border-radius: 10px;
  position: relative;

  ${({ $isActive }) =>
    css`
      filter: ${$isActive ? "none" : "grayscale(100%)"};
      transition: all 0.5s ease;

      ${$isActive &&
      css`
        animation: ${swing} 2s infinite;
        box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
      `}
    `}

  &:hover {
    cursor: pointer;
  }
`;

const TokenImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

interface TagProps {
  top: number;
}

const Tag = styled.div.attrs<TagProps>(({ top }) => ({
  style: { top: `${top}px` },
}))<TagProps>`
  position: absolute;
  left: -10px;
  background-color: #ffcc00;
  color: #333;
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 0 5px 5px 0;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

export const TokenCard = ({
  token,
  fallbackImage,
  isActive,
  onClick,
}: {
  token: Token | null | undefined;
  fallbackImage: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  const experienceAttr = token?.attributes?.find(
    (attr) => attr.trait_type === "Experience"
  );
  const generationAttr = token?.attributes?.find(
    (attr) => attr.trait_type === "Generation"
  );

  return (
    <TokenCardWrapper $isActive={isActive} onClick={onClick}>
      {experienceAttr && (
        <Tag top={20}>Exp: {experienceAttr.value}</Tag>
      )}
      {generationAttr && (
        <Tag top={60}>Gen: {generationAttr.value}</Tag>
      )}

      {token?.image ? (
        <TokenImage src={token.image} alt={`Token ${token.tokenId}`} />
      ) : (
        <TokenImage src={fallbackImage} alt="Fallback Image" />
      )}
    </TokenCardWrapper>
  );
};
