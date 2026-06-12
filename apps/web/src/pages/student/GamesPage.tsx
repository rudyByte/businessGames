import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Gamepad2, MapPin, Building, Star } from 'lucide-react';

export default function GamesPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 bg-purple-950/5">
        <h1 className="text-2xl font-bold font-display text-white">Games Catalog 🎮</h1>
        <p className="text-slate-400 text-xs mt-1">
          Explore our curricular games designed to help you practice real business skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Game 1 */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between hover:border-purple-500/20 transition-all">
          <div className="bg-purple-900/10 p-8 flex items-center justify-center border-b border-slate-800">
            <Trophy className="h-16 w-16 text-purple-400" />
          </div>
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-display">Problem Hunt Detective</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Step into the shoes of Kabir, a junior problem detective. Walk through 3D environments like school canteens and local markets, search for clue objects, and interview NPCs to discover hidden problems.
              </p>
              <div className="flex gap-4 text-[10px] text-slate-500 font-semibold uppercase">
                <span>Chapters: 3</span>
                <span>Levels: 10 per Chapter</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/student/games/detective')}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2.5 rounded-lg border border-purple-500/20 transition-colors"
            >
              Start Investigation
            </button>
          </div>
        </div>

        {/* Game 2 */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between hover:border-blue-500/20 transition-all">
          <div className="bg-blue-900/10 p-8 flex items-center justify-center border-b border-slate-800">
            <Building className="h-16 w-16 text-blue-400" />
          </div>
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-display">Startup Simulator</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Build your own brand, hire complementary team members, set selling prices, run advertising campaigns, and execute weekly business rounds. End with pitching your traction to Shark Tank!
              </p>
              <div className="flex gap-4 text-[10px] text-slate-500 font-semibold uppercase">
                <span>Chapters: 4</span>
                <span>Rounds: 12 Business Weeks</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/student/games/simulator')}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg border border-blue-500/20 transition-colors"
            >
              Launch Startup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
