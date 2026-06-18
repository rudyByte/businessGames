import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Check, Megaphone, Calendar } from 'lucide-react';
import api from '../../lib/api';

interface Announcement {
  id: string;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaLink?: string;
  isActive: boolean;
  expiresAt?: string;
  schoolId?: string;
  classroomId?: string;
  createdByRole: string;
  createdAt: string;
}

interface Props {
  schools?: { id: string; name: string }[];
}

export default function AnnouncementManager({ schools = [] }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [scope, setScope] = useState<'global' | 'school' | 'classroom'>('global');
  const [schoolId, setSchoolId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setCtaLabel('');
    setCtaLink('');
    setExpiresAt('');
    setScope('global');
    setSchoolId('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (ann: Announcement) => {
    setTitle(ann.title);
    setMessage(ann.message);
    setCtaLabel(ann.ctaLabel || '');
    setCtaLink(ann.ctaLink || '');
    setExpiresAt(ann.expiresAt ? ann.expiresAt.slice(0, 16) : '');
    setScope(ann.classroomId ? 'classroom' : ann.schoolId ? 'school' : 'global');
    setSchoolId(ann.schoolId || '');
    setEditingId(ann.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        title,
        message,
        ctaLabel: ctaLabel || undefined,
        ctaLink: ctaLink || undefined,
        expiresAt: expiresAt || undefined,
        schoolId: (scope === 'school' || scope === 'classroom') ? schoolId : undefined,
        classroomId: undefined, // Classroom scope not yet implemented in this UI
      };

      if (editingId) {
        await api.put(`/announcements/${editingId}`, payload);
      } else {
        await api.post('/announcements', payload);
      }

      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to save announcement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const toggleActive = async (ann: Announcement) => {
    try {
      await api.put(`/announcements/${ann.id}`, { isActive: !ann.isActive });
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to toggle announcement:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold font-display text-white text-sm">Announcements</h3>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {showForm ? 'Cancel' : 'New'}
        </button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-panel border border-slate-700/50 rounded-xl p-4 space-y-3 overflow-hidden"
          >
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Scope</label>
              <select
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500"
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
              >
                <option value="global">Global (All Schools)</option>
                <option value="school">Single School</option>
              </select>
            </div>

            {scope !== 'global' && (
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">School</label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                >
                  <option value="">Select a school...</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500"
                placeholder="Announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Message</label>
              <textarea
                required
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500 resize-none"
                placeholder="Announcement message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">CTA Label (optional)</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500"
                  placeholder="e.g. Learn More"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">CTA Link (optional)</label>
                <input
                  type="url"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500"
                  placeholder="https://..."
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Expires At (optional)</label>
              <input
                type="datetime-local"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-xs transition-colors"
            >
              {isSubmitting ? 'Saving...' : editingId ? 'Update Announcement' : 'Create Announcement'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Announcement List */}
      <div className="space-y-2">
        {announcements.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No announcements yet.</p>
        ) : (
          announcements.map((ann) => (
            <motion.div
              key={ann.id}
              layout
              className={`glass-panel border rounded-xl p-3.5 flex items-start justify-between gap-3 ${
                ann.isActive ? 'border-purple-500/20' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Megaphone className={`h-3.5 w-3.5 ${ann.isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-white truncate">{ann.title}</span>
                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                    ann.createdByRole === 'SUPER_ADMIN'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {ann.createdByRole === 'SUPER_ADMIN' ? 'Admin' : 'Faculty'}
                  </span>
                  {!ann.isActive && (
                    <span className="text-[9px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Inactive</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{ann.message}</p>
                {ann.expiresAt && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                    <Calendar className="h-3 w-3" />
                    Expires: {new Date(ann.expiresAt).toLocaleDateString()}
                  </span>
                )}
                {ann.ctaLabel && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-purple-400 ml-2">
                    → {ann.ctaLabel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(ann)}
                  className={`p-1.5 rounded-lg transition-all ${
                    ann.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-slate-600 hover:bg-slate-800'
                  }`}
                  title={ann.isActive ? 'Deactivate' : 'Activate'}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleEdit(ann)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                  title="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
