import React, { useState } from 'react';
import { ArrowRight, Sparkles, Layout, Palette, Heart, CheckCircle2 } from 'lucide-react';
import api from '../../../lib/api';

interface BrandBuilderProps {
  onComplete: (saveState: any) => void;
}

export default function BrandBuilder({ onComplete }: BrandBuilderProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [startupName, setStartupName] = useState('');
  const [tagline, setTagline] = useState('');
  
  // Logo configs
  const [iconId, setIconId] = useState('box');
  const [logoColor, setLogoColor] = useState('#4A90D9');
  const [fontStyle, setFontStyle] = useState('Professional');
  
  // Mission configs
  const [whoText, setWhoText] = useState('school students');
  const [whatText, setWhatText] = useState('waste recess waiting time');
  const [howText, setHowText] = useState('delivering hot samosas directly to classrooms');

  const [aiNames, setAiNames] = useState<string[]>([]);
  const [isLoadingNames, setIsLoadingNames] = useState(false);

  const icons = [
    { id: 'box', char: '📦', name: 'Delivery Box' },
    { id: 'samosa', char: '🥟', name: 'Food/Samosa' },
    { id: 'book', char: '📖', name: 'Education' },
    { id: 'scooter', char: '🛵', name: 'Logistics' },
    { id: 'phone', char: '📱', name: 'Digital App' }
  ];

  const colors = [
    { name: 'Blue', value: '#4A90D9' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Gold', value: '#eab308' },
    { name: 'Purple', value: '#a855f7' }
  ];

  const generateNames = async () => {
    setIsLoadingNames(true);
    try {
      // simple local Indian startup names list fallback or API call
      setAiNames([
        'SpeedySamosa Services',
        'Tiffin Busters Pune',
        'QuickChow Canteen',
        'CampusBite Delivery',
        'RecessExpress Wallet'
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingNames(false);
    }
  };

  const handleComplete = async () => {
    const brandConfig = {
      startupName,
      tagline: tagline || `Fast preordering for ${whoText}`,
      logoConfig: {
        iconId,
        color: logoColor,
        fontStyle
      },
      colors: {
        primary: logoColor,
        secondary: '#1e293b'
      }
    };

    try {
      const res = await api.post('/games/simulator/save-brand', { brandConfig });
      onComplete(res.data.data.save);
    } catch (err) {
      console.error('Failed to save brand config:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-6 md:p-8 border border-slate-800 font-sans text-xs">
      
      {/* Horizontal Steps Indicator */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-850 mb-8">
        {[
          { label: 'Name', num: 1 },
          { label: 'Logo', num: 2 },
          { label: 'Mission', num: 3 },
          { label: 'Review', num: 4 }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              step === s.num ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-500'
            }`}>
              {s.num}
            </span>
            <span className={`font-semibold ${step === s.num ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Name & Tagline */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display">Pick Your Startup Name</h3>
            <p className="text-slate-400 text-xs">Choose a name that is memorable and describes your solution.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">Startup Name</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-2.5 text-slate-200 outline-none"
                placeholder="e.g. SpeedySamosa Solutions"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">Tagline / Mission phrase</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-2.5 text-slate-200 outline-none"
                placeholder="e.g. Samosas delivered hot in 2 minutes"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={generateNames}
                className="bg-slate-900 border border-slate-800 hover:text-white hover:border-purple-500/30 text-slate-400 font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="h-4.5 w-4.5 text-purple-400" />
                Generate AI Suggestions
              </button>
            </div>

            {aiNames.length > 0 && (
              <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">AI Ideas</span>
                <div className="flex flex-wrap gap-2">
                  {aiNames.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setStartupName(name)}
                      className="bg-slate-950 hover:bg-purple-950/20 hover:border-purple-500/20 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!startupName.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-800 disabled:text-slate-650 text-white font-bold py-2.5 rounded-xl border border-purple-500/20 transition-colors flex items-center justify-center gap-1"
          >
            Design Logo <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Logo Design */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display">Design Your Logo</h3>
            <p className="text-slate-400 text-xs">Pick an icon character, brand color, and font style.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Control Panel */}
            <div className="space-y-4">
              <div>
                <span className="block text-slate-400 font-semibold mb-2">Select Icon</span>
                <div className="flex gap-2">
                  {icons.map(i => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => setIconId(i.id)}
                      className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg ${
                        iconId === i.id ? 'border-purple-500 bg-purple-950/15' : 'border-slate-800 bg-slate-950'
                      }`}
                      title={i.name}
                    >
                      {i.char}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-slate-400 font-semibold mb-2">Primary Brand Color</span>
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setLogoColor(c.value)}
                      className={`w-7 h-7 rounded-full border-2 ${
                        logoColor === c.value ? 'border-purple-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-slate-400 font-semibold mb-2">Font Style</span>
                <div className="flex gap-2">
                  {['Bold', 'Playful', 'Professional'].map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFontStyle(style)}
                      className={`px-3 py-1.5 rounded-lg border font-semibold ${
                        fontStyle === style
                          ? 'bg-purple-600/25 border-purple-500 text-purple-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="border border-slate-800 rounded-2xl bg-slate-900/40 p-6 flex flex-col items-center justify-center space-y-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl"
                style={{ backgroundColor: `${logoColor}20`, border: `2px solid ${logoColor}` }}
              >
                {icons.find(i => i.id === iconId)?.char}
              </div>
              <div className="text-center space-y-1">
                <h4
                  className={`text-lg font-bold tracking-tight text-white ${
                    fontStyle === 'Bold' ? 'font-black' : fontStyle === 'Playful' ? 'font-game' : 'font-display'
                  }`}
                  style={{ color: logoColor }}
                >
                  {startupName}
                </h4>
                <p className="text-[10px] text-slate-400 italic">"{tagline || 'Tagline here'}"</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-slate-900 border border-slate-800 hover:text-white font-bold py-2.5 rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl border border-purple-500/20 transition-colors flex items-center justify-center gap-1"
            >
              Define Mission <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Mission Statement */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display">Define Your Business Mission</h3>
            <p className="text-slate-400 text-xs">Fill in the gaps to clarify who you serve and what value you offer.</p>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
              <p>
                We help{' '}
                <input
                  type="text"
                  className="bg-slate-950 border-b border-slate-700 focus:border-purple-500 px-2 py-0.5 outline-none text-white font-bold w-48 text-center"
                  value={whoText}
                  onChange={(e) => setWhoText(e.target.value)}
                />{' '}
                solve the problem of{' '}
                <input
                  type="text"
                  className="bg-slate-950 border-b border-slate-700 focus:border-purple-500 px-2 py-0.5 outline-none text-white font-bold w-64 text-center mt-2"
                  value={whatText}
                  onChange={(e) => setWhatText(e.target.value)}
                />
              </p>
              <p>
                by providing{' '}
                <input
                  type="text"
                  className="bg-slate-950 border-b border-slate-700 focus:border-purple-500 px-2 py-0.5 outline-none text-white font-bold w-full text-center mt-2"
                  value={howText}
                  onChange={(e) => setHowText(e.target.value)}
                />
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-slate-900 border border-slate-800 hover:text-white font-bold py-2.5 rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl border border-purple-500/20 transition-colors flex items-center justify-center gap-1"
            >
              Final Review <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review and Submit */}
      {step === 4 && (
        <div className="space-y-6 text-center">
          <div className="inline-flex p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-display">Confirm Brand Config</h3>
            <p className="text-slate-400 text-xs">Verify your company profile. Ready to launch?</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-sm mx-auto space-y-4">
            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl"
              style={{ backgroundColor: `${logoColor}20`, border: `2px solid ${logoColor}` }}
            >
              {icons.find(i => i.id === iconId)?.char}
            </div>
            
            <h4
              className={`text-lg font-bold ${
                fontStyle === 'Bold' ? 'font-black' : fontStyle === 'Playful' ? 'font-game' : 'font-display'
              }`}
              style={{ color: logoColor }}
            >
              {startupName}
            </h4>
            
            <p className="text-slate-300 text-xs leading-relaxed">
              "We help <span className="text-purple-400 font-bold">{whoText}</span> solve the problem of <span className="text-purple-400 font-bold">{whatText}</span> by providing <span className="text-green-400 font-bold">{howText}</span>."
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-slate-900 border border-slate-800 hover:text-white font-bold py-3 rounded-xl transition-colors"
            >
              Modify Config
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl border border-purple-500/20 transition-colors flex items-center justify-center gap-1"
            >
              Assemble Team <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
