import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Megaphone, X } from 'lucide-react';
import api from '../../lib/api';

interface Classroom {
  id: string;
  name: string;
  students: any[];
}

interface Props {
  classrooms: Classroom[];
  onCreated?: () => void;
}

export default function FacultyAnnouncementComposer({ classrooms, onCreated }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [classroomId, setClassroomId] = useState(classrooms[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    try {
      await api.post('/announcements', {
        title,
        message,
        classroomId,
        // Faculty announcements are auto-scoped to their school
      });

      setTitle('');
      setMessage('');
      setSuccess(true);
      setShowForm(false);
      onCreated?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to create announcement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Megaphone className="h-3.5 w-3.5 text-blue-400" />
          Classroom Announcements
        </h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1.5 rounded-lg transition-colors"
        >
          {showForm ? (
            <X className="h-3 w-3" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
          {showForm ? 'Cancel' : 'New'}
        </button>
      </div>

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
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Classroom</label>
              <select
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-blue-500"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                required
              >
                {classrooms.map((cl) => (
                  <option key={cl.id} value={cl.id}>{cl.name} ({cl.students.length} students)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-blue-500"
                placeholder="e.g. Homework Reminder"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Message</label>
              <textarea
                required
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-blue-500 resize-none"
                placeholder="Your message to students..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-xs transition-colors"
            >
              {isSubmitting ? 'Sending...' : 'Send Announcement'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-2.5 rounded-lg text-[11px]">
          Announcement sent to students!
        </div>
      )}
    </div>
  );
}
