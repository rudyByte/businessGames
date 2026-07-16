import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { getTutorHint, getNPCChatResponse } from '../services/aiTutor';
import { generateQuizQuestions } from '../services/quizGenerator';
import { analyzeSafetyAndSentiment } from '../services/sentimentAnalysis';
import { redis } from '../lib/redis';
import { emitToUser, emitToClassroom } from '../lib/socket';
import { awardXP, awardCoins, XP_REWARDS } from '../services/gamification';
import { checkAndAwardAchievements } from '../services/achievements';
import { updateLeaderboard, getLeaderboard } from '../services/leaderboard';
import { getDailyChallenge } from '../services/dailyChallenge';


const router = Router();

// Middleware to verify user is authenticated and is a student for progress operations
const requireStudent = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return res.status(403).json({
      success: false,
      error: { code: 'STUDENT_ONLY', message: 'This operation is only available to students.' }
    });
  }
  next();
};

// GET /api/v1/games
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const games = await prisma.game.findMany({
      where: { isActive: true },
      include: {
        chapters: {
          orderBy: { number: 'asc' },
          include: {
            levels: {
              orderBy: { number: 'asc' }
            }
          }
        }
      }
    });

    return res.json({ success: true, data: games });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/games/daily-chest/claim
router.post('/daily-chest/claim', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const now = new Date();
    const dateSuffix = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const claimKey = `daily-chest:claimed:${student.id}:${dateSuffix}`;

    const alreadyClaimed = await redis.get(claimKey);
    if (alreadyClaimed) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_CLAIMED', message: 'You have already claimed today\'s chest!' }
      });
    }

    // Mark as claimed for 28 hours (covering full day + timezone wiggle room)
    await redis.set(claimKey, '1', 60 * 60 * 28);

    const xpReward = 50 + Math.floor(Math.random() * 100);
    const coinReward = 25 + Math.floor(Math.random() * 50);

    await awardRewards(student.id, xpReward, coinReward, 'Claimed Daily Chest', `chest:${student.id}:${dateSuffix}`);

    return res.json({
      success: true,
      data: {
        xp: xpReward,
        coins: coinReward
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/games/leaderboard
router.get('/leaderboard', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const period = (req.query.period as any) || 'all-time';
    const type = (req.query.type as any) || 'global';

    let scopeId = 'global';
    if (type === 'classroom') {
      scopeId = student.classroomId || '';
    } else if (type === 'school') {
      scopeId = student.schoolId;
    }

    if (type === 'classroom' && !scopeId) {
      return res.json({ success: true, data: [] });
    }

    const leaderboard = await getLeaderboard(type, scopeId, period, 20);

    return res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/games/daily-challenge
router.get('/daily-challenge', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const challenge = await getDailyChallenge(student.id);

    // Also check if already completed today
    const now = new Date();
    const dateSuffix = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const submitKey = `daily-challenge:submitted:${student.id}:${dateSuffix}`;
    const alreadySubmitted = await redis.get(submitKey);

    return res.json({
      success: true,
      data: {
        ...challenge,
        completedToday: !!alreadySubmitted
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/games/daily-challenge/submit
router.post('/daily-challenge/submit', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const { answerIndex } = req.body;

    const now = new Date();
    const dateSuffix = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const submitKey = `daily-challenge:submitted:${student.id}:${dateSuffix}`;

    const alreadySubmitted = await redis.get(submitKey);
    if (alreadySubmitted) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_COMPLETED', message: 'You have already submitted today\'s challenge!' }
      });
    }

    const challenge = await getDailyChallenge(student.id);

    let isCorrect = false;
    if (challenge.type === 'QUIZ_SPRINT') {
      const correctIdx = challenge.content.questions?.[0]?.correctIndex ?? 1;
      isCorrect = (parseInt(answerIndex) === correctIdx);
    } else {
      const correctIdx = challenge.content.correctIndex ?? 1;
      isCorrect = (parseInt(answerIndex) === correctIdx);
    }

    // Set lock key for 28 hours
    await redis.set(submitKey, isCorrect ? 'CORRECT' : 'INCORRECT', 60 * 60 * 28);

    if (isCorrect) {
      await awardRewards(student.id, challenge.xpReward, challenge.coinReward, `Completed Daily Challenge: ${challenge.title}`, `daily-challenge:${student.id}:${dateSuffix}`);
      return res.json({
        success: true,
        data: {
          correct: true,
          xp: challenge.xpReward,
          coins: challenge.coinReward,
          message: 'Excellent! Reward credited.'
        }
      });
    } else {
      return res.json({
        success: true,
        data: {
          correct: false,
          message: 'Incorrect answer. Try again tomorrow!'
        }
      });
    }
  } catch (error) {
    next(error);
  }
});




// GET /api/v1/games/:slug
router.get('/:slug', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const game = await prisma.game.findUnique({
      where: { slug: req.params.slug },
      include: {
        chapters: {
          orderBy: { number: 'asc' },
          include: {
            levels: {
              orderBy: { number: 'asc' }
            }
          }
        }
      }
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        error: { code: 'GAME_NOT_FOUND', message: 'Game not found.' }
      });
    }

    return res.json({ success: true, data: game });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/games/:slug/progress
router.get('/:slug/progress', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student profile missing');

    const game = await prisma.game.findUnique({ where: { slug: req.params.slug } });
    if (!game) return res.status(404).json({ success: false, error: { message: 'Game not found' } });

    let progress = await prisma.gameProgress.findUnique({
      where: {
        studentId_gameId: {
          studentId: student.id,
          gameId: game.id
        }
      },
      include: {
        levelAttempts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!progress) {
      progress = await prisma.gameProgress.create({
        data: {
          studentId: student.id,
          gameId: game.id,
          currentChapter: 1,
          currentLevel: 1,
          status: 'NOT_STARTED'
        },
        include: {
          levelAttempts: true
        }
      });
    }

    return res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
});

// Helper function to award XP + coins + achievements + leaderboard — uses proper services
async function awardRewards(
  studentId: string,
  xp: number,
  coins: number,
  reason: string,
  referenceKey?: string,
  achievementContext?: { type: string; value: number }
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { schoolId: true, classroomId: true, userId: true },
  });
  if (!student) return null;

  const [xpResult] = await Promise.all([
    awardXP(studentId, xp, reason, referenceKey),
    awardCoins(studentId, coins, reason, referenceKey),
  ]);

  // Update leaderboards
  await updateLeaderboard(studentId, 'school', student.schoolId);
  if (student.classroomId) {
    await updateLeaderboard(studentId, 'classroom', student.classroomId);
  }
  await updateLeaderboard(studentId, 'global', 'global');

  // Check achievements if context provided
  if (achievementContext) {
    await checkAndAwardAchievements({
      studentId,
      type: achievementContext.type as any,
      value: achievementContext.value,
    });
  }

  return {
    totalXP: xpResult.totalXP,
    level: xpResult.newLevel,
    leveledUp: xpResult.leveledUp,
  };
}

// POST /api/v1/games/:slug/progress/save
router.post('/:slug/progress/save', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const game = await prisma.game.findUnique({ where: { slug: req.params.slug } });
    if (!game) return res.status(404).json({ success: false, error: { message: 'Game not found' } });

    const { currentChapter, currentLevel, status, detectiveSave, simulatorSave } = req.body;

    const progress = await prisma.gameProgress.upsert({
      where: {
        studentId_gameId: {
          studentId: student.id,
          gameId: game.id
        }
      },
      update: {
        currentChapter,
        currentLevel,
        status,
        detectiveSave: detectiveSave ? (typeof detectiveSave === 'string' ? detectiveSave : JSON.stringify(detectiveSave)) : undefined,
        simulatorSave: simulatorSave ? (typeof simulatorSave === 'string' ? simulatorSave : JSON.stringify(simulatorSave)) : undefined,
      },
      create: {
        studentId: student.id,
        gameId: game.id,
        currentChapter,
        currentLevel,
        status,
        detectiveSave: detectiveSave ? (typeof detectiveSave === 'string' ? detectiveSave : JSON.stringify(detectiveSave)) : undefined,
        simulatorSave: simulatorSave ? (typeof simulatorSave === 'string' ? simulatorSave : JSON.stringify(simulatorSave)) : undefined,
      }
    });

    return res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/games/:slug/levels/:levelId/complete
router.post('/:slug/levels/:levelId/complete', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const game = await prisma.game.findUnique({ where: { slug: req.params.slug } });
    if (!game) return res.status(404).json({ success: false, error: { message: 'Game not found' } });

    const { score, maxScore, passed, timeSpent, choices, chapterNumber, levelNumber } = req.body;

    const progress = await prisma.gameProgress.findUnique({
      where: {
        studentId_gameId: {
          studentId: student.id,
          gameId: game.id
        }
      }
    });

    if (!progress) throw new Error('Game progress record missing. Call save first.');

    // Record level attempt
    const attempt = await prisma.levelAttempt.create({
      data: {
        progressId: progress.id,
        chapterNumber,
        levelNumber,
        score,
        maxScore,
        passed,
        timeSpent,
        choices: choices ? (typeof choices === 'string' ? choices : JSON.stringify(choices)) : undefined,
        completedAt: new Date()
      }
    });

    let xpEarned = passed ? 50 : 10;
    let coinsEarned = passed ? 20 : 5;

    // Bonus XP if high score
    if (passed && score >= 900) {
      xpEarned += 30;
      coinsEarned += 15;
    }

    const rewardResult = await awardRewards(student.id, xpEarned, coinsEarned, `Completed Level ${chapterNumber}.${levelNumber}`);

    // Update current level/chapter index if passed and matches current save
    let nextChapter = progress.currentChapter;
    let nextLevel = progress.currentLevel;

    if (passed && chapterNumber === progress.currentChapter && levelNumber === progress.currentLevel) {
      if (levelNumber === 10) { // end of chapter
        nextChapter = progress.currentChapter + 1;
        nextLevel = 1;
      } else {
        nextLevel = progress.currentLevel + 1;
      }
    }

    await prisma.gameProgress.update({
      where: { id: progress.id },
      data: {
        currentChapter: nextChapter,
        currentLevel: nextLevel,
        status: nextChapter > game.totalChapters ? 'COMPLETED' : 'IN_PROGRESS',
        totalScore: progress.totalScore + score,
        totalXPEarned: progress.totalXPEarned + xpEarned,
      }
    });

    // Notify classroom of student progress in real-time
    if (student.classroomId) {
      emitToClassroom(student.classroomId, 'classroom:student_progress', {
        studentId: student.id,
        name: student.name,
        chapterCompleted: chapterNumber,
        levelCompleted: levelNumber,
      });
    }

    return res.json({
      success: true,
      data: {
        attempt,
        rewards: {
          xpEarned,
          coinsEarned,
          ...rewardResult
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/games/detective/ranking-submit
router.post('/detective/ranking-submit', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const { levelId, rankings } = req.body; // rankings: { problemId, size, frequency, solvability, totalScore }[]

    // Calculate score compared to expert rankings. Let's create a simulated feedback
    // In typical configuration, school noticeboard and canteen are highly ranked.
    let score = 800; // default passing score
    const feedbacks = [
      "Excellent opportunity mapping! You identified the canteen queues as a high-frequency daily problem. That is exactly the kind of bottleneck that Paytm or Zomato focus on to build strong businesses.",
      "Good rankings. You realized that water cooler issues are highly critical, but solving it locally as a student business is slightly harder (solvability 3/5). That is a mature business judgment!"
    ];

    const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];

    const rewards = await awardRewards(student.id, 100, 50, 'Submitted Problem Rankings');

    return res.json({
      success: true,
      data: {
        score,
        expertRanking: rankings.map((r: any, idx: number) => ({ ...r, rank: idx + 1 })), // match for now
        feedback,
        xpEarned: 100,
        coinsEarned: 50,
        rewards
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/games/detective/validation-complete
router.post('/detective/validation-complete', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const { problemId, validationData, insights } = req.body;

    const game = await prisma.game.findUnique({ where: { slug: 'problem-hunt' } });
    if (!game) throw new Error('Detective game not found');

    const progress = await prisma.gameProgress.findUnique({
      where: { studentId_gameId: { studentId: student.id, gameId: game.id } }
    });

    if (progress) {
      const oldSave = progress.detectiveSave ? (typeof progress.detectiveSave === 'string' ? JSON.parse(progress.detectiveSave) : progress.detectiveSave) : {};
      const newSave = {
        ...oldSave,
        validatedProblemId: problemId,
        validationData,
        insights
      };
      await prisma.gameProgress.update({
        where: { id: progress.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          detectiveSave: JSON.stringify(newSave)
        }
      });
    }

    const rewards = await awardRewards(student.id, 200, 100, 'Completed Customer Validation');

    // Automatically initialize/unlock Simulator Game
    const simGame = await prisma.game.findUnique({ where: { slug: 'startup-simulator' } });
    if (simGame) {
      await prisma.gameProgress.upsert({
        where: {
          studentId_gameId: {
            studentId: student.id,
            gameId: simGame.id
          }
        },
        update: {
          status: 'IN_PROGRESS',
          simulatorSave: JSON.stringify({
            validatedProblem: problemId,
            cash: 50000, // starting cash
            currentRound: 1,
            brandStrength: 0,
            customerAwareness: 10,
            unitCost: 20,
            sellingPrice: 50,
            inventory: 0,
            teamMembers: [],
            teamEfficiency: 100,
            marketingBudget: 0,
            revenue: 0,
            expenses: 0,
            profit: 0,
          })
        },
        create: {
          studentId: student.id,
          gameId: simGame.id,
          status: 'IN_PROGRESS',
          currentChapter: 1,
          currentLevel: 1,
          simulatorSave: JSON.stringify({
            validatedProblem: problemId,
            cash: 50000,
            currentRound: 1,
            brandStrength: 0,
            customerAwareness: 10,
            unitCost: 20,
            sellingPrice: 50,
            inventory: 0,
            teamMembers: [],
            teamEfficiency: 100,
            marketingBudget: 0,
            revenue: 0,
            expenses: 0,
            profit: 0,
          })
        }
      });
    }

    return res.json({
      success: true,
      data: {
        unlocked: true,
        startupPrompt: `Build a solution for ${problemId}`,
        rewards
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/games/simulator/save-brand
router.post('/simulator/save-brand', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const { brandConfig } = req.body;

    const game = await prisma.game.findUnique({ where: { slug: 'startup-simulator' } });
    if (!game) throw new Error('Simulator game not found');

    const progress = await prisma.gameProgress.findUnique({
      where: { studentId_gameId: { studentId: student.id, gameId: game.id } }
    });

    if (!progress) throw new Error('Simulator progress missing');

    const oldSave = progress.simulatorSave ? (typeof progress.simulatorSave === 'string' ? JSON.parse(progress.simulatorSave) : progress.simulatorSave) : {};
    const updatedSave = {
      ...oldSave,
      startupName: brandConfig.startupName,
      tagline: brandConfig.tagline,
      logoConfig: brandConfig.logoConfig,
      colors: brandConfig.colors,
      currentPhase: 'team',
      currentRound: 2
    };

    await prisma.gameProgress.update({
      where: { id: progress.id },
      data: {
        currentChapter: 1,
        currentLevel: 2,
        simulatorSave: JSON.stringify(updatedSave)
      }
    });

    const rewards = await awardRewards(student.id, 200, 50, 'Created Brand Identity');

    return res.json({
      success: true,
      data: {
        save: updatedSave,
        rewards
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/games/simulator/save-team
router.post('/simulator/save-team', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const { teamMembers, teamEfficiency } = req.body;

    const game = await prisma.game.findUnique({ where: { slug: 'startup-simulator' } });
    if (!game) throw new Error('Simulator game not found');

    const progress = await prisma.gameProgress.findUnique({
      where: { studentId_gameId: { studentId: student.id, gameId: game.id } }
    });

    if (!progress) throw new Error('Simulator progress missing');

    const oldSave = progress.simulatorSave ? (typeof progress.simulatorSave === 'string' ? JSON.parse(progress.simulatorSave) : progress.simulatorSave) : {};
    const updatedSave = {
      ...oldSave,
      teamMembers,
      teamEfficiency,
      currentPhase: 'launch',
      currentRound: 5 // skip to launch rounds
    };

    await prisma.gameProgress.update({
      where: { id: progress.id },
      data: {
        currentChapter: 2,
        currentLevel: 1,
        simulatorSave: JSON.stringify(updatedSave)
      }
    });

    const rewards = await awardRewards(student.id, 200, 50, 'Assembled Startup Team');

    return res.json({
      success: true,
      data: {
        save: updatedSave,
        rewards
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/games/simulator/round-complete
router.post('/simulator/round-complete', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const { decisions, results, nextSaveState } = req.body;

    const game = await prisma.game.findUnique({ where: { slug: 'startup-simulator' } });
    if (!game) throw new Error('Simulator game not found');

    const progress = await prisma.gameProgress.findUnique({
      where: { studentId_gameId: { studentId: student.id, gameId: game.id } }
    });

    if (!progress) throw new Error('Simulator progress missing');

    // Create a level attempt for the round
    const attempt = await prisma.levelAttempt.create({
      data: {
        progressId: progress.id,
        chapterNumber: progress.currentChapter,
        levelNumber: progress.currentLevel,
        score: results.profit > 0 ? 800 : 400,
        maxScore: 1000,
        passed: results.profit >= -5000, // soft pass unless major loss
        timeSpent: 60,
        choices: decisions ? (typeof decisions === 'string' ? decisions : JSON.stringify(decisions)) : undefined,
      }
    });

    const xpEarned = results.profit > 0 ? 100 : 50;
    const coinsEarned = results.profit > 0 ? 50 : 10;

    const rewards = await awardRewards(student.id, xpEarned, coinsEarned, `Round ${nextSaveState.currentRound - 1} Completion`);

    const nextLevel = progress.currentLevel === 8 ? 1 : progress.currentLevel + 1;
    const nextChapter = progress.currentLevel === 8 ? progress.currentChapter + 1 : progress.currentChapter;

    await prisma.gameProgress.update({
      where: { id: progress.id },
      data: {
        currentChapter: nextChapter,
        currentLevel: nextLevel,
        simulatorSave: nextSaveState ? (typeof nextSaveState === 'string' ? nextSaveState : JSON.stringify(nextSaveState)) : undefined,
        totalScore: progress.totalScore + (results.profit > 0 ? 800 : 400)
      }
    });

    // Emit socket notification
    if (student.classroomId) {
      emitToClassroom(student.classroomId, 'classroom:student_progress', {
        studentId: student.id,
        name: student.name,
        roundCompleted: nextSaveState.currentRound - 1,
        profit: results.profit
      });
    }

    return res.json({
      success: true,
      data: {
        attempt,
        rewards
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/games/simulator/capstone-submit
router.post('/simulator/capstone-submit', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const { pitchData, gameData } = req.body;

    const game = await prisma.game.findUnique({ where: { slug: 'startup-simulator' } });
    if (!game) throw new Error('Simulator game not found');

    const progress = await prisma.gameProgress.findUnique({
      where: { studentId_gameId: { studentId: student.id, gameId: game.id } }
    });

    if (!progress) throw new Error('Simulator progress missing');

    const oldSave = progress.simulatorSave ? (typeof progress.simulatorSave === 'string' ? JSON.parse(progress.simulatorSave) : progress.simulatorSave) : {};
    const updatedSave = {
      ...oldSave,
      pitchData,
      gameData,
      currentPhase: 'showcase'
    };

    await prisma.gameProgress.update({
      where: { id: progress.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        simulatorSave: JSON.stringify(updatedSave)
      }
    });

    const mentorFeedback = {
      overallScore: 85,
      grade: 'A',
      financials: "Very strong budget control. You kept a healthy cash cushion of virtual coins and avoided stock-outs during peak seasons like Diwali.",
      customerImpact: "Impressive focus on customer satisfaction! Your repeat customer rate was above 75%, showing deep empathy for the problem.",
      execution: "Complementary team roles were used well. Hiring a mid-level CFO early on was a smart move to monitor expenses."
    };

    const rewards = await awardRewards(student.id, 500, 200, 'Completed Capstone Showcase');

    // Trigger achievement unlocks
    const masterAch = await prisma.achievement.findUnique({ where: { slug: 'startup-master' } });
    if (masterAch) {
      try {
        await prisma.studentAchievement.create({
          data: { studentId: student.id, achievementId: masterAch.id }
        });
      } catch (_) { /* already earned */ }
    }

    return res.json({
      success: true,
      data: {
        mentorFeedback,
        rewards
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/ai/tutor
router.post('/ai/tutor', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const { context, message } = req.body;

    const response = await getTutorHint(student.id, context, message);

    return res.json({ success: true, data: { response } });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/ai/npc-chat
router.post('/ai/npc-chat', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const { npcId, npcContext, sceneContext, playerQuestion, conversationHistory } = req.body;

    const result = await getNPCChatResponse(
      student.id,
      npcId,
      npcContext,
      sceneContext,
      playerQuestion,
      conversationHistory
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/ai/generate-quiz
router.post('/ai/generate-quiz', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new Error('Student missing');

    const { chapterNumber, chapterTitle, gameContext } = req.body;

    const questions = await generateQuizQuestions(
      student.id,
      chapterNumber,
      chapterTitle,
      gameContext
    );

    return res.json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/ai/feedback
router.post('/ai/feedback', authMiddleware, requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    const result = await analyzeSafetyAndSentiment(text);
    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
