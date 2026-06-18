import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';

// 3D & Scene Components
import GameCanvas from '../../3d/GameCanvas';
import PlayerCharacter from '../../3d/PlayerCharacter';
import SchoolScene from '../../3d/scenes/SchoolScene';
import MarketScene from '../../3d/scenes/MarketScene';

// UI components
import CaseFile from './CaseFile';
import NPCDialogueBox from './NPCDialogueBox';
import ValidationLevel from './ValidationLevel';

// Mechanic HUD components
import DetectiveRadar from './DetectiveRadar';
import RushTimer from './RushTimer';
import WitnessChain from './WitnessChain';
import CompareReveal from './CompareReveal';
import OpportunityMeter from './OpportunityMeter';
import ComboIndicator from './ComboIndicator';
import RivalBanner from './RivalBanner';

// Story / Character progression
import ComicCutscene from '../story/ComicCutscene';
import PreetiMessage from '../story/PreetiMessage';
import ChapterCompleteScreen from '../ChapterCompleteScreen';
import type { PreetiMessageData } from '../story/PreetiMessage';
import type { CutsceneData } from '../story/ComicCutscene';

// Detective store
import { useDetectiveStore } from '../../../stores/detectiveStore';

import {
  MapPin, BookOpen, User, ArrowLeft, Trophy,
  Search, CheckCircle2, ChevronRight,
  Sparkles, Compass, MessageSquare
} from 'lucide-react';

// ─── Game Phase Types ───────────────────────────────────────────────────────
type GamePhase =
  | 'briefing'
  | 'explore_school'
  | 'npc_school'
  | 'explore_market'
  | 'npc_market'
  | 'evidence_board'
  | 'validation'
  | 'report';

const PHASE_META: Record<GamePhase, { label: string; emoji: string; desc: string }> = {
  briefing: { label: 'Briefing', emoji: '📋', desc: 'Receive your mission' },
  explore_school: { label: 'School Investigation', emoji: '🏫', desc: 'Find problems in the school' },
  npc_school: { label: 'Interview: Raju Uncle', emoji: '👨‍🍳', desc: 'Talk to the canteen operator' },
  explore_market: { label: 'Market Investigation', emoji: '🏪', desc: 'Find problems in the market' },
  npc_market: { label: 'Interview: Sunil Bhai', emoji: '🧑‍🌾', desc: 'Talk to the vegetable vendor' },
  evidence_board: { label: 'Evidence Board', emoji: '🔍', desc: 'Rank problems by priority' },
  validation: { label: 'Customer Validation', emoji: '🎯', desc: 'Interview real stakeholders' },
  report: { label: 'Final Report', emoji: '🏆', desc: 'Review your findings' },
};

// ─── Clue Database ──────────────────────────────────────────────────────────
const SCHOOL_CLUES = [
  { id: 'canteen_queue', title: 'Canteen Counter', desc: 'Long queue! Recess ends before half the students get served hot samosas.', area: 'canteen' },
  { id: 'water_cooler', title: 'Water Cooler', desc: 'Water cooler completely empty and dry during Delhi summer heat.', area: 'playground' },
  { id: 'notice_board', title: 'Notice Board', desc: 'Important paper notices go unread because they look boring and get buried.', area: 'entrance' },
  { id: 'lost_found', title: 'Lost & Found Box', desc: 'Box overflowing with unclaimed water bottles and textbooks.', area: 'office' },
  { id: 'parking_pickup', title: 'School Gate Parking', desc: 'Chaotic vehicle layouts. Parents park randomly causing traffic during pickup.', area: 'gate' },
];

const MARKET_CLUES = [
  { id: 'vegetable_vendor', title: 'Vegetable Wastage', desc: 'Fresh vegetables spoil rapidly in the afternoon sun — 40% lost daily.', area: 'produce' },
  { id: 'tea_stall', title: 'Chai Stall Queue', desc: 'Huge queues at peak hours. Customers wait 15 minutes for one cup of tea.', area: 'food' },
  { id: 'rickshaw_stand', title: 'Auto-Rickshaw Mismatch', desc: 'Drivers wait hours for fares while passengers walk looking for autos.', area: 'transport' },
  { id: 'pharmacy_stock', title: 'Pharmacy Stockouts', desc: 'Regular medicines for diabetes and BP are frequently out of stock.', area: 'health' },
  { id: 'repair_shop', title: 'Slow Mobile Repairs', desc: 'Customers wait 3–5 days for simple screen replacements.', area: 'electronics' },
];

// ─── NPC Definitions ────────────────────────────────────────────────────────
const NPCS: Record<string, { id: string; name: string; emoji: string; context: string; scene: string }> = {
  canteen_uncle: {
    id: 'canteen_uncle', name: 'Raju Uncle', emoji: '👨‍🍳',
    context: 'canteen operator who struggles to serve 200+ students food during 15 min recess.',
    scene: 'school'
  },
  vegetable_vendor: {
    id: 'vegetable_vendor', name: 'Sunil Bhai', emoji: '🧑‍🌾',
    context: 'vegetable stall seller whose fresh green items spoil under Delhi sun heat.',
    scene: 'market'
  },
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function DetectiveGamePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // ─── Game State ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<GamePhase>('briefing');
  const [activeScene, setActiveScene] = useState<'school' | 'market'>('school');
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [discoveredClues, setDiscoveredClues] = useState<Record<string, string[]>>({ school: [], market: [] });
  const [clueSources, setClueSources] = useState<Record<string, 'explore' | 'npc'>>({});
  const [npcInterviews, setNpcInterviews] = useState<Record<string, boolean>>({});
  const [npcRevealedClue, setNpcRevealedClue] = useState<string | null>(null);
  const [lastDiscovered, setLastDiscovered] = useState<any | null>(null);
  const [showClueToast, setShowClueToast] = useState(false);

  // Overlays
  const [showCaseFile, setShowCaseFile] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showNpcChat, setShowNpcChat] = useState(false);
  const [activeNpc, setActiveNpc] = useState<any | null>(null);
  const [activeClueData, setActiveClueData] = useState<any | null>(null);

  // Results
  const [rankingsData, setRankingsData] = useState<any[] | null>(null);
  const [validationData, setValidationData] = useState<any | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showChapterComplete, setShowChapterComplete] = useState(false);

  // Story beats
  const [activeCutscene, setActiveCutscene] = useState<CutsceneData | null>(null);
  const [preetiMessage, setPreetiMessage] = useState<PreetiMessageData | null>(null);

  // ─── Story Beats ──────────────────────────────────────────────────────────
  // Check for pending cutscenes after major progress milestones
  const checkPendingCutscenes = useCallback(async () => {
    try {
      const res = await api.get('/story/pending-cutscene');
      const cutscenes = res.data.data?.cutscenes || [];
      if (cutscenes.length > 0) {
        // Show the first pending cutscene
        setActiveCutscene(cutscenes[0]);
      }
    } catch (err) {
      // Silently fail — story is non-critical
    }
  }, []);

  const handleCutsceneComplete = useCallback(async () => {
    if (activeCutscene) {
      try {
        await api.post('/story/complete-cutscene', { cutsceneId: activeCutscene.id });
      } catch (err) {
        // Silently fail
      }
    }
    setActiveCutscene(null);
    // Check if there are more pending cutscenes
    checkPendingCutscenes();
  }, [activeCutscene, checkPendingCutscenes]);

  const handlePreetiDismiss = useCallback(() => {
    setPreetiMessage(null);
  }, []);

  // ─── Reset Game (Dev Only) ────────────────────────────────────────────────
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetGame = useCallback(async () => {
    const initialState = {
      phase: 'briefing' as GamePhase,
      discoveredClues: { school: [], market: [] },
      clueSources: {} as Record<string, 'explore' | 'npc'>,
      npcInterviews: {} as Record<string, boolean>,
      activeScene: 'school' as 'school' | 'market',
      playerPosition: [0, 0, 0] as [number, number, number],
      rankingsData: null as any,
      validationData: null as any,
      showCaseFile: false,
      showValidation: false,
      showNpcChat: false,
      activeNpc: null as any,
      activeClueData: null as any,
      lastDiscovered: null as any,
      showClueToast: false,
      npcRevealedClue: null,
      showCompletion: false,
      showResetConfirm: false,
    };

    setPhase(initialState.phase);
    setDiscoveredClues(initialState.discoveredClues);
    setClueSources(initialState.clueSources);
    setNpcInterviews(initialState.npcInterviews);
    setActiveScene(initialState.activeScene);
    setPlayerPosition(initialState.playerPosition);
    setRankingsData(initialState.rankingsData);
    setValidationData(initialState.validationData);
    setShowCaseFile(initialState.showCaseFile);
    setShowValidation(initialState.showValidation);
    setShowNpcChat(initialState.showNpcChat);
    setActiveNpc(initialState.activeNpc);
    setActiveClueData(initialState.activeClueData);
    setLastDiscovered(initialState.lastDiscovered);
    setShowClueToast(initialState.showClueToast);
    setNpcRevealedClue(initialState.npcRevealedClue);
    setShowCompletion(initialState.showCompletion);
    setShowResetConfirm(false);

    // Overwrite saved progress on the API
    try {
      await api.post('/games/problem-hunt/progress/save', {
        currentChapter: 1,
        currentLevel: 1,
        status: 'NOT_STARTED',
        detectiveSave: initialState,
      });
    } catch (err) {
      console.warn('Reset save API call failed:', err);
    }
  }, []);

  // Auto-save tracking
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const npcToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Derived State ───────────────────────────────────────────────────────
  const schoolFound = discoveredClues.school?.length || 0;
  const marketFound = discoveredClues.market?.length || 0;
  const totalClues = SCHOOL_CLUES.length + MARKET_CLUES.length;
  const totalFound = schoolFound + marketFound;
  const sceneDiscovered = activeScene === 'school' ? (discoveredClues.school || []) : (discoveredClues.market || []);
  const currentClues = activeScene === 'school' ? SCHOOL_CLUES : MARKET_CLUES;

  // Phase unlock checks
  const canExploreMarket = npcInterviews.canteen_uncle === true;
  const canUseCaseFile = npcInterviews.canteen_uncle && npcInterviews.vegetable_vendor;
  const schoolComplete = schoolFound >= SCHOOL_CLUES.length;
  const marketComplete = marketFound >= MARKET_CLUES.length;

  // ─── Detective Store Integration (individual selectors for perf) ────────────
  const startRushModeStore = useDetectiveStore(s => s.startRushMode);

  // Rush mode timer — ticks every second during explore phases
  // Uses getState() to avoid re-render race conditions
  useEffect(() => {
    if (!phase.includes('explore')) return;

    if (!useDetectiveStore.getState().rushActive) {
      startRushModeStore();
    }

    const interval = setInterval(() => {
      useDetectiveStore.getState().tickRushTimer(1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, startRushModeStore]);

  // ─── Progress Save ───────────────────────────────────────────────────────
  const saveProgress = useCallback(async (silent = true) => {
    try {
      await api.post('/games/problem-hunt/progress/save', {
        currentChapter: 2,
        currentLevel: phase === 'report' ? 10 : Math.min(10, Math.max(1, Math.floor(totalFound / 2) + 1)),
        status: phase === 'report' ? 'COMPLETED' : 'IN_PROGRESS',
        detectiveSave: {
          phase,
          discoveredClues,
          clueSources,
          npcInterviews,
          activeScene,
          rankingsData,
          validationData,
        }
      });
    } catch (err) {
      if (!silent) console.error('Save failed:', err);
    }
  }, [phase, discoveredClues, clueSources, npcInterviews, activeScene, rankingsData, validationData]);

  // Auto-save when key state changes (debounced 2s)
  useEffect(() => {
    if (phase === 'briefing') return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveProgress(), 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [phase, discoveredClues, npcInterviews, rankingsData, validationData, saveProgress]);

  // Background auto-save every 60 seconds while game is active
  useEffect(() => {
    if (phase === 'briefing' || phase === 'report') return;
    intervalSaveRef.current = setInterval(() => {
      saveProgress();
    }, 60000);
    return () => {
      if (intervalSaveRef.current) {
        clearInterval(intervalSaveRef.current);
        intervalSaveRef.current = null;
      }
    };
  }, [phase, saveProgress]);

  // Save before unload (tab close, navigate away)
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveProgress]);

  // ─── Restore Progress ────────────────────────────────────────────────────
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await api.get('/games/problem-hunt/progress');
        const data = res.data.data;
        if (data?.detectiveSave) {
          const save = typeof data.detectiveSave === 'string' ? JSON.parse(data.detectiveSave) : data.detectiveSave;
          if (save.phase && save.phase !== 'briefing') {
            setPhase(save.phase);
            setDiscoveredClues(save.discoveredClues || { school: [], market: [] });
            setClueSources(save.clueSources || {});
            setNpcInterviews(save.npcInterviews || {});
            setActiveScene(save.activeScene || 'school');
            setRankingsData(save.rankingsData || null);
            setValidationData(save.validationData || null);
          }
        }
      } catch (err) {
        // First time playing - no save yet
      }
    };
    loadProgress();
  }, []);

  // ─── Clue Discovery ──────────────────────────────────────────────────────
  const handleInteractClue = useCallback((clueId: string, details: any) => {
    const isNew = !sceneDiscovered.includes(clueId);
    setActiveClueData({ id: clueId, ...details, isNew });

    if (isNew) {
      setDiscoveredClues(prev => ({
        ...prev,
        [activeScene]: [...(prev[activeScene] || []), clueId]
      }));
      setClueSources(prev => ({ ...prev, [clueId]: 'explore' }));
      setLastDiscovered(details);
      setShowClueToast(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setShowClueToast(false), 3000);

      // Record in detective store (combo, opportunity meter, rival)
      useDetectiveStore.getState().recordClueFound(clueId);

      // Show compare reveal after finding a clue
      useDetectiveStore.getState().showCompareReveal({
        studentProblem: details.title || clueId,
        realFounder: '"Nobody could find restaurant menus online" — Deepinder Goyal',
        founderName: 'Deepinder Goyal (Zomato)',
        rating: 'GREAT THINKING! Similar observation to a real founder!',
      });

      // Award XP via API
      api.post('/games/problem-hunt/levels/1/complete', {
        score: 100, maxScore: 1000, passed: true, timeSpent: 10,
        choices: { clueDiscovered: clueId },
        chapterNumber: activeScene === 'school' ? 2 : 3, levelNumber: 1
      }).then(() => useAuthStore.getState().checkAuth()).catch(() => {});
    }
  }, [activeScene, sceneDiscovered]);

  const handleNpcClueRevealed = useCallback((clueId: string, details: any) => {
    if (!sceneDiscovered.includes(clueId)) {
      setDiscoveredClues(prev => ({
        ...prev,
        [activeScene]: [...(prev[activeScene] || []), clueId]
      }));
      setClueSources(prev => ({ ...prev, [clueId]: 'npc' }));
      setActiveClueData({ id: clueId, ...details, isNew: true, fromNpc: true });
      setNpcRevealedClue(clueId);
      if (npcToastTimerRef.current) clearTimeout(npcToastTimerRef.current);
      npcToastTimerRef.current = setTimeout(() => setNpcRevealedClue(null), 4000);
    }
  }, [activeScene, sceneDiscovered]);

  // ─── NPC Interview ───────────────────────────────────────────────────────
  const handleOpenNpc = useCallback((npcKey: string) => {
    const npc = NPCS[npcKey];
    if (npc) {
      setActiveNpc(npc);
      setShowNpcChat(true);
    }
  }, []);

  const handleNpcClose = useCallback(() => {
    setShowNpcChat(false);
    setActiveNpc(null);
    // Mark NPC as interviewed
    if (activeNpc) {
      const npcKey = activeNpc.id;
      if (!npcInterviews[npcKey]) {
        setNpcInterviews(prev => ({ ...prev, [npcKey]: true }));
      }
    }
  }, [activeNpc, npcInterviews]);

  // ─── CaseFile / Rankings ─────────────────────────────────────────────────
  const handleSubmitRankings = useCallback(async (rankings: any[]) => {
    setRankingsData(rankings);
    setShowCaseFile(false);
    try {
      await api.post('/games/detective/ranking-submit', { levelId: '1', rankings });
    } catch (err) {
      console.error('Failed to submit rankings:', err);
    }
    // Auto-advance to validation phase
    setPhase('validation');
    setShowValidation(true);

    // Check for pending cutscenes after this milestone
    checkPendingCutscenes();
  }, [checkPendingCutscenes]);

  // ─── Validation ───────────────────────────────────────────────────────────
  const handleValidationComplete = useCallback(async (valData: any) => {
    setValidationData(valData);
    setShowValidation(false);
    try {
      await api.post('/games/detective/validation-complete', valData);
    } catch (err) {
      console.error('Failed to complete validation:', err);
    }
    setPhase('report');
    // Show chapter complete screen first, then final report + bridge
    setShowChapterComplete(true);

    // Check for pending cutscenes after validation complete
    checkPendingCutscenes();
  }, [checkPendingCutscenes]);

  const handleChapterCompleteContinue = useCallback(() => {
    setShowChapterComplete(false);
    setShowCompletion(true);

    // Show Preeti message congratulating with bridge to simulator
    setPreetiMessage({
      id: 'detective-complete',
      message: 'Wah Kabir! You identified real problems and validated them with actual customers! Yeh toh businessman ka pehla step hai! Mujhe pakka yakeen hai tumse kuch bada hoga! 🎉\n\nNow the real challenge begins — BUILD a solution! Your top-ranked problem has been saved. Head over to the Startup Galaxy to start building your business! 🚀',
      mood: 'excited',
      xpReward: 50,
      actionLabel: 'Go to Startup Galaxy!',
      onAction: () => { setShowCompletion(false); navigate('/student/games/simulator'); },
    });
  }, [navigate]);

  // ─── Phase Advancement ───────────────────────────────────────────────────
  const advancePhase = useCallback(() => {
    switch (phase) {
      case 'briefing':
        setPhase('explore_school');
        setActiveScene('school');
        break;
      case 'explore_school':
        if (schoolComplete) setPhase('npc_school');
        break;
      case 'npc_school':
        if (npcInterviews.canteen_uncle) {
          setPhase('explore_market');
          setActiveScene('market');
        }
        break;
      case 'explore_market':
        if (marketComplete) setPhase('npc_market');
        break;
      case 'npc_market':
        if (npcInterviews.vegetable_vendor) {
          setPhase('evidence_board');
          setShowCaseFile(true);
        }
        break;
      case 'evidence_board':
        // Handled by CaseFile submit -> validation
        break;
      case 'validation':
        // Handled by validation complete -> report
        break;
      case 'report':
        navigate('/student');
        break;
    }
  }, [phase, schoolComplete, marketComplete, npcInterviews, navigate]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden select-none bg-slate-950 font-sans text-xs">
      {/* ───── Top HUD ───── */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-slate-900/40 backdrop-blur-md border-b border-slate-800/40 px-6 flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student')}
            className="p-2 bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 font-semibold">
            <ArrowLeft className="h-4 w-4" /> Exit
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <span className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5 uppercase">
            <Trophy className="h-4.5 w-4.5 text-purple-400" />
            Problem Hunt
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Phase Indicator */}
          <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider hidden sm:block">
            {PHASE_META[phase].emoji} {PHASE_META[phase].label}
          </span>

          {/* 🔧 Dev Reset Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="DEV ONLY — Reset all game progress"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-950/60 border border-red-800/40 rounded-lg hover:bg-red-900/60 hover:border-red-600/50 transition-colors group"
          >
            <svg className="h-3.5 w-3.5 text-red-400 group-hover:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[9px] font-bold text-red-400 group-hover:text-red-300">Reset</span>
            <span className="text-[7px] font-bold uppercase tracking-widest bg-red-800/60 text-red-300 px-1.5 py-0.5 rounded">dev</span>
          </button>

          {/* Progress */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800/40 rounded-full">
            <div className="flex items-center gap-1">
              <Search className="h-3 w-3 text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400">{totalFound}/{totalClues}</span>
            </div>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(totalFound / totalClues) * 100}%` }} />
            </div>
          </div>

          {/* Mini-map */}
          {phase.includes('explore') && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-900/60 border border-slate-800/40 rounded-lg">
              <div className="relative w-14 h-14 bg-slate-950/60 rounded border border-slate-800/40 overflow-hidden">
                {currentClues.map((clue, i) => {
                  const positions = activeScene === 'school'
                    ? [{ x: 6, y: 5 }, { x: 14, y: 8 }, { x: 9, y: 10 }, { x: 13, y: 2 }, { x: 8, y: 2 }]
                    : [{ x: 4, y: 6 }, { x: 14, y: 5 }, { x: 5, y: 2 }, { x: 13, y: 3 }, { x: 8, y: 10 }];
                  const pos = positions[i];
                  const found = sceneDiscovered.includes(clue.id);
                  const fromNpc = clueSources[clue.id] === 'npc';
                  return (
                    <div key={clue.id}
                      className={`absolute w-1.5 h-1.5 rounded-full ${found ? (fromNpc ? 'bg-blue-400' : 'bg-green-400') : 'bg-yellow-500/40'}`}
                      style={{ left: `${(pos.x / 16) * 100}%`, top: `${(pos.y / 12) * 100}%` }}
                      title={found ? `${clue.title} ✅` : '?'}
                    />
                  );
                })}
                <div className="absolute w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-500/50"
                  style={{ left: `${((playerPosition[0] + 15) / 30) * 100}%`, top: `${((playerPosition[2] + 15) / 30) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───── 3D Scene ───── */}
      <div className="flex-1 w-full h-full relative z-10">
        <GameCanvas>
          <PlayerCharacter position={[0, 0, 0]} onPositionChange={setPlayerPosition} />
          {activeScene === 'school' ? (
            <SchoolScene playerPosition={playerPosition} discoveredClues={sceneDiscovered} onInteract={handleInteractClue} />
          ) : (
            <MarketScene playerPosition={playerPosition} discoveredClues={sceneDiscovered} onInteract={handleInteractClue} />
          )}
        </GameCanvas>
      </div>

      {/* ───── LEFT SIDE HUD ───── */}
      {phase.includes('explore') && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4">
          {/* Mechanic 1: Radar */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/30 rounded-2xl p-3">
            <DetectiveRadar />
          </div>

          {/* Mechanic 3: Witness Chain Arrow */}
          <WitnessChain />
        </div>
      )}

      {/* ───── RIGHT SIDE HUD ───── */}
      {phase.includes('explore') && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4">
          {/* Mechanic 5: Opportunity Meter */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/30 rounded-2xl p-3">
            <OpportunityMeter />
          </div>

          {/* Mechanic 7: Rival Detective */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/30 rounded-2xl p-3">
            <RivalBanner />
          </div>
        </div>
      )}

      {/* ───── TOP HUD EXTRAS ───── */}
      {phase.includes('explore') && (
        <div className="absolute top-16 right-4 z-30 flex items-center gap-2">
          {/* Mechanic 2: Rush Timer */}
          <RushTimer />
        </div>
      )}

      {/* ───── COMBO INDICATOR (floating) ───── */}
      <ComboIndicator />

      {/* ───── COMPARE REVEAL (bottom) ───── */}
      <CompareReveal />

      {/* ───── Clue Discovered Toast ───── */}
      <AnimatePresence>
        {showClueToast && lastDiscovered && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-28 left-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl border border-green-400/30 flex items-center gap-3 z-50"
          >
            <Sparkles className="h-4 w-4" />
            <span className="font-bold text-xs">🔍 Found: {lastDiscovered.title} <span className="font-normal opacity-80">+100 XP</span></span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── NPC Clue Reveal Toast ───── */}
      <AnimatePresence>
        {npcRevealedClue && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-20 left-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-3 rounded-full shadow-2xl border border-blue-400/30 flex items-center gap-3 z-50"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="font-bold text-xs">💬 NPC Revealed a New Clue! <span className="font-normal opacity-80">+150 XP</span></span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Active Clue Detail ───── */}
      <AnimatePresence>
        {activeClueData && (
          <div className="fixed inset-0 z-45 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setActiveClueData(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-sm w-full bg-slate-900 border border-yellow-500/20 rounded-2xl p-6 text-center space-y-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl">🔍</div>
              <div>
                {activeClueData.fromNpc && (
                  <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-full">
                    💬 Revealed by NPC
                  </span>
                )}
                <h3 className="text-lg font-bold text-white mt-1">{activeClueData.title}</h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">{activeClueData.desc}</p>
              <div className="flex justify-center gap-3">
                <span className="text-green-400 font-semibold text-[10px] flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> +100 XP
                </span>
                {activeClueData.fromNpc && (
                  <span className="text-blue-400 font-semibold text-[10px] flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> NPC Bonus
                  </span>
                )}
              </div>
              <button onClick={() => setActiveClueData(null)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold py-2 rounded-xl transition-colors">
                Continue Investigating
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── Bottom HUD ───── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
        {phase.includes('explore') && (
          <>
            {/* Scene Switch */}
            {((phase === 'explore_school' && schoolComplete) || (phase === 'explore_market' && canExploreMarket)) && (
              <button onClick={() => {
                const next = activeScene === 'school' ? 'market' : 'school';
                setActiveScene(next);
                if (phase === 'explore_school' && next === 'market') setPhase('explore_market');
              }}
                className="bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-xl border border-slate-700/60 transition-colors shadow-lg flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Go to {activeScene === 'school' ? 'Market' : 'School'}
                {activeScene === 'school' && !schoolComplete && (
                  <span className="text-[9px] text-yellow-400 ml-1">({schoolFound}/{SCHOOL_CLUES.length})</span>
                )}
              </button>
            )}

            {/* NPC Interview Button (visible when phase requires it) */}
            {(phase === 'npc_school' || (phase === 'explore_school' && schoolComplete)) && !npcInterviews.canteen_uncle && (
              <button onClick={() => handleOpenNpc('canteen_uncle')}
                className="bg-blue-600/80 backdrop-blur-md hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl border border-blue-500/20 transition-colors shadow-lg flex items-center gap-1.5">
                <User className="h-4 w-4" /> Interview Raju Uncle
              </button>
            )}
            {(phase === 'npc_market' || (phase === 'explore_market' && marketComplete)) && !npcInterviews.vegetable_vendor && (
              <button onClick={() => handleOpenNpc('vegetable_vendor')}
                className="bg-blue-600/80 backdrop-blur-md hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl border border-blue-500/20 transition-colors shadow-lg flex items-center gap-1.5">
                <User className="h-4 w-4" /> Interview Sunil Bhai
              </button>
            )}

            {/* CaseFile button - only when both NPCs interviewed */}
            {canUseCaseFile && (
              <button onClick={() => setShowCaseFile(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl border border-purple-500/20 transition-colors shadow-lg flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> Evidence Board
              </button>
            )}

            {/* Scene Progress */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-900/70 backdrop-blur-sm border border-slate-800/40 rounded-xl">
              <Compass className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[10px] text-slate-400">
                {activeScene === 'school' ? '🏫 School' : '🏪 Market'}
              </span>
              <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(sceneDiscovered.length / currentClues.length) * 100}%` }} />
              </div>
              <span className="text-[9px] text-slate-500 font-bold">{sceneDiscovered.length}/{currentClues.length}</span>
            </div>
          </>
        )}

        {/* Report phase - exit button */}
        {phase === 'report' && (
          <button onClick={() => navigate('/student')}
            className="bg-gradient-to-r from-purple-600 to-green-600 text-white font-bold py-3 px-8 rounded-xl border border-purple-500/20 shadow-lg flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Back to Dashboard
          </button>
        )}
      </div>

      {/* ───── Phase transition notification ───── */}
      <AnimatePresence>
        {phase === 'explore_school' && schoolComplete && !npcInterviews.canteen_uncle && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-400/30 z-50 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <p className="font-bold text-sm">School Investigation Complete!</p>
              <p className="text-[10px] text-blue-200">Now interview Raju Uncle to get his perspective</p>
            </div>
            <ChevronRight className="h-4 w-4 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'explore_market' && marketComplete && !npcInterviews.vegetable_vendor && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-400/30 z-50 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <p className="font-bold text-sm">Market Investigation Complete!</p>
              <p className="text-[10px] text-blue-200">Talk to Sunil Bhai next to get his insights</p>
            </div>
            <ChevronRight className="h-4 w-4 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Briefing Overlay ───── */}
      <AnimatePresence>
        {phase === 'briefing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-lg w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/20 rounded-2xl p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="text-6xl">🕵️‍♂️</div>
              <div className="space-y-1">
                <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px]">Problem Hunt Detective</span>
                <h2 className="text-2xl font-bold font-display text-white">Your Mission</h2>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm">
                Real entrepreneurs don't just build products — they <strong className="text-yellow-400">find problems</strong>.
                Your mission: explore <strong>Greenfield School</strong> and <strong>Rajpur Market</strong> to spot
                hidden problems. Each problem is a potential business opportunity!
              </p>
              <div className="grid grid-cols-2 gap-3 text-left">
                {[
                  { icon: '🔍', title: 'Find 5 Clues', desc: 'Walk around & click glowing objects' },
                  { icon: '💬', title: 'Interview NPCs', desc: 'Get insider perspectives' },
                  { icon: '📊', title: 'Rank Problems', desc: 'Sort by business potential' },
                  { icon: '🎯', title: 'Validate Ideas', desc: 'Interview real customers' },
                ].map((step, i) => (
                  <div key={i} className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl flex items-center gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <div className="font-bold text-white text-xs">{step.title}</div>
                      <div className="text-[10px] text-slate-500">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <motion.button
                onClick={advancePhase}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl border border-purple-500/20 transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🚀 Start Investigation
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── CaseFile ───── */}
      {showCaseFile && rankingsData === null && (
        <CaseFile
          discoveredClues={[
            ...SCHOOL_CLUES.filter(cl => (discoveredClues.school || []).includes(cl.id)).map(cl => ({
              ...cl, source: clueSources[cl.id] || 'explore'
            })),
            ...MARKET_CLUES.filter(cl => (discoveredClues.market || []).includes(cl.id)).map(cl => ({
              ...cl, source: clueSources[cl.id] || 'explore'
            })),
          ]}
          onClose={() => setShowCaseFile(false)}
          onSubmitRankings={handleSubmitRankings}
        />
      )}

      {/* ───── Validation ───── */}
      {showValidation && (
        <ValidationLevel
          onComplete={handleValidationComplete}
          discoveredClues={discoveredClues}
        />
      )}

      {/* ───── NPC Chat ───── */}
      {showNpcChat && activeNpc && (
        <NPCDialogueBox
          npcId={activeNpc.id}
          npcName={activeNpc.name}
          npcContext={activeNpc.context}
          sceneContext={activeScene === 'school' ? 'Greenfield School Campus' : 'Rajpur Market'}
          onClose={handleNpcClose}
          onClueRevealed={handleNpcClueRevealed}
          sceneClues={currentClues}
          discoveredClues={sceneDiscovered}
        />
      )}

      {/* ───── Reset Confirmation Modal ───── */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-sm w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl">⚠️</div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Reset Game Progress?</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  This will wipe all discovered clues, NPC interviews, rankings, and validation data.
                  Your game will restart from the briefing.
                </p>
              </div>
              <div className="p-3 bg-red-950/40 border border-red-800/30 rounded-xl">
                <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  This action cannot be undone. Remove the reset button before deploying to production.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl border border-slate-700 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetGame}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl border border-red-500/30 transition-colors text-xs"
                >
                  Yes, Reset Everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Chapter Complete Screen ───── */}
      {showChapterComplete && (
        <ChapterCompleteScreen
          chapterNumber={3}
          chapterTitle="Opportunities in Rajpur Market"
          gameName="Problem Hunt Detective"
          score={validationData?.score || totalFound * 200}
          maxScore={1000}
          xpEarned={200}
          coinsEarned={100}
          onContinue={handleChapterCompleteContinue}
        />
      )}

      {/* ───── Story: Comic Cutscene ───── */}
      {activeCutscene && (
        <ComicCutscene
          cutscene={activeCutscene}
          onComplete={handleCutsceneComplete}
        />
      )}

      {/* ───── Story: Preeti Message ───── */}
      {preetiMessage && (
        <PreetiMessage
          message={preetiMessage}
          onDismiss={handlePreetiDismiss}
          autoDismissMs={8000}
        />
      )}

      {/* ───── Final Report ───── */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-green-500/20 rounded-2xl p-8 text-center space-y-6 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-6xl"
              >🏆</motion.div>
              <div className="space-y-1">
                <span className="text-green-400 font-bold uppercase tracking-wider text-[10px]">Investigation Complete</span>
                <h2 className="text-2xl font-bold font-display text-white">Case Closed!</h2>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm">
                Outstanding work, detective! You identified {totalFound} real-world problems,
                interviewed key stakeholders, validated customer demand, and ranked opportunities
                like a true entrepreneur.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Clues Found', value: totalFound.toString(), icon: '🔍' },
                  { label: 'NPCs Met', value: Object.keys(npcInterviews).length.toString(), icon: '💬' },
                  { label: 'Problems Validated', value: validationData?.respondents?.toString() || '3', icon: '✅' },
                ].map((stat, i) => (
                  <div key={i} className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                    <div className="text-xl mb-1">{stat.icon}</div>
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800/60 rounded-xl space-y-2">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">💡 Entrepreneur Connection</span>
                <p className="text-xs text-slate-400 italic leading-relaxed">
                  "Deepinder Goyal noticed long cafeteria lines at Bain & Co, scanned menus online,
                  and founded Zomato. You just took the same first step — spotting a real problem
                  and validating it with customers!"
                </p>
              </div>

              <motion.button
                onClick={() => { setShowCompletion(false); navigate('/student'); }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl border border-green-500/20 transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🎉 Back to Dashboard
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
