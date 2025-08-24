'use client';

import type { Deal } from '@/hooks/useDeals';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Calendar, DollarSign, Save, Target, TrendingUp, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCompanies } from '@/hooks/useCompanies';
import { useContacts } from '@/hooks/useContacts';

// Pipeline stages
const pipelineStages = [
  { id: 'prospecting', name: 'Prospecting', probability: 10 },
  { id: 'qualification', name: 'Qualification', probability: 25 },
  { id: 'proposal', name: 'Proposal', probability: 50 },
  { id: 'negotiation', name: 'Negotiation', probability: 75 },
  { id: 'closed-won', name: 'Closed Won', probability: 100 },
  { id: 'closed-lost', name: 'Closed Lost', probability: 0 },
];

// Validation schema
const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().min(0, 'Value must be positive').optional(),
  currency: z.string().default('USD'),
  stage: z.string().min(1, 'Stage is required'),
  probability: z.number().min(0).max(100).default(50),
  expectedCloseDate: z.string().optional(),
  description: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
});

type DealFormData = z.infer<typeof dealSchema>;

type DealFormProps = {
  deal?: Deal;
  onSubmit: (data: DealFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function DealForm({ deal, onSubmit, onCancel, loading = false }: DealFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('prospecting');

  // Load contacts and companies for dropdowns
  const { contacts } = useContacts();
  const { companies } = useCompanies();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: '',
      value: 0,
      currency: 'USD',
      stage: 'prospecting',
      probability: 10,
      expectedCloseDate: '',
      description: '',
      contactId: '',
      companyId: '',
    },
  });

  const watchedStage = watch('stage');

  // Update probability when stage changes
  useEffect(() => {
    const stage = pipelineStages.find(s => s.id === watchedStage);
    if (stage) {
      setValue('probability', stage.probability);
      setSelectedStage(watchedStage);
    }
  }, [watchedStage, setValue]);

  // Populate form when editing
  useEffect(() => {
    if (deal) {
      setValue('title', deal.title);
      setValue('value', deal.value || 0);
      setValue('currency', deal.currency);
      setValue('stage', deal.stage);
      setValue('probability', deal.probability);
      setValue('expectedCloseDate', deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '');
      setValue('description', deal.description || '');
      setValue('contactId', deal.contactId || '');
      setValue('companyId', deal.companyId || '');
      setSelectedStage(deal.stage);
    }
  }, [deal, setValue]);

  const handleFormSubmit = async (data: DealFormData) => {
    setSubmitError(null);

    try {
      // Convert empty strings to undefined
      const cleanData = {
        ...data,
        contactId: data.contactId || undefined,
        companyId: data.companyId || undefined,
        expectedCloseDate: data.expectedCloseDate || undefined,
        description: data.description || undefined,
      };

      await onSubmit(cleanData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save deal');
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="crm-card mx-auto max-w-2xl">
      <div className="crm-card-header">
        <div className="crm-flex crm-items-center crm-justify-between">
          <h2 className="crm-text-lg crm-font-semibold text-gray-900">
            {deal ? 'Edit Deal' : 'Create New Deal'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="crm-card-content">
        {submitError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="crm-text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <div className="crm-gap-6 grid grid-cols-1 md:grid-cols-2">
          {/* Deal Information */}
          <div className="space-y-4">
            <h3 className="crm-text-md crm-font-medium crm-flex crm-items-center crm-gap-2 text-gray-900">
              <TrendingUp className="h-4 w-4" />
              Deal Information
            </h3>

            <div>
              <label className="crm-text-sm crm-font-medium mb-1 block text-gray-700">
                Deal Title *
              </label>
              <input
                {...register('title')}
                className={`crm-input ${errors.title ? 'border-red-300' : ''}`}
                placeholder="Enterprise Software License"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="crm-text-xs mt-1 text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="crm-gap-3 grid grid-cols-2">
              <div>
                <label className="crm-text-sm crm-font-medium crm-flex crm-items-center crm-gap-2 mb-1 block text-gray-700">
                  <DollarSign className="h-3.5 w-3.5" />
                  Value
                </label>
                <input
                  {...register('value', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className={`crm-input ${errors.value ? 'border-red-300' : ''}`}
                  placeholder="50000"
                  disabled={isLoading}
                />
                {errors.value && (
                  <p className="crm-text-xs mt-1 text-red-600">{errors.value.message}</p>
                )}
              </div>

              <div>
                <label className="crm-text-sm crm-font-medium mb-1 block text-gray-700">
                  Currency
                </label>
                <select
                  {...register('currency')}
                  className="crm-input"
                  disabled={isLoading}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="crm-text-sm crm-font-medium crm-flex crm-items-center crm-gap-2 mb-1 block text-gray-700">
                <Calendar className="h-3.5 w-3.5" />
                Expected Close Date
              </label>
              <input
                {...register('expectedCloseDate')}
                type="date"
                className="crm-input"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Pipeline & Associations */}
          <div className="space-y-4">
            <h3 className="crm-text-md crm-font-medium crm-flex crm-items-center crm-gap-2 text-gray-900">
              <Target className="h-4 w-4" />
              Pipeline & Associations
            </h3>

            <div>
              <label className="crm-text-sm crm-font-medium mb-1 block text-gray-700">
                Pipeline Stage *
              </label>
              <select
                {...register('stage')}
                className={`crm-input ${errors.stage ? 'border-red-300' : ''}`}
                disabled={isLoading}
              >
                {pipelineStages.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                    {' '}
                    (
                    {stage.probability}
                    %)
                  </option>
                ))}
              </select>
              {errors.stage && (
                <p className="crm-text-xs mt-1 text-red-600">{errors.stage.message}</p>
              )}
            </div>

            <div>
              <label className="crm-text-sm crm-font-medium mb-1 block text-gray-700">
                Probability (%)
              </label>
              <input
                {...register('probability', { valueAsNumber: true })}
                type="number"
                min="0"
                max="100"
                className={`crm-input ${errors.probability ? 'border-red-300' : ''}`}
                disabled={isLoading}
              />
              {errors.probability && (
                <p className="crm-text-xs mt-1 text-red-600">{errors.probability.message}</p>
              )}
            </div>

            <div>
              <label className="crm-text-sm crm-font-medium crm-flex crm-items-center crm-gap-2 mb-1 block text-gray-700">
                <User className="h-3.5 w-3.5" />
                Contact
              </label>
              <select
                {...register('contactId')}
                className="crm-input"
                disabled={isLoading}
              >
                <option value="">Select contact...</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName}
                    {' '}
                    {contact.lastName}
                    {' '}
                    -
                    {' '}
                    {contact.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="crm-text-sm crm-font-medium crm-flex crm-items-center crm-gap-2 mb-1 block text-gray-700">
                <Building2 className="h-3.5 w-3.5" />
                Company
              </label>
              <select
                {...register('companyId')}
                className="crm-input"
                disabled={isLoading}
              >
                <option value="">Select company...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="crm-text-sm crm-font-medium mb-1 block text-gray-700">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="crm-input resize-none"
            placeholder="Deal description, requirements, notes..."
            disabled={isLoading}
          />
        </div>

        {/* Actions */}
        <div className="crm-flex crm-items-center crm-justify-end crm-gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="crm-button crm-button-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="crm-button crm-button-primary crm-flex crm-items-center crm-gap-2"
            disabled={isLoading}
          >
            {isLoading
              ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Saving...
                  </>
                )
              : (
                  <>
                    <Save className="h-4 w-4" />
                    {deal ? 'Update Deal' : 'Create Deal'}
                  </>
                )}
          </button>
        </div>
      </form>
    </div>
  );
}
