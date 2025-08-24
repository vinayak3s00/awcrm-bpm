// AWCRM Data Table Component - Inspired by Salesforce Lightning Data Tables
// High-density, professional data display with sorting, filtering, and actions

'use client';

import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Filter,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/libs/utils';

export type Column<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  actions?: {
    label: string;
    onClick: (row: T) => void;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  className?: string;
  emptyState?: React.ReactNode;
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  onRowClick,
  onRowSelect,
  actions,
  className,
  emptyState,
  loading = false,
  pagination,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchQuery) {
      filtered = data.filter(row =>
        columns.some((column) => {
          const value = row[column.key];
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        }),
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, sortConfig, columns]);

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleRowSelect = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);

    if (onRowSelect) {
      const selectedData = Array.from(newSelected).map(i => processedData[i]);
      onRowSelect(selectedData);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === processedData.length) {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    } else {
      const allIndices = new Set(processedData.map((_, index) => index));
      setSelectedRows(allIndices);
      onRowSelect?.(processedData);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-10 animate-pulse rounded bg-gray-200" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      {searchable && (
        <div className="flex items-center justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {onRowSelect && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === processedData.length && processedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                {columns.map(column => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      column.sortable && 'cursor-pointer hover:bg-gray-100',
                      column.className,
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          {sortConfig?.key === column.key
                            ? (
                                sortConfig.direction === 'asc'
                                  ? (
                                      <ChevronUp className="h-3 w-3" />
                                    )
                                  : (
                                      <ChevronDown className="h-3 w-3" />
                                    )
                              )
                            : (
                                <ArrowUpDown className="h-3 w-3 text-gray-400" />
                              )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="w-12 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {processedData.length === 0
                ? (
                    <tr>
                      <td
                        colSpan={columns.length + (onRowSelect ? 1 : 0) + (actions ? 1 : 0)}
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        {emptyState || 'No data available'}
                      </td>
                    </tr>
                  )
                : (
                    processedData.map((row, index) => (
                      <tr
                        key={index}
                        className={cn(
                          'hover:bg-gray-50 transition-colors',
                          onRowClick && 'cursor-pointer',
                          selectedRows.has(index) && 'bg-blue-50',
                        )}
                        onClick={() => onRowClick?.(row)}
                      >
                        {onRowSelect && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(index)}
                              onChange={() => handleRowSelect(index)}
                              onClick={e => e.stopPropagation()}
                              className="rounded border-gray-300"
                            />
                          </td>
                        )}
                        {columns.map(column => (
                          <td
                            key={String(column.key)}
                            className={cn('px-4 py-3 text-sm text-gray-900', column.className)}
                          >
                            {column.render
                              ? column.render(row[column.key], row)
                              : row[column.key]?.toString() || '-'}
                          </td>
                        ))}
                        {actions && actions.length > 0 && (
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions.map((action, actionIndex) => (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(row);
                                    }}
                                  >
                                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing
            {' '}
            {((pagination.page - 1) * pagination.pageSize) + 1}
            {' '}
            to
            {' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            {' '}
            of
            {' '}
            {pagination.total}
            {' '}
            results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page
              {' '}
              {pagination.page}
              {' '}
              of
              {' '}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
