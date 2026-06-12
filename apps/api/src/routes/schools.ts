import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/v1/schools - Public endpoint to list all schools
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        classrooms: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
            _count: {
              select: { students: true }
            }
          }
        }
      }
    });

    return res.json({
      success: true,
      data: schools
    });
  } catch (error) {
    next(error);
  }
});

export default router;
