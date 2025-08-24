// AWCRM Rate Limiting - Enterprise Grade Implementation
// Advanced rate limiting with multiple strategies and Redis-like functionality

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
};

type RateLimitConfig = {
  requests: number;
  window: number; // in milliseconds
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
};

class InMemoryRateLimit {
  private store = new Map<string, { count: number; resetTime: number }>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Clean up expired entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime <= now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const key = identifier;
    const existing = this.store.get(key);

    // If no existing record or window has expired, create new
    if (!existing || existing.resetTime <= now) {
      const resetTime = now + this.config.window;
      this.store.set(key, { count: 1, resetTime });

      return {
        success: true,
        limit: this.config.requests,
        remaining: this.config.requests - 1,
        reset: resetTime,
      };
    }

    // Increment count
    existing.count++;
    this.store.set(key, existing);

    const remaining = Math.max(0, this.config.requests - existing.count);
    const success = existing.count <= this.config.requests;

    const result: RateLimitResult = {
      success,
      limit: this.config.requests,
      remaining,
      reset: existing.resetTime,
    };

    if (!success) {
      result.retryAfter = Math.ceil((existing.resetTime - now) / 1000);
    }

    return result;
  }

  async reset(identifier: string): Promise<void> {
    this.store.delete(identifier);
  }

  getStats(): { totalKeys: number; memoryUsage: string } {
    const totalKeys = this.store.size;
    const memoryUsage = `${Math.round(JSON.stringify([...this.store]).length / 1024)}KB`;
    return { totalKeys, memoryUsage };
  }
}

// Different rate limit configurations for different endpoints
const rateLimitConfigs = {
  // General API rate limit
  api: {
    requests: 100,
    window: 60 * 1000, // 1 minute
  },

  // Authentication endpoints (more restrictive)
  auth: {
    requests: 10,
    window: 60 * 1000, // 1 minute
  },

  // Contact creation (moderate)
  contactCreate: {
    requests: 20,
    window: 60 * 1000, // 1 minute
  },

  // Search endpoints (higher limit)
  search: {
    requests: 200,
    window: 60 * 1000, // 1 minute
  },

  // File uploads (very restrictive)
  upload: {
    requests: 5,
    window: 60 * 1000, // 1 minute
  },

  // Email sending (restrictive)
  email: {
    requests: 10,
    window: 60 * 1000, // 1 minute
  },
} as const;

// Create rate limiters for different types
const rateLimiters = {
  api: new InMemoryRateLimit(rateLimitConfigs.api),
  auth: new InMemoryRateLimit(rateLimitConfigs.auth),
  contactCreate: new InMemoryRateLimit(rateLimitConfigs.contactCreate),
  search: new InMemoryRateLimit(rateLimitConfigs.search),
  upload: new InMemoryRateLimit(rateLimitConfigs.upload),
  email: new InMemoryRateLimit(rateLimitConfigs.email),
};

// Default rate limiter (general API)
export const ratelimit = rateLimiters.api;

// Export specific rate limiters
export const authRateLimit = rateLimiters.auth;
export const contactCreateRateLimit = rateLimiters.contactCreate;
export const searchRateLimit = rateLimiters.search;
export const uploadRateLimit = rateLimiters.upload;
export const emailRateLimit = rateLimiters.email;

// Utility function to get appropriate rate limiter based on endpoint
export function getRateLimiter(endpoint: string): InMemoryRateLimit {
  if (endpoint.includes('/auth/') || endpoint.includes('/sign-in') || endpoint.includes('/sign-up')) {
    return authRateLimit;
  }

  if (endpoint.includes('/contacts') && endpoint.includes('POST')) {
    return contactCreateRateLimit;
  }

  if (endpoint.includes('/search')) {
    return searchRateLimit;
  }

  if (endpoint.includes('/upload')) {
    return uploadRateLimit;
  }

  if (endpoint.includes('/email')) {
    return emailRateLimit;
  }

  return ratelimit;
}

// Advanced rate limiting with user-based limits
export class UserRateLimit {
  private userLimits = new Map<string, InMemoryRateLimit>();

  constructor(private defaultConfig: RateLimitConfig) {}

  async limitUser(userId: string, customConfig?: RateLimitConfig): Promise<RateLimitResult> {
    const config = customConfig || this.defaultConfig;
    const key = `user:${userId}`;

    if (!this.userLimits.has(key)) {
      this.userLimits.set(key, new InMemoryRateLimit(config));
    }

    const limiter = this.userLimits.get(key)!;
    return limiter.limit(userId);
  }

  async resetUser(userId: string): Promise<void> {
    const key = `user:${userId}`;
    const limiter = this.userLimits.get(key);
    if (limiter) {
      await limiter.reset(userId);
    }
  }
}

// Create user-specific rate limiters
export const userApiRateLimit = new UserRateLimit(rateLimitConfigs.api);
export const userContactRateLimit = new UserRateLimit(rateLimitConfigs.contactCreate);

// Rate limit middleware helper
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof rateLimiters = 'api',
): Promise<RateLimitResult> {
  const limiter = rateLimiters[type];
  return limiter.limit(identifier);
}

// Organization-based rate limiting
export class OrganizationRateLimit {
  private orgLimits = new Map<string, InMemoryRateLimit>();

  constructor(private defaultConfig: RateLimitConfig) {}

  async limitOrganization(orgId: string, customConfig?: RateLimitConfig): Promise<RateLimitResult> {
    const config = customConfig || this.defaultConfig;
    const key = `org:${orgId}`;

    if (!this.orgLimits.has(key)) {
      this.orgLimits.set(key, new InMemoryRateLimit(config));
    }

    const limiter = this.orgLimits.get(key)!;
    return limiter.limit(orgId);
  }
}

// Organization rate limiters with higher limits
export const orgApiRateLimit = new OrganizationRateLimit({
  requests: 1000, // Higher limit for organizations
  window: 60 * 1000,
});

// Export rate limit stats for monitoring
export function getRateLimitStats() {
  const stats: Record<string, any> = {};

  for (const [name, limiter] of Object.entries(rateLimiters)) {
    stats[name] = limiter.getStats();
  }

  return {
    rateLimiters: stats,
    timestamp: new Date().toISOString(),
  };
}

// Cleanup function for graceful shutdown
export function cleanupRateLimiters(): void {
  // Clear all rate limiter stores
  for (const limiter of Object.values(rateLimiters)) {
    limiter.store.clear();
  }

  console.log('Rate limiters cleaned up');
}
