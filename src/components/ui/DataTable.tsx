'use client';

import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

export type Column<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
};

export type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  selectedRows?: T[];
  onSelectRows?: (rows: T[]) => void;
  rowKey: keyof T;
  actions?: boolean;
  selectable?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  selectedRows = [],
  onSelectRows,
  rowKey,
  actions = true,
  selectable = true,
  pagination,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<any>(null);

  const handleSort = (key: keyof T) => {
    if (!columns.find(col => col.key === key)?.sortable) {
      return;
    }

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      onSelectRows?.([]);
    } else {
      onSelectRows?.(data);
    }
  };

  const handleSelectRow = (row: T) => {
    const isSelected = selectedRows.some(selected => selected[rowKey] === row[rowKey]);
    if (isSelected) {
      onSelectRows?.(selectedRows.filter(selected => selected[rowKey] !== row[rowKey]));
    } else {
      onSelectRows?.([...selectedRows, row]);
    }
  };

  const isRowSelected = (row: T) => {
    return selectedRows.some(selected => selected[rowKey] === row[rowKey]);
  };

  if (loading) {
    return (
      <div className="crm-card">
        <div className="crm-card-content">
          <div className="crm-flex crm-items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="crm-text-sm ml-3 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crm-card">
      <div className="overflow-x-auto">
        <table className="crm-table">
          <thead>
            <tr>
              {selectable && (
                <th className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={String(column.key)}
                  className={`
                    ${column.width || ''}
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'right' ? 'text-right' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="crm-flex crm-items-center crm-gap-2">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="crm-flex flex-col">
                        {sortKey === column.key
                          ? (
                              sortDirection === 'asc'
                                ? (
                                    <ChevronUp className="h-3 w-3 text-blue-600" />
                                  )
                                : (
                                    <ChevronDown className="h-3 w-3 text-blue-600" />
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
              {actions && <th className="w-16">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={String(row[rowKey])}
                className={`
                  ${isRowSelected(row) ? 'bg-blue-25' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                  hover:bg-gray-25 transition-colors
                `}
                onClick={() => onRowClick?.(row)}
                onMouseEnter={() => setHoveredRow(row[rowKey])}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {selectable && (
                  <td onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isRowSelected(row)}
                      onChange={() => handleSelectRow(row)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                {columns.map(column => (
                  <td
                    key={String(column.key)}
                    className={`
                      ${column.align === 'center' ? 'text-center' : ''}
                      ${column.align === 'right' ? 'text-right' : ''}
                    `}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')}
                  </td>
                ))}
                {actions && (
                  <td onClick={e => e.stopPropagation()}>
                    <div className="crm-flex crm-items-center crm-gap-1">
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          className="p-1 text-gray-400 transition-colors hover:text-blue-600"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-1 text-gray-400 transition-colors hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="p-1 text-gray-400 transition-colors hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="p-1 text-gray-400 transition-colors hover:text-gray-600"
                        title="More actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="crm-flex crm-items-center crm-justify-between border-t border-gray-200 px-6 py-3">
          <div className="crm-flex crm-items-center crm-gap-4">
            <span className="crm-text-sm text-gray-700">
              Showing
              {' '}
              {((pagination.page - 1) * pagination.limit) + 1}
              {' '}
              to
              {' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}
              {' '}
              of
              {' '}
              {pagination.total}
              {' '}
              results
            </span>
            <select
              value={pagination.limit}
              onChange={e => pagination.onLimitChange(Number(e.target.value))}
              className="crm-input crm-text-sm w-auto px-2 py-1"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          <div className="crm-flex crm-items-center crm-gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="crm-button crm-button-secondary crm-text-sm px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="crm-flex crm-items-center crm-gap-1">
              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={`
                      crm-text-sm rounded-md px-3 py-1 transition-colors
                      ${page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="crm-button crm-button-secondary crm-text-sm px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && !loading && (
        <div className="crm-flex crm-items-center justify-center py-12">
          <div className="text-center">
            <div className="crm-flex crm-items-center mx-auto mb-3 h-12 w-12 justify-center rounded-full bg-gray-100">
              <X className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="crm-text-md crm-font-medium mb-1 text-gray-900">No data found</h3>
            <p className="crm-text-sm text-gray-500">No records match your current filters.</p>
          </div>
        </div>
      )}
    </div>
  );
}
