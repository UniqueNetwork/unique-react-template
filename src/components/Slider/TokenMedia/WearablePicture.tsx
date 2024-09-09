import React, { FC, useCallback, useState } from 'react';
import styled from 'styled-components';
import { Placeholder } from './Placeholder';
import { DecodedInfixOrUrlOrCidAndHash } from '../types';

interface PictureProps {
  src?: string | DecodedInfixOrUrlOrCidAndHash;
  baseSrc?: string | DecodedInfixOrUrlOrCidAndHash;
  wearableSrc?: string | DecodedInfixOrUrlOrCidAndHash;
  alt: string;
  testid?: string;
  size?: number;
}

export const WearablePicture: FC<PictureProps> = ({
  alt,
  src,
  wearableSrc,
  baseSrc,
  size,
  testid = ''
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [tryMode, setTryMode] = useState<boolean>(false);

  const onTryOnClick = useCallback(() => {
    setTryMode(!tryMode);
  }, [tryMode]);

  return (<>
    <PictureWrapper className={'picture'}>
      <ImgStyled
        visible={!!baseSrc && tryMode}
        alt={alt}
        src={getUrl(baseSrc)}
        height={size || undefined}
        data-testid={`${testid}`}
      />
      <ImgStyled
        visible={!!baseSrc && tryMode}
        alt={alt}
        src={getUrl(wearableSrc)}
        height={size || undefined}
        data-testid={`${testid}`}
      />
      {!hasError && src &&
      <PreviewWrapper>
        <ImgStyled
          visible={!isLoading && !tryMode}
          alt={alt}
          src={getUrl(src)}
          height={size || undefined}
          data-testid={`${testid}`}
          loading='lazy'
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
        {!isLoading && !hasError && baseSrc && <ActionsWrapper size={size}>
          {/* <Button onClick={onTryOnClick} title={tryMode ? 'Wearable' : 'Try on'} /> */}
        </ActionsWrapper>}
      </PreviewWrapper>}
      {!isLoading && (hasError || !src || !baseSrc) && <Placeholder size={size} />}
      {isLoading && <></>}
    </PictureWrapper>
  </>);
};

const PictureWrapper = styled.div`
`;

const PreviewWrapper = styled.div`
  position: absolute;
  top: 0;
  top: 0;
  left: 0;

  &>img {
    position: relative;
  }
`;

const ImgStyled = styled.img<{ visible: boolean }>`
  opacity: ${({ visible }) => visible ? 1 : 0};
  transition: all 0.2s;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ActionsWrapper = styled.div<{ size: number | undefined }>`
  z-index: 1;
  position: absolute;
  right: 16px;
  bottom: 22px;
`;

const getUrl = (src?: string | DecodedInfixOrUrlOrCidAndHash) => src ? (typeof src === 'string' ? src.trim() : (src.fullUrl || '')) : '';
