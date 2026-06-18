import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from './auth';

// Extend the AuthenticatedRequest to include schoolId
export interface ScopedRequest extends AuthenticatedRequest {
  schoolId?: string;
  subscriptionTier?: 'free' | 'premium';
}

/**
 * Middleware that loads the user's schoolId from their profile and attaches it
 * to the request object. Also resolves subscription tier for rate limiting.
 */
export async function schoolScopeMiddleware(
  req: ScopedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' },
    });
  }

  try {
    // Resolve schoolId based on role
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
        include: { school: { select: { id: true, subscriptionTier: true } } },
      });
      if (student) {
        req.schoolId = student.schoolId;
        req.subscriptionTier = student.school.subscriptionTier as 'free' | 'premium';
      }
    } else if (req.user.role === 'FACULTY') {
      const faculty = await prisma.faculty.findUnique({
        where: { userId: req.user.id },
        include: { school: { select: { id: true, subscriptionTier: true } } },
      });
      if (faculty) {
        req.schoolId = faculty.schoolId;
        req.subscriptionTier = faculty.school.subscriptionTier as 'free' | 'premium';
      }
    } else if (req.user.role === 'PARENT') {
      // Parents can have children in multiple schools — use the first child's school
      const parent = await prisma.parent.findUnique({
        where: { userId: req.user.id },
        include: {
          children: {
            include: { student: { select: { schoolId: true } } },
          },
        },
      });
      if (parent?.children.length) {
        req.schoolId = parent.children[0].student.schoolId;
      }
    }
    // SUPER_ADMIN has no schoolId scope (sees everything)

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Route-level guard to ensure the user only accesses data within their school.
 * Pass the field on the target model that contains schoolId.
 */
export function scopedQuery(field: string) {
  return (req: ScopedRequest, res: Response, next: NextFunction) => {
    // SuperAdmin bypasses school scoping
    if (req.user?.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!req.schoolId) {
      return res.status(403).json({
        success: false,
        error: { code: 'SCOPE_MISSING', message: 'Could not determine school scope.' },
      });
    }

    // Store the schoolId for use in route handlers
    (req as any).scopeFilter = { [field]: req.schoolId };
    next();
  };
}

/**
 * Helper to apply school scope filter to Prisma queries.
 * Usage: `prisma.student.findMany({ where: { ...scopeFilter(req), ...additionalFilter } })`
 */
export function scopeFilter(req: ScopedRequest): Record<string, any> {
  if (req.user?.role === 'SUPER_ADMIN') return {};
  if (req.schoolId) return { schoolId: req.schoolId };
  return {};
}
