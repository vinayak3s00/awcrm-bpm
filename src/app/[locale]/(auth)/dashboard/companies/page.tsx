// AWCRM Companies Page - Professional Company Management
// Information-dense company management with real API integration

'use client';

import React, { useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { CRMHeader } from '@/components/layout/CRMHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal, ConfirmModal, useModal } from '@/components/ui/Modal';
import { useCompanies, Company } from '@/hooks/useCompanies';
import {
  Building2,
  Users,
  DollarSign,
  MapPin,
  Phone,
  Calendar,
  TrendingUp,
  Star,
  Trash2
} from 'lucide-react';

export default function CompaniesPage() {
  const { organization } = useOrganization();

  // Hooks
  const {
    companies,
    loading,
    error,
    pagination,
    deleteCompany,
    bulkDeleteCompanies,
    setPage,
    setLimit,
    setFilters,
  } = useCompanies();

  // Modal states
  const deleteModal = useModal();

  // Local state
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  // Table columns configuration
  const columns: Column<Company>[] = [
    {
      key: 'name',
      header: 'Company',
      sortable: true,
      width: '300px',
      render: (_, company) => (
        <div className="crm-flex crm-items-center crm-gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg crm-flex crm-items-center justify-center flex-shrink-0">
            {company.logo ? (
              <img src={company.logo} alt="" className="w-10 h-10 rounded-lg" />
            ) : (
              <Building2 className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="crm-text-sm crm-font-medium text-gray-900 truncate">
              {company.name}
            </div>
            <div className="crm-text-xs text-gray-500 truncate">{company.domain}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'industry',
      header: 'Industry',
      sortable: true,
      width: '140px',
      render: (industry) => (
        <span className="crm-text-sm text-gray-700">{industry}</span>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      sortable: true,
      width: '120px',
      render: (size) => (
        <div className="crm-flex crm-items-center crm-gap-2">
          <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="crm-text-sm text-gray-700">{size}</span>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      width: '160px',
      render: (location) => (
        <div className="crm-flex crm-items-center crm-gap-2">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="crm-text-sm text-gray-700 truncate">{location}</span>
        </div>
      ),
    },
    {
      key: 'contactCount',
      header: 'Contacts',
      sortable: true,
      width: '100px',
      align: 'center',
      render: (contactCount) => (
        <span className="crm-text-sm crm-font-medium text-gray-900">{contactCount}</span>
      ),
    },
    {
      key: 'dealCount',
      header: 'Deals',
      sortable: true,
      width: '80px',
      align: 'center',
      render: (dealCount) => (
        <span className="crm-text-sm crm-font-medium text-gray-900">{dealCount}</span>
      ),
    },
    {
      key: 'totalValue',
      header: 'Total Value',
      sortable: true,
      width: '120px',
      align: 'right',
      render: (totalValue) => (
        <div className="crm-flex crm-items-center crm-gap-2 justify-end">
          <DollarSign className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="crm-text-sm crm-font-medium text-gray-900">
            ${(totalValue / 1000).toFixed(0)}K
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '100px',
      render: (status) => (
        <span className={`crm-badge ${
          status === 'active' ? 'crm-badge-success' : 
          status === 'prospect' ? 'crm-badge-info' : 
          'crm-badge-error'
        }`}>
          {status}
        </span>
      ),
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      sortable: true,
      width: '140px',
      render: (lastActivity) => (
        <div className="crm-flex crm-items-center crm-gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="crm-text-sm text-gray-600">{lastActivity}</span>
        </div>
      ),
    },
  ];

  // Event handlers
  const handleSort = (key: keyof Company, direction: 'asc' | 'desc') => {
    const sortedCompanies = [...companies].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      
      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    setCompanies(sortedCompanies);
  };

  const handleRowClick = (company: Company) => {
    console.log('View company:', company);
  };

  const handleEdit = (company: Company) => {
    console.log('Edit company:', company);
  };

  const handleDelete = (company: Company) => {
    console.log('Delete company:', company);
  };

  const handleView = (company: Company) => {
    console.log('View company details:', company);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
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
        title="Companies"
        subtitle={`${pagination.total} companies in your organization`}
        showSearch={true}
        showFilters={true}
        showQuickActions={true}
      />
      
      <div className="crm-content">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 crm-gap-6 mb-6">
          <div className="crm-card">
            <div className="crm-card-content">
              <div className="crm-flex crm-items-center crm-justify-between">
                <div>
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Total Companies</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">156</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg crm-flex crm-items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
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
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Active Companies</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">134</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg crm-flex crm-items-center justify-center">
                  <Star className="w-5 h-5 text-green-600" />
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
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Total Contacts</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">2,847</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg crm-flex crm-items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-3">
                <span className="crm-text-xs crm-font-medium text-green-600">+15%</span>
                <span className="crm-text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>

          <div className="crm-card">
            <div className="crm-card-content">
              <div className="crm-flex crm-items-center crm-justify-between">
                <div>
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">$2.4M</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg crm-flex crm-items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="mt-3">
                <span className="crm-text-xs crm-font-medium text-green-600">+18%</span>
                <span className="crm-text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={companies}
          columns={columns}
          loading={loading}
          onSort={handleSort}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          selectedRows={selectedCompanies}
          onSelectRows={setSelectedCompanies}
          rowKey="id"
          actions={true}
          selectable={true}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }}
        />
      </div>
    </div>
  );
}
