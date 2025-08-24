'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Building2, 
  User, 
  Mail, 
  CheckCircle, 
  Loader2,
  Database,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';

// Validation schema
const setupSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  adminEmail: z.string().email('Invalid email address'),
  adminFirstName: z.string().min(1, 'First name is required'),
  adminLastName: z.string().min(1, 'Last name is required'),
  createSampleData: z.boolean().default(true),
});

type SetupFormData = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleDataResult, setSampleDataResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      organizationName: '',
      adminEmail: '',
      adminFirstName: '',
      adminLastName: '',
      createSampleData: true,
    },
  });

  // Check if setup is required
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/admin/setup', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (!data.setupRequired) {
            // User already exists, redirect to dashboard
            router.push('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
      } finally {
        setCheckingSetup(false);
      }
    };

    if (user) {
      checkSetupStatus();
    }
  }, [user, getToken, router]);

  // Pre-fill form with user data from Clerk
  useEffect(() => {
    if (user) {
      setValue('adminEmail', user.primaryEmailAddress?.emailAddress || '');
      setValue('adminFirstName', user.firstName || '');
      setValue('adminLastName', user.lastName || '');
    }
  }, [user, setValue]);

  const handleSetup = async (data: SetupFormData) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSetupComplete(true);
        setSampleDataResult(result.data.sampleData);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError(result.error || 'Setup failed');
      }
    } catch (err) {
      setError('Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-gray-50 crm-flex crm-items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="crm-text-sm text-gray-600">Checking setup status...</p>
        </div>
      </div>
    );
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 crm-flex crm-items-center justify-center">
        <div className="max-w-md w-full">
          <div className="crm-card">
            <div className="crm-card-content text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h1 className="crm-text-2xl crm-font-bold text-gray-900 mb-4">
                Setup Complete!
              </h1>
              <p className="crm-text-sm text-gray-600 mb-6">
                Your CRM is ready to use. You'll be redirected to the dashboard shortly.
              </p>

              {sampleDataResult && (
                <div className="bg-blue-50 rounded-md p-4 mb-6">
                  <h3 className="crm-text-sm crm-font-medium text-blue-900 mb-3">
                    Sample Data Created:
                  </h3>
                  <div className="grid grid-cols-2 crm-gap-3 crm-text-xs text-blue-700">
                    <div className="crm-flex crm-items-center crm-gap-2">
                      <Users className="w-3 h-3" />
                      {sampleDataResult.contacts} Contacts
                    </div>
                    <div className="crm-flex crm-items-center crm-gap-2">
                      <Building2 className="w-3 h-3" />
                      {sampleDataResult.companies} Companies
                    </div>
                    <div className="crm-flex crm-items-center crm-gap-2">
                      <TrendingUp className="w-3 h-3" />
                      {sampleDataResult.deals} Deals
                    </div>
                    <div className="crm-flex crm-items-center crm-gap-2">
                      <Calendar className="w-3 h-3" />
                      {sampleDataResult.activities} Activities
                    </div>
                  </div>
                </div>
              )}

              <div className="crm-flex crm-items-center justify-center crm-gap-2 crm-text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to dashboard...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 crm-flex crm-items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="crm-text-3xl crm-font-bold text-gray-900 mb-2">
            Welcome to AWCRM
          </h1>
          <p className="crm-text-sm text-gray-600">
            Let's set up your organization and admin account
          </p>
        </div>

        <div className="crm-card">
          <form onSubmit={handleSubmit(handleSetup)} className="crm-card-content">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="crm-text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Organization Information */}
            <div className="mb-6">
              <h3 className="crm-text-md crm-font-medium text-gray-900 mb-4 crm-flex crm-items-center crm-gap-2">
                <Building2 className="w-4 h-4" />
                Organization Information
              </h3>

              <div>
                <label className="block crm-text-sm crm-font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  {...register('organizationName')}
                  className={`crm-input ${errors.organizationName ? 'border-red-300' : ''}`}
                  placeholder="Acme Corporation"
                  disabled={loading}
                />
                {errors.organizationName && (
                  <p className="mt-1 crm-text-xs text-red-600">{errors.organizationName.message}</p>
                )}
              </div>
            </div>

            {/* Admin Information */}
            <div className="mb-6">
              <h3 className="crm-text-md crm-font-medium text-gray-900 mb-4 crm-flex crm-items-center crm-gap-2">
                <User className="w-4 h-4" />
                Admin Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block crm-text-sm crm-font-medium text-gray-700 mb-1 crm-flex crm-items-center crm-gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Email Address *
                  </label>
                  <input
                    {...register('adminEmail')}
                    type="email"
                    className={`crm-input ${errors.adminEmail ? 'border-red-300' : ''}`}
                    placeholder="admin@company.com"
                    disabled={loading}
                  />
                  {errors.adminEmail && (
                    <p className="mt-1 crm-text-xs text-red-600">{errors.adminEmail.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 crm-gap-3">
                  <div>
                    <label className="block crm-text-sm crm-font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      {...register('adminFirstName')}
                      className={`crm-input ${errors.adminFirstName ? 'border-red-300' : ''}`}
                      placeholder="John"
                      disabled={loading}
                    />
                    {errors.adminFirstName && (
                      <p className="mt-1 crm-text-xs text-red-600">{errors.adminFirstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block crm-text-sm crm-font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      {...register('adminLastName')}
                      className={`crm-input ${errors.adminLastName ? 'border-red-300' : ''}`}
                      placeholder="Doe"
                      disabled={loading}
                    />
                    {errors.adminLastName && (
                      <p className="mt-1 crm-text-xs text-red-600">{errors.adminLastName.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Data Option */}
            <div className="mb-6">
              <h3 className="crm-text-md crm-font-medium text-gray-900 mb-4 crm-flex crm-items-center crm-gap-2">
                <Database className="w-4 h-4" />
                Sample Data
              </h3>

              <label className="crm-flex crm-items-start crm-gap-3">
                <input
                  {...register('createSampleData')}
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <div>
                  <span className="crm-text-sm crm-font-medium text-gray-700">
                    Create sample data
                  </span>
                  <p className="crm-text-xs text-gray-500 mt-1">
                    Add sample contacts, companies, deals, and activities to help you get started
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full crm-button crm-button-primary crm-flex crm-items-center justify-center crm-gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Setup
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
