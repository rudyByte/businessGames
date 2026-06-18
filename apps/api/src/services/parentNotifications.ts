import { prisma } from '../lib/prisma';

// ─── Notification Types ──────────────────────────────────────────
export type ParentNotificationType =
  | 'achievement_earned'
  | 'chapter_complete'
  | 'inactivity_alert'
  | 'streak_milestone'
  | 'startup_milestone';

export interface ParentNotification {
  id: string;
  type: ParentNotificationType;
  childName: string;
  childId: string;
  title: string;
  message: string;
  emoji: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

// ─── Generate notification message from type ─────────────────────
interface NotificationInput {
  type: ParentNotificationType;
  childName: string;
  childId: string;
  details?: {
    badgeName?: string;
    chapterTitle?: string;
    chapterNumber?: number;
    daysInactive?: number;
    streakCount?: number;
    startupName?: string;
    revenue?: number;
    profit?: number;
    rank?: number;
    xpGained?: number;
  };
}

function generateNotification(input: NotificationInput): Omit<ParentNotification, 'id' | 'read' | 'createdAt'> {
  const { type, childName, childId, details } = input;

  switch (type) {
    case 'achievement_earned':
      return {
        type,
        childName,
        childId,
        title: `🏆 ${childName} just earned '${details?.badgeName || 'New Badge'}'!`,
        message: `Wow! ${childName} unlocked a new achievement! They're learning entrepreneurial skills step by step. We're so proud! 🎉`,
        emoji: '🏆',
        data: { badgeName: details?.badgeName },
      };

    case 'chapter_complete':
      return {
        type,
        childName,
        childId,
        title: `📚 ${childName} completed Chapter ${details?.chapterNumber || ''}!`,
        message: `${childName} just finished "${details?.chapterTitle || 'a chapter'}" — learning how to think like a real entrepreneur. Keep encouraging them! 💪`,
        emoji: '📚',
        data: { chapterNumber: details?.chapterNumber, chapterTitle: details?.chapterTitle },
      };

    case 'inactivity_alert':
      return {
        type,
        childName,
        childId,
        title: `👋 ${childName} hasn't played in ${details?.daysInactive || 5} days`,
        message: `${childName} has been away from CampusEdge for a while. A gentle nudge might help! A quick 15-minute session is all it takes to keep the streak going. 😊`,
        emoji: '👋',
        data: { daysInactive: details?.daysInactive },
      };

    case 'streak_milestone':
      return {
        type,
        childName,
        childId,
        title: `🔥 ${childName} is on a ${details?.streakCount || 7}-day learning streak!`,
        message: `Incredible! ${childName} has been learning every day for ${details?.streakCount || 7} days! Consistency like this builds real entrepreneurial thinking. 🌟`,
        emoji: '🔥',
        data: { streakCount: details?.streakCount },
      };

    case 'startup_milestone':
      return {
        type,
        childName,
        childId,
        title: `🚀 ${childName}'s startup '${details?.startupName || 'New Venture'}' is growing!`,
        message: `Their startup made virtual ₹${(details?.revenue || 0).toLocaleString()} in revenue with ₹${(details?.profit || 0).toLocaleString()} profit! They're learning real business skills! 📈`,
        emoji: '🚀',
        data: { startupName: details?.startupName, revenue: details?.revenue, profit: details?.profit },
      };

    default:
      return {
        type,
        childName,
        childId,
        title: `📢 Update about ${childName}`,
        message: `New update available about ${childName}'s progress on CampusEdge.`,
        emoji: '📢',
      };
  }
}

// ─── Store a notification in the database ─────────────────────────
export async function createParentNotification(
  parentId: string,
  input: NotificationInput
): Promise<ParentNotification> {
  const generated = generateNotification(input);

  const notification = await prisma.parentNotification.create({
    data: {
      parentId,
      type: generated.type,
      childId: generated.childId,
      childName: generated.childName,
      title: generated.title,
      message: generated.message,
      emoji: generated.emoji,
      data: generated.data ? JSON.stringify(generated.data) : null,
    },
  });

  return {
    id: notification.id,
    type: notification.type as ParentNotificationType,
    childName: notification.childName,
    childId: notification.childId,
    title: notification.title,
    message: notification.message,
    emoji: notification.emoji,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    data: notification.data ? JSON.parse(notification.data) : undefined,
  };
}

// ─── Fetch notifications for a parent ────────────────────────────
export async function getParentNotifications(
  parentId: string,
  limit = 20,
  offset = 0
): Promise<{ notifications: ParentNotification[]; unreadCount: number }> {
  const [notifications, unreadCount] = await Promise.all([
    prisma.parentNotification.findMany({
      where: { parentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.parentNotification.count({
      where: { parentId, read: false },
    }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type as ParentNotificationType,
      childName: n.childName,
      childId: n.childId,
      title: n.title,
      message: n.message,
      emoji: n.emoji,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      data: n.data ? JSON.parse(n.data) : undefined,
    })),
    unreadCount,
  };
}

// ─── Mark notification as read ───────────────────────────────────
export async function markNotificationRead(notificationId: string, parentId: string): Promise<void> {
  await prisma.parentNotification.updateMany({
    where: { id: notificationId, parentId },
    data: { read: true },
  });
}

// ─── Mark all notifications as read for a parent ─────────────────
export async function markAllNotificationsRead(parentId: string): Promise<void> {
  await prisma.parentNotification.updateMany({
    where: { parentId, read: false },
    data: { read: true },
  });
}

// ─── Get notification settings for a parent ──────────────────────
export const DEFAULT_NOTIFICATION_SETTINGS = {
  achievement_earned: true,
  chapter_complete: true,
  inactivity_alert: true,
  streak_milestone: true,
  startup_milestone: true,
  weekly_digest: true,
};

export type NotificationSettings = typeof DEFAULT_NOTIFICATION_SETTINGS;

export async function getNotificationSettings(
  parentId: string
): Promise<NotificationSettings> {
  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    select: { notificationSettings: true },
  });

  if (!parent?.notificationSettings) {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  try {
    const parsed = JSON.parse(parent.notificationSettings);
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

// ─── Update notification settings ────────────────────────────────
export async function updateNotificationSettings(
  parentId: string,
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const current = await getNotificationSettings(parentId);
  const updated = { ...current, ...settings };

  await prisma.parent.update({
    where: { id: parentId },
    data: { notificationSettings: JSON.stringify(updated) },
  });

  return updated;
}

// ─── Auto-generate sample notifications for demo purposes ────────
export async function generateSampleNotifications(parentId: string, children: any[]): Promise<void> {
  for (const child of children) {
    // Achievement
    await createParentNotification(parentId, {
      type: 'achievement_earned',
      childName: child.name,
      childId: child.id,
      details: { badgeName: 'Detective Pro' },
    });

    // Chapter complete
    await createParentNotification(parentId, {
      type: 'chapter_complete',
      childName: child.name,
      childId: child.id,
      details: { chapterNumber: 4, chapterTitle: 'Turning Problems into Opportunities' },
    });

    // Streak milestone
    await createParentNotification(parentId, {
      type: 'streak_milestone',
      childName: child.name,
      childId: child.id,
      details: { streakCount: 7 },
    });
  }
}
