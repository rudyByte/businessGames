import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Volume2, VolumeX, Sparkles, Trophy, Flame, TrendingUp, Zap } from 'lucide-react';
import { soundManager } from '../../lib/rewardSystem';

/* ─── Types ──────────────────────────────────── */
export interface ActivityEvent {
  id: string;
  emoji: string;
  message: string;
  timestamp: Date;
  color?: string;
}

interface FOMOFeedProps {
  activities: ActivityEvent[];
  maxVisible?: number;      // max notifications visible at once
  className?: string;
}

/* ─── Sample activities ──────────────────────── */
export const SAMPLE_ACTIVITIES: ActivityEvent[] = [
  { id: '1', emoji: '⚡', message: 'Rohan just beat Chapter 3', timestamp: new Date(Date.now() - 2 * 60000), color: '#22D3EE' },
  { id: '2', emoji: '🏆', message: 'Priya is now rank #2 in your class', timestamp: new Date(Date.now() - 5 * 60000), color: '#FBBF24' },
  { id: '3', emoji: '💰', message: "Sneha's startup just made ₹50,000 profit", timestamp: new Date(Date.now() - 8 * 60000), color: '#34D399' },
  { id: '4', emoji: '🔥', message: 'Aryan is on a 14-day streak!', timestamp: new Date(Date.now() - 12 * 60000), color: '#F97316' },
  { id: '5', emoji: '⭐', message: 'Vikram earned Detective Master badge', timestamp: new Date(Date.now() - 20 * 60000), color: '#A78BFA' },
  { id: '6', emoji: '🚀', message: 'Neha completed the Shark Tank pitch!', timestamp: new Date(Date.now() - 30 * 60000), color: '#4ECDC4' },
  { id: '7', emoji: '📊', message: 'Kunal scored 95% on Chapter 4 quiz', timestamp: new Date(Date.now() - 45 * 60000), color: '#60A5FA' },
  { id: '8', emoji: '🎯', message: 'Ananya validated 10 customers in 1 day', timestamp: new Date(Date.now() - 60 * 60000), color: '#F472B6' },
];

/* ─── Single notification pop-up ─────────────── */
function ActivityNotification({ activity, onDismiss }: {
  activity: ActivityEvent;
  onDismiss: () => void;
}) {
  const timeAgo = getTimeAgo(activity.timestamp);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex items-start gap-3 p-3 rounded-xl backdrop-blur-md border cursor-pointer group hover:scale-[1.02] transition-all"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        borderColor: activity.color ? `${activity.color}25` : 'rgba(51, 65, 85, 0.4)',
      }}
      onClick={onDismiss}
    >
      {/* Emoji icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
        style={{ backgroundColor: activity.color ? `${activity.color}15` : 'rgba(100, 116, 139, 0.15)' }}
      >
        {activity.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-200 leading-relaxed">
          {activity.message}
        </p>
        <p className="text-[9px] text-slate-500 mt-0.5">{timeAgo}</p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

/* ─── Main FOMO Feed Component ──────────────── */
export default function FOMOFeed({ activities, maxVisible = 3, className = '' }: FOMOFeedProps) {
  const [muted, setMuted] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [activeActivities, setActiveActivities] = useState<ActivityEvent[]>([]);
  const [incomingActivities, setIncomingActivities] = useState<ActivityEvent[]>(activities);
  const lastActivityRef = useRef<string>('');

  // Pulse activities in one at a time with sound
  useEffect(() => {
    if (incomingActivities.length === 0 || activeActivities.length >= maxVisible) return;

    const nextActivity = incomingActivities[0];
    if (nextActivity.id === lastActivityRef.current) return;
    lastActivityRef.current = nextActivity.id;

    const timer = setTimeout(() => {
      setActiveActivities(prev => [...prev, nextActivity]);
      setIncomingActivities(prev => prev.slice(1));

      // Play notification sound (soft ding)
      if (!muted) {
        soundManager.play('ding');
      }

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setActiveActivities(prev => prev.filter(a => a.id !== nextActivity.id));
      }, 8000);
    }, 3000); // one every 3 seconds

    return () => clearTimeout(timer);
  }, [incomingActivities, activeActivities, maxVisible, muted]);

  const handleDismiss = (id: string) => {
    setActiveActivities(prev => prev.filter(a => a.id !== id));
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-xl bg-game-deep/60 backdrop-blur-sm border border-slate-700/40 hover:bg-game-deep/80 transition-all"
        title="Classroom Activity"
      >
        <Bell className="h-4 w-4 text-slate-400" />
        {activeActivities.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-game-hot text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {activeActivities.length}
          </span>
        )}
      </button>

      {/* Sound toggle */}
      <button
        onClick={() => setMuted(!muted)}
        className="p-2 rounded-xl bg-game-deep/60 backdrop-blur-sm border border-slate-700/40 hover:bg-game-deep/80 transition-all"
        title={muted ? 'Unmute sounds' : 'Mute sounds'}
      >
        {muted ? (
          <VolumeX className="h-3.5 w-3.5 text-slate-500" />
        ) : (
          <Volume2 className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>

      {/* Activity Feed Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute top-12 right-0 w-80 max-w-[90vw] bg-game-deep/90 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-3 shadow-2xl z-50 ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-bold text-white">Classroom Feed</span>
              </div>
              <span className="text-[9px] text-slate-500">{activities.length} activities</span>
            </div>

            {/* Activity list */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="text-center py-6 text-slate-600">
                  <Bell className="h-6 w-6 mx-auto mb-2 opacity-30" />
                  <p className="text-[10px]">No recent activity — check back later!</p>
                </div>
              ) : (
                activities.slice(0, 10).map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800/30 transition-colors"
                  >
                    <span className="text-sm">{activity.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-300 truncate">{activity.message}</p>
                      <p className="text-[8px] text-slate-600">{getTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Floating notification pop-ups (shown on map) — uses simple interval */
export function FloatingActivityPopups({ activities, maxVisible = 3 }: {
  activities: ActivityEvent[];
  maxVisible?: number;
}) {
  const [activePopups, setActivePopups] = useState<ActivityEvent[]>([]);
  const queueRef = useRef<ActivityEvent[]>([]);
  const indexRef = useRef(0);

  // Reset queue when activities change
  useEffect(() => {
    queueRef.current = [...activities];
    indexRef.current = 0;
  }, [activities]);

  // Use a single interval to pulse activities
  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      // Get next activity
      const queue = queueRef.current;
      if (queue.length === 0) {
        // Reset cycle
        queueRef.current = [...activities];
        indexRef.current = 0;
        return;
      }

      const next = queue.shift()!;
      queueRef.current = queue;

      setActivePopups(prev => [...prev, next]);
      soundManager.play('ding');

      // Schedule removal
      setTimeout(() => {
        setActivePopups(prev => prev.filter(a => a.id !== next.id));
      }, 6000);
    }, 5000);

    return () => clearInterval(interval);
  }, [activities]);

  return (
    <div className="fixed bottom-24 right-4 z-40 space-y-2 pointer-events-none">
      <AnimatePresence>
        {activePopups.slice(0, maxVisible).map(activity => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 60, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${activity.color || 'rgba(51, 65, 85, 0.4)'}40`,
              borderRadius: '12px',
              padding: '10px 14px',
              maxWidth: '280px',
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{activity.emoji}</span>
              <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                {activity.message}
              </p>
            </div>
            <p className="text-[8px] text-slate-500 mt-1 ml-8">{getTimeAgo(activity.timestamp)}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Helper ─────────────────────────────────── */
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
