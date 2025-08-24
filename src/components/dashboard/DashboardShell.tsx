// AWCRM Dashboard Shell - Modern Responsive Layout
// Main dashboard layout with sidebar navigation and header

'use client';

import { SignOutButton, useOrganization, useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  DollarSign,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/libs/utils';

type DashboardShellProps = {
  children: React.ReactNode;
};

// Navigation items
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and analytics',
  },
  {
    name: 'Contacts',
    href: '/dashboard/contacts',
    icon: Users,
    description: 'People in your CRM',
  },
  {
    name: 'Companies',
    href: '/dashboard/companies',
    icon: Building2,
    description: 'Organizations & accounts',
    badge: 'New',
  },
  {
    name: 'Leads',
    href: '/dashboard/leads',
    icon: TrendingUp,
    description: 'Sales pipeline & leads',
  },
  {
    name: 'Deals',
    href: '/dashboard/deals',
    icon: DollarSign,
    description: 'Opportunities & revenue',
    badge: 'New',
  },
  {
    name: 'Activities',
    href: '/dashboard/activities',
    icon: Calendar,
    description: 'Tasks & communications',
    disabled: true,
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    description: 'Analytics & insights',
    disabled: true,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account settings',
    disabled: true,
  },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { organization } = useOrganization();

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial="closed"
        animate={sidebarOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        className="fixed inset-y-0 left-0 z-50 w-60 border-r border-gray-200 bg-white lg:static lg:inset-0 lg:translate-x-0"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b border-gray-200 px-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="rounded bg-blue-600 p-1.5 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold text-gray-900">AWCRM</span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="ml-auto lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Organization info */}
          {organization && (
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={organization.imageUrl} alt={organization.name} />
                  <AvatarFallback className="bg-blue-600 text-xs text-white">
                    {organization.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-900">
                    {organization.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.disabled ? '#' : item.href}
                    className={cn(
                      'group flex items-center px-2 py-1.5 text-sm font-medium rounded transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : item.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100',
                    )}
                    onClick={(e) => {
                      if (item.disabled) {
                        e.preventDefault();
                      } else {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <Icon
                      className={cn(
                        'mr-2 h-4 w-4 flex-shrink-0',
                        isActive ? 'text-blue-600' : 'text-gray-500',
                      )}
                    />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {item.disabled && (
                      <Badge variant="outline" className="ml-1 border-gray-300 px-1.5 py-0.5 text-xs text-gray-500">
                        Soon
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start p-2"
                >
                  <Avatar className="mr-3 h-8 w-8">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                    <AvatarFallback className="bg-gray-100">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/user-profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <SignOutButton>
                    <button className="flex w-full items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Top header */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
          <div className="flex h-12 items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>

              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="h-7 w-48 border-gray-200 pl-7 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-1">
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  3
                </span>
              </Button>

              {/* Quick actions */}
              <Button size="sm" className="h-7 bg-blue-600 px-2 text-xs text-white hover:bg-blue-700">
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-gray-50">
          <div className="p-3">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
