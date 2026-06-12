import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';

// Onboarding & Round Views
import BrandBuilder from './BrandBuilder';
import TeamBuilder from './TeamBuilder';
import RoundDashboard from './RoundDashboard';
import SharkTankEvaluation from './SharkTankEvaluation';

import { ArrowLeft, Building, HelpCircle } from 'lucide-react';

export default function SimulatorGamePage() {
  const navigate = useNavigate();
  const [saveState, setSaveState] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEvaluation, setShowEvaluation] = useState(false);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await api.get('/games/startup-simulator/progress');
        setSaveState(res.data.data.simulatorSave);
      } catch (err) {
        console.error('Failed to load simulator progress:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProgress();
  }, []);

  const handleBrandComplete = (updatedSave: any) => {
    setSaveState(updatedSave);
  };

  const handleTeamComplete = (updatedSave: any) => {
    setSaveState(updatedSave);
  };

  const handleRoundComplete = (updatedSave: any) => {
    setSaveState(updatedSave);
    if (updatedSave.currentRound > 12) {
      setShowEvaluation(true);
    }
  };

  const handleCloseEvaluation = () => {
    setShowEvaluation(false);
    navigate('/student');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  // Fallback saveState initialization
  const activeSave = saveState || {
    cash: 50000,
    currentRound: 1,
    brandStrength: 0,
    customerAwareness: 10,
    unitCost: 20,
    sellingPrice: 50,
    inventory: 0,
    teamMembers: [],
    teamEfficiency: 100,
    marketingBudget: 0,
    revenue: 0,
    expenses: 0,
    profit: 0,
    currentPhase: 'brand'
  };

  const currentPhase = activeSave.currentPhase || 'brand';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden font-sans">
      
      {/* HUD Header */}
      <header className="bg-slate-900/40 backdrop-blur-md border-b border-slate-800/40 px-6 py-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student')}
            className="p-2 bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 font-semibold text-xs"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          
          <div className="h-4 w-px bg-slate-800" />
          
          <span className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5 uppercase">
            <Building className="h-4.5 w-4.5 text-blue-400" />
            Startup Simulator
          </span>
        </div>

        {activeSave.startupName && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full font-bold text-xs uppercase tracking-wide">
            <span>{activeSave.startupName}</span>
          </div>
        )}
      </header>

      {/* Primary Simulator Workspace Container */}
      <main className="flex-1 p-6 flex flex-col justify-center">
        {currentPhase === 'brand' && (
          <BrandBuilder onComplete={handleBrandComplete} />
        )}
        
        {currentPhase === 'team' && (
          <TeamBuilder onComplete={handleTeamComplete} />
        )}

        {(currentPhase === 'launch' || currentPhase === 'scale' || currentPhase === 'showcase') && (
          <RoundDashboard saveState={activeSave} onRoundComplete={handleRoundComplete} />
        )}
      </main>

      {/* Capstone Shark Tank Pitch deck overlay */}
      {showEvaluation && (
        <SharkTankEvaluation saveState={activeSave} onClose={handleCloseEvaluation} />
      )}
    </div>
  );
}
