interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  
  constructor(private config: RateLimitConfig) {}

  check(identifier: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const entry = this.storage.get(identifier);

    // Clean up expired entries periodically
    this.cleanup(now);

    if (!entry) {
      // First request from this identifier
      this.storage.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return { allowed: true };
    }

    if (now > entry.resetTime) {
      // Window has expired, reset the counter
      this.storage.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return { allowed: true };
    }

    if (entry.count >= this.config.maxRequests) {
      // Limit exceeded
      return { 
        allowed: false, 
        resetTime: entry.resetTime 
      };
    }

    // Increment counter
    entry.count++;
    return { allowed: true };
  }

  private cleanup(now: number) {
    // Remove expired entries to prevent memory leaks
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  // Get current usage for an identifier
  getUsage(identifier: string): { count: number; resetTime?: number } {
    const entry = this.storage.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return { count: 0 };
    }
    return { count: entry.count, resetTime: entry.resetTime };
  }
}

// Plan generation rate limiter - 1 plan per day per IP
export const planGenerationLimiter = new RateLimiter({
  maxRequests: 1,
  windowMs: 24 * 60 * 60 * 1000 // 24 hours
});

// Utility function to get client IP from request
export function getClientIP(request: Request): string {
  // Try to get real IP from headers (for production with proxies/CDN)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  // Fallback for development
  return 'unknown';
}