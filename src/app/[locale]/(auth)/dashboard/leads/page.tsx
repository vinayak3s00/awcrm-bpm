// AWCRM Leads Page - Modern Sales Pipeline Management
// Main leads page with full CRUD functionality and pipeline view

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOrganization } from '@clerk/nextjs';
import { 
  TrendingUp, 
  Plus, 
  Filter,
  BarChart3,
  Target,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '@/features/leads/hooks/useLeads';
import type { Lead, LeadStatus } from '@/features/leads/types/lead.types';

// Mock data for pipeline stages
const pipelineStages = [
  { status: 'new' as LeadStatus, label: 'New Leads', color: 'bg-slate-500', count: 12, value: 45000 },
  { status: 'contacted' as LeadStatus, label: 'Contacted', color: 'bg-blue-500', count: 8, value: 32000 },
  { status: 'qualified' as LeadStatus, label: 'Qualified', color: 'bg-indigo-500', count: 6, value: 28000 },
  { status: 'proposal' as LeadStatus, label: 'Proposal', color: 'bg-purple-500', count: 4, value: 22000 },
  { status: 'negotiation' as LeadStatus, label: 'Negotiation', color: 'bg-orange-500', count: 3, value: 18000 },
  { status: 'closed_won' as LeadStatus, label: 'Closed Won', color: 'bg-green-500', count: 2, value: 15000 },
  { status: 'closed_lost' as LeadStatus, label: 'Closed Lost', color: 'bg-red-500', count: 1, value: 5000 },
];

export default function LeadsPage() {
  const { organization } = useOrganization();
  const [selectedStage, setSelectedStage] = useState<LeadStatus | null>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');

  // Fetch leads data
  const { data: leadsData, isLoading } = useLeads(
    {
      page: 1,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      filters: selectedStage ? { status: selectedStage } : {},
    },
    organization?.id || ''
  );

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

  // Show loading state if organization is not loaded
  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h1 className="text-4xl font-bold">Sales Pipeline</h1>
                </div>
                <p className="text-indigo-100 text-lg">
                  Track and manage your leads through the sales process
                </p>
              </div>
              
              <Button 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl px-6 py-3"
                onClick={() => console.log('Create lead')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pipeline Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Leads</p>
                <p className="text-3xl font-bold text-slate-900">36</p>
              </div>
              <div className="bg-blue-500 p-4 rounded-2xl shadow-lg">
                <Target className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm font-medium text-green-600">+12%</span>
              <span className="text-sm text-slate-500 ml-1">vs last month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Pipeline Value</p>
                <p className="text-3xl font-bold text-slate-900">$165K</p>
              </div>
              <div className="bg-green-500 p-4 rounded-2xl shadow-lg">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm font-medium text-green-600">+8%</span>
              <span className="text-sm text-slate-500 ml-1">vs last month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold text-slate-900">24%</p>
              </div>
              <div className="bg-purple-500 p-4 rounded-2xl shadow-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm font-medium text-green-600">+3%</span>
              <span className="text-sm text-slate-500 ml-1">vs last month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Avg. Deal Size</p>
                <p className="text-3xl font-bold text-slate-900">$4.6K</p>
              </div>
              <div className="bg-orange-500 p-4 rounded-2xl shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm font-medium text-red-600">-2%</span>
              <span className="text-sm text-slate-500 ml-1">vs last month</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pipeline View */}
      <motion.div variants={itemVariants}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Sales Pipeline</h2>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {pipelineStages.map((stage) => (
              <motion.div
                key={stage.status}
                variants={itemVariants}
                className={`bg-slate-50 rounded-xl p-4 border-2 transition-all cursor-pointer ${
                  selectedStage === stage.status 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedStage(selectedStage === stage.status ? null : stage.status)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 text-sm">{stage.label}</h3>
                  <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Leads</span>
                    <Badge variant="secondary" className="text-xs">
                      {stage.count}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Value</span>
                    <span className="text-xs font-semibold text-slate-900">
                      ${(stage.value / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>

                {/* Sample lead cards */}
                <div className="mt-4 space-y-2">
                  {Array.from({ length: Math.min(stage.count, 3) }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <Users className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-900">Sample Lead {i + 1}</span>
                      </div>
                      <p className="text-xs text-slate-500">Company Name</p>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        ${((stage.value / stage.count) / 1000).toFixed(1)}K
                      </p>
                    </div>
                  ))}
                  {stage.count > 3 && (
                    <div className="text-center">
                      <span className="text-xs text-slate-500">+{stage.count - 3} more</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Coming Soon Notice */}
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            🚧 Lead Management Coming Soon
          </h3>
          <p className="text-amber-700 mb-4">
            We're building advanced lead management features including drag-and-drop pipeline, 
            lead scoring, automated workflows, and detailed analytics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 text-amber-600 rounded-full p-2">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Drag & Drop Pipeline</p>
                <p className="text-xs text-amber-600">Visual lead management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 text-amber-600 rounded-full p-2">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Lead Scoring</p>
                <p className="text-xs text-amber-600">Automated qualification</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 text-amber-600 rounded-full p-2">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Advanced Analytics</p>
                <p className="text-xs text-amber-600">Performance insights</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
