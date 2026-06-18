import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { schoolScopeMiddleware, scopeFilter } from '../middleware/schoolScope';

const router = Router();

// ─── STUDENT: Get active announcements for their school/classroom ──────
router.get(
  '/',
  authMiddleware,
  schoolScopeMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      let announcements: any[] = [];

      if (user.role === 'STUDENT') {
        const student = await prisma.student.findUnique({
          where: { userId: user.id },
          select: { schoolId: true, classroomId: true },
        });

        if (student) {
          announcements = await prisma.announcement.findMany({
            where: {
              isActive: true,
              OR: [
                { schoolId: null, classroomId: null }, // Global (SuperAdmin)
                { schoolId: student.schoolId, classroomId: null }, // School-wide
                { schoolId: student.schoolId, classroomId: student.classroomId }, // Classroom
              ],
              AND: [
                { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
              ],
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          });
        }
      } else if (user.role === 'FACULTY') {
        const faculty = await prisma.faculty.findUnique({
          where: { userId: user.id },
          select: { classrooms: { select: { id: true } } },
        });
        const classroomIds = faculty?.classrooms.map((c) => c.id) || [];

        announcements = await prisma.announcement.findMany({
          where: {
            isActive: true,
            OR: [
              { classroomId: { in: classroomIds } },
              { schoolId: (await prisma.faculty.findUnique({ where: { userId: user.id } }))?.schoolId },
            ].filter(Boolean),
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
      } else if (user.role === 'SUPER_ADMIN') {
        announcements = await prisma.announcement.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
      }

      return res.json({ success: true, data: announcements });
    } catch (error) {
      next(error);
    }
  }
);

// ─── SUPER_ADMIN: Create global announcement ─────────────────────────
router.post(
  '/',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'FACULTY']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { title, message, ctaLabel, ctaLink, expiresAt, schoolId, classroomId } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION', message: 'Title and message are required.' },
        });
      }

      const announcement = await prisma.announcement.create({
        data: {
          title,
          message,
          ctaLabel: ctaLabel || null,
          ctaLink: ctaLink || null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          createdByUserId: req.user!.id,
          createdByRole: req.user!.role,
          // SuperAdmin: null schoolId = global; Faculty: scoped to their school/classroom
          schoolId: schoolId || null,
          classroomId: classroomId || null,
        },
      });

      return res.status(201).json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  }
);

// ─── SUPER_ADMIN: Update announcement ────────────────────────────────
router.put(
  '/:id',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'FACULTY']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { title, message, ctaLabel, ctaLink, isActive, expiresAt } = req.body;
      const announcement = await prisma.announcement.update({
        where: { id: req.params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(message !== undefined && { message }),
          ...(ctaLabel !== undefined && { ctaLabel }),
          ...(ctaLink !== undefined && { ctaLink }),
          ...(isActive !== undefined && { isActive }),
          ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        },
      });

      return res.json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  }
);

// ─── SUPER_ADMIN: Delete announcement ─────────────────────────────────
router.delete(
  '/:id',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'FACULTY']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await prisma.announcement.delete({
        where: { id: req.params.id },
      });
      return res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      next(error);
    }
  }
);

// ─── STUDENT: Dismiss announcement (tracked via Redis, not DB) ───────
router.post(
  '/:id/dismiss',
  authMiddleware,
  requireRole(['STUDENT']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { redis } = await import('../lib/redis.js');
      const key = `dismissed:announcement:${req.params.id}:user:${req.user!.id}`;
      await redis.set(key, 'true', 86400); // Expire after 24h
      return res.json({ success: true, data: { dismissed: true } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
