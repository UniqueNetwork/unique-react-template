import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import VideoIcon from '../../static/icons/video.svg';
import AudioIcon from '../../static/icons/audio.svg';
import { Icon } from '../UI/Icon';
// import { Icon } from 'components/UI';

export const LEFT_SLIDER_ITEM_SIZE = 92;

interface SliderItem {
  src?: string;
  thumbnail?: string;
  // 'token_image' | 'image' | 'youtube_url' | 'video' | 'audio'
  type: string;
  index: number;
  activeIndex: number;
  handleLeftSliderClick: (index: number) => void;
}

const Container = styled.div<{
  isMedia: boolean;
  active: boolean;
  backgroundImage?: string;
  // 'token_image' | 'image' | 'youtube_url' | 'video' | 'audio';
  type: string;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 92px;
  height: 92px;
  margin-bottom: 22px;
  position: relative;
  background: ${({ backgroundImage }) =>
    backgroundImage
      ? `url(${backgroundImage}) no-repeat center/cover`
      : 'transparent'};
  box-shadow: ${({ isMedia }) =>
    isMedia
      ? 'none'
      : 'inset 0 0 28px 7px #00000040'};
  cursor: pointer;
  border: ${({ active }) => (active ? '2px solid #009CF0' : 'none')};
  border-radius: 8px;
  box-sizing: border-box;
  overflow: hidden;

  ${({ type }) =>
    (type === 'video' || type === 'youtube_url') &&
    css`
      &:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-shadow: inset 0 0 28px 7px rgba(0, 0, 0, 0.5);
        pointer-events: none;
        border-radius: 8px;
      }
    `}
`;

const Thumbnail = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 25px;
  width: 50px;
  height: 50px;
  position: absolute;
  left: calc(50% - 25px);
`;

const BlurredMedia = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  filter: blur(5px);
  pointer-events: none;
`;

const LeftSliderItem: React.FC<SliderItem> = ({
  src,
  type,
  index,
  activeIndex,
  thumbnail,
  handleLeftSliderClick
}) => {
  const onItemClick = () => {
    handleLeftSliderClick(index);
  };

  const isActive = useMemo(() => activeIndex === index, [activeIndex, index]);

  switch (type) {
    case 'token_image':
    case 'animation_url':
    case 'image':
      return (
        <Container
          type={type}
          isMedia={true}
          active={isActive}
          onClick={onItemClick}
        >
          <Thumbnail src={src} alt='Media' />
        </Container>
      );
    case 'youtube_url':
      return (
        <Container
          type={type}
          isMedia={true}
          active={isActive}
          onClick={onItemClick}
        >
          <BlurredMedia>
            <iframe
              src={`https://www.youtube.com/embed/${src}`}
              width='100%'
              height='100%'
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              style={{ borderRadius: '8px' }}
            />
          </BlurredMedia>
          <IconContainer>
            <Icon file={VideoIcon} size={32} />
          </IconContainer>
        </Container>
      );
    case 'video':
      return (
        <Container
          type={type}
          isMedia={true}
          active={isActive}
          onClick={onItemClick}
        >
          <BlurredMedia>
            <video
              src={src}
              width='100%'
              height='100%'
              style={{ borderRadius: '8px' }}
              controls={false}
            />
          </BlurredMedia>
          <IconContainer>
            <Icon file={VideoIcon} size={32} />
          </IconContainer>
        </Container>
      );
    case 'audio':
      return (
        <Container
          type={type}
          isMedia={true}
          backgroundImage={thumbnail || 'rgba(0, 0, 0, 1)'}
          active={isActive}
          onClick={onItemClick}
        >
          <IconContainer>
            <Icon file={AudioIcon} size={32} />
          </IconContainer>
        </Container>
      );
    default:
      return null;
  }
};

export default LeftSliderItem;
