// apps/web/src/phaser/StartupWarsGame.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PhaserGame, PhaserGameRef } from './PhaserGame';
import { EventBridge, PHASER_EVENTS, REACT_EVENTS } from './EventBridge';
import { useSimulatorStore } from '../stores/simulatorStore';
import api from '../lib/api';

// Scenes
import { SimulatorPreloaderScene } from './scenes/simulator/SimulatorPreloaderScene';
import { StartupNameScene } from './scenes/simulator/StartupNameScene';
import { SimulatorHQScene } from './scenes/simulator/SimulatorHQScene';
import { BusinessDayScene } from './scenes/simulator/BusinessDayScene';
import { InvestorPitchScene } from './scenes/simulator/InvestorPitchScene';


interface RoundResult {
  scene: string;
  revenue: number;
  served: number;
}

// ─── Round Complete Modal ──────────────────────────────────────────────────
function RoundCompleteOverlay({ result, onContinue }: { result: RoundResult; onContinue: () => void }) {
  const marketing = useSimulatorStore((s) => s.marketing);
  const overhead = 2000;
  const totalCost = overhead + marketing;
  const profit = result.revenue - totalCost;

  return (
    <div className="absolute inset-0 bg-black/75 z-50 flex items-center justify-center p-6 font-body">
      <motion.div
        className="card-glass text-center p-8 max-w-sm w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3 className="font-game text-2xl text-gradient-orange mb-4" style={{ fontFamily: "'Fredoka One', cursive" }}>
          WEEKLY STATEMENT 📊
        </h3>

        <div className="space-y-3 mb-6 text-sm text-left" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/70">Customers Served:</span>
            <span className="font-bold text-white">{result.served}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/70">Gross Revenue:</span>
            <span className="font-bold text-gold">+₹{result.revenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/70">Overhead & Marketing:</span>
            <span className="font-bold text-danger">-₹{totalCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <span>Net Profit:</span>
            <span className={profit >= 0 ? 'text-success' : 'text-danger'}>
              {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()}
            </span>
          </div>
        </div>

        <button onClick={onContinue} className="btn-game btn-primary w-full text-sm">
          Next Week Strategy 🚀
        </button>
      </motion.div>
    </div>
  );
}

// ─── Pitch Complete Modal ──────────────────────────────────────────────────
function PitchCompleteOverlay({ result, onDone }: { result: any; onDone: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-6">
      <motion.div
        className="card-glass text-center p-8 max-w-sm w-full"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <div className="text-6xl mb-4">🦈</div>
        <h3 className="font-game text-3xl text-gradient-gold mb-2" style={{ fontFamily: "'Fredoka One', cursive" }}>
          PITCH SUCCESSFUL!
        </h3>
        <p className="text-sm mb-6" style={{ color: '#A8B2D8' }}>
          Congratulations! The investors finalized an offer for your startup.
        </p>

        <div className="space-y-2 mb-6">
          <div>
            <div className="text-xs text-muted">Grade Rating</div>
            <div className="text-3xl font-score font-bold text-teal">{result.grade}</div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-muted">Seed Funding Offered</div>
            <div className="text-3xl font-score font-bold text-gold">₹{result.offer.toLocaleString()}</div>
          </div>
        </div>

        <button onClick={onDone} className="btn-game btn-primary w-full text-sm">
          Finish Game 🏆
        </button>
      </motion.div>
    </div>
  );
}

export const StartupWarsGame = () => {
  const phaserRef = useRef<PhaserGameRef>(null);
  const navigate = useNavigate();
  
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [pitchResult, setPitchResult] = useState<any>(null);

  const currentRound = useSimulatorStore((s) => s.currentRound);
  const addRoundResult = useSimulatorStore((s) => s.addRoundResult);
  const resetAll = useSimulatorStore((s) => s.resetAll);

  const SIMULATOR_CONFIG: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#0D0D1A',
    scene: [
      SimulatorPreloaderScene,
      StartupNameScene,
      SimulatorHQScene,
      BusinessDayScene,
      InvestorPitchScene,
    ],
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  useEffect(() => {
    const handleSceneComplete = (event: any) => {
      if (event.scene === 'simulator_round') {
        setRoundResult(event);
      } else if (event.scene === 'investor_pitch') {
        setPitchResult(event);
      }
    };

    EventBridge.on(PHASER_EVENTS.SCENE_COMPLETE, handleSceneComplete);

    return () => {
      EventBridge.off(PHASER_EVENTS.SCENE_COMPLETE, handleSceneComplete);
    };
  }, []);

  const handleRoundDone = async () => {
    if (roundResult) {
      try {
        const marketing = parseInt(localStorage.getItem('campusedge_marketing') || '1000');
        const price = parseInt(localStorage.getItem('campusedge_price') || '50');
        const overhead = 2000;
        const totalCost = overhead + marketing;
        const profit = roundResult.revenue - totalCost;

        await api.post('/games/simulator/round-complete', {
          decisions: { price, marketing },
          results: { profit, revenue: roundResult.revenue, served: roundResult.served },
          nextSaveState: { currentRound: currentRound + 1 }
        });
      } catch {}

      // Update Zustand state
      addRoundResult({
        revenue: roundResult.revenue,
        served: roundResult.served,
      });
    }

    setRoundResult(null);

    const nextWeek = currentRound + 1;

    if (phaserRef.current?.game) {
      phaserRef.current.game.scene.stop('BusinessDay');
      
      if (nextWeek > 3) { // Let's shorten it to 3 rounds for fast gameplay preview
        phaserRef.current.game.scene.start('InvestorPitch');
      } else {
        const hqScene = phaserRef.current.game.scene.getScene('SimulatorHQ') as any;
        if (hqScene) {
          hqScene.currentWeek = nextWeek;
          hqScene.currentCash = useSimulatorStore.getState().cash;
        }
        phaserRef.current.game.scene.start('SimulatorHQ');
      }
    }
  };

  const handlePitchDone = async () => {
    try {
      await api.post('/games/simulator/capstone-submit', {
        pitchData: {
          grade: pitchResult.grade,
          funding: pitchResult.offer,
        }
      });
    } catch {}

    setPitchResult(null);
    resetAll();
    navigate('/student'); // return back to dashboard
  };

  return (
    <div className="fixed inset-0 w-full h-full z-40 bg-bg-deep overflow-hidden">
      <PhaserGame ref={phaserRef} config={SIMULATOR_CONFIG} />

      {/* React Overlays */}
      <AnimatePresence>
        {roundResult && (
          <RoundCompleteOverlay result={roundResult} onContinue={handleRoundDone} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pitchResult && (
          <PitchCompleteOverlay result={pitchResult} onDone={handlePitchDone} />
        )}
      </AnimatePresence>
    </div>
  );
};
