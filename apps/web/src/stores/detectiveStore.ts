import { create } from 'zustand';

/* ─── Types ──────────────────────────────────── */

export interface HotspotPosition {
  id: string;
  x: number;
  z: number;
}

export interface ClueCombo {
  count: number;
  lastClueTime: number;
  multiplier: number;
}

export interface RivalProgress {
  meeraClues: number;
  lastMeeraAnnouncement: number;
  beatCount: number;
}

export interface DetectiveState {
  // Mechanic 1: Radar
  radarPulse: number;           // 0-1 intensity based on proximity to nearest hotspot
  nearestHotspotId: string | null;
  hotspotPositions: HotspotPosition[];

  // Mechanic 2: Timed Investigation Burst
  rushEndTime: number | null;
  rushActive: boolean;
  rushMultiplier: number;       // 1x, 2x, or 3x
  rushTimeRemaining: number;    // seconds

  // Mechanic 3: Witness Chain
  currentWitnessTarget: string | null;  // NPC id to visit next
  witnessChain: string[];               // ordered NPC chain
  witnessArrowVisible: boolean;

  // Mechanic 4: Compare Reveal
  compareRevealData: {
    studentProblem: string;
    realFounder: string;
    founderName: string;
    rating: string;
  } | null;

  // Mechanic 5: Opportunity Meter
  opportunityMeter: number;     // 0-100
  opportunityThresholds: number[];

  // Mechanic 6: Clue Combo Multiplier
  combo: ClueCombo;
  comboVisible: boolean;
  comboPopupText: string;

  // Mechanic 7: Rival Detective
  rivalEnabled: boolean;
  rivalMeera: RivalProgress;
  rivalMessage: string | null;
  rivalBeatMessage: string | null;

  // Shared
  xpMultiplier: number;
  totalFoundThisSession: number;

  // Actions
  updateRadar: (playerX: number, playerZ: number) => void;
  setHotspotPositions: (positions: HotspotPosition[]) => void;
  setCurrentWitnessTarget: (npcId: string | null) => void;
  startRushMode: () => void;
  tickRushTimer: (deltaSeconds: number) => void;
  endRushMode: () => void;
  recordClueFound: (clueId: string) => void;
  showCompareReveal: (data: DetectiveState['compareRevealData']) => void;
  dismissCompareReveal: () => void;
  triggerCombo: () => void;
  dismissCombo: () => void;
  rivalFoundClue: () => void;
  dismissRivalMessage: () => void;
  dismissRivalBeat: () => void;
  resetAll: () => void;
}

/* ─── Constants ───────────────────────────────── */
const COMBO_WINDOW_MS = 30000;  // 30 seconds between clues for combo
const RUSH_DURATION_SECONDS = 300; // 5 minutes
const RIVAL_ANNOUNCE_INTERVAL_MS = 45000; // 45s between rival finding clues
const OPPORTUNITY_THRESHOLDS = [20, 40, 60, 80, 100];

/* ─── Initial State ────────────────────────────── */
const initialState = {
  radarPulse: 0,
  nearestHotspotId: null,
  hotspotPositions: [],

  rushEndTime: null,
  rushActive: false,
  rushMultiplier: 1,
  rushTimeRemaining: RUSH_DURATION_SECONDS,

  currentWitnessTarget: null,
  witnessChain: ['canteen_uncle', 'vegetable_vendor'],
  witnessArrowVisible: false,

  compareRevealData: null,

  opportunityMeter: 0,
  opportunityThresholds: OPPORTUNITY_THRESHOLDS,

  combo: { count: 0, lastClueTime: 0, multiplier: 1 },
  comboVisible: false,
  comboPopupText: '',

  rivalEnabled: true,
  rivalMeera: { meeraClues: 0, lastMeeraAnnouncement: 0, beatCount: 0 },
  rivalMessage: null,
  rivalBeatMessage: null,

  xpMultiplier: 1,
  totalFoundThisSession: 0,
};

/* ─── Store ───────────────────────────────────── */
export const useDetectiveStore = create<DetectiveState>((set, get) => ({
  ...initialState,

  updateRadar: (playerX: number, playerZ: number) => {
    const { hotspotPositions } = get();
    if (hotspotPositions.length === 0) {
      set({ radarPulse: 0, nearestHotspotId: null });
      return;
    }

    let minDist = Infinity;
    let nearestId: string | null = null;

    for (const h of hotspotPositions) {
      const dx = playerX - h.x;
      const dz = playerZ - h.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        nearestId = h.id;
      }
    }

    // Map distance to 0-1 pulse intensity
    const maxRange = 18;
    const pulse = Math.max(0, Math.min(1, 1 - minDist / maxRange));

    set({ radarPulse: pulse, nearestHotspotId: nearestId });
  },

  setHotspotPositions: (positions) => set({ hotspotPositions: positions }),

  setCurrentWitnessTarget: (npcId) => set({
    currentWitnessTarget: npcId,
    witnessArrowVisible: npcId !== null,
  }),

  startRushMode: () => {
    const now = Date.now();
    set({
      rushActive: true,
      rushEndTime: now + RUSH_DURATION_SECONDS * 1000,
      rushTimeRemaining: RUSH_DURATION_SECONDS,
      rushMultiplier: 1,
    });
  },

  tickRushTimer: (deltaSeconds) => {
    const { rushActive, rushTimeRemaining, rushEndTime } = get();
    if (!rushActive || rushEndTime === null) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((rushEndTime - now) / 1000));

    // Calculate multiplier based on remaining time tiers
    // 3x when > 200s remaining, 2x when > 100s, 1x after
    let mult = 1;
    if (remaining > 200) mult = 3;
    else if (remaining > 100) mult = 2;

    if (remaining <= 0) {
      set({ rushActive: false, rushMultiplier: 1, rushTimeRemaining: 0 });
    } else {
      set({ rushTimeRemaining: remaining, rushMultiplier: mult });
    }
  },

  endRushMode: () => set({ rushActive: false, rushMultiplier: 1 }),

  recordClueFound: (clueId: string) => {
    const state = get();
    const now = Date.now();

    // Check combo
    const timeSinceLastClue = now - state.combo.lastClueTime;
    let comboCount = state.combo.count;
    let comboMult = state.combo.multiplier;

    if (timeSinceLastClue < COMBO_WINDOW_MS && state.combo.lastClueTime > 0) {
      comboCount += 1;
      comboMult = Math.min(comboCount, 5); // max 5x
    } else {
      comboCount = 1;
      comboMult = 1;
    }

    // Update opportunity meter
    const meterIncrement = 100 / 10; // 10 clues total across both scenes
    const newMeter = Math.min(100, state.opportunityMeter + meterIncrement);

    // Check thresholds
    const currentThreshold = state.opportunityThresholds.find(t => newMeter >= t && state.opportunityMeter < t);

    // Rival: 30% chance to find a clue too
    let newRivalClues = state.rivalMeera.meeraClues;
    let rivalMsg: string | null = state.rivalMessage;

    if (state.rivalEnabled && Math.random() < 0.3) {
      newRivalClues += 1;
      const now2 = Date.now();
      if (now2 - state.rivalMeera.lastMeeraAnnouncement > RIVAL_ANNOUNCE_INTERVAL_MS) {
        rivalMsg = `Detective Meera found a clue! She has ${newRivalClues} — don't let her beat you!`;
      }
    }

    // Check if player just beat Meera
    const newTotal = state.totalFoundThisSession + 1;
    let beatMsg: string | null = null;
    if (newTotal > newRivalClues && newRivalClues > 0 && state.rivalEnabled) {
      const newBeatCount = state.rivalMeera.beatCount + 1;
      beatMsg = `You beat Detective Meera! You found ${newTotal} clues to her ${newRivalClues}! 🏆`;
      set({
        combo: { count: comboCount, lastClueTime: now, multiplier: comboMult },
        opportunityMeter: newMeter,
        totalFoundThisSession: newTotal,
        xpMultiplier: comboMult * (state.rushActive ? state.rushMultiplier : 1),
        rivalMeera: { ...state.rivalMeera, meeraClues: newRivalClues, lastMeeraAnnouncement: now, beatCount: newBeatCount },
        rivalMessage: rivalMsg,
        rivalBeatMessage: beatMsg,
      });
    } else {
      set({
        combo: { count: comboCount, lastClueTime: now, multiplier: comboMult },
        opportunityMeter: newMeter,
        totalFoundThisSession: newTotal,
        xpMultiplier: comboMult * (state.rushActive ? state.rushMultiplier : 1),
        rivalMeera: { ...state.rivalMeera, meeraClues: newRivalClues, lastMeeraAnnouncement: now },
        rivalMessage: rivalMsg,
        rivalBeatMessage: beatMsg,
      });
    }

    // Show combo popup if combo > 1
    if (comboCount >= 2) {
      const xpBonus = comboCount * 30;
      get().triggerCombo();
    }
  },

  showCompareReveal: (data) => set({ compareRevealData: data }),

  dismissCompareReveal: () => set({ compareRevealData: null }),

  triggerCombo: () => {
    const { combo } = get();
    const xpBonus = combo.count * 30;
    set({
      comboVisible: true,
      comboPopupText: `COMBO x${combo.count}! +${xpBonus} XP`,
    });
  },

  dismissCombo: () => set({ comboVisible: false }),

  rivalFoundClue: () => {
    const state = get();
    const newCount = state.rivalMeera.meeraClues + 1;
    set({
      rivalMeera: { ...state.rivalMeera, meeraClues: newCount, lastMeeraAnnouncement: Date.now() },
      rivalMessage: `Detective Meera found another clue! She has ${newCount} now! 🔥`,
    });
  },

  dismissRivalMessage: () => set({ rivalMessage: null }),
  dismissRivalBeat: () => set({ rivalBeatMessage: null }),

  resetAll: () => set({ ...initialState }),
}));

/* ─── Hook for accessing derived state ────────── */
export function useDetectiveDerived() {
  const store = useDetectiveStore();

  const isRushUrgent = store.rushActive && store.rushTimeRemaining < 120;
  const isRushCritical = store.rushActive && store.rushTimeRemaining < 60;
  const comboActive = store.combo.count >= 2;

  const playerAheadOfMeera = store.totalFoundThisSession > store.rivalMeera.meeraClues;
  const meeraAhead = store.rivalMeera.meeraClues > store.totalFoundThisSession;

  return {
    isRushUrgent,
    isRushCritical,
    comboActive,
    playerAheadOfMeera,
    meeraAhead,
  };
}
