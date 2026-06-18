import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { emitToUser, emitToClassroom, emitToClassWar } from '../lib/socket';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface RivalData {
  rivalStudentId: string;
  rivalName: string;
  rivalLevel: number;
  rivalXP: number;
  rivalAvatarUrl: string | null;
  xpGap: number;
  assignedAt: string;
}

export interface WeeklyChallenge {
  studentId: string;
  rivalStudentId: string;
  weekStart: string;
  studentWeekXP: number;
  rivalWeekXP: number;
  status: 'active' | 'won' | 'lost';
}

export interface ClassWarState {
  classroomId: string;
  teamA: { name: string; studentIds: string[]; totalXP: number };
  teamB: { name: string; studentIds: string[]; totalXP: number };
  weekStart: string;
  active: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const RIVAL_CACHE_TTL = 120; // 2 minutes in seconds
const RIVAL_CACHE_PREFIX = 'rival:';
const WEEKLY_XP_PREFIX = 'weekly_xp:';
const CLASS_WAR_PREFIX = 'class_war:';

// ─── Assign Rival ────────────────────────────────────────────────────────────
export async function assignRival(studentId: string, classroomId: string): Promise<RivalData | null> {
  // Check cache first
  const cached = await redis.get(`${RIVAL_CACHE_PREFIX}${studentId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Get all students in the same classroom, sorted by XP
  const classmates = await prisma.student.findMany({
    where: { classroomId, id: { not: studentId } },
    orderBy: { totalXP: 'desc' },
    select: { id: true, name: true, level: true, totalXP: true, avatarUrl: true },
  });

  if (classmates.length === 0) return null;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return null;

  // Find the closest classmate who is slightly ahead (+50 to +200 XP)
  let rival = classmates.find(c => c.totalXP >= student.totalXP + 50 && c.totalXP <= student.totalXP + 200);

  // If no one in that range, pick the closest ahead
  if (!rival) {
    rival = classmates.find(c => c.totalXP > student.totalXP);
  }

  // If no one ahead, pick the closest behind (you're #1!)
  if (!rival) {
    rival = classmates.reduce((prev, curr) =>
      Math.abs(curr.totalXP - student.totalXP) < Math.abs(prev.totalXP - student.totalXP) ? curr : prev
    );
    // At this point rival is guaranteed non-null because classmates is non-empty
  }

  const xpGap = rival!.totalXP - student.totalXP;
  const rivalData: RivalData = {
    rivalStudentId: rival.id,
    rivalName: rival.name,
    rivalLevel: rival.level,
    rivalXP: rival.totalXP,
    rivalAvatarUrl: rival.avatarUrl,
    xpGap,
    assignedAt: new Date().toISOString(),
  };

  // Cache for 2 minutes
  await redis.set(`${RIVAL_CACHE_PREFIX}${studentId}`, JSON.stringify(rivalData), RIVAL_CACHE_TTL);

  // Initialize weekly challenge
  await initializeWeeklyChallenge(studentId, rival.id);

  return rivalData;
}

// ─── Get Rival ───────────────────────────────────────────────────────────────
export async function getRival(studentId: string): Promise<RivalData | null> {
  const cached = await redis.get(`${RIVAL_CACHE_PREFIX}${studentId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // If cache miss, try to find from classroom
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classroomId: true },
  });

  if (!student?.classroomId) return null;
  return assignRival(studentId, student.classroomId);
}

// ─── Refresh Rival XP ────────────────────────────────────────────────────────
export async function refreshRivalXP(studentId: string): Promise<{
  overtaken: boolean;
  newRival?: RivalData;
  xpDiff?: number;
}> {
  const cached = await redis.get(`${RIVAL_CACHE_PREFIX}${studentId}`);
  if (!cached) {
    return { overtaken: false };
  }

  const rivalData: RivalData = JSON.parse(cached);
  const [student, rival] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId }, select: { totalXP: true } }),
    prisma.student.findUnique({ where: { id: rivalData.rivalStudentId }, select: { totalXP: true, level: true, name: true } }),
  ]);

  if (!student || !rival) return { overtaken: false };

  const xpDiff = student.totalXP - rival.totalXP;
  const overtaken = xpDiff > 0;

  if (overtaken) {
    // Assign new rival (next classmate ahead)
    const studentRec = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classroomId: true },
    });
    const newRival = studentRec?.classroomId
      ? await assignRival(studentId, studentRec.classroomId)
      : undefined;

    return { overtaken: true, newRival: newRival ?? undefined, xpDiff };
  }

  // Update cached rival XP
  rivalData.rivalXP = rival.totalXP;
  rivalData.rivalLevel = rival.level;
  rivalData.xpGap = rival.totalXP - student.totalXP;
  await redis.set(`${RIVAL_CACHE_PREFIX}${studentId}`, JSON.stringify(rivalData), RIVAL_CACHE_TTL);

  return { overtaken: false, xpDiff: rival.totalXP - student.totalXP };
}

// ─── Weekly Challenge ────────────────────────────────────────────────────────
async function initializeWeeklyChallenge(studentId: string, rivalStudentId: string) {
  const weekStart = getWeekStart();
  const key = `${WEEKLY_XP_PREFIX}${weekStart}:${studentId}`;

  const exists = await redis.get(key);
  if (exists) return; // Already initialized this week

  await redis.set(key, JSON.stringify({
    studentId,
    rivalStudentId,
    weekStart,
    studentWeekXP: 0,
    rivalWeekXP: 0,
    status: 'active',
  }), 7 * 24 * 3600); // 7 days TTL
}

export async function addWeeklyXP(studentId: string, xpAmount: number) {
  const weekStart = getWeekStart();
  const key = `${WEEKLY_XP_PREFIX}${weekStart}:${studentId}`;
  const raw = await redis.get(key);
  if (!raw) return;

  const challenge = JSON.parse(raw);
  challenge.studentWeekXP += xpAmount;

  // Also fetch rival's XP
  const rivalRaw = await redis.get(`${WEEKLY_XP_PREFIX}${weekStart}:${challenge.rivalStudentId}`);
  if (rivalRaw) {
    const rivalChallenge = JSON.parse(rivalRaw);
    challenge.rivalWeekXP = rivalChallenge.rivalWeekXP;
    // Also update rival's studentWeekXP from the actual student
  } else {
    // Fetch from DB if not cached
    const rival = await prisma.student.findUnique({
      where: { id: challenge.rivalStudentId },
      select: { totalXP: true },
    });
    if (rival) {
      // Use rival's total XP as the weekly snapshot
      challenge.rivalWeekXP = rival.totalXP;
    }
  }

  await redis.set(key, JSON.stringify(challenge), 7 * 24 * 3600);
  return challenge;
}

export async function getWeeklyChallenge(studentId: string): Promise<WeeklyChallenge | null> {
  const weekStart = getWeekStart();
  const key = `${WEEKLY_XP_PREFIX}${weekStart}:${studentId}`;
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
}

async function settleWeeklyChallenges() {
  const weekStart = getWeekStart();
  // This would be called by a cron job on Monday midnight
  // For now, we check challenges that ended
  const pattern = `${WEEKLY_XP_PREFIX}${weekStart}:*`;
  // Note: In production, use Redis SCAN. For mock Redis, iterate keys.
  // For simplicity, challenges are resolved on access.
}

// ─── Class War ───────────────────────────────────────────────────────────────
export async function startClassWar(
  classroomId: string,
  teamAName: string,
  teamBName: string,
  teamAStudentIds: string[],
  teamBStudentIds: string[]
): Promise<ClassWarState> {
  const weekStart = getWeekStart();
  const state: ClassWarState = {
    classroomId,
    teamA: { name: teamAName, studentIds: teamAStudentIds, totalXP: 0 },
    teamB: { name: teamBName, studentIds: teamBStudentIds, totalXP: 0 },
    weekStart,
    active: true,
  };

  await redis.set(`${CLASS_WAR_PREFIX}${classroomId}`, JSON.stringify(state), 7 * 24 * 3600);
  
  // Notify the classroom via class_war room
  emitToClassWar(classroomId, 'class_war:started', state);

  return state;
}

export async function endClassWar(classroomId: string): Promise<ClassWarState | null> {
  const raw = await redis.get(`${CLASS_WAR_PREFIX}${classroomId}`);
  if (!raw) return null;

  const state: ClassWarState = JSON.parse(raw);
  state.active = false;

  // Calculate final scores
  await updateClassWarScores(classroomId);

  const finalRaw = await redis.get(`${CLASS_WAR_PREFIX}${classroomId}`);
  const finalState = finalRaw ? JSON.parse(finalRaw) : state;
  finalState.active = false;

  await redis.set(`${CLASS_WAR_PREFIX}${classroomId}`, JSON.stringify(finalState), 7 * 24 * 3600);

  // Announce winner via class_war room
  const winner = finalState.teamA.totalXP > finalState.teamB.totalXP ? finalState.teamA : finalState.teamB;
  emitToClassWar(classroomId, 'class_war:ended', { winner, state: finalState });

  return finalState;
}

export async function getClassWarState(classroomId: string): Promise<ClassWarState | null> {
  const raw = await redis.get(`${CLASS_WAR_PREFIX}${classroomId}`);
  return raw ? JSON.parse(raw) : null;
}

async function updateClassWarScores(classroomId: string) {
  const raw = await redis.get(`${CLASS_WAR_PREFIX}${classroomId}`);
  if (!raw) return;

  const state: ClassWarState = JSON.parse(raw);

  // Fetch total XP for each team
  const teamAStudents = await prisma.student.findMany({
    where: { id: { in: state.teamA.studentIds } },
    select: { totalXP: true },
  });
  const teamBStudents = await prisma.student.findMany({
    where: { id: { in: state.teamB.studentIds } },
    select: { totalXP: true },
  });

  state.teamA.totalXP = teamAStudents.reduce((sum, s) => sum + s.totalXP, 0);
  state.teamB.totalXP = teamBStudents.reduce((sum, s) => sum + s.totalXP, 0);

  await redis.set(`${CLASS_WAR_PREFIX}${classroomId}`, JSON.stringify(state), 7 * 24 * 3600);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

// ─── Socket Event Handlers ───────────────────────────────────────────────────
export function syncRivalXP(studentId: string, xpEarned: number) {
  // Emit to the student's rival if they're online
  refreshRivalXP(studentId).then(result => {
    if (result.overtaken) {
      emitToUser(studentId, 'rival:you_passed', {
        message: '🔥 YOU JUST OVERTOOK YOUR RIVAL!',
        newRival: result.newRival,
      });
    }

    // Also check if the student's rival overtook them
    const xpDiff = result.xpDiff;
    if (xpDiff && xpDiff < 0) {
      emitToUser(studentId, 'rival:passed_you', {
        message: `⚡ Your rival just passed you! They're ${Math.abs(xpDiff)} XP ahead!`,
        xpGap: Math.abs(xpDiff),
      });
    }
  });

  // Update weekly XP
  addWeeklyXP(studentId, xpEarned);
}
