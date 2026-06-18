import { Response, NextFunction } from 'express';
import { redis } from '../lib/redis';
import { ScopedRequest } from './schoolScope';

/**
 * School-level AI hint rate limiting.
 * 
 * Free tier schools: 50 AI hints/month total
 * Premium schools: 500 AI hints/month per student (effectively unlimited)
 * 
 * Tracked per schoolId in Redis with monthly expiry.
 */

const FREE_TIER_LIMIT = 50;
const PREMIUM_TIER_LIMIT = 500;

export async function schoolRateLimitMiddleware(
  req: ScopedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // SuperAdmin and unauthenticated requests bypass rate limiting
    if (!req.user || req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // If no school scope, allow through (public endpoints)
    if (!req.schoolId) {
      return next();
    }

    // Check if this is an AI hint call (check route path)
    const isAIHintCall =
      req.path.includes('/ai-tutor') ||
      req.path.includes('/ai-hint') ||
      req.path.includes('/ai/doubt') ||
      req.path.includes('/story/dialogue');

    if (!isAIHintCall) {
      return next();
    }

    const subscriptionTier = req.subscriptionTier || 'free';
    const limit = subscriptionTier === 'premium' ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT;

    // Monthly reset key: e.g. "rate:school:{schoolId}:ai:2026-06"
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const rateKey = `rate:school:${req.schoolId}:ai:${monthKey}`;

    const currentUsage = await redis.get(rateKey);
    const usageCount = currentUsage ? parseInt(currentUsage, 10) : 0;

    if (usageCount >= limit) {
      const isFree = subscriptionTier === 'free';
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: isFree
            ? 'Your school has reached its free-tier AI hint limit (50/month). Contact your admin to upgrade for unlimited hints!'
            : 'AI hint limit reached for this month.',
        },
        data: {
          isFree,
          limit,
          usage: usageCount,
          resetKey: monthKey,
        },
      });
    }

    // Increment    
    if (usageCount === 0) {
      // First usage: set with TTL (expire at end of month)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const secondsUntilEndOfMonth = Math.round((lastDay.getTime() - now.getTime()) / 1000);
      await redis.set(rateKey, '1', secondsUntilEndOfMonth > 0 ? secondsUntilEndOfMonth : 2592000);
    } else {
      await redis.incr(rateKey);
    }

    // Attach remaining limit to response headers (non-standard, but useful for debugging)
    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(limit - usageCount - 1));

    next();
  } catch (error) {
    // If Redis fails, allow the request through (graceful degradation)
    console.warn('Rate limit check failed, allowing request:', error);
    next();
  }
}
