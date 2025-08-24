import type { LocalizationResource } from '@clerk/types';
import type { LocalePrefixMode } from 'next-intl/routing';
import { enUS, frFR } from '@clerk/localizations';

const localePrefix: LocalePrefixMode = 'as-needed';

// AWCRM - Enterprise CRM & Business Process Management Configuration
export const AppConfig = {
  name: 'AWCRM',
  title: 'AWCRM - Enterprise CRM & Business Process Management',
  description: 'AI-powered CRM with workflow automation for modern enterprises. Manage contacts, leads, deals, and business processes in one unified platform.',
  version: '1.0.0',
  author: 'AWCRM Team',
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix,
};

const supportedLocales: Record<string, LocalizationResource> = {
  en: enUS,
  fr: frFR,
};

export const ClerkLocalizations = {
  defaultLocale: enUS,
  supportedLocales,
};
