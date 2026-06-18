import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';

// Onboarding & Round Views
import BrandBuilder from './BrandBuilder';
import TeamBuilder from './TeamBuilder';
import RoundDashboard from './RoundDashboard';
import RoundBriefing from './RoundBriefing';
import SharkTankEvaluation from './SharkTankEvaluation';

import { ArrowLeft, Building } from 'lucide-react';

// Story / Character progression
import ComicCutscene from '../story/ComicCutscene';
import PreetiMessage from '../story/PreetiMessage';
import RishabhChallenge from '../story/RishabhChallenge';
import type { PreetiMessageData } from '../story/PreetiMessage';
import type { RishabhChallengeData } from '../story/RishabhChallenge';
import type { CutsceneData } from '../story/ComicCutscene';

export default function SimulatorGamePage() {
  const navigate = useNavigate();
  const [saveState, setSaveState] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

  // Story beats
  const [activeCutscene, setActiveCutscene] = useState<CutsceneData | null>(null);
  const [preetiMessage, setPreetiMessage] = useState<PreetiMessageData | null>(null);
  const [rishabhChallenge, setRishabhChallenge] = useState<RishabhChallengeData | null>(null);
  const [hasShownMidgameBeat, setHasShownMidgameBeat] = useState(false);
  const [hasShownFirstProfitBeat, setHasShownFirstProfitBeat] = useState(false);

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
    // Story: Check for first profit milestone
    const roundHistory = updatedSave.roundHistory || [];
    if (roundHistory.length > 0) {
      const lastResult = roundHistory[roundHistory.length - 1];
      const hasPositiveProfit = lastResult.profit > 0;

      // First positive profit → Preeti celebration + Rishabh doubt
      if (hasPositiveProfit && !hasShownFirstProfitBeat) {
        setHasShownFirstProfitBeat(true);

        // Show Preeti's cutscene (will be checked on next render)
        // We set the cutscene data directly from predefined content
        setActiveCutscene({
          id: 'first_profit',
          title: 'First Profit! 🎉',
          xpReward: 75,
          panels: [
            {
              bgEmoji: '💰',
              character: '👩‍💼',
              characterName: 'Preeti Didi',
              dialogue: 'KABIR! You made your first profit! I am literally jumping up and down right now! When I made my first ₹500 in my tiffin business, I called my mom crying happy tears! 🥹',
              emotion: '🥹',
              location: 'Startup HQ',
            },
            {
              bgEmoji: '📈',
              character: '👩‍💼',
              characterName: 'Preeti Didi',
              dialogue: 'This profit means REAL customers are paying for your solution. That is the most honest feedback you can get. But remember — profit is just the beginning. Now we SCALE!',
              emotion: '😎',
              location: 'Business Milestone',
            },
            {
              bgEmoji: '🎯',
              character: '👩‍💼',
              characterName: 'Preeti Didi',
              dialogue: 'Take a moment to celebrate. Seriously. You built something people want. That feeling? That is what entrepreneurship is all about! ✨',
              emotion: '💪',
              location: 'Proud Moment',
            },
          ],
        });

        // Schedule Rishabh's challenge after the cutscene
        setTimeout(() => {
          setRishabhChallenge({
            id: 'rishabh-first-profit',
            title: 'Beginner\'s Luck?',
            challenge: 'First profit? Okay, not bad. But anyone can get lucky once. My cousin\'s friend also made money in his first month and then his business crashed. Let\'s see if you can REPEAT it.',
            expression: 'smug',
            type: 'doubt',
            context: 'You just made your first profitable week!',
          });
        }, 2000);
      }

      // Mid-game milestone (round 5-6)
      if (updatedSave.currentRound >= 5 && !hasShownMidgameBeat) {
        setHasShownMidgameBeat(true);
        setTimeout(() => {
          setPreetiMessage({
            id: 'midgame-milestone',
            message: 'Arrey, you\'re halfway through the game! This is where it gets real. In my tiffin business, the first month was easy — everyone wanted home-cooked food. But sustaining it? THAT was the challenge. 😅 Keep going!',
            mood: 'excited',
            xpReward: 50,
            actionLabel: 'Keep Going!',
          });
        }, 1500);
      }
    }

    if (updatedSave.currentRound > 12) {
      setShowEvaluation(true);
    }
  };

  const handleCloseEvaluation = () => {
    setShowEvaluation(false);

    // Show capstone resolution cutscene
    setActiveCutscene({
      id: 'capstone_resolution',
      title: 'The Final Pitch',
      xpReward: 100,
      panels: [
        {
          bgEmoji: '🎯',
          character: '👩‍💼',
          characterName: 'Preeti Didi',
          dialogue: 'KABIR! This is your moment! Do you remember that first day when you were just exploring the school canteen? Look how far you\'ve come! I am SO proud of you! 🥹✨',
          emotion: '🥹',
          location: 'Capstone Day',
        },
        {
          bgEmoji: '🏆',
          character: '👩‍💼',
          characterName: 'Preeti Didi',
          dialogue: 'You started as a curious kid with a dream. Today, you\'re presenting a REAL business with revenue, customers, and a team! This is what entrepreneurship looks like!',
          emotion: '😊',
          location: 'Journey So Far',
        },
        {
          bgEmoji: '😲',
          character: '😲',
          characterName: 'Rishabh',
          dialogue: 'Okay. I admit it. I was wrong. You actually... built something real. I\'ve been watching your progress and... wow. The numbers don\'t lie. You\'re a real entrepreneur.',
          emotion: '😲',
          location: 'Rishabh\'s Confession',
        },
        {
          bgEmoji: '🎉',
          character: '😊',
          characterName: 'Rishabh',
          dialogue: 'I always thought business was just about making money. But you showed me it\'s about solving problems people actually have. I... I want to learn too. Can you teach me?',
          emotion: '😊',
          location: 'New Beginning',
        },
      ],
    });
  };

  const handleCutsceneComplete = useCallback(async () => {
    if (activeCutscene) {
      try {
        await api.post('/story/complete-cutscene', { cutsceneId: activeCutscene.id });
      } catch (err) {
        // Silently fail
      }
    }
    setActiveCutscene(null);

    // If capstone is done, go back to dashboard
    if (activeCutscene?.id === 'capstone_resolution') {
      navigate('/student');
    }
  }, [activeCutscene, navigate]);

  const handlePreetiDismiss = useCallback(() => {
    setPreetiMessage(null);
  }, []);

  const handleRishabhDismiss = useCallback(() => {
    setRishabhChallenge(null);
  }, []);

  const handleRishabhAcceptChallenge = useCallback(() => {
    setRishabhChallenge(null);
    // The challenge is inherently accepted by continuing to play
  }, []);

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

  // Track current round to trigger briefing on each round change
  const prevRoundRef = React.useRef<number | null>(null);

  const handleBeginRound = () => {
    setShowBriefing(false);
  };

  // Show briefing when entering gameplay phase OR when round changes
  React.useEffect(() => {
    if (currentPhase === 'launch' || currentPhase === 'scale' || currentPhase === 'showcase') {
      const currentRound = activeSave.currentRound || 1;
      if (prevRoundRef.current === null || prevRoundRef.current !== currentRound) {
        prevRoundRef.current = currentRound;
        setShowBriefing(true);
      }
    }
  }, [currentPhase, activeSave.currentRound]);

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
          <>
            {showBriefing && (
              <RoundBriefing
                round={activeSave.currentRound || 1}
                startupName={activeSave.startupName || 'Samosa Stall'}
                onBeginRound={handleBeginRound}
                lastRoundProfit={
                  activeSave.roundHistory && activeSave.roundHistory.length > 0
                    ? activeSave.roundHistory[activeSave.roundHistory.length - 1].profit
                    : undefined
                }
              />
            )}
            {!showBriefing && (
              <RoundDashboard saveState={activeSave} onRoundComplete={handleRoundComplete} />
            )}
          </>
        )}
      </main>

      {/* Story: Comic Cutscene */}
      {activeCutscene && (
        <ComicCutscene
          cutscene={activeCutscene}
          onComplete={handleCutsceneComplete}
        />
      )}

      {/* Story: Preeti Message */}
      {preetiMessage && (
        <PreetiMessage
          message={preetiMessage}
          onDismiss={handlePreetiDismiss}
          autoDismissMs={10000}
        />
      )}

      {/* Story: Rishabh Challenge */}
      {rishabhChallenge && (
        <RishabhChallenge
          data={rishabhChallenge}
          onDismiss={handleRishabhDismiss}
          autoDismissMs={0}
        />
      )}

      {/* Capstone Shark Tank Pitch deck overlay */}
      {showEvaluation && (
        <SharkTankEvaluation saveState={activeSave} onClose={handleCloseEvaluation} />
      )}
    </div>
  );
}
