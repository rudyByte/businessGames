// apps/web/src/stores/simulatorStore.ts
import { create } from 'zustand';

export interface RoundResult {
  round: number;
  price: number;
  marketing: number;
  revenue: number;
  expenses: number;
  profit: number;
  served: number;
}

export interface SimulatorState {
  cash: number;
  currentRound: number;
  startupName: string;
  industry: string;
  brandColor: string;
  marketing: number;
  price: number;
  team: string[];
  resultsHistory: RoundResult[];

  setBrand: (name: string, industry: string, color: string) => void;
  updateStrategy: (price: number, marketing: number) => void;
  hireMember: (memberId: string, cost: number) => boolean;
  fireMember: (memberId: string) => void;
  addRoundResult: (result: { revenue: number; served: number }) => void;
  resetAll: () => void;
}

const STARTING_CASH = 50000;

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  cash: STARTING_CASH,
  currentRound: 1,
  startupName: '',
  industry: '',
  brandColor: '',
  marketing: 1000,
  price: 50,
  team: [],
  resultsHistory: [],

  setBrand: (name, industry, color) => {
    set({ startupName: name, industry, brandColor: color });
    localStorage.setItem('campusedge_startup_name', name);
  },

  updateStrategy: (price, marketing) => {
    set({ price, marketing });
    localStorage.setItem('campusedge_price', price.toString());
    localStorage.setItem('campusedge_marketing', marketing.toString());
  },

  hireMember: (memberId, cost) => {
    const { cash, team } = get();
    if (cash < cost) return false;
    if (team.includes(memberId)) return true;

    set({
      cash: cash - cost,
      team: [...team, memberId],
    });
    return true;
  },

  fireMember: (memberId) => {
    const { team } = get();
    set({
      team: team.filter(id => id !== memberId),
    });
  },

  addRoundResult: (result) => {
    const { currentRound, price, marketing, cash, resultsHistory } = get();
    const overhead = 2000;
    const totalCost = overhead + marketing;
    const profit = result.revenue - totalCost;

    const roundData: RoundResult = {
      round: currentRound,
      price,
      marketing,
      revenue: result.revenue,
      expenses: totalCost,
      profit,
      served: result.served,
    };

    set({
      cash: cash + profit,
      currentRound: currentRound + 1,
      resultsHistory: [...resultsHistory, roundData],
    });
  },

  resetAll: () => {
    set({
      cash: STARTING_CASH,
      currentRound: 1,
      startupName: '',
      industry: '',
      brandColor: '',
      marketing: 1000,
      price: 50,
      team: [],
      resultsHistory: [],
    });
    localStorage.removeItem('campusedge_startup_name');
    localStorage.removeItem('campusedge_price');
    localStorage.removeItem('campusedge_marketing');
  },
}));
