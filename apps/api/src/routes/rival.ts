import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { emitToClassroom, emitToUser } from '../lib/socket';
import {
  getRival,
  assignRival,
  refreshRivalXP,
  getWeeklyChallenge,
  getClassWarState,
  startClassWar,
  endClassWar,
  syncRivalXP,
} from '../services/rival';

const router = Router();

// Middleware to verify student role
const requireStudent = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return res.status(403).json({
      success: false,
      error: { code: 'STUDENT_ONLY', message: 'Student access required.' }
    });
  }
  next();
};

// GET /api/v1/rival — Get current rival
router.get('/', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student not found');

    let rival = await getRival(student.id);
    if (!rival && student.classroomId) {
      rival = await assignRival(student.id, student.classroomId);
    }

    return res.json({ success: true, data: { rival } });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/rival/refresh — Refresh rival XP and check for overtake
router.post('/refresh', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student not found');

    const result = await refreshRivalXP(student.id);

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/rival/weekly-challenge — Get weekly challenge status
router.get('/weekly-challenge', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student not found');

    const challenge = await getWeeklyChallenge(student.id);

    return res.json({ success: true, data: { challenge } });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/rival/sync-xp — Called when student earns XP
router.post('/sync-xp', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student not found');

    const { xpEarned } = req.body;
    if (!xpEarned || typeof xpEarned !== 'number') {
      return res.status(400).json({ success: false, error: { message: 'xpEarned is required' } });
    }

    syncRivalXP(student.id, xpEarned);

    return res.json({ success: true, data: { synced: true } });
  } catch (error) {
    next(error);
  }
});

// ─── Class War Routes (Faculty) ──────────────────────────────────────────────

// GET /api/v1/rival/class-war/:classroomId — Get class war state
router.get('/class-war/:classroomId', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const state = await getClassWarState(req.params.classroomId);
    return res.json({ success: true, data: { classWar: state } });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/rival/class-war/start — Faculty starts a class war
router.post('/class-war/start', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'FACULTY' && req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: { message: 'Faculty access required' } });
    }

    const { classroomId, teamAName, teamBName, teamAStudentIds, teamBStudentIds } = req.body;

    if (!classroomId || !teamAName || !teamBName || !teamAStudentIds || !teamBStudentIds) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
    }

    const state = await startClassWar(classroomId, teamAName, teamBName, teamAStudentIds, teamBStudentIds);

    return res.json({ success: true, data: { classWar: state } });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/rival/class-war/end — Faculty ends a class war
router.post('/class-war/end', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'FACULTY' && req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: { message: 'Faculty access required' } });
    }

    const { classroomId } = req.body;
    if (!classroomId) {
      return res.status(400).json({ success: false, error: { message: 'classroomId is required' } });
    }

    const state = await endClassWar(classroomId);

    return res.json({ success: true, data: { classWar: state } });
  } catch (error) {
    next(error);
  }
});

export default router;
