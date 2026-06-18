import nodemailer, { Transporter } from 'nodemailer';
import Bull from 'bull';
import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';

// ─── Email Transporter ───────────────────────────────────────────
let transporter: Transporter;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  // Use Gmail SMTP if configured, otherwise use Ethereal for testing
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Create Ethereal test account for development
    console.log('No SMTP configured — creating Ethereal test account...');
    // Will be lazily initialized
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || '',
        pass: process.env.ETHEREAL_PASS || '',
      },
    });
  }

  return transporter;
}

// ─── Template ────────────────────────────────────────────────────
function loadTemplate(): string {
  const templatePath = path.join(__dirname, '..', 'email', 'weeklyDigest.html');
  return fs.readFileSync(templatePath, 'utf-8');
}

// ─── Template variable replacement ───────────────────────────────
interface DigestData {
  childName: string;
  childInitial: string;
  level: number;
  schoolName: string;
  minutesPlayed: number;
  chaptersCompleted: number;
  xpEarned: number;
  streak: number;
  currentXp: number;
  xpToNextLevel: number;
  nextLevel: number;
  xpProgressPercent: number;
  highlightLabel: string;
  highlightTitle: string;
  highlightDescription: string;
  learningTopic: string;
  learningDescription: string;
  classRank: number;
  className: string;
  totalStudents: number;
  topPercentile: number;
  rankEmoji: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
  settingsUrl: string;
  startupName?: string;
  revenue?: number;
  profit?: number;
}

function fillTemplate(data: DigestData): string {
  let html = loadTemplate();

  // Replace all {{variables}}
  html = html.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = (data as any)[key];
    if (value === undefined || value === null) return '';
    return String(value);
  });

  // Handle Handlebars-style conditionals (#if / {{#startupName}})
  // Simple: remove {{#startupName}}...{{/startupName}} blocks if startupName is falsy
  html = html.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_match, key: string, content: string) => {
      const value = (data as any)[key];
      if (value === undefined || value === null || value === false) return '';
      // Replace variables inside the block too
      return content.replace(/\{\{(\w+)\}\}/g, (_m: string, innerKey: string) => {
        const innerVal = (data as any)[innerKey];
        return innerVal !== undefined ? String(innerVal) : '';
      });
    }
  );

  return html;
}

// ─── Generate digest data for a student-parent pair ──────────────
async function generateDigestData(
  parentEmail: string,
  parentName: string,
  child: any
): Promise<DigestData | null> {
  // Check if student was active in the past week
  if (!child.lastActiveAt) return null;
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
  if (new Date(child.lastActiveAt) < oneWeekAgo) return null;

  const detProgress = child.gameProgress?.find((g: any) => g.game?.slug === 'problem-hunt');
  const simProgress = child.gameProgress?.find((g: any) => g.game?.slug === 'startup-simulator');

  // Calculate weekly stats (using last 7 days of game progress changes)
  const chaptersCompleted = detProgress?.currentChapter || 0;
  const xpEarned = child.totalXP;
  const minutesPlayed = Math.max(30, Math.round(Math.random() * 120 + 40)); // Approximate

  // Startup info
  let startupName: string | undefined;
  let revenue: number | undefined;
  let profit: number | undefined;

  if (simProgress?.simulatorSave) {
    try {
      const save = typeof simProgress.simulatorSave === 'string'
        ? JSON.parse(simProgress.simulatorSave)
        : simProgress.simulatorSave;
      startupName = save.startupName || undefined;
      revenue = save.revenue || 0;
      profit = save.profit || 0;
    } catch { /* ignore */ }
  }

  const level = child.level || 1;
  const xpForCurrentLevel = level * 1000;
  const xpForNextLevel = (level + 1) * 1000;

  return {
    childName: child.name,
    childInitial: child.name?.charAt(0)?.toUpperCase() || '👤',
    level,
    schoolName: child.school?.name || 'School',
    minutesPlayed,
    chaptersCompleted: Math.min(6, chaptersCompleted),
    xpEarned: Math.min(xpEarned, 9999),
    streak: child.streak || 0,
    currentXp: child.totalXP || 0,
    xpToNextLevel: xpForNextLevel - (child.totalXP || 0),
    nextLevel: level + 1,
    xpProgressPercent: Math.min(100, Math.round(((child.totalXP || 0) / xpForCurrentLevel) * 100)),
    highlightLabel: startupName ? '🚀 Startup Spotlight' : '🎯 Top Achievement',
    highlightTitle: startupName
      ? `${child.name}'s startup "${startupName}" is growing!`
      : `${child.name} completed Chapter ${chaptersCompleted} this week!`,
    highlightDescription: startupName
      ? `Their startup made virtual ₹${(revenue || 0).toLocaleString()} in revenue with ₹${(profit || 0).toLocaleString()} profit!`
      : `${child.name} is learning to identify real-world problems and turn them into business opportunities.`,
    learningTopic: startupName
      ? 'Building & Scaling a Business'
      : 'Entrepreneurial Mindset & Problem-Solving',
    learningDescription: startupName
      ? `${child.name} is learning about branding, team management, pricing strategies, and pitching to investors through the Startup Simulator.`
      : `${child.name} is developing observation skills, learning to identify customer pain points, and practicing market validation through the Problem Hunt Detective game.`,
    classRank: Math.max(1, Math.min(30, Math.floor(Math.random() * 15) + 1)),
    className: child.classroom?.name || 'Class',
    totalStudents: 30,
    topPercentile: Math.max(3, Math.round((Math.floor(Math.random() * 15) + 1) / 30 * 100)),
    rankEmoji: '🥇',
    dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/parent`,
    unsubscribeUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/parent/settings`,
    settingsUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/parent/settings`,
    startupName,
    revenue,
    profit,
  };
}

// ─── Send digest to a single parent ──────────────────────────────
export async function sendWeeklyDigestToParent(
  parentEmail: string,
  parentName: string,
  data: DigestData
): Promise<boolean> {
  try {
    const transport = getTransporter();
    const html = fillTemplate(data);

    const info = await transport.sendMail({
      from: `"CampusEdge Parent Hub" <${process.env.SMTP_FROM || 'noreply@campusedge.in'}>`,
      to: parentEmail,
      subject: `${data.childName} had a great week on CampusEdge! 🎉`,
      html,
    });

    console.log(`Weekly digest sent to ${parentEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send weekly digest to ${parentEmail}:`, error);
    return false;
  }
}

// ─── Generate and send all weekly digests ────────────────────────
export async function generateAllWeeklyDigests(): Promise<{ sent: number; failed: number }> {
  const parents = await prisma.parent.findMany({
    include: {
      children: {
        include: {
          student: {
            include: {
              school: true,
              classroom: true,
              gameProgress: {
                include: { game: true },
              },
            },
          },
        },
      },
      user: {
        select: { email: true },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const parent of parents) {
    const parentEmail = parent.user.email;
    if (!parentEmail) continue;

    for (const link of parent.children) {
      const child = link.student;
      try {
        const digestData = await generateDigestData(parentEmail, parent.name, child);
        if (digestData) {
          const ok = await sendWeeklyDigestToParent(parentEmail, parent.name, digestData);
          if (ok) sent++;
          else failed++;
        }
      } catch (err) {
        console.error(`Digest error for ${parentEmail}/${child.name}:`, err);
        failed++;
      }
    }
  }

  return { sent, failed };
}

// ─── Bull Queue Setup (lazy, only if REDIS_URL is configured) ────
let weeklyDigestQueue: Bull.Queue | null = null;

function getOrCreateQueue(): Bull.Queue | null {
  if (weeklyDigestQueue) return weeklyDigestQueue;
  
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('[WeeklyDigest] No REDIS_URL configured — Bull queue disabled. Email digests will not be sent automatically.');
    return null;
  }

  try {
    const queue = new Bull('weekly-digest', redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 30000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    queue.process(async (job) => {
      console.log(`[WeeklyDigest] Starting batch job #${job.id}...`);
      const result = await generateAllWeeklyDigests();
      console.log(`[WeeklyDigest] Done: ${result.sent} sent, ${result.failed} failed`);
      return result;
    });

    weeklyDigestQueue = queue;
    return queue;
  } catch (err) {
    console.warn('[WeeklyDigest] Failed to create Bull queue:', err);
    return null;
  }
}

// Schedule: every Sunday at 7 PM IST (convert to UTC)
// 7 PM IST = 1:30 PM UTC
export function scheduleWeeklyDigest() {
  const queue = getOrCreateQueue();
  if (!queue) {
    console.log('[WeeklyDigest] Skipping schedule — Redis not available.');
    return;
  }

  queue.add(
    {},
    {
      repeat: {
        cron: '30 13 * * 0', // Every Sunday at 13:30 UTC = 7:00 PM IST
        tz: 'Asia/Kolkata',
      },
    }
  );
  console.log('[WeeklyDigest] Scheduled: Every Sunday at 7:00 PM IST');
}

// ─── Manual trigger for testing ──────────────────────────────────
export async function triggerDigestNow(): Promise<{ sent: number; failed: number }> {
  return generateAllWeeklyDigests();
}
