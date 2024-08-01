import React, { useEffect, useState } from 'react';

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const CustomNextArrow: React.FC<ArrowProps> = (props) => {
  const { className, style, onClick } = props;
  const [isHovered, setIsHovered] = useState(false);

  //react-slick not remove default arrow
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .slick-next:before {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        backgroundColor: '#FFF',
        borderRadius: '25px',
        width: '50px',
        height: '50px',
        transition: 'background-color 0.3s ease',
        boxShadow: isHovered
          ? '0px 3px 3px 0px #00000040'
          : '0px 2px 2px 0px #00000020',
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        style={{margin: '20px 22px'}}
        width='9'
        height='12'
        viewBox='0 0 9 12'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M1.50002 1L6.5 5.99998L1.50002 11'
          stroke='#009CF0'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

const CustomPrevArrow: React.FC<ArrowProps> = (props) => {
  const { className, style, onClick } = props;
  const [isHovered, setIsHovered] = useState(false);

  //react-slick not remove default arrow
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .slick-prev:before {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
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
          ? '0px 3px 3px 0px #00000040'
          : '0px 2px 2px 0px #00000020',
        zIndex: 222
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width='9'
        height='12'
        viewBox='0 0 9 12'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M7.49998 1L2.5 5.99998L7.49998 11'
          stroke='#009CF0'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

export { CustomNextArrow, CustomPrevArrow };
