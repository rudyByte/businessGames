// apps/api/src/services/leaderboard.ts
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { emitToClassroom, emitToSchool } from '../lib/socket';

type LeaderboardPeriod = 'all-time' | 'weekly' | 'monthly';
type LeaderboardType = 'classroom' | 'school' | 'global';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  score: number;
  change?: number; // rank change since last check
}

// ─── Period Key Helpers ─────────────────────────────────────────
function periodSuffix(period: LeaderboardPeriod): string {
  const now = new Date();
  if (period === 'weekly') {
    const weekNum = getISOWeek(now);
    return `W${now.getFullYear()}${weekNum}`;
  }
  if (period === 'monthly') {
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  return 'all';
}

function getISOWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function redisKey(type: LeaderboardType, scopeId: string, period: LeaderboardPeriod): string {
  return `lb:${type}:${scopeId}:${periodSuffix(period)}`;
}

// ─── Update Leaderboard (called after XP award) ─────────────────
export async function updateLeaderboard(
  studentId: string,
  type: LeaderboardType,
  scopeId: string
): Promise<void> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { totalXP: true, userId: true },
  });
  if (!student) return;

  const periods: LeaderboardPeriod[] = ['all-time', 'weekly', 'monthly'];

  for (const period of periods) {
    const key = redisKey(type, scopeId, period);

    // Update sorted set (score = XP)
    await redis.zadd(key, student.totalXP, studentId);

    // Set expiry for time-limited periods
    if (period === 'weekly') {
      const expiry = secondsUntilSunday();
      await redis.expire(key, expiry);
    } else if (period === 'monthly') {
      const expiry = secondsUntilMonthEnd();
      await redis.expire(key, expiry);
    }

    // Check rank change (for socket event)
    const rank = await redis.zrevrank(key, studentId);
    if (rank !== null && rank < 20) {
      // Emit rank update to classroom/school
      const rankEntry = { studentId, rank: rank + 1, score: student.totalXP };
      if (type === 'classroom') emitToClassroom(scopeId, 'leaderboard:update', rankEntry);
      if (type === 'school') emitToSchool(scopeId, 'leaderboard:update', rankEntry);
    }
  }
}

// ─── Get Leaderboard ────────────────────────────────────────────
export async function getLeaderboard(
  type: LeaderboardType,
  scopeId: string,
  period: LeaderboardPeriod,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const key = redisKey(type, scopeId, period);

  // Get top N from Redis sorted set (highest score first)
  const raw = await redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');

  if (!raw || raw.length === 0) {
    // Fallback: build from DB
    return buildLeaderboardFromDB(type, scopeId, limit);
  }

  // Parse Redis result [id, score, id, score, ...]
  const entries: { id: string; score: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    entries.push({ id: raw[i], score: parseInt(raw[i + 1]) });
  }

  // Enrich with student info
  const studentIds = entries.map((e) => e.id);
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    select: { id: true, name: true, avatarUrl: true, level: true },
  });
  const studentMap = new Map(students.map((s) => [s.id, s]));

  return entries.map((e, i) => {
    const s = studentMap.get(e.id);
    return {
      rank: i + 1,
      studentId: e.id,
      name: s?.name ?? 'Unknown',
      avatarUrl: s?.avatarUrl ?? null,
      level: s?.level ?? 1,
      score: e.score,
    };
  });
}

// ─── Get Student Rank ───────────────────────────────────────────
export async function getStudentRank(
  studentId: string,
  type: LeaderboardType,
  scopeId: string,
  period: LeaderboardPeriod = 'all-time'
): Promise<{ rank: number; score: number; total: number } | null> {
  const key = redisKey(type, scopeId, period);
  const [rank, score, total] = await Promise.all([
    redis.zrevrank(key, studentId),
    redis.zscore(key, studentId),
    redis.zcard(key),
  ]);

  if (rank === null) return null;
  return { rank: rank + 1, score: parseInt(score ?? '0'), total };
}

// ─── Rebuild Leaderboard from DB (fallback) ─────────────────────
async function buildLeaderboardFromDB(
  type: LeaderboardType,
  scopeId: string,
  limit: number
): Promise<LeaderboardEntry[]> {
  let whereClause: Record<string, any> = {};
  if (type === 'classroom') whereClause = { classroomId: scopeId };
  else if (type === 'school') whereClause = { schoolId: scopeId };

  const students = await prisma.student.findMany({
    where: whereClause,
    orderBy: { totalXP: 'desc' },
    take: limit,
    select: { id: true, name: true, avatarUrl: true, level: true, totalXP: true },
  });

  // Populate Redis while we're at it
  for (const s of students) {
    const periods: LeaderboardPeriod[] = ['all-time', 'weekly', 'monthly'];
    for (const period of periods) {
      await redis.zadd(redisKey(type, scopeId, period), s.totalXP, s.id);
    }
  }

  return students.map((s, i) => ({
    rank: i + 1,
    studentId: s.id,
    name: s.name,
    avatarUrl: s.avatarUrl,
    level: s.level,
    score: s.totalXP,
  }));
}

// ─── Helpers ────────────────────────────────────────────────────
function secondsUntilSunday(): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  return daysUntilSunday * 24 * 60 * 60;
}

function secondsUntilMonthEnd(): number {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.floor((nextMonth.getTime() - now.getTime()) / 1000);
}
