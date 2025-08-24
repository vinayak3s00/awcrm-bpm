'use client';

import {
  BarChart3,
  Building2,
  Calendar,
  Database,
  DollarSign,
  FileText,
  LayoutDashboard,
  Mail,
  Phone,
  Settings,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
};

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Contacts',
    href: '/dashboard/contacts',
    icon: Users,
    badge: '1,247',
  },
  {
    name: 'Companies',
    href: '/dashboard/companies',
    icon: Building2,
    badge: '89',
  },
  {
    name: 'Deals',
    href: '/dashboard/deals',
    icon: TrendingUp,
    badge: '23',
  },
  {
    name: 'Leads',
    href: '/dashboard/leads',
    icon: Target,
    badge: '156',
  },
  {
    name: 'Activities',
    href: '/dashboard/activities',
    icon: Calendar,
    children: [
      { name: 'All Activities', href: '/dashboard/activities', icon: Calendar },
      { name: 'Calls', href: '/dashboard/activities/calls', icon: Phone },
      { name: 'Emails', href: '/dashboard/activities/emails', icon: Mail },
      { name: 'Meetings', href: '/dashboard/activities/meetings', icon: Users },
      { name: 'Tasks', href: '/dashboard/activities/tasks', icon: FileText },
    ],
  },
  {
    name: 'Sales',
    href: '/dashboard/sales',
    icon: DollarSign,
    children: [
      { name: 'Pipeline', href: '/dashboard/sales/pipeline', icon: TrendingUp },
      { name: 'Forecasting', href: '/dashboard/sales/forecasting', icon: BarChart3 },
      { name: 'Quotes', href: '/dashboard/sales/quotes', icon: FileText },
      { name: 'Orders', href: '/dashboard/sales/orders', icon: Database },
    ],
  },
  {
    name: 'Marketing',
    href: '/dashboard/marketing',
    icon: UserPlus,
    children: [
      { name: 'Campaigns', href: '/dashboard/marketing/campaigns', icon: Mail },
      { name: 'Email Templates', href: '/dashboard/marketing/templates', icon: FileText },
      { name: 'Lead Sources', href: '/dashboard/marketing/sources', icon: Target },
    ],
  },
  {
    name: 'Automation',
    href: '/dashboard/automation',
    icon: Workflow,
    children: [
      { name: 'Workflows', href: '/dashboard/automation/workflows', icon: Workflow },
      { name: 'Triggers', href: '/dashboard/automation/triggers', icon: Target },
      { name: 'Actions', href: '/dashboard/automation/actions', icon: Settings },
    ],
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    children: [
      { name: 'Sales Reports', href: '/dashboard/reports/sales', icon: DollarSign },
      { name: 'Activity Reports', href: '/dashboard/reports/activities', icon: Calendar },
      { name: 'Performance', href: '/dashboard/reports/performance', icon: TrendingUp },
    ],
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    children: [
      { name: 'General', href: '/dashboard/settings/general', icon: Settings },
      { name: 'Users & Roles', href: '/dashboard/settings/users', icon: Users },
      { name: 'Custom Fields', href: '/dashboard/settings/fields', icon: Database },
      { name: 'Integrations', href: '/dashboard/settings/integrations', icon: Workflow },
    ],
  },
];

export function CRMSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name],
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isExpanded = (name: string) => expandedItems.includes(name);

  return (
    <div className="crm-sidebar">
      {/* Logo */}
      <div className="crm-flex crm-items-center crm-gap-2 border-b border-gray-200 p-4">
        <div className="crm-flex crm-items-center h-8 w-8 justify-center rounded-md bg-blue-600">
          <span className="crm-font-bold crm-text-sm text-white">AW</span>
        </div>
        <div>
          <div className="crm-font-semibold crm-text-md text-gray-900">AWCRM</div>
          <div className="crm-text-xs text-gray-500">Enterprise</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        <div className="space-y-1">
          {navigation.map(item => (
            <div key={item.name}>
              {/* Main Item */}
              <div
                className={`
                  crm-flex crm-items-center crm-justify-between cursor-pointer rounded-md px-3 py-2 transition-colors
                  ${isActive(item.href)
              ? 'border-r-2 border-blue-600 bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
            }
                `}
                onClick={() => {
                  if (item.children) {
                    toggleExpanded(item.name);
                  }
                }}
              >
                <Link href={item.href} className="crm-flex crm-items-center crm-gap-3 flex-1">
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="crm-text-sm crm-font-medium">{item.name}</span>
                </Link>

                <div className="crm-flex crm-items-center crm-gap-2">
                  {item.badge && (
                    <span className="crm-badge crm-badge-info crm-text-xs px-2 py-0.5">
                      {item.badge}
                    </span>
                  )}
                  {item.children && (
                    <svg
                      className={`h-3 w-3 transition-transform ${
                        isExpanded(item.name) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Children */}
              {item.children && isExpanded(item.name) && (
                <div className="mt-1 ml-4 space-y-1">
                  {item.children.map(child => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={`
                        crm-flex crm-items-center crm-gap-3 rounded-md px-3 py-1.5 transition-colors
                        ${isActive(child.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                      `}
                    >
                      <child.icon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="crm-text-sm">{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="absolute right-0 bottom-0 left-0 border-t border-gray-200 bg-gray-50 p-4">
        <div className="crm-flex crm-items-center crm-gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-300"></div>
          <div className="min-w-0 flex-1">
            <div className="crm-text-sm crm-font-medium truncate text-gray-900">John Doe</div>
            <div className="crm-text-xs truncate text-gray-500">john@company.com</div>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
