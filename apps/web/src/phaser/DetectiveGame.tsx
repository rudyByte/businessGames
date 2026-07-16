// apps/web/src/phaser/DetectiveGame.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PhaserGame, PhaserGameRef } from './PhaserGame';
import { EventBridge, PHASER_EVENTS, REACT_EVENTS } from './EventBridge';
import api from '../lib/api';
import ChapterCompleteScreen from '../components/game/ChapterCompleteScreen';
import ValidationLevel from '../components/game/detective/ValidationLevel';
import AssessmentModal from '../components/ui/AssessmentModal';
import PreetiMessage from '../components/game/story/PreetiMessage';

// Scenes
import { DetectivePreloaderScene } from './scenes/detective/DetectivePreloaderScene';
import { DetectiveHQScene } from './scenes/detective/DetectiveHQScene';
import { SchoolInvestigationScene } from './scenes/detective/SchoolInvestigationScene';
import { MarketInvestigationScene } from './scenes/detective/MarketInvestigationScene';
import { HomeInvestigationScene } from './scenes/detective/HomeInvestigationScene';
import { EvidenceBoardScene } from './scenes/detective/EvidenceBoardScene';

interface Clue {
  id: string;
  label: string;
  description: string;
  xp: number;
}

// ─── Clue Discovered Modal ──────────────────────────────────────────────────
function ClueDiscoveredOverlay({ clue, onClose }: { clue: Clue; onClose: () => void }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-50 p-6 flex justify-center"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 25 }}
    >
      <div className="card-glass w-full max-w-2xl p-6 flex flex-col md:flex-row gap-6 relative shadow-glow-teal">
        {/* Stamp Effect */}
        <motion.div
          className="w-20 h-20 bg-teal/20 rounded-full flex items-center justify-center text-4xl border border-teal/40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring' }}
        >
          🔍
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="badge-game badge-xp">EVIDENCE FOUND</span>
            <span className="text-xs" style={{ color: '#FFE66D' }}>+{clue.xp} XP</span>
          </div>

          <h3 className="font-game text-xl mb-1 text-white" style={{ fontFamily: "'Fredoka One', cursive" }}>
            {clue.label}
          </h3>
          <p className="text-sm mb-4" style={{ color: '#A8B2D8' }}>
            {clue.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['High priority bottleneck', 'Minor operational issue', 'Resource management gap', 'Communication failure'].map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold text-left transition-all border ${
                  selectedOption === opt
                    ? 'border-orange bg-orange/20 text-orange'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={!selectedOption}
          className="btn-game btn-primary self-end px-6 py-3 text-sm disabled:opacity-50"
        >
          Add to Case File 💼
        </button>
      </div>
    </motion.div>
  );
}

// ─── NPC Dialogue Overlay ───────────────────────────────────────────────────
function NPCDialogueOverlay({ npc, onClose }: { npc: { name: string; greeting: string }; onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: 'npc' | 'player'; content: string }[]>([
    { role: 'npc', content: npc.greeting }
  ]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const playerMsg = inputText;
    setMessages(prev => [...prev, { role: 'player', content: playerMsg }]);
    setInputText('');
    setTyping(true);

    try {
      const res = await api.post('/games/ai/npc-chat', {
        npcId: npc.name,
        npcContext: npc.greeting,
        sceneContext: 'Greenfield School Canteen',
        playerQuestion: playerMsg,
        conversationHistory: messages.map(m => ({
          role: m.role === 'npc' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      });
      const response = res.data?.data?.response || 'Achaa! Keep investigating, you might find something useful!';
      setMessages(prev => [...prev, { role: 'npc', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'npc', content: 'Interesting. Let me know what else you discover!' }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center p-6">
      <div className="card-glass w-full max-w-3xl p-6 flex flex-col md:flex-row gap-6">
        {/* Character avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 bg-orange/20 rounded-2xl flex items-center justify-center text-5xl border-2 border-orange">
            🧑
          </div>
          <span className="font-game text-sm text-orange" style={{ fontFamily: "'Fredoka One', cursive" }}>
            {npc.name}
          </span>
        </div>

        {/* Conversation flow */}
        <div className="flex-1 flex flex-col justify-between min-h-[160px]">
          <div className="max-h-[140px] overflow-y-auto mb-4 space-y-2 pr-2">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === 'player' ? 'text-teal text-right' : 'text-white'}`}>
                <span className="font-semibold">{m.role === 'player' ? 'You: ' : `${npc.name}: `}</span>
                {m.content}
              </div>
            ))}
            {typing && <div className="text-xs text-muted">Typing...</div>}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 bg-bg-deep rounded-xl px-4 py-2 text-sm text-white outline-none border border-white/10 focus:border-teal"
            />
            <button onClick={sendMessage} className="btn-game btn-secondary py-2 px-4 text-xs font-bold">
              Send 🚀
            </button>
            <button onClick={onClose} className="btn-game btn-primary py-2 px-4 text-xs font-bold">
              Done ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scene Complete Overlay ─────────────────────────────────────────────────
function SceneCompleteOverlay({ result, onContinue }: { result: { scene: string; cluesFound: number; timeElapsed: number }; onContinue: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
      <motion.div
        className="card-glass text-center p-8 max-w-sm"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="font-game text-3xl text-gradient-orange mb-2" style={{ fontFamily: "'Fredoka One', cursive" }}>
          SCENE COMPLETE!
        </h2>
        <p className="text-sm mb-6" style={{ color: '#A8B2D8' }}>
          Amazing job! You identified Greenfield School's core business problems.
        </p>

        <div className="flex justify-center gap-6 mb-6">
          <div>
            <div className="text-2xl font-score text-teal">{result.cluesFound}/6</div>
            <div className="text-xs text-muted">Clues Found</div>
          </div>
          <div>
            <div className="text-2xl font-score text-gold">{result.timeElapsed}s</div>
            <div className="text-xs text-muted">Time Taken</div>
          </div>
        </div>

        <button onClick={onContinue} className="btn-game btn-primary w-full text-sm">
          Rank Opportunities →
        </button>
      </motion.div>
    </div>
  );
}

export const DetectiveGame = () => {
  const phaserRef = useRef<PhaserGameRef>(null);
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<any>(null);
  const [sceneCompleteResult, setSceneCompleteResult] = useState<any>(null);

  // Progression states
  const [progress, setProgress] = useState<any>(null);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [chapterCompleteData, setChapterCompleteData] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showBridge, setShowBridge] = useState(false);

  // Fetch progress on mount
  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await api.get('/games/problem-hunt/progress');
        setProgress(res.data.data);
      } catch (err) {
        console.warn('Failed to load game progress:', err);
      }
    }
    fetchProgress();
  }, []);

  const handleGameReady = useCallback((game: Phaser.Game) => {
    if (progress) {
      game.registry.set('progress', progress);
    }
  }, [progress]);

  // Sync progress if loaded after game ready
  useEffect(() => {
    if (progress && phaserRef.current?.game) {
      phaserRef.current.game.registry.set('progress', progress);
    }
  }, [progress]);

  const DETECTIVE_CONFIG: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#0D0D1A',
    scene: [
      DetectivePreloaderScene,
      DetectiveHQScene,
      SchoolInvestigationScene,
      MarketInvestigationScene,
      HomeInvestigationScene,
      EvidenceBoardScene
    ],
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false }
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  useEffect(() => {
    const handleOpenModal = (event: any) => {
      setActiveModal(event);
    };

    const handleSceneComplete = async (event: any) => {
      if (event.scene === 'school') {
        setSceneCompleteResult(event);
      } else if (event.scene === 'evidence_board') {
        try {
          const list = Object.entries(event.placements).map(([problemId, priority]) => {
            const size = priority === 'big' ? 5 : priority === 'medium' ? 3 : 1;
            return {
              problemId,
              size,
              frequency: size,
              solvability: 3,
              totalScore: size * 20
            };
          });

          const res = await api.post('/games/detective/ranking-submit', {
            levelId: 'canteen_queue',
            rankings: list
          });

          setChapterCompleteData({
            score: res.data.data.score || 800,
            maxScore: 1000,
            xpEarned: res.data.data.xpEarned || 100,
            coinsEarned: res.data.data.coinsEarned || 50,
          });
          setShowChapterComplete(true);
        } catch (err) {
          console.error('Failed to submit rankings:', err);
          // Fallback to local complete
          setChapterCompleteData({
            score: 800,
            maxScore: 1000,
            xpEarned: 150,
            coinsEarned: 50,
          });
          setShowChapterComplete(true);
        }
      }
    };

    EventBridge.on(PHASER_EVENTS.OPEN_MODAL, handleOpenModal);
    EventBridge.on(PHASER_EVENTS.SCENE_COMPLETE, handleSceneComplete);

    return () => {
      EventBridge.off(PHASER_EVENTS.OPEN_MODAL, handleOpenModal);
      EventBridge.off(PHASER_EVENTS.SCENE_COMPLETE, handleSceneComplete);
    };
  }, [navigate]);

  const handleCloseClue = () => {
    setActiveModal(null);
    EventBridge.emit(REACT_EVENTS.RESUME_GAME, {});
  };

  const handleCloseNPC = () => {
    setActiveModal(null);
    EventBridge.emit(REACT_EVENTS.RESUME_GAME, {});
  };

  const handleNextPhase = () => {
    setSceneCompleteResult(null);
    // Transition to the Evidence Board scene
    if (phaserRef.current?.game) {
      phaserRef.current.game.scene.stop('SchoolInvestigation');
      phaserRef.current.game.scene.start('EvidenceBoard');
    }
  };

  const handleReplay = () => {
    setShowChapterComplete(false);
    if (phaserRef.current?.game) {
      const game = phaserRef.current.game;
      game.scene.stop('EvidenceBoard');
      game.scene.start('SchoolInvestigation');
    }
  };

  const handleContinueChapterComplete = () => {
    setShowChapterComplete(false);
    setShowQuiz(true);
  };

  const handleQuizComplete = () => {
    setShowQuiz(false);
    setShowValidation(true);
  };

  const handleValidationComplete = async (validationData: any) => {
    try {
      await api.post('/games/detective/validation-complete', {
        problemId: 'canteen_queue',
        validationData,
        insights: 'Verified that canteen queues represent a high-frequency, high-urgency pain point with customer willingness to pay.'
      });
    } catch (err) {
      console.warn('Failed to save validation complete:', err);
    }
    setShowValidation(false);
    setShowBridge(true);
  };

  return (
    <div className="fixed inset-0 w-full h-full z-40 bg-bg-deep overflow-hidden">
      <PhaserGame ref={phaserRef} config={DETECTIVE_CONFIG} onGameReady={handleGameReady} />

      {/* React Overlays */}
      <AnimatePresence>
        {activeModal && activeModal.type === 'clue_discovered' && (
          <ClueDiscoveredOverlay clue={activeModal.clue} onClose={handleCloseClue} />
        )}
      </AnimatePresence>

      {activeModal && activeModal.type === 'npc_dialogue' && (
        <NPCDialogueOverlay npc={activeModal.npc} onClose={handleCloseNPC} />
      )}

      <AnimatePresence>
        {sceneCompleteResult && (
          <SceneCompleteOverlay result={sceneCompleteResult} onContinue={handleNextPhase} />
        )}
      </AnimatePresence>

      {/* Chapter Complete Screen */}
      <AnimatePresence>
        {showChapterComplete && chapterCompleteData && (
          <ChapterCompleteScreen
            chapterNumber={1}
            chapterTitle="Opportunity Discovery"
            gameName="Problem Hunt"
            score={chapterCompleteData.score}
            maxScore={chapterCompleteData.maxScore}
            xpEarned={chapterCompleteData.xpEarned}
            coinsEarned={chapterCompleteData.coinsEarned}
            onContinue={handleContinueChapterComplete}
            onReplay={handleReplay}
          />
        )}
      </AnimatePresence>

      {/* Chapter Ending Quiz */}
      <AssessmentModal
        assessmentId="opportunity_or_not"
        open={showQuiz}
        onComplete={handleQuizComplete}
        onClose={() => setShowQuiz(false)}
      />

      {/* Customer Validation Level */}
      <AnimatePresence>
        {showValidation && (
          <ValidationLevel
            discoveredClues={{}}
            onComplete={handleValidationComplete}
          />
        )}
      </AnimatePresence>

      {/* PreetiMessage Bridge to Simulator */}
      <AnimatePresence>
        {showBridge && (
          <div className="absolute inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full">
              <PreetiMessage
                message={{
                  id: 'validation_success',
                  message: "Arre waah! You've validated the canteen queue problem with Rohan and Mrs. Patel! 🥳 Now you are ready to build a real solution. Let's go to the Startup Galaxy and build your business!",
                  mood: 'proud',
                  actionLabel: 'Launch Startup Galaxy! 🚀',
                  onAction: () => {
                    navigate('/student/games/simulator');
                  }
                }}
                onDismiss={() => {
                  setShowBridge(false);
                  navigate('/student');
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
