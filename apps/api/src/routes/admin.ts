import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['SUPER_ADMIN']));

// GET /api/v1/admin/stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const totalSchools = await prisma.school.count();
    const totalStudents = await prisma.student.count();
    const totalFaculty = await prisma.faculty.count();
    const totalGames = await prisma.game.count();
    const completions = await prisma.gameProgress.count({ where: { status: 'COMPLETED' } });

    return res.json({
      success: true,
      data: {
        totalSchools,
        totalStudents,
        totalFaculty,
        totalGames,
        completions
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/admin/schools
router.get('/schools', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: {
            students: true,
            faculty: true,
            classrooms: true
          }
        }
      }
    });

    return res.json({ success: true, data: schools });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/admin/schools
router.post('/schools', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, city, state, boardType } = req.body;

    const school = await prisma.school.create({
      data: {
        name,
        city,
        state,
        boardType: boardType || 'CBSE'
      }
    });

    return res.status(201).json({ success: true, data: school });
  } catch (error) {
    next(error);
  }
});

export default router;
