import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Star, Award, Shield, Edit3, Save, Coins, Hexagon, User, Settings } from 'lucide-react';
import HexBadge, { getRarityForLevel } from '../../components/ui/HexBadge';
import XPProgressBar from '../../components/gamification/XPProgressBar';

export default function ProfilePage() {
  const { user, updateAvatar } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const defaultAvatar = {
    skinTone: '#F3D2C1',
    hairStyle: 'short',
    hairColor: '#000000',
    uniformColor: '#4A90D9',
    accessory: 'none',
    expression: 'happy',
  };

  const student = user?.student || {
    name: 'Aryan Goel',
    level: 2,
    totalXP: 320,
    coins: 150,
    avatarConfig: defaultAvatar,
  };

  const currentAvatar = student.avatarConfig || defaultAvatar;

  const [skinTone, setSkinTone] = useState(currentAvatar.skinTone);
  const [hairStyle, setHairStyle] = useState(currentAvatar.hairStyle);
  const [hairColor, setHairColor] = useState(currentAvatar.hairColor);
  const [uniformColor, setUniformColor] = useState(currentAvatar.uniformColor);
  const [expression, setExpression] = useState(currentAvatar.expression);

  const skinTones = [
    { name: 'Fair', value: '#F3D2C1' },
    { name: 'Warm', value: '#E8B490' },
    { name: 'Medium', value: '#C68642' },
    { name: 'Brown', value: '#8D5524' },
  ];

  const uniformColors = [
    { name: 'Blue', value: '#4A90D9' },
    { name: 'Green', value: '#2C5F2E' },
    { name: 'Red', value: '#A8201A' },
    { name: 'Gold', value: '#FFB800' },
  ];

  const rarity = getRarityForLevel(student.level || 1);

  const handleSaveAvatar = async () => {
    await updateAvatar({
      skinTone,
      hairStyle,
      hairColor,
      uniformColor,
      accessory: 'none',
      expression,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="game-card-accent p-6 rounded-xl">
        <h1 className="text-2xl font-game-round font-bold text-white">Student Profile 👤</h1>
        <p className="text-sm font-game-body text-game-text-muted mt-1">
          Customize your avatar, check your badges, and view game progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="game-card p-6 rounded-xl flex flex-col items-center space-y-4 border-slate-700/30"
        >
          {/* Avatar */}
          <div className="relative">
            <div
              className="absolute -inset-2 rounded-full blur-md"
              style={{ backgroundColor: `${rarity === 'gold' ? 'rgba(255,215,0,0.2)' : 'rgba(168,85,247,0.15)'}` }}
            />
            <div className="w-28 h-28 rounded-full border-2 border-slate-700/50 overflow-hidden flex items-center justify-center relative bg-game-dark">
              <svg className="w-24 h-24" viewBox="0 0 100 100">
                {/* Face */}
                <circle cx="50" cy="50" r="30" fill={skinTone} />
                {/* Hair */}
                {hairStyle === 'short' ? (
                  <path d="M20,40 Q50,15 80,40 Q50,30 20,40" fill={hairColor} />
                ) : (
                  <path d="M20,40 Q50,10 80,40 L80,60 L75,60 L75,45 Q50,30 25,45 L25,60 L20,60 Z" fill={hairColor} />
                )}
                {/* Eyes */}
                <circle cx="42" cy="48" r="3" fill="#333" />
                <circle cx="58" cy="48" r="3" fill="#333" />
                {/* Mouth */}
                {expression === 'happy' ? (
                  <path d="M42,58 Q50,66 58,58" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <line x1="42" y1="60" x2="58" y2="60" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                )}
                {/* Uniform collar */}
                <path d="M30,80 L70,80 L65,95 L35,95 Z" fill={uniformColor} />
              </svg>
            </div>
            {/* Level badge floating */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <HexBadge level={student.level || 1} rarity={rarity} size="sm" />
            </div>
          </div>

          <div className="text-center mt-4">
            <h3 className="text-lg font-game-round font-bold text-white">{student.name}</h3>
            <p className="text-xs font-game-score text-purple-400 mt-0.5">Level {student.level} Student</p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-game btn-game-ghost w-full"
            >
              <Edit3 className="h-4 w-4" /> Customize Avatar
            </button>
          ) : (
            <button
              onClick={handleSaveAvatar}
              className="btn-game btn-game-primary w-full"
            >
              <Save className="h-4 w-4" /> Save Avatar
            </button>
          )}
        </motion.div>

        {/* Stats + Customization */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="md:col-span-2 space-y-6"
        >
          {isEditing ? (
            /* ─── Avatar Customizer ─── */
            <div className="game-card p-6 rounded-xl space-y-6 border-slate-700/30">
              <h3 className="text-base font-game-round font-bold text-white">
                <Settings className="h-4 w-4 inline mr-1.5 text-game-teal" /> Avatar Customizer
              </h3>

              {/* Skin tone */}
              <div className="space-y-3">
                <span className="text-xs font-game-body font-bold text-slate-400 uppercase tracking-wider">Skin Tone</span>
                <div className="flex gap-3">
                  {skinTones.map(t => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSkinTone(t.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        skinTone === t.value ? 'border-game-orange scale-110' : 'border-transparent hover:border-slate-600'
                      }`}
                      style={{ backgroundColor: t.value }}
                      title={t.name}
                    />
                  ))}
                </div>
              </div>

              {/* Hair style */}
              <div className="space-y-3">
                <span className="text-xs font-game-body font-bold text-slate-400 uppercase tracking-wider">Hair Style</span>
                <div className="flex gap-2">
                  {['short', 'long'].map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setHairStyle(style)}
                      className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                        hairStyle === style
                          ? 'bg-gradient-game text-white border-game-orange/30'
                          : 'bg-game-dark/60 text-slate-500 border-slate-700/30 hover:border-slate-600'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Uniform color */}
              <div className="space-y-3">
                <span className="text-xs font-game-body font-bold text-slate-400 uppercase tracking-wider">Uniform Color</span>
                <div className="flex gap-3">
                  {uniformColors.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setUniformColor(c.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        uniformColor === c.value ? 'border-game-orange scale-110' : 'border-transparent hover:border-slate-600'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Expression */}
              <div className="space-y-3">
                <span className="text-xs font-game-body font-bold text-slate-400 uppercase tracking-wider">Expression</span>
                <div className="flex gap-2">
                  {['happy', 'focused'].map(exp => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setExpression(exp)}
                      className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                        expression === exp
                          ? 'bg-gradient-game text-white border-game-orange/30'
                          : 'bg-game-dark/60 text-slate-500 border-slate-700/30 hover:border-slate-600'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ─── Stats ─── */
            <div className="space-y-4">
              {/* XP Progress */}
              <XPProgressBar currentXP={student.totalXP || 0} level={student.level || 1} size="lg" />

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="game-card p-4 rounded-xl border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-game-orange/20 to-game-orange/10 border border-game-orange/20 flex items-center justify-center">
                      <Star className="h-5 w-5 text-game-orange" />
                    </div>
                    <div>
                      <span className="text-[10px] font-game-body font-bold text-slate-500 uppercase tracking-wider block">Total XP</span>
                      <span className="text-lg font-game-score font-bold text-white">{student.totalXP || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="game-card p-4 rounded-xl border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-game-yellow/20 to-game-yellow/10 border border-game-yellow/20 flex items-center justify-center">
                      <Coins className="h-5 w-5 text-game-yellow" />
                    </div>
                    <div>
                      <span className="text-[10px] font-game-body font-bold text-slate-500 uppercase tracking-wider block">Coins</span>
                      <span className="text-lg font-game-score font-bold text-game-yellow">₹{student.coins || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="game-card p-4 rounded-xl border-slate-700/30 col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Award className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-game-body font-bold text-slate-500 uppercase tracking-wider block">Achievements</span>
                      <span className="text-sm font-game-body font-semibold text-slate-200">First Steps, Clue Hunter unlocked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
