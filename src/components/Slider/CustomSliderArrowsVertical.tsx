import React, { useEffect, useMemo, useState } from 'react';
import { LEFT_SLIDER_ITEM_SIZE } from './LeftSliderItem';
import useBreakpointObserver, { BREAKPOINTS } from '../../hooks/useBreakpointObserver';

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const CustomNextArrowVertical: React.FC<ArrowProps> = (props) => {
  const { className, style, onClick } = props;
  const [isHovered, setIsHovered] = useState(false);
  //react-slick not remove default arrow
  useEffect(() => {
    const style2 = document.createElement('style');
    style2.innerHTML = `
          .slick-prev:before {
            display: none !important;
          }
        `;
    document.head.appendChild(style2);
    return () => {
      document.head.removeChild(style2);
    };
  }, []);

  const width = useBreakpointObserver();

  const calculateTop = useMemo(() => {
  const baseCalculation = LEFT_SLIDER_ITEM_SIZE + 22;
    if (width <= BREAKPOINTS.mobile) {
      return 4 * baseCalculation - 22;
    } else if (width <= BREAKPOINTS.tablet) {
      return 4 * baseCalculation - 22;
    } else if (width <= BREAKPOINTS.mediumDesktop) {
      return 3 * baseCalculation - 22;
    } else if (width <= BREAKPOINTS.desktop) {
      return 4 * baseCalculation - 22;
    } else {
      return 2 * baseCalculation - 22;
    }
  }, [width]);

  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: '25px',
        width: '50px',
        height: '50px',
        transition: 'background-color 0.3s ease',
        boxShadow: isHovered
          ? '0px 3px 3px 0px #00000040'
          : '0px 2px 2px 0px #00000020',

        top: calculateTop,
        position: 'absolute',
        left: 'calc(50% - 25px)'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width='12'
        height='10'
        viewBox='0 0 12 10'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M1 3.00002L5.99998 8L11 3.00002'
          stroke='#009CF0'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

const CustomPrevArrowVertical: React.FC<ArrowProps> = (props) => {
  const { className, style, onClick } = props;
  const [isHovered, setIsHovered] = useState(false);

  //react-slick not remove default arrow
  useEffect(() => {
    const style2 = document.createElement('style');
    style2.innerHTML = `
        .slick-prev:before {
          display: none !important;
        }
      `;
    document.head.appendChild(style2);
    return () => {
      document.head.removeChild(style2);
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: '25px',
        width: '50px',
        height: '50px',
        transition: 'background-color 0.3s ease',
        boxShadow: isHovered
          ? '0px -3px 3px 0px #00000040'
          : '0px -2px 2px 0px #00000020',
        zIndex: 222,
        top: '0',
        position: 'absolute',
        left: 'calc(50% - 25px)'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width='12'
        height='10'
        viewBox='0 0 12 10'
        style={{ transform: 'rotate(180deg)' }}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M1 3.00002L5.99998 8L11 3.00002'
          stroke='#009CF0'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

export { CustomPrevArrowVertical, CustomNextArrowVertical };
