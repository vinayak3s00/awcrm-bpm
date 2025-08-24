// AWCRM Contacts Page - Professional CRM Interface
// Information-dense contact management with real API integration

'use client';

import React, { useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { CRMHeader } from '@/components/layout/CRMHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal, ConfirmModal, useModal } from '@/components/ui/Modal';
import { ContactForm } from '@/components/forms/ContactForm';
import { useContacts, Contact } from '@/hooks/useContacts';
import {
  Users,
  Mail,
  Phone,
  Building2,
  Calendar,
  Star,
  MapPin,
  Trash2
} from 'lucide-react';

export default function ContactsPage() {
  const { organization } = useOrganization();

  // Hooks
  const {
    contacts,
    loading,
    error,
    pagination,
    createContact,
    updateContact,
    deleteContact,
    bulkDeleteContacts,
    setPage,
    setLimit,
    setFilters,
  } = useContacts();

  // Modal states
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Local state
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Table columns configuration
  const columns: Column<Contact>[] = [
    {
      key: 'firstName',
      header: 'Contact',
      sortable: true,
      width: '280px',
      render: (_, contact) => (
        <div className="crm-flex crm-items-center crm-gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full crm-flex crm-items-center justify-center flex-shrink-0">
            {contact.avatar ? (
              <img src={contact.avatar} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <span className="crm-text-sm crm-font-medium text-blue-600">
                {contact.firstName[0]}{contact.lastName[0]}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="crm-text-sm crm-font-medium text-gray-900 truncate">
              {contact.firstName} {contact.lastName}
            </div>
            <div className="crm-text-xs text-gray-500 truncate">{contact.jobTitle}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      width: '220px',
      render: (email) => (
        <div className="crm-flex crm-items-center crm-gap-2">
          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <a
            href={`mailto:${email}`}
            className="crm-text-sm text-blue-600 hover:text-blue-700 truncate"
          >
            {email}
          </a>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      width: '160px',
      render: (phone) => (
        <div className="crm-flex crm-items-center crm-gap-2">
          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="crm-text-sm text-gray-700">{phone}</span>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      width: '180px',
      render: (company) => (
        <div className="crm-flex crm-items-center crm-gap-2">
          <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="crm-text-sm text-gray-700 truncate">{company}</span>
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
      key: 'source',
      header: 'Source',
      sortable: true,
      width: '120px',
      render: (source) => (
        <span className="crm-text-sm text-gray-600">{source}</span>
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
  const handleSort = (key: keyof Contact, direction: 'asc' | 'desc') => {
    // Sorting is handled by the API, so we just update filters
    setFilters({ sortBy: key as string, sortOrder: direction });
  };

  const handleRowClick = (contact: Contact) => {
    // Open contact detail view
    setEditingContact(contact);
    editModal.open();
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    editModal.open();
  };

  const handleDelete = (contact: Contact) => {
    setDeletingContact(contact);
    deleteModal.open();
  };

  const handleView = (contact: Contact) => {
    setEditingContact(contact);
    editModal.open();
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setLimit(limit);
  };

  // Form handlers
  const handleCreateContact = async (data: Partial<Contact>) => {
    setFormLoading(true);
    try {
      await createContact(data);
      createModal.close();
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to create contact:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateContact = async (data: Partial<Contact>) => {
    if (!editingContact) return;

    setFormLoading(true);
    try {
      await updateContact(editingContact.id, data);
      editModal.close();
      setEditingContact(null);
    } catch (error) {
      console.error('Failed to update contact:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingContact) return;

    try {
      await deleteContact(deletingContact.id);
      deleteModal.close();
      setDeletingContact(null);
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;

    try {
      const ids = selectedContacts.map(contact => contact.id);
      await bulkDeleteContacts(ids);
      setSelectedContacts([]);
    } catch (error) {
      console.error('Failed to delete contacts:', error);
    }
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
        title="Contacts"
        subtitle={`${pagination.total} contacts in your organization`}
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
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Total Contacts</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">1,247</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg crm-flex crm-items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
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
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Active Contacts</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">892</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg crm-flex crm-items-center justify-center">
                  <Star className="w-5 h-5 text-green-600" />
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
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">New This Month</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">156</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg crm-flex crm-items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-3">
                <span className="crm-text-xs crm-font-medium text-green-600">+24%</span>
                <span className="crm-text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>

          <div className="crm-card">
            <div className="crm-card-content">
              <div className="crm-flex crm-items-center crm-justify-between">
                <div>
                  <p className="crm-text-xs crm-font-medium text-gray-500 uppercase tracking-wide">Conversion Rate</p>
                  <p className="crm-text-2xl crm-font-bold text-gray-900 mt-1">24%</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg crm-flex crm-items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="mt-3">
                <span className="crm-text-xs crm-font-medium text-red-600">-2%</span>
                <span className="crm-text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={contacts}
          columns={columns}
          loading={loading}
          onSort={handleSort}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          selectedRows={selectedContacts}
          onSelectRows={setSelectedContacts}
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

        {/* Create Contact Modal */}
        <Modal
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          title="Create New Contact"
          size="lg"
        >
          <ContactForm
            onSubmit={handleCreateContact}
            onCancel={createModal.close}
            loading={formLoading}
          />
        </Modal>

        {/* Edit Contact Modal */}
        <Modal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.close();
            setEditingContact(null);
          }}
          title={editingContact ? `Edit ${editingContact.firstName} ${editingContact.lastName}` : 'Edit Contact'}
          size="lg"
        >
          {editingContact && (
            <ContactForm
              contact={editingContact}
              onSubmit={handleUpdateContact}
              onCancel={() => {
                editModal.close();
                setEditingContact(null);
              }}
              loading={formLoading}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => {
            deleteModal.close();
            setDeletingContact(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Contact"
          message={
            deletingContact
              ? `Are you sure you want to delete ${deletingContact.firstName} ${deletingContact.lastName}? This action cannot be undone.`
              : 'Are you sure you want to delete this contact?'
          }
          confirmText="Delete"
          variant="destructive"
        />

        {/* Bulk Actions */}
        {selectedContacts.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 crm-flex crm-items-center crm-gap-4">
              <span className="crm-text-sm crm-font-medium text-gray-700">
                {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="crm-button crm-button-secondary crm-text-sm crm-flex crm-items-center crm-gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedContacts([])}
                className="crm-button crm-button-secondary crm-text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed top-6 right-6 z-50">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
              <div className="crm-flex crm-items-center crm-gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                <p className="crm-text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
