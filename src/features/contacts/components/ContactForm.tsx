// AWCRM Contact Form Component - Modern, Accessible UI
// Comprehensive form for creating and editing contacts with validation

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Tag,
  FileText,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/libs/utils';
import { useCreateContact, useUpdateContact } from '../hooks/useContacts';
import type { Contact, ContactStatus } from '../types/contact.types';

// Form validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  jobTitle: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('prospect'),
  source: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  contact?: Contact;
  organizationId: string;
  onSuccess?: (contact: Contact) => void;
  onCancel?: () => void;
  className?: string;
}

const statusOptions = [
  { value: 'prospect', label: 'Prospect', color: 'bg-blue-100 text-blue-800' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
] as const;

const sourceOptions = [
  'Website',
  'Referral',
  'Social Media',
  'Email Campaign',
  'Conference',
  'Cold Call',
  'Advertisement',
  'Partner',
  'Other',
];

export function ContactForm({
  contact,
  organizationId,
  onSuccess,
  onCancel,
  className,
}: ContactFormProps) {
  const [tagInput, setTagInput] = useState('');
  const isEditing = !!contact;

  // Form setup
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: contact?.firstName || '',
      lastName: contact?.lastName || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      company: contact?.company || '',
      jobTitle: contact?.jobTitle || '',
      status: contact?.status || 'prospect',
      source: contact?.source || '',
      tags: contact?.tags || [],
      notes: contact?.notes || '',
    },
  });

  // Mutations
  const createContactMutation = useCreateContact(organizationId);
  const updateContactMutation = useUpdateContact(organizationId);

  const isLoading = createContactMutation.isPending || updateContactMutation.isPending;

  // Handle form submission
  const onSubmit = async (data: ContactFormData) => {
    try {
      if (isEditing && contact) {
        const updatedContact = await updateContactMutation.mutateAsync({
          id: contact.id,
          ...data,
        });
        onSuccess?.(updatedContact);
      } else {
        const newContact = await createContactMutation.mutateAsync(data);
        onSuccess?.(newContact);
      }
    } catch (error) {
      // Error is handled by the mutation
      console.error('Form submission error:', error);
    }
  };

  // Handle tag management
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !form.getValues('tags').includes(trimmedTag)) {
      const currentTags = form.getValues('tags');
      form.setValue('tags', [...currentTags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('bg-white rounded-lg shadow-lg p-6', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Contact' : 'Create New Contact'}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditing ? 'Update contact information' : 'Add a new contact to your CRM'}
            </p>
          </div>
        </div>
        
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                {...form.register('firstName')}
                placeholder="Enter first name"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-600">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                {...form.register('lastName')}
                placeholder="Enter last name"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-600">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                {...form.register('email')}
                type="email"
                placeholder="Enter email address"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                {...form.register('phone')}
                placeholder="Enter phone number"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Company
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                {...form.register('company')}
                placeholder="Enter company name"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Job Title
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                {...form.register('jobTitle')}
                placeholder="Enter job title"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Status and Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              value={form.watch('status')}
              onValueChange={(value: ContactStatus) => form.setValue('status', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <div className={cn('w-2 h-2 rounded-full', option.color)} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Source
            </label>
            <Select
              value={form.watch('source') || ''}
              onValueChange={(value) => form.setValue('source', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tags
          </label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="Add a tag and press Enter"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!tagInput.trim() || isLoading}
              >
                Add
              </Button>
            </div>
            
            {form.watch('tags').length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.watch('tags').map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Notes
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              {...form.register('notes')}
              placeholder="Add any additional notes..."
              className="w-full min-h-[100px] pl-10 pt-3 pr-3 pb-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Contact' : 'Create Contact'}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
