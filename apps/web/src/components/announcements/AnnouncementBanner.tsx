import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ExternalLink, Megaphone } from 'lucide-react';
import api from '../../lib/api';

interface Announcement {
  id: string;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaLink?: string;
  createdByRole: string;
  createdAt: string;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await api.get('/announcements');
        const data = res.data.data || [];
        // Load dismissed IDs from localStorage (persists across sessions)
        const stored = localStorage.getItem('dismissedAnnouncements');
        if (stored) {
          setDismissedIds(new Set(JSON.parse(stored)));
        }
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err) {
        // Silently fail — announcements are non-critical
        console.warn('Failed to load announcements:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  const handleDismiss = async (id: string) => {
    // Track in localStorage (persists across sessions)
    const updated = new Set(dismissedIds);
    updated.add(id);
    setDismissedIds(updated);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify([...updated]));

    // Notify server (fire-and-forget)
    try {
      await api.post(`/announcements/${id}/dismiss`);
    } catch {
      // Silently fail
    }
  };

  const visible = announcements.filter((a) => !dismissedIds.has(a.id));

  if (isLoading || visible.length === 0) return null;

  return (
    <div className="space-y-2 px-4 pt-2">
      {visible.slice(0, 3).map((announcement) => (
        <motion.div
          key={announcement.id}
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="relative bg-gradient-to-r from-purple-600/20 via-blue-600/15 to-purple-600/20 backdrop-blur-xl border border-purple-400/20 rounded-xl p-3.5 pr-10 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Megaphone className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-white truncate">
                  {announcement.title}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-purple-400/70 font-semibold bg-purple-400/10 px-1.5 py-0.5 rounded">
                  {announcement.createdByRole === 'SUPER_ADMIN' ? 'School' : 'Teacher'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {announcement.message}
              </p>
              {announcement.ctaLabel && announcement.ctaLink && (
                <a
                  href={announcement.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {announcement.ctaLabel}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <button
            onClick={() => handleDismiss(announcement.id)}
            className="absolute top-3 right-3 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Dismiss announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
