import React, { FC, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { CustomNextArrow, CustomPrevArrow } from './CustomSliderArrows';
import { CustomNextArrowVertical, CustomPrevArrowVertical } from './CustomSliderArrowsVertical';
import Slider from 'react-slick';
import LeftSliderItem from './LeftSliderItem';

import MainSliderItem from './MainSliderItem';
import { DecodedInfixOrUrlOrCidAndHash } from './types';
import useBreakpointObserver, { BREAKPOINTS } from '../../hooks/useBreakpointObserver';

export enum BadgeEnum {
  Fractional = 'Fractional',
  Bundle = 'Bundle',
  Nested = 'Nested',
  Customizable = 'customizable',
}

interface SliderItem {
  src?: string;
  //'token_image' | 'image' | 'youtube_url' | 'video' | 'audio'
  type: string;
  thumbnail?: string;
}

interface ITokenSliderProps {
  items: SliderItem[];
  baseSrc?: string | DecodedInfixOrUrlOrCidAndHash;
  wearableSrc?: string | DecodedInfixOrUrlOrCidAndHash;
  isWearable?: boolean;
  badges?: BadgeEnum[];
  previewMode?: boolean
}
export const TokenSlider: FC<ITokenSliderProps> = ({
  items: sliderItems,
  baseSrc,
  wearableSrc,
  isWearable,
  badges,
  previewMode,
}) => {
  const width = useBreakpointObserver();

  const SLIDES_TO_SHOW = useMemo(() => {
    if (width <= BREAKPOINTS.mobile) {
      return 4;
    } else if (width <= BREAKPOINTS.tablet) {
      return 4;
    } else if (width <= BREAKPOINTS.mediumDesktop) {
      return 3;
    } else if (width <= BREAKPOINTS.desktop) {
      return 4;
    } else {
      return 2;
    }
  }, [width]);
  const [activeIndex, setActiveIndex] = useState(0);
  const horizontalSliderRef = useRef<Slider>(null);
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: !previewMode,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    beforeChange: (oldIndex: number, newIndex: number) =>
      setActiveIndex(newIndex)
  };

  const [currentLeftSliderPosition, setCurrentLeftSliderPosition] = useState(0);

  const settings2 = {
    speed: 500,
    arrows: sliderItems.length > SLIDES_TO_SHOW,
    slidesToShow: SLIDES_TO_SHOW,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    swipeToSlide: true,
    infinite: false
  };

  const handleLeftSliderClick = (index: number) => {
    setActiveIndex(index);
    horizontalSliderRef.current?.slickGoTo(index);
  };

  return (
    <SliderWrapper>
      {width > BREAKPOINTS.tablet && (
        <PreviewCarouseWrap>
          <Slider
            {...settings2}
            nextArrow={
              sliderItems.length - SLIDES_TO_SHOW <=
              currentLeftSliderPosition ? (
                <></>
              ) : (
                <CustomNextArrowVertical />
              )
            }
            prevArrow={
              currentLeftSliderPosition ? <CustomPrevArrowVertical /> : <></>
            }
            afterChange={setCurrentLeftSliderPosition}
          >
            {sliderItems.map(({ type, src, thumbnail }, index) => (
              <LeftSliderItem
                key={index}
                src={src}
                type={type}
                index={index}
                thumbnail={thumbnail}
                activeIndex={activeIndex}
                handleLeftSliderClick={handleLeftSliderClick}
              />
            ))}
          </Slider>
        </PreviewCarouseWrap>
      )}

      <SliderContainer previewMode={!!previewMode}>
        <Slider ref={horizontalSliderRef} {...settings}>
          {sliderItems.map(({ type, src, thumbnail }, index) => (
            <MainSliderItem
              key={index}
              src={src || ''}
              type={type || ''}
              isWearable={isWearable}
              baseSrc={baseSrc}
              wearableSrc={wearableSrc}
              index={index}
              activeIndex={activeIndex}
              badges={badges}
              thumbnail={thumbnail}
            />
          ))}
        </Slider>
      </SliderContainer>
    </SliderWrapper>
  );
};

const SliderItem = styled.div`
  width: 100%;
  height: 100%;
`;

const SliderContainer = styled.div<{previewMode: boolean}>`
  position: relative;
  width: ${({previewMode}) => previewMode ? '440px !important' : '536px'};
  margin-right: 32px;
  margin-left: 32px;

  @media (max-width: ${BREAKPOINTS.desktop}px) {
    width: 536px;
  }

  @media (max-width: ${BREAKPOINTS.mediumDesktop}px) {
    width: 326px;
  }

  @media (max-width: ${BREAKPOINTS.smallDesktop}px) {
    width: 326px;
  }

  @media (max-width: ${BREAKPOINTS.tablet}px) {
    width: calc(100vw - 16px * 3);
    margin-left: 0;
  }

  @media (max-width: ${BREAKPOINTS.mobile}px) {
    width: calc(100vw - 16px * 2);
    margin-left: 0;
  }

  .slick-next .slick-prev .slick-next:before,
  .slick-prev:before {
    display: none;
  }
`;

const SliderWrapper = styled.div`
  display: flex;
`;

const PreviewCarouseWrap = styled.div`
  position: relative;
  width: 93px;
`;
