import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, ChevronRight, Settings, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: string;
  childName: string;
  childId: string;
  title: string;
  message: string;
  emoji: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  parentId: string;
}

export default function NotificationFeed({ parentId }: Props) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/parent/notifications', {
        params: { limit: showAll ? 50 : 5 },
      });
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      // Silently fail — notifications are non-critical
    } finally {
      setIsLoading(false);
    }
  }, [showAll]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.post(`/parent/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/parent/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  const timeAgo = (dateStr: string) => {
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const emojiBg = (type: string) => {
    const map: Record<string, string> = {
      achievement_earned: 'bg-yellow-500/10 text-yellow-400',
      chapter_complete: 'bg-blue-500/10 text-blue-400',
      inactivity_alert: 'bg-orange-500/10 text-orange-400',
      streak_milestone: 'bg-red-500/10 text-red-400',
      startup_milestone: 'bg-purple-500/10 text-purple-400',
    };
    return map[type] || 'bg-slate-500/10 text-slate-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500" />
      </div>
    );
  }

  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Bell className="h-5 w-5 text-green-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <span className="text-sm font-bold text-white">Notifications</span>
            <span className="text-[10px] text-slate-500 ml-2">
              {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] text-green-400 hover:text-green-300 font-semibold px-2 py-1 rounded-lg hover:bg-green-500/10 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={() => navigate('/parent/settings')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            title="Notification settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="divide-y divide-slate-800/40">
        {displayNotifications.length === 0 ? (
          <div className="text-center py-10 px-4">
            <MessageSquare className="h-8 w-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No notifications yet</p>
            <p className="text-[10px] text-slate-600 mt-1">
              You'll see updates about your child's progress here
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {displayNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 transition-colors cursor-pointer hover:bg-white/[0.02] ${
                  !notif.read ? 'bg-green-500/3 border-l-2 border-l-green-500' : ''
                }`}
                onClick={() => !notif.read && handleMarkRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${emojiBg(notif.type)}`}>
                    {notif.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs ${notif.read ? 'text-slate-400' : 'text-white font-semibold'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[9px] text-slate-600 whitespace-nowrap shrink-0">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-semibold text-green-400/70">
                        {notif.childName}
                      </span>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* View All Footer */}
      {notifications.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full p-3 border-t border-slate-800/40 text-xs text-slate-400 hover:text-white font-semibold flex items-center justify-center gap-1 transition-colors"
        >
          {showAll ? 'Show less' : `View all ${notifications.length} notifications`}
          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showAll ? 'rotate-90' : ''}`} />
        </button>
      )}
    </div>
  );
}
