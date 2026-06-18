import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  PREDEFINED_CUTSCENES,
  CutsceneScript,
  getPreetiDialogue,
  getRishabhDialogue,
} from '../services/storyTeller';
import { emitToUser } from '../lib/socket';

const router = Router();

// Middleware to verify user is a student
const requireStudent = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return res.status(403).json({
      success: false,
      error: { code: 'STUDENT_ONLY', message: 'This operation is only available to students.' }
    });
  }
  next();
};

/* ─── Routes ────────────────────────────────────────────────────── */

// GET /api/v1/story/pending-cutscene
// Computes pending cutscenes from game progress (no persistence needed)
router.get('/pending-cutscene', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id }
    });
    if (!student) {
      return res.status(404).json({ success: false, error: { message: 'Student not found' } });
    }

    // Fetch game progress to determine available cutscenes
    const gameProgress = await prisma.gameProgress.findMany({
      where: {
        studentId: student.id,
        game: { slug: { in: ['problem-hunt', 'startup-simulator'] } }
      },
      include: { game: true }
    });

    const detProgress = gameProgress.find(g => g.game.slug === 'problem-hunt');
    const simProgress = gameProgress.find(g => g.game.slug === 'startup-simulator');

    const pendingCutscenes: CutsceneScript[] = [];

    // Check Chapter 3 complete (detective game — evidence board phase or beyond)
    if (detProgress) {
      const detSave = detProgress.detectiveSave ? (
        typeof detProgress.detectiveSave === 'string'
          ? JSON.parse(detProgress.detectiveSave)
          : detProgress.detectiveSave
      ) : null;

      if (detSave?.phase && ['evidence_board', 'validation', 'report'].includes(detSave.phase)) {
        pendingCutscenes.push(PREDEFINED_CUTSCENES.chapter3_complete);
      }
    }

    // Check first profit (simulator game)
    if (simProgress) {
      const simSave = simProgress.simulatorSave ? (
        typeof simProgress.simulatorSave === 'string'
          ? JSON.parse(simProgress.simulatorSave)
          : simProgress.simulatorSave
      ) : null;

      const roundHistory = simSave?.roundHistory || [];
      const hasPositiveProfit = roundHistory.some((r: any) => r.profit > 0);

      if (hasPositiveProfit) {
        pendingCutscenes.push(PREDEFINED_CUTSCENES.first_profit);
        pendingCutscenes.push(PREDEFINED_CUTSCENES.rishabh_first_profit);
      }

      // Mid-game milestone (round 5+)
      const currentRound = simSave?.currentRound || 1;
      if (currentRound >= 5) {
        pendingCutscenes.push(PREDEFINED_CUTSCENES.mid_game_milestone);
      }

      // Capstone resolution (both games completed)
      if (detProgress?.status === 'COMPLETED' && simProgress?.status === 'COMPLETED') {
        pendingCutscenes.push(PREDEFINED_CUTSCENES.capstone_resolution);
      }
    }

    return res.json({
      success: true,
      data: {
        cutscenes: pendingCutscenes,
        totalPending: pendingCutscenes.length,
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/story/complete-cutscene
router.post('/complete-cutscene', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id }
    });
    if (!student) {
      return res.status(404).json({ success: false, error: { message: 'Student not found' } });
    }

    const { cutsceneId } = req.body;
    if (!cutsceneId) {
      return res.status(400).json({ success: false, error: { message: 'cutsceneId is required' } });
    }

    // Award XP for completing a story cutscene
    const cutscene = PREDEFINED_CUTSCENES[cutsceneId];
    const xpReward = cutscene?.xpReward || 0;

    if (xpReward > 0) {
      const updatedStudent = await prisma.student.update({
        where: { id: student.id },
        data: { totalXP: { increment: xpReward } }
      });

      // Notify the student of XP gain via socket
      emitToUser(student.userId, 'story:xp_reward', {
        cutsceneId,
        xpEarned: xpReward,
        totalXP: updatedStudent.totalXP,
      });

      return res.json({
        success: true,
        data: {
          completed: true,
          xpEarned: xpReward,
          totalXP: updatedStudent.totalXP,
        }
      });
    }

    return res.json({
      success: true,
      data: { completed: true, xpEarned: 0 }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/story/preeti-message
router.get('/preeti-message', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id }
    });
    if (!student) {
      return res.status(404).json({ success: false, error: { message: 'Student not found' } });
    }

    const { scenario } = req.query as { scenario?: string };
    const dialogue = getPreetiDialogue(scenario || 'welcome');

    return res.json({
      success: true,
      data: {
        character: 'preeti',
        dialogue,
        mood: 'warm',
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/story/rishabh-message
router.get('/rishabh-message', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id }
    });
    if (!student) {
      return res.status(404).json({ success: false, error: { message: 'Student not found' } });
    }

    const { scenario } = req.query as { scenario?: string };
    const dialogue = getRishabhDialogue(scenario || 'chapter_complete');

    return res.json({
      success: true,
      data: {
        character: 'rishabh',
        dialogue,
        expression: 'smug',
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/story/trigger (emit story event to student in real-time via socket)
router.post('/trigger', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id }
    });
    if (!student) {
      return res.status(404).json({ success: false, error: { message: 'Student not found' } });
    }

    const { triggerType, cutsceneId } = req.body as {
      triggerType: 'cutscene' | 'preeti_message' | 'rishabh_challenge';
      cutsceneId?: string;
    };

    if (triggerType === 'cutscene' && cutsceneId && PREDEFINED_CUTSCENES[cutsceneId]) {
      emitToUser(student.userId, 'story:trigger_cutscene', {
        cutscene: PREDEFINED_CUTSCENES[cutsceneId],
      });

      return res.json({
        success: true,
        data: { triggered: true, type: 'cutscene', cutsceneId }
      });
    }

    if (triggerType === 'preeti_message') {
      const dialogue = getPreetiDialogue('chapter_complete');

      emitToUser(student.userId, 'story:preeti_message', {
        message: dialogue,
        mood: 'excited',
      });

      return res.json({
        success: true,
        data: { triggered: true, type: 'preeti_message', dialogue }
      });
    }

    if (triggerType === 'rishabh_challenge') {
      const dialogue = getRishabhDialogue('chapter_complete');

      emitToUser(student.userId, 'story:rishabh_challenge', {
        challenge: dialogue,
        expression: 'smug',
      });

      return res.json({
        success: true,
        data: { triggered: true, type: 'rishabh_challenge', dialogue }
      });
    }

    return res.status(400).json({
      success: false,
      error: { message: 'Invalid trigger type or cutsceneId' }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
