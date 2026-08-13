'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { DesktopOnlyRestriction } from './DesktopOnlyRestriction';

interface DeviceRestrictionWrapperProps {
  children: ReactNode;
}

export function DeviceRestrictionWrapper({ children }: DeviceRestrictionWrapperProps) {
  const { isDesktop, isMobile } = useDeviceDetection();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show nothing while detecting device to avoid hydration mismatch
  if (!isMounted || isDesktop === null) {
    return <div className="bg-gray-50" />; // Empty safe fallback during detection
  }

  // If user is on mobile, show the restriction message
  if (isMobile) {
    return <DesktopOnlyRestriction />;
  }

  // Otherwise, render the normal app
  return <>{children}</>;
}
