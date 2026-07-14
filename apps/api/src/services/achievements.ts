// apps/api/src/services/achievements.ts
// NOTE: In schema.prisma, Achievement model uses `students StudentAchievement[]` (not `studentAchievements`)
//       All queries use `prisma.studentAchievement` directly so this does not matter for service logic.

import { prisma } from '../lib/prisma';
import { awardXP, XP_REWARDS } from './gamification';
import { emitToUser } from '../lib/socket';

// ─── Achievement Definitions ────────────────────────────────────
export const ACHIEVEMENT_DEFINITIONS = [
  // Explorer Tier
  { slug: 'first-steps',      name: 'First Steps',        description: 'Complete your first level',                  rarity: 'COMMON',    xpBonus: XP_REWARDS.ACHIEVEMENT_COMMON,    badgeColor: '#9CA3AF', condition: { type: 'levels_completed', threshold: 1 } },
  { slug: 'clue-hunter',      name: 'Clue Hunter',        description: 'Find 3 clues in Problem Hunt',               rarity: 'COMMON',    xpBonus: XP_REWARDS.ACHIEVEMENT_COMMON,    badgeColor: '#9CA3AF', condition: { type: 'clues_found', threshold: 3 } },
  { slug: 'problem-spotter',  name: 'Problem Spotter',    description: 'Identify 5 unique business problems',        rarity: 'RARE',      xpBonus: XP_REWARDS.ACHIEVEMENT_RARE,      badgeColor: '#3B82F6', condition: { type: 'problems_identified', threshold: 5 } },
  { slug: 'detective-pro',    name: 'Detective Pro',      description: 'Complete all 3 Detective scenes',            rarity: 'EPIC',      xpBonus: XP_REWARDS.ACHIEVEMENT_EPIC,      badgeColor: '#8B5CF6', condition: { type: 'detective_scenes', threshold: 3 } },
  { slug: 'master-detective', name: 'Master Detective',   description: 'Score 90%+ on all Detective levels',        rarity: 'LEGENDARY', xpBonus: XP_REWARDS.ACHIEVEMENT_LEGENDARY, badgeColor: '#F59E0B', condition: { type: 'detective_avg_score', threshold: 90 } },
  // Business Builder Tier
  { slug: 'brand-born',       name: 'Brand Born',         description: 'Complete the Brand Builder',                 rarity: 'COMMON',    xpBonus: 50,  badgeColor: '#9CA3AF', condition: { type: 'brand_built', threshold: 1 } },
  { slug: 'open-for-business',name: 'Open for Business',  description: 'Complete your first Startup round',         rarity: 'COMMON',    xpBonus: 50,  badgeColor: '#9CA3AF', condition: { type: 'simulator_rounds', threshold: 1 } },
  { slug: 'profitable',       name: 'Profitable!',        description: 'Earn your first profit in Startup Wars',    rarity: 'RARE',      xpBonus: 100, badgeColor: '#3B82F6', condition: { type: 'profitable_rounds', threshold: 1 } },
  { slug: 'millionaire',      name: 'Millionaire',        description: 'Accumulate ₹1,00,000 total revenue',        rarity: 'EPIC',      xpBonus: 200, badgeColor: '#8B5CF6', condition: { type: 'total_revenue', threshold: 100000 } },
  { slug: 'startup-master',   name: 'Startup Master',     description: 'Complete full Simulator with A grade',      rarity: 'LEGENDARY', xpBonus: 500, badgeColor: '#F59E0B', condition: { type: 'simulator_complete_a', threshold: 1 } },
  // Streak Tier
  { slug: 'on-a-roll',        name: 'On a Roll',          description: '3-day login streak',                        rarity: 'COMMON',    xpBonus: XP_REWARDS.ACHIEVEMENT_COMMON,    badgeColor: '#FF6B35', condition: { type: 'streak', threshold: 3 } },
  { slug: 'unstoppable',      name: 'Unstoppable',        description: '7-day login streak',                        rarity: 'RARE',      xpBonus: XP_REWARDS.ACHIEVEMENT_RARE,      badgeColor: '#FF6B35', condition: { type: 'streak', threshold: 7 } },
  { slug: 'dedicated',        name: 'Dedicated',          description: '30-day login streak',                       rarity: 'EPIC',      xpBonus: XP_REWARDS.ACHIEVEMENT_EPIC,      badgeColor: '#FF6B35', condition: { type: 'streak', threshold: 30 } },
  // Speed Tier
  { slug: 'quick-learner',    name: 'Quick Learner',      description: 'Complete a chapter in under 20 minutes',    rarity: 'RARE',      xpBonus: 100, badgeColor: '#4ECDC4', condition: { type: 'chapter_speed_min', threshold: 20 } },
  { slug: 'speed-runner',     name: 'Speed Runner',       description: 'Complete Detective game in under 3 hours',  rarity: 'EPIC',      xpBonus: 200, badgeColor: '#4ECDC4', condition: { type: 'game_speed_hrs', threshold: 3 } },
] as const;

export type AchievementTriggerType =
  | 'levels_completed'
  | 'clues_found'
  | 'problems_identified'
  | 'detective_scenes'
  | 'detective_avg_score'
  | 'brand_built'
  | 'simulator_rounds'
  | 'profitable_rounds'
  | 'total_revenue'
  | 'simulator_complete_a'
  | 'streak'
  | 'chapter_speed_min'
  | 'game_speed_hrs';

export interface AchievementTrigger {
  type: AchievementTriggerType;
  value: number; // Current value to compare against threshold
  studentId: string;
}

// ─── Seed Achievements into DB ──────────────────────────────────
export async function seedAchievements(): Promise<void> {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug,
        name: def.name,
        description: def.description,
        rarity: def.rarity,
        xpBonus: def.xpBonus,
        badgeColor: def.badgeColor,
        condition: JSON.stringify(def.condition),
      },
      update: {
        name: def.name,
        description: def.description,
        rarity: def.rarity,
        xpBonus: def.xpBonus,
        badgeColor: def.badgeColor,
        condition: JSON.stringify(def.condition),
      },
    });
  }
}

// ─── Check & Award Achievements (idempotent) ────────────────────
export async function checkAndAwardAchievements(
  trigger: AchievementTrigger
): Promise<{ slug: string; name: string; rarity: string; xpBonus: number }[]> {
  const { studentId, type, value } = trigger;

  // Find relevant achievement definitions for this trigger type
  const relevant = ACHIEVEMENT_DEFINITIONS.filter(
    (def) => def.condition.type === type && value >= def.condition.threshold
  );

  if (relevant.length === 0) return [];

  // Load student's already-earned achievements
  const earned = await prisma.studentAchievement.findMany({
    where: { studentId },
    select: { achievementId: true, achievement: { select: { slug: true } } },
  });
  const earnedSlugs = new Set(earned.map((e) => e.achievement.slug));

  const newlyEarned: { slug: string; name: string; rarity: string; xpBonus: number }[] = [];

  for (const def of relevant) {
    if (earnedSlugs.has(def.slug)) continue; // Already earned — skip

    // Find or create the Achievement record
    const achievement = await prisma.achievement.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug,
        name: def.name,
        description: def.description,
        rarity: def.rarity,
        xpBonus: def.xpBonus,
        badgeColor: def.badgeColor,
        condition: JSON.stringify(def.condition),
      },
      update: {},
    });

    // Award the achievement
    await prisma.studentAchievement.create({
      data: { studentId, achievementId: achievement.id },
    });

    // Award XP bonus
    if (def.xpBonus > 0) {
      await awardXP(studentId, def.xpBonus, `Achievement: ${def.name}`, `achievement:${def.slug}:${studentId}`);
    }

    // Get userId for socket emit
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });
    if (student) {
      emitToUser(student.userId, 'achievement:unlocked', {
        slug: def.slug,
        name: def.name,
        rarity: def.rarity,
        xpBonus: def.xpBonus,
        badgeColor: def.badgeColor,
      });
    }

    newlyEarned.push({ slug: def.slug, name: def.name, rarity: def.rarity, xpBonus: def.xpBonus });
  }

  return newlyEarned;
}

// ─── Get Student Achievements ────────────────────────────────────
export async function getStudentAchievements(studentId: string) {
  const earned = await prisma.studentAchievement.findMany({
    where: { studentId },
    include: { achievement: true },
    orderBy: { earnedAt: 'desc' },
  });

  const allDefs = ACHIEVEMENT_DEFINITIONS.map((def) => {
    const earnedRecord = earned.find((e) => e.achievement.slug === def.slug);
    return {
      ...def,
      earned: !!earnedRecord,
      earnedAt: earnedRecord?.earnedAt ?? null,
    };
  });

  return allDefs;
}
