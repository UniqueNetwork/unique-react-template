import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';


import YouTube, { YouTubeEvent, YouTubeProps } from 'react-youtube';
import { DecodedInfixOrUrlOrCidAndHash } from './types';
import { BadgeEnum, Picture } from '../Picture';
import { BREAKPOINTS } from '../../hooks/useBreakpointObserver';
import { WearablePicture } from './TokenMedia/WearablePicture';
import { extractVideoId, isYouTubeLink } from '../../utils/common';


interface SliderItem {
  src: string;
  // 'token_image' | 'image' | 'youtube_url' | 'video' | 'audio'
  type: string;
  isWearable?: boolean;
  baseSrc?: string | DecodedInfixOrUrlOrCidAndHash;
  wearableSrc?: string | DecodedInfixOrUrlOrCidAndHash;
  tokenId?: number;
  index: number;
  activeIndex: number;
  badges?: BadgeEnum[];
  thumbnail?: string,
}

const SliderItem = styled.div`
  width: calc(100% - 4px);
  margin: auto;
  border: none;

  display: flex;
  align-items: center;
  height: 536px;

  @media (max-width: ${BREAKPOINTS.desktop}px) {
    height: 536px;
  }

  @media (max-width: ${BREAKPOINTS.mediumDesktop}px) {
    height: 326px;
  }

  @media (max-width: ${BREAKPOINTS.tablet}px) {
    height: calc(100vw - var(--prop-gap) * 3);
  }

  @media (max-width: ${BREAKPOINTS.mobile}px) {
    height: calc(100vw - var(--prop-gap) * 2);
  }

  > div {
    flex: 1;
  }
`;

const PictureWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  // width: 100%;
  flex-direction: column;
  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  div[class^='Skeleton'] {
    position: absolute;
  }

  .picture {
    position: absolute;
    top: 0;
    left: 2px;
    bottom: 0;
    right: 2px;
    display: flex;
    align-items: center;
    color: white;
    text-align: center;
    max-height: 100%;
    border-radius: 8px;
    overflow: hidden;

    img {
      max-width: 100%;
      max-height: 100%;
      border-radius: 8px;
    }

    svg {
      border-radius: 8px;
      height: auto;
    }
  }
`;

const MainSliderItem = ({
  src,
  type,
  isWearable,
  wearableSrc,
  baseSrc,
  tokenId,
  activeIndex,
  index,
  thumbnail,
  badges
}: SliderItem) => {
  const isActive = activeIndex === index;
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive) {
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => video.pause());

      //Stop youtube video
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
    }
  }, [isActive, playerRef]);

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    playerVars: {
      autoplay: 0
    }
  };

  const onReady = (event: YouTubeEvent) => {
    event.target.pauseVideo();
    playerRef.current = event.target;
  };

  switch (type) {
    case 'token_image':
      return (
        <PictureWrapper>
          {!isWearable ? (
            <Picture
              alt={tokenId?.toString() || ''}
              src={src}
              badges={badges}
            />
          ) : (
            <WearablePicture
              alt={tokenId?.toString() || ''}
              src={src}
              wearableSrc={wearableSrc || src}
              baseSrc={baseSrc}
            />
          )}
        </PictureWrapper>
      );
    case 'image':
    case 'animation_url':
      return (
        <PictureWrapper>
          <Picture alt={tokenId?.toString() || ''} src={src} badges={badges} />
        </PictureWrapper>
      );
    case 'youtube_url':
      return (
        <SliderItem>
          <YouTube
            videoId={extractVideoId(src)}
            opts={opts}
            onReady={onReady}
          />
        </SliderItem>
      );
    case 'video':
      return (
        <>
          {isYouTubeLink(src) ? (
            <SliderItem>
              <YouTube
                videoId={extractVideoId(src)}
                opts={opts}
                onReady={onReady}
              />
            </SliderItem>
          ) : (
            <PictureWrapper>
              <Picture
                alt={tokenId?.toString() || ''}
                src={''}
                video={src || ''}
                testid={`${`testid`}-token-picture`}
              />
            </PictureWrapper>
          )}
        </>
      );
    case 'audio':
      return (
        <SliderItem>
          <Picture alt={tokenId?.toString() || ''} src={thumbnail} video={src || ''} />
        </SliderItem>
      );
    default:
      return null;
  }
};

export default MainSliderItem;
