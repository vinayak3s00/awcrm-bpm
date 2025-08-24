'use client';

import {
  Building2,
  Calendar,
  Download,
  Filter,
  HelpCircle,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { KnowledgeBase } from '@/components/help/KnowledgeBase';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { GlobalSearch } from '@/components/search/GlobalSearch';

type CRMHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  showFilters?: boolean;
  showQuickActions?: boolean;
};

const quickActions = [
  { name: 'Add Contact', icon: Users, href: '/dashboard/contacts/new', color: 'bg-blue-600' },
  { name: 'Add Company', icon: Building2, href: '/dashboard/companies/new', color: 'bg-green-600' },
  { name: 'Add Deal', icon: TrendingUp, href: '/dashboard/deals/new', color: 'bg-purple-600' },
  { name: 'Schedule Meeting', icon: Calendar, href: '/dashboard/activities/new', color: 'bg-orange-600' },
];

export function CRMHeader({
  title,
  subtitle,
  actions,
  showSearch = true,
  showFilters = true,
  showQuickActions = true,
}: CRMHeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);

  return (
    <div className="crm-header">
      <div className="crm-flex crm-items-center crm-justify-between">
        {/* Left Section - Title and Search */}
        <div className="crm-flex crm-items-center crm-gap-6 flex-1">
          {/* Title */}
          <div>
            <h1 className="crm-text-xl crm-font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="crm-text-sm mt-0.5 text-gray-500">{subtitle}</p>
            )}
          </div>

          {/* Global Search */}
          {showSearch && (
            <GlobalSearch
              placeholder="Search contacts, companies, deals..."
              onResultClick={(result) => {
                console.log('Search result clicked:', result);
              }}
            />
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="crm-flex crm-items-center crm-gap-3">
          {/* Filters */}
          {showFilters && (
            <button className="crm-button crm-button-secondary crm-flex crm-items-center crm-gap-2">
              <Filter className="h-4 w-4" />
              <span className="crm-text-sm">Filters</span>
            </button>
          )}

          {/* Import/Export */}
          <div className="crm-flex crm-items-center">
            <button className="crm-button crm-button-secondary p-2" title="Import">
              <Upload className="h-4 w-4" />
            </button>
            <button className="crm-button crm-button-secondary ml-1 p-2" title="Export">
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="relative">
              <button
                className="crm-button crm-button-primary crm-flex crm-items-center crm-gap-2"
                onClick={() => setShowQuickMenu(!showQuickMenu)}
              >
                <Plus className="h-4 w-4" />
                <span className="crm-text-sm">New</span>
              </button>

              {/* Quick Actions Dropdown */}
              {showQuickMenu && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg">
                  <div className="py-2">
                    <div className="crm-text-xs crm-font-semibold px-3 py-2 tracking-wide text-gray-500 uppercase">
                      Quick Actions
                    </div>
                    {quickActions.map(action => (
                      <a
                        key={action.name}
                        href={action.href}
                        className="crm-flex crm-items-center crm-gap-3 px-3 py-2 transition-colors hover:bg-gray-50"
                        onClick={() => setShowQuickMenu(false)}
                      >
                        <div className={`h-8 w-8 ${action.color} crm-flex crm-items-center justify-center rounded-md`}>
                          <action.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="crm-text-sm crm-font-medium text-gray-900">{action.name}</div>
                          <div className="crm-text-xs text-gray-500">
                            Create new
                            {action.name.toLowerCase()}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Actions */}
          {actions}

          {/* Notifications */}
          <NotificationCenter />

          {/* Help */}
          <button
            onClick={() => setShowKnowledgeBase(true)}
            className="crm-button crm-button-secondary p-2"
            title="Help & Knowledge Base"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* More Actions */}
          <button className="crm-button crm-button-secondary p-2">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Results Overlay */}
      {searchValue && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-3">
            <div className="crm-text-sm mb-2 text-gray-500">
              Search results for "
              {searchValue}
              "
            </div>

            {/* Sample Results */}
            <div className="space-y-2">
              <div className="crm-flex crm-items-center crm-gap-3 cursor-pointer rounded-md p-2 hover:bg-gray-50">
                <div className="crm-flex crm-items-center h-8 w-8 justify-center rounded-full bg-blue-100">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="crm-text-sm crm-font-medium">John Smith</div>
                  <div className="crm-text-xs text-gray-500">Contact • john@company.com</div>
                </div>
              </div>

              <div className="crm-flex crm-items-center crm-gap-3 cursor-pointer rounded-md p-2 hover:bg-gray-50">
                <div className="crm-flex crm-items-center h-8 w-8 justify-center rounded-full bg-green-100">
                  <Building2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="crm-text-sm crm-font-medium">Acme Corporation</div>
                  <div className="crm-text-xs text-gray-500">Company • 45 employees</div>
                </div>
              </div>

              <div className="crm-flex crm-items-center crm-gap-3 cursor-pointer rounded-md p-2 hover:bg-gray-50">
                <div className="crm-flex crm-items-center h-8 w-8 justify-center rounded-full bg-purple-100">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="crm-text-sm crm-font-medium">Enterprise Software Deal</div>
                  <div className="crm-text-xs text-gray-500">Deal • $50,000 • Negotiation</div>
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-gray-100 pt-2">
              <button className="crm-text-sm text-blue-600 hover:text-blue-700">
                View all results →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {(showQuickMenu || searchValue) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowQuickMenu(false);
            setSearchValue('');
          }}
        />
      )}

      {/* Knowledge Base */}
      <KnowledgeBase
        isOpen={showKnowledgeBase}
        onClose={() => setShowKnowledgeBase(false)}
      />
    </div>
  );
}
