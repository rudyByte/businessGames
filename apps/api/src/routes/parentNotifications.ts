import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import {
  getParentNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationSettings,
  updateNotificationSettings,
  generateSampleNotifications,
} from '../services/parentNotifications';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['PARENT']));

// ─── GET /api/v1/parent/notifications ────────────────────────────
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user!.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: { code: 'PARENT_NOT_FOUND', message: 'Parent profile not found.' },
      });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await getParentNotifications(parent.id, limit, offset);

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/v1/parent/notifications/:id/read ─────────────────
router.post('/:id/read', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user!.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: { code: 'PARENT_NOT_FOUND', message: 'Parent profile not found.' },
      });
    }

    await markNotificationRead(req.params.id, parent.id);

    return res.json({ success: true, data: { read: true } });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/v1/parent/notifications/read-all ─────────────────
router.post('/read-all', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user!.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: { code: 'PARENT_NOT_FOUND', message: 'Parent profile not found.' },
      });
    }

    await markAllNotificationsRead(parent.id);

    return res.json({ success: true, data: { readAll: true } });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/v1/parent/notifications/settings ──────────────────
router.get('/settings', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user!.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: { code: 'PARENT_NOT_FOUND', message: 'Parent profile not found.' },
      });
    }

    const settings = await getNotificationSettings(parent.id);

    return res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/v1/parent/notifications/settings ──────────────────
router.put('/settings', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user!.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: { code: 'PARENT_NOT_FOUND', message: 'Parent profile not found.' },
      });
    }

    const settings = await updateNotificationSettings(parent.id, req.body);

    return res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/v1/parent/notifications/generate-sample ──────────
router.post('/generate-sample', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { userId: req.user!.id },
      include: {
        children: {
          include: { student: true },
        },
      },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        error: { code: 'PARENT_NOT_FOUND', message: 'Parent profile not found.' },
      });
    }

    const children = parent.children.map((link) => link.student);
    await generateSampleNotifications(parent.id, children);

    return res.json({ success: true, data: { generated: true } });
  } catch (error) {
    next(error);
  }
});

export default router;
