// AWCRM Dashboard Layout - Professional CRM Layout
// Information-dense layout with sidebar navigation and header

import { setRequestLocale } from 'next-intl/server';
import { CRMLayout } from '@/components/layout/CRMLayout';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <CRMLayout>
      {props.children}
    </CRMLayout>
  );
}
