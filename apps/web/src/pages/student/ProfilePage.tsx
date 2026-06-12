import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Star, Award, Settings, Shield, Edit3, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateAvatar } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // Avatar config forms
  const defaultAvatar = {
    skinTone: '#F3D2C1',
    hairStyle: 'short',
    hairColor: '#000000',
    uniformColor: '#4A90D9',
    accessory: 'none',
    expression: 'happy'
  };

  const student = user?.student || {
    name: 'Aryan Goel',
    level: 2,
    totalXP: 320,
    coins: 150,
    avatarConfig: defaultAvatar
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
    { name: 'Brown', value: '#8D5524' }
  ];

  const uniformColors = [
    { name: 'Blue', value: '#4A90D9' },
    { name: 'Green', value: '#2C5F2E' },
    { name: 'Red', value: '#A8201A' },
    { name: 'Gold', value: '#FFB800' }
  ];

  const handleSaveAvatar = async () => {
    await updateAvatar({
      skinTone,
      hairStyle,
      hairColor,
      uniformColor,
      accessory: 'none',
      expression
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 bg-purple-950/5">
        <h1 className="text-2xl font-bold font-display text-white">Student Profile 👤</h1>
        <p className="text-slate-400 text-xs mt-1">
          Customize your avatar, check your learning badges, and view game progress metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar customizer card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center space-y-4 justify-between">
          <div className="flex flex-col items-center space-y-4">
            {/* Composed SVG Avatar */}
            <div className="w-24 h-24 rounded-full border border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center relative">
              <svg className="w-20 h-20" viewBox="0 0 100 100">
                {/* Background Face */}
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
                
                {/* Mouth Expression */}
                {expression === 'happy' ? (
                  <path d="M42,58 Q50,66 58,58" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <line x1="42" y1="60" x2="58" y2="60" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                )}

                {/* Collar/Uniform */}
                <path d="M30,80 L70,80 L65,95 L35,95 Z" fill={uniformColor} />
              </svg>
            </div>
            
            <div className="text-center">
              <h3 className="text-base font-bold text-white tracking-tight">{student.name}</h3>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mt-1">Level {student.level} Student</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-slate-900 border border-slate-800 text-xs font-semibold py-2 rounded-lg text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" /> Customize Avatar
            </button>
          ) : (
            <button
              onClick={handleSaveAvatar}
              className="w-full bg-purple-600 border border-purple-500/20 text-xs font-semibold py-2 rounded-lg text-white hover:bg-purple-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Save className="h-3.5 w-3.5" /> Save Configuration
            </button>
          )}
        </div>

        {/* Customization Details or Stats */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          {isEditing ? (
            <div className="space-y-6 text-xs">
              <h3 className="font-bold text-white text-sm">Avatar Customizer</h3>
              
              <div className="space-y-4">
                {/* Skin tone selection */}
                <div>
                  <span className="block text-slate-400 font-semibold mb-2">Skin Tone</span>
                  <div className="flex gap-3">
                    {skinTones.map(t => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setSkinTone(t.value)}
                        className={`w-7 h-7 rounded-full border-2 ${
                          skinTone === t.value ? 'border-purple-500' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: t.value }}
                        title={t.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair styles selection */}
                <div>
                  <span className="block text-slate-400 font-semibold mb-2">Hair Style</span>
                  <div className="flex gap-2">
                    {['short', 'long'].map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setHairStyle(style)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold uppercase tracking-wider ${
                          hairStyle === style
                            ? 'bg-purple-600/25 border-purple-500 text-purple-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {style} hair
                      </button>
                    ))}
                  </div>
                </div>

                {/* Uniform colors selection */}
                <div>
                  <span className="block text-slate-400 font-semibold mb-2">Uniform Color</span>
                  <div className="flex gap-3">
                    {uniformColors.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setUniformColor(c.value)}
                        className={`w-7 h-7 rounded-full border-2 ${
                          uniformColor === c.value ? 'border-purple-500' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Face expressions */}
                <div>
                  <span className="block text-slate-400 font-semibold mb-2">Expression</span>
                  <div className="flex gap-2">
                    {['happy', 'focused'].map(exp => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => setExpression(exp)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold uppercase tracking-wider ${
                          expression === exp
                            ? 'bg-purple-600/25 border-purple-500 text-purple-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="font-bold font-display text-white text-base">Student Analytics</h3>
              
              <div className="grid grid-cols-2 gap-6 text-xs text-slate-350">
                <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Level XP</span>
                  <p className="text-lg font-bold text-white">{student.totalXP} XP</p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Virtual Rupees</span>
                  <p className="text-lg font-bold text-yellow-400">₹{student.coins}</p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1 col-span-2 flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-600/15 text-purple-400 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Achievements Showcase</span>
                    <p className="text-sm font-semibold text-slate-200">First Steps, Clue Hunter unlocked.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
