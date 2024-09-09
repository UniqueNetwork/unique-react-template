import { useEffect, useMemo, useState } from 'react';

/**
 * @enum {number}
 * sm: <769px
 * * md: <1025px
 * * lg: <1280px
 * * xl: <1440px
 * * xxl: others
 */
export enum DeviceSize {
  sm,
  md,
  lg,
  xl,
  xxl
}

export enum SizeMap {
  xxs = -1,
  xs = 0,
  sm = 1,
  md = 2,
  lg = 3,
  xl = 4,
  xxl = 5,
}

const useDeviceSize = (): DeviceSize => {
  const [windowWidth, setWindowWidth] = useState<number | undefined>();

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width to state
      setWindowWidth(window.innerWidth);
    }

    // Add event listener
    window.addEventListener('resize', handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return useMemo(() => {
    if (windowWidth && windowWidth < 769) return DeviceSize.sm;
    if (windowWidth && windowWidth < 1025) return DeviceSize.md;
    if (windowWidth && windowWidth < 1280) return DeviceSize.lg;
    if (windowWidth && windowWidth < 1440) return DeviceSize.xl;
    return DeviceSize.xxl;
  }, [windowWidth]);
};

export default useDeviceSize;
