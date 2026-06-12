import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['PARENT']));

// GET /api/v1/parent/children
router.get('/children', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user!.id } });
    if (!parent) throw new Error('Parent profile not found');

    const childrenLinks = await prisma.studentParentLink.findMany({
      where: { parentId: parent.id },
      include: {
        student: {
          include: {
            school: true,
            classroom: true,
            gameProgress: {
              include: {
                game: true
              }
            }
          }
        }
      }
    });

    const children = childrenLinks.map(link => link.student);

    return res.json({ success: true, data: children });
  } catch (error) {
    next(error);
  }
});

export default router;
