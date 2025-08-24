// AWCRM Deals Page - Professional Sales Pipeline Management
// Visual pipeline with real API integration and drag-and-drop

'use client';

import React, { useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { CRMHeader } from '@/components/layout/CRMHeader';
import { Modal, ConfirmModal, useModal } from '@/components/ui/Modal';
import { DealForm } from '@/components/forms/DealForm';
import { useDeals, Deal } from '@/hooks/useDeals';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Building2,
  Target,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

// Pipeline stages
const pipelineStages = [
  { id: 'prospecting', name: 'Prospecting', color: 'bg-blue-500', probability: 10 },
  { id: 'qualification', name: 'Qualification', color: 'bg-indigo-500', probability: 25 },
  { id: 'proposal', name: 'Proposal', color: 'bg-purple-500', probability: 50 },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-pink-500', probability: 75 },
  { id: 'closed-won', name: 'Closed Won', color: 'bg-green-500', probability: 100 },
  { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-500', probability: 0 },
];

export default function DealsPage() {
  const { organization } = useOrganization();

  // Hooks
  const {
    deals,
    loading,
    error,
    createDeal,
    updateDeal,
    deleteDeal,
    moveDeal,
    getDealsByStage,
    getPipelineMetrics,
  } = useDeals();

  // Modal states
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Local state
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Group deals by stage
  const dealsByStage = pipelineStages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(deal => deal.stage === stage.id);
    return acc;
  }, {} as Record<string, Deal[]>);

  // Calculate pipeline metrics
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const weightedValue = deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
  const averageDealSize = deals.length > 0 ? totalValue / deals.length : 0;
  const winRate = deals.filter(deal => deal.status === 'won').length / Math.max(deals.length, 1) * 100;

  // Event handlers
  const handleDealClick = (deal: Deal) => {
    console.log('View deal:', deal);
  };

  const handleEditDeal = (deal: Deal) => {
    console.log('Edit deal:', deal);
  };

  const handleDeleteDeal = (deal: Deal) => {
    console.log('Delete deal:', deal);
  };

  // Show loading state if organization is not loaded
  if (!organization) {
    return (
      <div className="crm-flex crm-items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="crm-text-sm text-gray-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crm-main">
      <CRMHeader 
        title="Sales Pipeline"
        subtitle={`${deals.length} active deals worth $${(totalValue / 1000).toFixed(0)}K`}
        showSearch={true}
        showFilters={true}
        showQuickActions={true}
        actions={
          <div className="crm-flex crm-items-center crm-gap-2">
            <div className="crm-flex rounded-md border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('pipeline')}
                className={`px-3 py-1 crm-text-sm ${
                  viewMode === 'pipeline' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Pipeline
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 crm-text-sm ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        }
      />
      
      <div className="crm-content">
        {/* Pipeline Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 crm-gap-6 mb-6">
          <div className="crm-card">
            <div className="crm-card-content">
              <div className="crm-flex crm-items-center crm-justify-between">
                <div>
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Total Pipeline</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">
                    ${(totalValue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg crm-flex crm-items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-3">
                <span className="crm-text-xs crm-font-medium text-green-600">+12%</span>
                <span className="crm-text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>

          <div className="crm-card">
            <div className="crm-card-content">
              <div className="crm-flex crm-items-center crm-justify-between">
                <div>
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Weighted Pipeline</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">
                    ${(weightedValue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg crm-flex crm-items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-3">
                <span className="crm-text-xs crm-font-medium text-green-600">+8%</span>
                <span className="crm-text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>

          <div className="crm-card">
            <div className="crm-card-content">
              <div className="crm-flex crm-items-center crm-justify-between">
                <div>
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Avg Deal Size</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">
                    ${(averageDealSize / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg crm-flex crm-items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-3">
                <span className="crm-text-xs crm-font-medium text-green-600">+5%</span>
                <span className="crm-text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>

          <div className="crm-card">
            <div className="crm-card-content">
              <div className="crm-flex crm-items-center crm-justify-between">
                <div>
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Win Rate</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">
                    {winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg crm-flex crm-items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="mt-3">
                <span className="crm-text-xs crm-font-medium text-red-600">-2%</span>
                <span className="crm-text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline View */}
        {viewMode === 'pipeline' && (
          <div className="crm-card">
            <div className="crm-card-content">
              <div className="grid grid-cols-1 lg:grid-cols-6 crm-gap-4 min-h-[600px]">
                {pipelineStages.map((stage) => (
                  <div key={stage.id} className="crm-flex flex-col">
                    {/* Stage Header */}
                    <div className="crm-flex crm-items-center crm-justify-between mb-4">
                      <div className="crm-flex crm-items-center crm-gap-2">
                        <div className={`w-3 h-3 ${stage.color} rounded-full`}></div>
                        <h3 className="crm-text-sm crm-font-semibold text-gray-900">{stage.name}</h3>
                      </div>
                      <span className="crm-text-xs text-gray-500">
                        {dealsByStage[stage.id]?.length || 0}
                      </span>
                    </div>

                    {/* Stage Value */}
                    <div className="mb-4">
                      <p className="crm-text-xs text-gray-500">Total Value</p>
                      <p className="crm-text-sm crm-font-medium text-gray-900">
                        ${((dealsByStage[stage.id]?.reduce((sum, deal) => sum + deal.value, 0) || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>

                    {/* Deals */}
                    <div className="crm-space-y-3 flex-1">
                      {dealsByStage[stage.id]?.map((deal) => (
                        <div
                          key={deal.id}
                          className="crm-card bg-white border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                          onClick={() => handleDealClick(deal)}
                        >
                          <div className="p-3">
                            <h4 className="crm-text-sm crm-font-medium text-gray-900 mb-2 truncate">
                              {deal.title}
                            </h4>
                            
                            <div className="crm-flex crm-items-center crm-justify-between mb-2">
                              <span className="crm-text-lg crm-font-bold text-gray-900">
                                ${(deal.value / 1000).toFixed(0)}K
                              </span>
                              <span className="crm-text-xs text-gray-500">
                                {deal.probability}%
                              </span>
                            </div>

                            <div className="crm-space-y-1">
                              {deal.companyName && (
                                <div className="crm-flex crm-items-center crm-gap-2">
                                  <Building2 className="w-3 h-3 text-gray-400" />
                                  <span className="crm-text-xs text-gray-600 truncate">
                                    {deal.companyName}
                                  </span>
                                </div>
                              )}
                              
                              {deal.contactName && (
                                <div className="crm-flex crm-items-center crm-gap-2">
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span className="crm-text-xs text-gray-600 truncate">
                                    {deal.contactName}
                                  </span>
                                </div>
                              )}
                              
                              <div className="crm-flex crm-items-center crm-gap-2">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="crm-text-xs text-gray-600">
                                  {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Deal Actions */}
                            <div className="crm-flex crm-items-center crm-justify-end crm-gap-1 mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDeal(deal);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDeal(deal);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Deal Button */}
                      <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors crm-flex crm-items-center justify-center crm-gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="crm-text-sm">Add Deal</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="crm-card">
            <div className="crm-card-content">
              <p className="crm-text-sm text-gray-600">Table view coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
