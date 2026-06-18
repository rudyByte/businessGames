import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, ArrowLeft, Save, Trophy, BookOpen, AlertTriangle, Flame, Rocket, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

interface NotificationSettings {
  achievement_earned: boolean;
  chapter_complete: boolean;
  inactivity_alert: boolean;
  streak_milestone: boolean;
  startup_milestone: boolean;
  weekly_digest: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  achievement_earned: true,
  chapter_complete: true,
  inactivity_alert: true,
  streak_milestone: true,
  startup_milestone: true,
  weekly_digest: true,
};

const SETTING_DETAILS: { key: keyof NotificationSettings; label: string; description: string; emoji: string; icon: React.ReactNode }[] = [
  {
    key: 'achievement_earned',
    label: 'Achievement Earned',
    description: 'When your child unlocks a new badge or achievement',
    emoji: '🏆',
    icon: <Trophy className="h-4 w-4 text-yellow-400" />,
  },
  {
    key: 'chapter_complete',
    label: 'Chapter Complete',
    description: 'When your child finishes a game chapter',
    emoji: '📚',
    icon: <BookOpen className="h-4 w-4 text-blue-400" />,
  },
  {
    key: 'inactivity_alert',
    label: 'Inactivity Alert',
    description: 'Reminder if your child hasn\'t played in 5+ days',
    emoji: '👋',
    icon: <AlertTriangle className="h-4 w-4 text-orange-400" />,
  },
  {
    key: 'streak_milestone',
    label: 'Streak Milestone',
    description: 'When your child reaches a learning streak milestone',
    emoji: '🔥',
    icon: <Flame className="h-4 w-4 text-red-400" />,
  },
  {
    key: 'startup_milestone',
    label: 'Startup Milestone',
    description: 'When your child\'s business hits revenue or profit goals',
    emoji: '🚀',
    icon: <Rocket className="h-4 w-4 text-purple-400" />,
  },
  {
    key: 'weekly_digest',
    label: 'Weekly Digest Email',
    description: 'Receive a summary email every Sunday with your child\'s progress',
    emoji: '📧',
    icon: <Mail className="h-4 w-4 text-green-400" />,
  },
];

export default function ParentSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get('/parent/notifications/settings');
        setSettings({ ...DEFAULT_SETTINGS, ...res.data.data });
      } catch {
        // Use defaults
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/parent/notifications/settings', settings);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/parent')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white font-display">Notification Settings</h2>
          <p className="text-xs text-slate-400">Choose how you hear about your child's progress</p>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-2">
        {SETTING_DETAILS.map((setting) => (
          <motion.div
            key={setting.key}
            layout
            className="glass-panel border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-0.5">{setting.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{setting.label}</span>
                  <span className="text-sm">{setting.emoji}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{setting.description}</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(setting.key)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                settings[setting.key] ? 'bg-green-600' : 'bg-slate-700'
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: settings[setting.key] ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
      >
        <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>

      {showSaved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-xs text-center"
        >
          ✅ Notification preferences saved!
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
        <div className="flex items-start gap-2.5">
          <BellOff className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-400">Note:</strong> You can always change these settings later. 
            Notifications appear in your dashboard and (if enabled) are sent to your email. 
            We only send important updates — no spam, ever.
          </div>
        </div>
      </div>
    </div>
  );
}
