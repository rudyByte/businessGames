import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/v1/students/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
      include: {
        school: true,
        classroom: true,
        gameProgress: {
          include: {
            game: true
          }
        },
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: { code: 'STUDENT_NOT_FOUND', message: 'Student profile not found.' }
      });
    }

    return res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/students/me/avatar
router.put('/me/avatar', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { avatarConfig } = req.body;

    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: { code: 'STUDENT_NOT_FOUND', message: 'Student profile not found.' }
      });
    }

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: { avatarConfig: avatarConfig ? JSON.stringify(avatarConfig) : undefined }
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/students/me/achievements
router.get('/me/achievements', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const earned = await prisma.studentAchievement.findMany({
      where: { studentId: student.id },
      include: { achievement: true }
    });

    const allAchievements = await prisma.achievement.findMany();

    const data = allAchievements.map(ach => {
      const earnedRecord = earned.find(e => e.achievementId === ach.id);
      return {
        ...ach,
        unlocked: !!earnedRecord,
        earnedAt: earnedRecord ? earnedRecord.earnedAt : null
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
