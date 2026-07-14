// apps/api/src/services/gamification.ts
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { emitToUser } from '../lib/socket';

// ─── XP Level Table (Levels 1–20) ─────────────────────────────
const XP_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  450,    // Level 4
  700,    // Level 5
  1000,   // Level 6
  1350,   // Level 7
  1750,   // Level 8
  2200,   // Level 9
  2700,   // Level 10
  3250,   // Level 11
  3850,   // Level 12
  4500,   // Level 13
  5200,   // Level 14
  5950,   // Level 15
  6750,   // Level 16
  7600,   // Level 17
  8500,   // Level 18
  9450,   // Level 19
  10450,  // Level 20
];

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
  xpEarned: number;
  totalXP: number;
  nextLevelXP: number;
}

// ─── Calculate level from raw XP ───────────────────────────────
export function calculateLevel(totalXP: number): number {
  let lo = 0;
  let hi = XP_THRESHOLDS.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (XP_THRESHOLDS[mid] <= totalXP) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

// ─── Get XP needed for next level ──────────────────────────────
export function xpForNextLevel(currentLevel: number): number {
  const idx = currentLevel; // XP_THRESHOLDS[idx] is the threshold for level currentLevel+1
  return idx < XP_THRESHOLDS.length ? XP_THRESHOLDS[idx] : XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
}

// ─── Award XP (idempotency via ref key in Redis) ───────────────
export async function awardXP(
  studentId: string,
  amount: number,
  reason: string,
  referenceKey?: string  // optional dedup key (e.g. "level:gameId:chapterId:levelId:studentId")
): Promise<LevelUpResult> {
  // Idempotency guard via Redis
  if (referenceKey) {
    const dedupKey = `xp:awarded:${referenceKey}`;
    const already = await redis.get(dedupKey);
    if (already) {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      const lvl = calculateLevel(student?.totalXP ?? 0);
      return {
        leveledUp: false,
        newLevel: lvl,
        previousLevel: lvl,
        xpEarned: 0,
        totalXP: student?.totalXP ?? 0,
        nextLevelXP: xpForNextLevel(lvl),
      };
    }
    // Mark as awarded for 30 days
    await redis.setex(dedupKey, 60 * 60 * 24 * 30, '1');
  }

  // Fetch current student
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new Error(`Student ${studentId} not found`);

  const previousXP = student.totalXP;
  const newTotalXP = previousXP + amount;
  const previousLevel = calculateLevel(previousXP);
  const newLevel = calculateLevel(newTotalXP);
  const leveledUp = newLevel > previousLevel;

  // Update student XP + level in DB
  await prisma.student.update({
    where: { id: studentId },
    data: {
      totalXP: newTotalXP,
      level: newLevel,
      lastActiveAt: new Date(),
    },
  });

  // Log coin/XP transaction (positive amount = XP equivalent in coins)
  await prisma.coinTransaction.create({
    data: {
      studentId,
      amount,
      reason: `XP: ${reason}`,
      reference: referenceKey,
    },
  });

  // Emit real-time events
  emitToUser(student.userId, 'xp:earned', { amount, totalXP: newTotalXP, level: newLevel });
  if (leveledUp) {
    emitToUser(student.userId, 'level:up', { newLevel, previousLevel });
  }

  return {
    leveledUp,
    newLevel,
    previousLevel,
    xpEarned: amount,
    totalXP: newTotalXP,
    nextLevelXP: xpForNextLevel(newLevel),
  };
}

// ─── Award Coins ────────────────────────────────────────────────
export async function awardCoins(
  studentId: string,
  amount: number,
  reason: string,
  reference?: string
): Promise<number> {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new Error(`Student ${studentId} not found`);

  const newCoins = student.coins + amount;

  await prisma.student.update({
    where: { id: studentId },
    data: { coins: newCoins },
  });

  await prisma.coinTransaction.create({
    data: {
      studentId,
      amount,
      reason,
      reference,
    },
  });

  emitToUser(student.userId, 'coins:earned', { amount, totalCoins: newCoins });
  return newCoins;
}

// ─── Daily Login Streak ─────────────────────────────────────────
export async function updateLoginStreak(studentId: string): Promise<{
  streak: number;
  isStreakDay: boolean;
  bonusXP: number;
}> {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return { streak: 0, isStreakDay: false, bonusXP: 0 };

  const now = new Date();
  const last = student.lastActiveAt;
  let newStreak = student.streak;
  let isStreakDay = false;
  let bonusXP = 0;

  if (!last) {
    // First login ever
    newStreak = 1;
    isStreakDay = true;
  } else {
    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day — no change
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak = student.streak + 1;
      isStreakDay = true;
    } else {
      // Streak broken
      newStreak = 1;
      isStreakDay = true;
    }
  }

  // Calculate bonus XP based on streak
  if (isStreakDay) {
    if (newStreak >= 7)      bonusXP = 100;
    else if (newStreak >= 3) bonusXP = 50;
    else                     bonusXP = 25;
  }

  await prisma.student.update({
    where: { id: studentId },
    data: { streak: newStreak, lastActiveAt: now },
  });

  if (isStreakDay && bonusXP > 0) {
    await awardXP(studentId, bonusXP, `Daily login streak (day ${newStreak})`);
    emitToUser(student.userId, 'streak:updated', { streak: newStreak, bonusXP });
  }

  return { streak: newStreak, isStreakDay, bonusXP };
}

// ─── XP Reward Constants ────────────────────────────────────────
export const XP_REWARDS = {
  // Detective game
  CLUE_FOUND:             30,
  PROBLEM_IDENTIFIED:     75,
  NPC_CHAT_FIRST:         20,
  DETECTIVE_SCENE_DONE:  200,
  DETECTIVE_COMPLETE:    500,
  // Simulator game
  PROFITABLE_ROUND:      100,
  SIMULATOR_ROUND:        75,
  CAPSTONE_COMPLETE:     750,
  // Generic
  LEVEL_COMPLETE:         50,
  CHAPTER_QUIZ_3STAR:    150,
  CHAPTER_QUIZ_2STAR:    100,
  CHAPTER_QUIZ_1STAR:     50,
  // Streaks (see updateLoginStreak)
  DAILY_LOGIN:            25,
  STREAK_3DAY:            50,
  STREAK_7DAY:           100,
  // Achievements
  ACHIEVEMENT_COMMON:     25,
  ACHIEVEMENT_RARE:       75,
  ACHIEVEMENT_EPIC:      150,
  ACHIEVEMENT_LEGENDARY: 300,
} as const;
