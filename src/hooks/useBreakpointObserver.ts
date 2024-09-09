import { useState, useEffect } from 'react';

export const BREAKPOINTS = {
  mobile: 567,
  tablet: 767,
  smallDesktop: 1023,
  mediumDesktop: 1400,
  desktop: 1919,
};

const useBreakpointObserver = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

export default useBreakpointObserver;
