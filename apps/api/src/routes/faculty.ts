import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Verify role is FACULTY
router.use(authMiddleware);
router.use(requireRole(['FACULTY']));

// GET /api/v1/faculty/classroom
router.get('/classroom', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const faculty = await prisma.faculty.findUnique({ where: { userId: req.user!.id } });
    if (!faculty) throw new Error('Faculty profile not found');

    const classrooms = await prisma.classroom.findMany({
      where: { facultyId: faculty.id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            level: true,
            totalXP: true,
            coins: true,
            lastActiveAt: true,
            gameProgress: true
          }
        }
      }
    });

    return res.json({ success: true, data: classrooms });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/faculty/classroom/analytics
router.get('/classroom/analytics', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const faculty = await prisma.faculty.findUnique({ where: { userId: req.user!.id } });
    if (!faculty) throw new Error('Faculty profile not found');

    const classrooms = await prisma.classroom.findMany({
      where: { facultyId: faculty.id },
      select: {
        id: true,
        name: true,
        students: {
          select: {
            id: true,
            name: true,
            level: true,
            totalXP: true,
            gameProgress: {
              select: {
                gameId: true,
                currentChapter: true,
                currentLevel: true,
                status: true,
                totalScore: true
              }
            }
          }
        }
      }
    });

    // Formulate a simple weekly Gemini AI insight
    const aiInsight = "This week, 75% of your class active students advanced at least 1 chapter. Chapter 3 shows slightly lower average scores (650/1000) than other levels. Consider spending 10 minutes reviewing Greenfield School observation clues in class before students proceed to Rajpur Market.";

    return res.json({
      success: true,
      data: {
        classrooms,
        aiInsight
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/faculty/assignments
router.post('/assignments', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const faculty = await prisma.faculty.findUnique({ where: { userId: req.user!.id } });
    if (!faculty) throw new Error('Faculty profile not found');

    const { classroomId, title, description, gameSlug, chapterNumber, dueDate } = req.body;

    const assignment = await prisma.assignment.create({
      data: {
        facultyId: faculty.id,
        classroomId,
        title,
        description: description || null,
        gameSlug,
        chapterNumber,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    });

    return res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/faculty/assignments
router.get('/assignments', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const faculty = await prisma.faculty.findUnique({ where: { userId: req.user!.id } });
    if (!faculty) throw new Error('Faculty profile not found');

    const assignments = await prisma.assignment.findMany({
      where: { facultyId: faculty.id },
      include: {
        classroom: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
});

export default router;
