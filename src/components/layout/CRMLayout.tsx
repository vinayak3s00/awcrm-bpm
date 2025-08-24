'use client';

import React from 'react';
import { CRMSidebar } from './CRMSidebar';
import '@/styles/crm-globals.css';

type CRMLayoutProps = {
  children: React.ReactNode;
};

export function CRMLayout({ children }: CRMLayoutProps) {
  return (
    <div className="bg-gray-25 min-h-screen">
      <CRMSidebar />
      <div className="crm-main">
        {children}
      </div>
    </div>
  );
}
