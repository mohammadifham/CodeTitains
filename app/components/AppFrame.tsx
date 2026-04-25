'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import SiteFooter from './SiteFooter';

interface AppFrameProps {
  children: React.ReactNode;
}

function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const showFooter = pathname !== '/login';

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      {showFooter ? <SiteFooter /> : null}
    </div>
  );
}

export default React.memo(AppFrame);