'use client';

import type { Contact } from '@/hooks/useContacts';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Building2, Mail, Phone, Save, Tag, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Validation schema
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('prospect'),
  source: z.string().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

type ContactFormProps = {
  contact?: Contact;
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function ContactForm({ contact, onSubmit, onCancel, loading = false }: ContactFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      status: 'prospect',
      source: '',
      notes: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (contact) {
      setValue('firstName', contact.firstName);
      setValue('lastName', contact.lastName);
      setValue('email', contact.email || '');
      setValue('phone', contact.phone || '');
      setValue('company', contact.company || '');
      setValue('jobTitle', contact.jobTitle || '');
      setValue('status', contact.status);
      setValue('source', contact.source || '');
      setValue('notes', contact.notes || '');
    }
  }, [contact, setValue]);

  const handleFormSubmit = async (data: ContactFormData) => {
    setSubmitError(null);

    try {
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save contact');
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="crm-card mx-auto max-w-2xl">
      <div className="crm-card-header">
        <div className="crm-flex crm-items-center crm-justify-between">
          <h2 className="crm-text-lg crm-font-semibold text-gray-900">
            {contact ? 'Edit Contact' : 'Create New Contact'}
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
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="crm-text-md crm-font-medium crm-flex crm-items-center crm-gap-2 text-gray-900">
              <User className="h-4 w-4" />
              Personal Information
            </h3>

            <div>
              <label className="crm-text-sm crm-font-medium mb-1 block text-gray-700">
                First Name *
              </label>
              <input
                {...register('firstName')}
                className={`crm-input ${errors.firstName ? 'border-red-300' : ''}`}
                placeholder="John"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="crm-text-xs mt-1 text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="crm-text-sm crm-font-medium mb-1 block text-gray-700">
                Last Name *
              </label>
              <input
                {...register('lastName')}
                className={`crm-input ${errors.lastName ? 'border-red-300' : ''}`}
                placeholder="Smith"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="crm-text-xs mt-1 text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="crm-text-sm crm-font-medium crm-flex crm-items-center crm-gap-2 mb-1 block text-gray-700">
                <Mail className="h-3.5 w-3.5" />
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className={`crm-input ${errors.email ? 'border-red-300' : ''}`}
                placeholder="john.smith@company.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="crm-text-xs mt-1 text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="crm-text-sm crm-font-medium crm-flex crm-items-center crm-gap-2 mb-1 block text-gray-700">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="crm-input"
                placeholder="+1 (555) 123-4567"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="crm-text-md crm-font-medium crm-flex crm-items-center crm-gap-2 text-gray-900">
              <Briefcase className="h-4 w-4" />
              Professional Information
            </h3>

            <div>
              <label className="crm-text-sm crm-font-medium crm-flex crm-items-center crm-gap-2 mb-1 block text-gray-700">
                <Building2 className="h-3.5 w-3.5" />
                Company
              </label>
              <input
                {...register('company')}
                className="crm-input"
                placeholder="Acme Corporation"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="crm-text-sm crm-font-medium mb-1 block text-gray-700">
                Job Title
              </label>
              <input
                {...register('jobTitle')}
                className="crm-input"
                placeholder="CEO"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="crm-text-sm crm-font-medium mb-1 block text-gray-700">
                Status
              </label>
              <select
                {...register('status')}
                className="crm-input"
                disabled={isLoading}
              >
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="crm-text-sm crm-font-medium crm-flex crm-items-center crm-gap-2 mb-1 block text-gray-700">
                <Tag className="h-3.5 w-3.5" />
                Source
              </label>
              <select
                {...register('source')}
                className="crm-input"
                disabled={isLoading}
              >
                <option value="">Select source...</option>
                <option value="Website">Website</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Trade Show">Trade Show</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="crm-text-sm crm-font-medium mb-1 block text-gray-700">
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="crm-input resize-none"
            placeholder="Additional notes about this contact..."
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
                    {contact ? 'Update Contact' : 'Create Contact'}
                  </>
                )}
          </button>
        </div>
      </form>
    </div>
  );
}
