import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { DecodedInfixOrUrlOrCidAndHash } from '../types';
import { Icon } from '../../UI/Icon';
import { Tooltip } from '../../UI/Tooltip';

interface VideoProps {
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
}

export enum BadgeEnum {
  Fractional = 'Fractional',
  Bundle = 'Bundle',
  Nested = 'Nested',
  Customizable = 'customizable',
}
interface PictureProps {
  src?: string | DecodedInfixOrUrlOrCidAndHash
  alt: string
  testid?: string
  size?: number
  video?: string
  videoProps?: VideoProps
  isPlaying?: boolean
  badges?: BadgeEnum[]
}

const badgesTooltips = {
  Fractional: 'A fractional token provides a way for many users to own a part of an NFT',
  Bundle: 'A group of tokens nested in an NFT and having a nested, ordered, tree-like structure',
  Nested: 'A group of tokens nested in an NFT and having a nested, ordered, tree-like structure',
  customizable: 'This token is customizable'
};

export const Picture: FC<PictureProps> = ({
  alt,
  src,
  size,
  testid = '',
  video,
  videoProps,
  isPlaying,
  badges
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const { autoplay = false, controls = true, loop = true, muted = false } = useMemo(() => videoProps || {}, [videoProps]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isPlaying && videoRef.current?.paused) {
      void videoRef.current.play();
    } else if (!isPlaying && !videoRef.current?.paused) {
      void videoRef.current?.pause();
    }
  }, [isPlaying]);

  const imageSrc = useMemo(() => {
    const imageUrl = src ? (typeof src === 'string' ? src.trim() : src.fullUrl) : '';
    return imageUrl;
  }, [src]);

  const videoUrl = useMemo(() => {
    if (!video) return undefined;
    const url = video;
    // if video doesn't have poster, we rewind video to 0.001 sec
    // because iphone doesn't render first frame as a poster https://developer.apple.com/forums/thread/129377
    if (!imageSrc) return `${url}#t=0.001`;
    else return url;
  }, [video, imageSrc]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.1;
    }
  }, []);

  return (<div className={'picture'}>
    {isLoading && <></>}
    {badges && <BadgesWrapper>
      {badges.map((badge, key) => <Badge key={key} className={'badge'} tooltip={badgesTooltips[badge]} >
        <Icon name={badge} size={24} />
      </Badge>)}
    </BadgesWrapper>}
    {!isLoading && video &&
      <VideoStyled
        ref={videoRef}
        src={videoUrl || ''}
        poster={imageSrc || undefined}
        controls={controls}
        autoPlay={autoplay}
        playsInline
        loop={loop}
        muted={muted}
        data-testid={`${testid}-video`}
      />
    }
    {!isLoading && !hasError && imageSrc && !video &&
      <ImgStyled
        alt={alt}
        src={imageSrc}
        height={size || undefined}
        data-testid={`${testid}`}
        loading='lazy'
        // onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />}
    {!isLoading && (hasError || (!imageSrc && !video)) && <></>}
  </div>);
};

const ImgStyled = styled.img`
  box-sizing: border-box;
`;

const VideoStyled = styled.video`
  width: 100%;
  @media (min-width: 1920px) {
    height: 536px;
  }
  @media (max-width: 767px) {
    height: 100%;
  }
`;

const BadgesWrapper = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  z-index: 2;
`;

  

const Badge: FC<{ tooltip: string, className?: string, children: React.ReactNode; }> = ({ tooltip, children, className }) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  return <>
    <Tooltip targetRef={badgeRef} >{tooltip}</Tooltip>
    <BadgeWrapper ref={badgeRef} className={className} >{children}</BadgeWrapper>
  </>;
};

const BadgeWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px;
  background-color: #FFFFF;
  border-radius: 4px;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #040B1D;
  box-shadow: 0px 2.767256498336792px 2.2138051986694336px 0px #68686812, 0px 6.650102138519287px 5.32008171081543px 0px #6868680D, 0px 12.521552085876465px 10.017241477966309px 0px #6868680B, 0px 22.3363094329834px 17.869047164916992px 0px #68686809, 0px 41.777610778808594px 33.422088623046875px 0px #68686807, 0px 100px 80px 0px #68686805;
`;
