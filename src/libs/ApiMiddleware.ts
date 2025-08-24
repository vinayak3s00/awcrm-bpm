// AWCRM API Middleware - Enterprise Grade Implementation
// Comprehensive middleware for API security, validation, and error handling

import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ratelimit } from './RateLimit';

// Types for API responses
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
};

export type ApiError = {
  message: string;
  code: string;
  status: number;
  details?: any;
};

// Custom error classes
export class ApiValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

export class ApiAuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'ApiAuthenticationError';
  }
}

export class ApiAuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'ApiAuthorizationError';
  }
}

export class ApiNotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'ApiNotFoundError';
  }
}

export class ApiRateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'ApiRateLimitError';
  }
}

// Generate unique request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create standardized API response
export function createApiResponse<T>(
  data?: T,
  message?: string,
  requestId?: string,
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId,
  };
}

// Create standardized error response
export function createErrorResponse(
  error: string | Error,
  status: number = 500,
  requestId?: string,
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorResponse: ApiResponse = {
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(errorResponse, { status });
}

// Enhanced error handler with logging
export function handleApiError(error: unknown, requestId?: string): NextResponse {
  console.error(`[API Error] ${requestId || 'unknown'}:`, error);

  if (error instanceof ApiValidationError) {
    return createErrorResponse(error.message, 400, requestId);
  }

  if (error instanceof ApiAuthenticationError) {
    return createErrorResponse(error.message, 401, requestId);
  }

  if (error instanceof ApiAuthorizationError) {
    return createErrorResponse(error.message, 403, requestId);
  }

  if (error instanceof ApiNotFoundError) {
    return createErrorResponse(error.message, 404, requestId);
  }

  if (error instanceof ApiRateLimitError) {
    return createErrorResponse(error.message, 429, requestId);
  }

  if (error instanceof z.ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: validationErrors,
      timestamp: new Date().toISOString(),
      requestId,
    }, { status: 400 });
  }

  // Generic error
  const message = error instanceof Error ? error.message : 'Internal server error';
  return createErrorResponse(message, 500, requestId);
}

// Authentication middleware
export async function requireAuth(request: NextRequest): Promise<{
  userId: string;
  organizationId?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    throw new ApiAuthenticationError('Authentication required');
  }

  // Get organization ID from headers
  const organizationId = request.headers.get('x-organization-id') || undefined;

  return { userId, organizationId };
}

// Rate limiting middleware
export async function applyRateLimit(request: NextRequest): Promise<void> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    throw new ApiRateLimitError(`Rate limit exceeded. Try again in ${Math.round((reset - Date.now()) / 1000)} seconds`);
  }

  // Add rate limit headers to response (will be handled by the calling function)
  // This is informational for the client
  console.log(`Rate limit: ${remaining}/${limit} remaining for ${ip}`);
}

// Organization validation middleware
export function requireOrganization(organizationId?: string): string {
  if (!organizationId) {
    throw new ApiValidationError('Organization ID is required in x-organization-id header');
  }
  return organizationId;
}

// Request validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error; // Will be handled by handleApiError
    }
    throw new ApiValidationError('Invalid request data');
  }
}

// CORS middleware
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-organization-id');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// Security headers middleware
export function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

// API wrapper for consistent error handling and middleware
export function withApiMiddleware<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const requestId = generateRequestId();

    try {
      // Apply rate limiting
      await applyRateLimit(request);

      // Call the actual handler
      const response = await handler(request, ...args);

      // Add security headers
      setSecurityHeaders(response);

      // Add request ID to response
      response.headers.set('x-request-id', requestId);

      return response;
    } catch (error) {
      return handleApiError(error, requestId);
    }
  };
}

// Utility function to handle OPTIONS requests
export function handleOptions(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response);
}
