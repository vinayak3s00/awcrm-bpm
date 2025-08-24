// AWCRM Dashboard Home Page - Analytics Overview
// Main dashboard with key metrics and recent activity

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye
} from 'lucide-react';
import { useOrganization } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Mock data for comprehensive CRM dashboard metrics
const dashboardMetrics = [
  {
    title: 'Total Contacts',
    value: '2,847',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
    color: 'bg-blue-500',
    href: '/dashboard/contacts',
    description: 'People in your CRM',
  },
  {
    title: 'Active Companies',
    value: '156',
    change: '+8%',
    changeType: 'positive' as const,
    icon: Building2,
    color: 'bg-indigo-500',
    href: '/dashboard/companies',
    description: 'Organizations tracked',
  },
  {
    title: 'Open Deals',
    value: '47',
    change: '+18%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    color: 'bg-green-500',
    href: '/dashboard/deals',
    description: 'Active opportunities',
  },
  {
    title: 'Pipeline Value',
    value: '$2.4M',
    change: '+15%',
    changeType: 'positive' as const,
    icon: DollarSign,
    color: 'bg-orange-500',
    href: '/dashboard/deals',
    description: 'Total deal value',
  },
  {
    title: 'Active Leads',
    value: '36',
    change: '+22%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    color: 'bg-purple-500',
    href: '/dashboard/leads',
    description: 'Qualified prospects',
  },
  {
    title: 'Conversion Rate',
    value: '24%',
    change: '+3%',
    changeType: 'positive' as const,
    icon: Building2,
    color: 'bg-pink-500',
    href: '/dashboard/analytics',
    description: 'Lead to deal rate',
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'deal_won',
    title: 'Deal closed won! 🎉',
    description: 'Enterprise Software Deal - $50,000',
    time: '5 minutes ago',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 2,
    type: 'contact_added',
    title: 'New contact added',
    description: 'Sarah Johnson from TechCorp Solutions',
    time: '15 minutes ago',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 3,
    type: 'deal_updated',
    title: 'Deal moved to negotiation',
    description: 'E-commerce Platform Integration - $75,000',
    time: '1 hour ago',
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    id: 4,
    type: 'company_added',
    title: 'New company added',
    description: 'Startup Innovations - Technology sector',
    time: '2 hours ago',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 5,
    type: 'lead_qualified',
    title: 'Lead qualified',
    description: 'Marketing Automation Lead - High priority',
    time: '3 hours ago',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export default function Dashboard() {
  const { organization } = useOrganization();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <div className="bg-white rounded border border-gray-200 p-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">
            Welcome back! 👋
          </h1>
          <p className="text-sm text-gray-600">
            Here's what's happening with your CRM today.
          </p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {dashboardMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Link key={metric.title} href={metric.href}>
              <motion.div
                variants={itemVariants}
                className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded ${metric.color}`}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex items-center text-xs">
                    {metric.changeType === 'positive' ? (
                      <ArrowUpRight className="h-2.5 w-2.5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-2.5 w-2.5 text-red-500" />
                    )}
                    <span
                      className={`ml-0.5 font-medium ${
                        metric.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">
                    {metric.title}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mb-0.5">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">
                    {metric.description}
                  </p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="bg-white rounded border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link href="/dashboard/contacts">
              <Button size="sm" className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white h-8">
                <Plus className="h-3 w-3 mr-2" />
                Add New Contact
              </Button>
            </Link>
            <Link href="/dashboard/leads">
              <Button size="sm" className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white h-8">
                <Plus className="h-3 w-3 mr-2" />
                Create New Lead
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="w-full justify-start h-8" disabled>
              <Plus className="h-3 w-3 mr-2" />
              Add Company
              <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
            </Button>
            <Link href="/dashboard/contacts">
              <Button variant="outline" size="sm" className="w-full justify-start h-8">
                <Eye className="h-3 w-3 mr-2" />
                View All Contacts
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="bg-white rounded border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentActivity.slice(0, 4).map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50 transition-colors">
                  <div className={`${activity.bgColor} p-1 rounded`}>
                    <Icon className={`h-3 w-3 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 leading-tight">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 leading-tight">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs">
            View All Activity
          </Button>
        </motion.div>
      </div>

      {/* CRM Pipeline Overview */}
      <motion.div variants={itemVariants} className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Sales Pipeline Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium text-blue-900">Prospecting</h4>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-lg font-bold text-blue-900">12</p>
            <p className="text-xs text-blue-600">$450K value</p>
          </div>

          <div className="bg-indigo-50 rounded p-3 border border-indigo-200">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium text-indigo-900">Qualification</h4>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            </div>
            <p className="text-lg font-bold text-indigo-900">8</p>
            <p className="text-xs text-indigo-600">$320K value</p>
          </div>

          <div className="bg-purple-50 rounded p-3 border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium text-purple-900">Proposal</h4>
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            </div>
            <p className="text-lg font-bold text-purple-900">5</p>
            <p className="text-xs text-purple-600">$280K value</p>
          </div>

          <div className="bg-green-50 rounded p-3 border border-green-200">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium text-green-900">Negotiation</h4>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-lg font-bold text-green-900">3</p>
            <p className="text-xs text-green-600">$180K value</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <span className="font-medium">Total Pipeline:</span> $1.23M across 28 deals
          </div>
          <Link href="/dashboard/deals">
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
              View Pipeline
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
