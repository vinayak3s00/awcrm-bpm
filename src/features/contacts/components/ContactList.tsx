// AWCRM Contact List Component - Modern, Responsive UI
// Advanced contact list with search, filtering, pagination, and smooth animations

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Users,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/libs/utils';
import { ContactCard } from './ContactCard';
import { useContacts } from '../hooks/useContacts';
import type { Contact, ContactListParams } from '../types/contact.types';

interface ContactListProps {
  organizationId: string;
  onContactSelect?: (contact: Contact) => void;
  onContactEdit?: (contact: Contact) => void;
  onContactDelete?: (contact: Contact) => void;
  onCreateContact?: () => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'firstName' | 'lastName' | 'company' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function ContactList({
  organizationId,
  onContactSelect,
  onContactEdit,
  onContactDelete,
  onCreateContact,
  className,
}: ContactListProps) {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Build query parameters
  const queryParams = useMemo<ContactListParams>(() => ({
    page: currentPage,
    limit: 20,
    sortBy: sortField,
    sortOrder,
    filters: {
      ...(searchQuery && { search: searchQuery }),
      ...(statusFilter !== 'all' && { status: statusFilter as any }),
    },
  }), [currentPage, sortField, sortOrder, searchQuery, statusFilter]);

  // Fetch contacts
  const { data, isLoading, error, refetch } = useContacts(queryParams, organizationId);

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Animation variants
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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={cn(
      'grid gap-6',
      viewMode === 'grid'
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1'
    )}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-4 mb-6">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-3/4 rounded-lg" />
            <Skeleton className="h-12 w-1/2 rounded-lg" />
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200/60">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <Users className="h-12 w-12 text-blue-500" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        {searchQuery || statusFilter !== 'all' ? 'No contacts found' : 'No contacts yet'}
      </h3>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        {searchQuery || statusFilter !== 'all'
          ? 'Try adjusting your search criteria or filters to find the contacts you\'re looking for.'
          : 'Start building your customer relationships by adding your first contact to the CRM.'
        }
      </p>
      {(!searchQuery && statusFilter === 'all') && (
        <Button
          onClick={onCreateContact}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-xl px-8 py-3"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Your First Contact
        </Button>
      )}
    </motion.div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Contacts
          </h2>
          {data && (
            <p className="text-sm text-slate-600 mt-1">
              {data.total} contact{data.total !== 1 ? 's' : ''} in your CRM
            </p>
          )}
        </div>

        <Button
          onClick={onCreateContact}
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full lg:w-48 border-slate-200 focus:border-blue-500">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full lg:w-auto h-12 bg-slate-50/50 border-slate-200 hover:bg-white hover:border-blue-300 rounded-xl">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200">
              <DropdownMenuItem onClick={() => handleSort('firstName')}>
                First Name {sortField === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('lastName')}>
                Last Name {sortField === 'lastName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('company')}>
                Company {sortField === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                Date Added {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "h-10 px-4 rounded-lg transition-all",
                viewMode === 'grid'
                  ? "bg-white shadow-sm text-blue-600"
                  : "hover:bg-slate-50 text-slate-600"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "h-10 px-4 rounded-lg transition-all",
                viewMode === 'list'
                  ? "bg-white shadow-sm text-blue-600"
                  : "hover:bg-slate-50 text-slate-600"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Failed to load contacts</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : !data?.contacts.length ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                : 'grid-cols-1'
            )}
          >
            <AnimatePresence>
              {data.contacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  variants={itemVariants}
                  layout
                >
                  <ContactCard
                    contact={contact}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                    onView={onContactSelect}
                    onEdit={onContactEdit}
                    onDelete={onContactDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg shadow-slate-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-slate-600 font-medium">
              Showing <span className="font-semibold text-slate-900">{((currentPage - 1) * 20) + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">{Math.min(currentPage * 20, data.total)}</span> of{' '}
              <span className="font-semibold text-slate-900">{data.total}</span> contacts
            </p>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-slate-50/50 border-slate-200 hover:bg-white hover:border-blue-300 rounded-xl disabled:opacity-50"
              >
                Previous
              </Button>

              <span className="text-sm text-slate-600 font-medium px-3 py-2 bg-slate-100 rounded-xl">
                Page {currentPage} of {data.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === data.totalPages}
                className="bg-slate-50/50 border-slate-200 hover:bg-white hover:border-blue-300 rounded-xl disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
