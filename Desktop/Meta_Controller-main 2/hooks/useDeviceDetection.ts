import { useEffect, useState } from 'react';

export function useDeviceDetection() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if device is mobile based on user agent
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    
    const mobilePatterns = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
      /IEMobile/i,
      /Opera Mini/i
    ];

    const isMobileDevice = mobilePatterns.some(pattern => pattern.test(userAgent));
    
    // Also check screen width for fallback detection
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const isSmallScreen = screenWidth < 1024; // Desktop threshold at 1024px

    const deviceIsMobile = isMobileDevice || isSmallScreen;
    
    setIsDesktop(!deviceIsMobile);
    setIsMobile(deviceIsMobile);
  }, []);

  return { isDesktop, isMobile };
}
