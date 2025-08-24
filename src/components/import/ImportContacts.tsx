'use client';

import { useAuth } from '@clerk/nextjs';
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

type ImportResult = {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
};

type ImportContactsProps = {
  onImportComplete?: (result: ImportResult) => void;
  onClose?: () => void;
};

export function ImportContacts({ onImportComplete, onClose }: ImportContactsProps) {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResult(null);
      setError(null);
    }
  };

  const downloadTemplate = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/import/contacts/template', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contacts_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download template');
      }
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const handleImport = async () => {
    if (!file) {
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('skipDuplicates', options.skipDuplicates.toString());
      formData.append('updateExisting', options.updateExisting.toString());

      const response = await fetch('/api/import/contacts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.results);
        onImportComplete?.(data.results);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="crm-card mx-auto max-w-2xl">
      <div className="crm-card-header">
        <div className="crm-flex crm-items-center crm-justify-between">
          <h2 className="crm-text-lg crm-font-semibold text-gray-900">
            Import Contacts
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="crm-card-content">
        {!result && (
          <>
            {/* File Upload Area */}
            <div
              className={`
                rounded-lg border-2 border-dashed p-8 text-center transition-colors
                ${file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file
                ? (
                    <div className="crm-flex crm-items-center crm-gap-3 justify-center">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="crm-text-sm crm-font-medium text-gray-900">{file.name}</p>
                        <p className="crm-text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)}
                          {' '}
                          KB
                        </p>
                      </div>
                      <button
                        onClick={resetImport}
                        className="p-1 text-gray-400 transition-colors hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )
                : (
                    <div>
                      <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="crm-text-lg crm-font-medium mb-2 text-gray-900">
                        Drop your CSV file here
                      </p>
                      <p className="crm-text-sm mb-4 text-gray-500">
                        or click to browse files
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="crm-button crm-button-primary"
                      >
                        Choose File
                      </button>
                    </div>
                  )}
            </div>

            {/* Import Options */}
            <div className="mt-6 space-y-4">
              <h3 className="crm-text-md crm-font-medium text-gray-900">Import Options</h3>

              <div className="space-y-3">
                <label className="crm-flex crm-items-center crm-gap-3">
                  <input
                    type="checkbox"
                    checked={options.skipDuplicates}
                    onChange={e => setOptions(prev => ({
                      ...prev,
                      skipDuplicates: e.target.checked,
                      updateExisting: e.target.checked ? false : prev.updateExisting,
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="crm-text-sm text-gray-700">
                    Skip duplicate contacts (based on email)
                  </span>
                </label>

                <label className="crm-flex crm-items-center crm-gap-3">
                  <input
                    type="checkbox"
                    checked={options.updateExisting}
                    onChange={e => setOptions(prev => ({
                      ...prev,
                      updateExisting: e.target.checked,
                      skipDuplicates: e.target.checked ? false : prev.skipDuplicates,
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="crm-text-sm text-gray-700">
                    Update existing contacts with new data
                  </span>
                </label>
              </div>
            </div>

            {/* Template Download */}
            <div className="mt-6 rounded-md bg-blue-50 p-4">
              <div className="crm-flex crm-items-center crm-gap-3">
                <Download className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="crm-text-sm crm-font-medium text-blue-900">
                    Need a template?
                  </p>
                  <p className="crm-text-xs text-blue-700">
                    Download our CSV template with the correct format
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="crm-button crm-button-secondary crm-text-sm"
                >
                  Download Template
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                <div className="crm-flex crm-items-center crm-gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="crm-text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Import Button */}
            <div className="crm-flex crm-items-center crm-justify-end crm-gap-3 mt-6">
              {onClose && (
                <button
                  onClick={onClose}
                  className="crm-button crm-button-secondary"
                  disabled={importing}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="crm-button crm-button-primary crm-flex crm-items-center crm-gap-2"
              >
                {importing
                  ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    )
                  : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import Contacts
                      </>
                    )}
              </button>
            </div>
          </>
        )}

        {/* Import Results */}
        {result && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
              <h3 className="crm-text-lg crm-font-semibold mb-2 text-gray-900">
                Import Complete!
              </h3>
            </div>

            {/* Results Summary */}
            <div className="crm-gap-4 grid grid-cols-2 md:grid-cols-4">
              <div className="rounded-md bg-blue-50 p-4 text-center">
                <p className="crm-text-2xl crm-font-bold text-blue-600">{result.total}</p>
                <p className="crm-text-sm text-blue-700">Total Rows</p>
              </div>
              <div className="rounded-md bg-green-50 p-4 text-center">
                <p className="crm-text-2xl crm-font-bold text-green-600">{result.imported}</p>
                <p className="crm-text-sm text-green-700">Imported</p>
              </div>
              <div className="rounded-md bg-yellow-50 p-4 text-center">
                <p className="crm-text-2xl crm-font-bold text-yellow-600">{result.updated}</p>
                <p className="crm-text-sm text-yellow-700">Updated</p>
              </div>
              <div className="rounded-md bg-gray-50 p-4 text-center">
                <p className="crm-text-2xl crm-font-bold text-gray-600">{result.skipped}</p>
                <p className="crm-text-sm text-gray-700">Skipped</p>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div>
                <h4 className="crm-text-md crm-font-medium mb-3 text-gray-900">
                  Errors (
                  {result.errors.length}
                  )
                </h4>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {result.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="rounded-md border border-red-200 bg-red-50 p-3">
                      <p className="crm-text-sm text-red-600">
                        <span className="font-medium">
                          Row
                          {error.row}
                          :
                        </span>
                        {' '}
                        {error.error}
                      </p>
                    </div>
                  ))}
                  {result.errors.length > 10 && (
                    <p className="crm-text-sm text-center text-gray-500">
                      ... and
                      {' '}
                      {result.errors.length - 10}
                      {' '}
                      more errors
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="crm-flex crm-items-center crm-justify-end crm-gap-3">
              <button
                onClick={resetImport}
                className="crm-button crm-button-secondary"
              >
                Import More
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="crm-button crm-button-primary"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
