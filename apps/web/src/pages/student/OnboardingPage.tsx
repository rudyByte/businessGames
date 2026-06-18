import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useReward } from '../../components/ui/RewardProvider';
import { Star, Sparkles, Gamepad2, Map, User, ChevronRight, Gift, Trophy } from 'lucide-react';

type OnboardingStep = 'welcome' | 'avatar' | 'tutorial' | 'complete';

const SKIN_TONES = [
  { name: 'Fair', value: '#F3D2C1' },
  { name: 'Warm', value: '#E8B490' },
  { name: 'Medium', value: '#C68642' },
  { name: 'Brown', value: '#8D5524' },
];

const HAIR_STYLES = [
  { name: 'Short', value: 'short', emoji: '👦' },
  { name: 'Long', value: 'long', emoji: '👧' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);
  const { triggerReward } = useReward();

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [skinTone, setSkinTone] = useState('#F3D2C1');
  const [hairStyle, setHairStyle] = useState('short');
  const [uniformColor, setUniformColor] = useState('#4A90D9');
  const [isSaving, setIsSaving] = useState(false);

  const student = user?.student || { name: 'Student', level: 1 };

  const handleAvatarSave = async () => {
    setIsSaving(true);
    try {
      await updateAvatar({
        skinTone,
        hairStyle,
        hairColor: '#000000',
        uniformColor,
        accessory: 'none',
        expression: 'happy',
      });
      // Award welcome XP
      await api.post('/games/problem-hunt/progress/save', {
        currentChapter: 1,
        currentLevel: 1,
        status: 'NOT_STARTED',
        detectiveSave: { onboardingComplete: true },
      });
    } catch (err) {
      console.warn('Avatar save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    triggerReward('level_up');
    // Small delay for reward animation
    setTimeout(() => {
      navigate('/student', { replace: true });
    }, 1500);
  };

  const renderAvatar = () => (
    <svg className="w-32 h-32" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="30" fill={skinTone} />
      {hairStyle === 'short' ? (
        <path d="M20,40 Q50,15 80,40 Q50,30 20,40" fill="#000000" />
      ) : (
        <path d="M20,40 Q50,10 80,40 L80,60 L75,60 L75,45 Q50,30 25,45 L25,60 L20,60 Z" fill="#000000" />
      )}
      <circle cx="42" cy="48" r="3" fill="#333" />
      <circle cx="58" cy="48" r="3" fill="#333" />
      <path d="M42,58 Q50,66 58,58" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30,80 L70,80 L65,95 L35,95 Z" fill={uniformColor} />
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl" />

      <div className="max-w-lg w-full relative z-10">
        <AnimatePresence mode="wait">
          {/* ─── STEP 1: WELCOME ─────────────────────── */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="glass-panel-heavy rounded-2xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="h-10 w-10 text-purple-400" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold font-display text-white">
                  Welcome, {student.name}! 👋
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Get ready to begin your entrepreneurial journey. You'll explore real-world problems, 
                  build your own startup, and pitch to investors — all through fun, interactive games!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🔍', title: 'Detective', desc: 'Find problems' },
                  { icon: '🚀', title: 'Simulator', desc: 'Build solutions' },
                  { icon: '🏆', title: 'Showcase', desc: 'Pitch & win' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-bold text-white">{item.title}</div>
                    <div className="text-[9px] text-slate-500">{item.desc}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep('avatar')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-xl border border-purple-500/20 transition-all flex items-center justify-center gap-2"
              >
                Customize Your Avatar <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* ─── STEP 2: AVATAR CUSTOMIZER ──────────── */}
          {step === 'avatar' && (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="glass-panel-heavy rounded-2xl p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <User className="h-8 w-8 text-purple-400 mx-auto" />
                <h2 className="text-2xl font-bold font-display text-white">Customize Your Avatar</h2>
                <p className="text-slate-400 text-sm">Pick your look for the journey ahead!</p>
              </div>

              {/* Avatar preview */}
              <div className="flex justify-center">
                <div className="w-36 h-36 rounded-full border-2 border-purple-500/20 bg-slate-900/60 flex items-center justify-center">
                  {renderAvatar()}
                </div>
              </div>

              {/* Skin tone */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skin Tone</span>
                <div className="flex gap-3 justify-center">
                  {SKIN_TONES.map(t => (
                    <button
                      key={t.name}
                      onClick={() => setSkinTone(t.value)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        skinTone === t.value ? 'border-purple-400 scale-110' : 'border-transparent hover:border-slate-600'
                      }`}
                      style={{ backgroundColor: t.value }}
                      title={t.name}
                    />
                  ))}
                </div>
              </div>

              {/* Hair style */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hair Style</span>
                <div className="flex gap-3 justify-center">
                  {HAIR_STYLES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setHairStyle(s.value)}
                      className={`px-5 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                        hairStyle === s.value
                          ? 'bg-purple-600 text-white border-purple-500/30'
                          : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {s.emoji} {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Uniform color */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uniform Color</span>
                <div className="flex gap-3 justify-center">
                  {[
                    { name: 'Blue', value: '#4A90D9' },
                    { name: 'Green', value: '#2C5F2E' },
                    { name: 'Red', value: '#A8201A' },
                    { name: 'Gold', value: '#FFB800' },
                  ].map(c => (
                    <button
                      key={c.name}
                      onClick={() => setUniformColor(c.value)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        uniformColor === c.value ? 'border-purple-400 scale-110' : 'border-transparent hover:border-slate-600'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('welcome')}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl border border-slate-700/50 transition-all text-xs"
                >
                  Back
                </button>
                <button
                  onClick={async () => {
                    await handleAvatarSave();
                    setStep('tutorial');
                  }}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2.5 rounded-xl border border-purple-500/20 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  {isSaving ? 'Saving...' : 'Save & Continue'}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: MAP TUTORIAL ───────────────── */}
          {step === 'tutorial' && (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="glass-panel-heavy rounded-2xl p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <Map className="h-8 w-8 text-blue-400 mx-auto" />
                <h2 className="text-2xl font-bold font-display text-white">Your World Map 🗺️</h2>
                <p className="text-slate-400 text-sm">Here's how to navigate your entrepreneurial journey!</p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: '🔍', title: 'Problem Hunt Zone', desc: 'Explore 3D scenes, find clues, and interview NPCs to discover real problems.', color: 'text-purple-400' },
                  { icon: '🚀', title: 'Startup Galaxy', desc: 'Build a brand, hire a team, run rounds, and pitch to Shark Tank!', color: 'text-blue-400' },
                  { icon: '🏆', title: 'Showcase Stage', desc: 'Complete both games to unlock the grand finale!', color: 'text-amber-400' },
                  { icon: '📦', title: 'Daily Chest', desc: 'Open it every day for bonus XP and coins.', color: 'text-green-400' },
                  { icon: '👥', title: 'Classmate Ghosts', desc: 'See what your classmates are doing in real-time!', color: 'text-pink-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <span className={`text-xs font-bold ${item.color}`}>{item.title}</span>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={async () => {
                  setStep('complete');
                  await handleComplete();
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl border border-green-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Gift className="h-5 w-5" />
                Claim Your Welcome Gift! <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* ─── STEP 4: COMPLETE ──────────────────── */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel-heavy rounded-2xl p-8 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-6xl"
              >🎉</motion.div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold font-display text-white">Welcome Aboard! 🚀</h1>
                <p className="text-slate-400 text-sm">
                  Your journey begins now! Head to the world map and start with 
                  <strong className="text-purple-400"> Problem Hunt Detective</strong>.
                </p>
              </div>

              {/* Welcome Gift */}
              <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-xl p-5 space-y-2">
                <Trophy className="h-6 w-6 text-amber-400 mx-auto" />
                <p className="text-lg font-bold text-white">Welcome Gift</p>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" /> +100 XP
                  </span>
                  <span className="flex items-center gap-1">
                    <Gamepad2 className="h-4 w-4 text-purple-400" /> Welcome Badge
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500">Redirecting to your world map...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
