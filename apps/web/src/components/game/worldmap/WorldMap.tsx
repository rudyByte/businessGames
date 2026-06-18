import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Lock, Zap, MapPin, ArrowRight, ChevronLeft } from 'lucide-react';
import DailyChest from './DailyChest';
import ClassmateGhosts from './ClassmateGhosts';

/* ─── Types ─────────────────────────────────────── */
interface ZoneData {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  status: 'unlocked' | 'available' | 'locked';
  color: string;
  accentColor: string;
  chapterCount: number;
  starsEarned: number;
  totalStars: number;
  icon: string;
}

interface ClassmateGhost {
  name: string;
  status: string;
  color: string;
  x: number;
  y: number;
}

interface WorldMapProps {
  studentName: string;
  studentLevel: number;
  coins: number;
  streak: number;
  detProgress: any;
  simProgress: any;
  onZoneClick: (zoneId: string) => void;
  onChestOpen: () => void;
  dailyChestAvailable: boolean;
}

/* ─── Zone Data ─────────────────────────────────── */
const ZONES: ZoneData[] = [
  {
    id: 'detective',
    name: 'Problem Hunt',
    subtitle: 'Investigate & Discover',
    description: 'Find clues in Greenfield School and Rajpur Market. Interview shopkeepers and rank problems to find business opportunities!',
    status: 'unlocked',
    color: '#8B5CF6',
    accentColor: '#A78BFA',
    chapterCount: 3,
    starsEarned: 5,
    totalStars: 9,
    icon: '🔍',
  },
  {
    id: 'simulator',
    name: 'Startup Galaxy',
    subtitle: 'Build & Launch',
    description: 'Choose a business model, hire your team, run price experiments, and present to Shark Tank!',
    status: 'available',
    color: '#3B82F6',
    accentColor: '#60A5FA',
    chapterCount: 4,
    starsEarned: 0,
    totalStars: 12,
    icon: '🚀',
  },
  {
    id: 'showcase',
    name: 'Showcase Stage',
    subtitle: 'Present & Win',
    description: 'Compete with the best student startups. Pitch your final business plan to win the grand trophy!',
    status: 'locked',
    color: '#F59E0B',
    accentColor: '#FBBF24',
    chapterCount: 1,
    starsEarned: 0,
    totalStars: 3,
    icon: '🏆',
  },
];

/* ─── Sample Ghosts ─────────────────────────────── */
const SAMPLE_GHOSTS: ClassmateGhost[] = [
  { name: 'Priya Patel', status: 'On Chapter 4 — Market Research', color: 'pink', x: 22, y: 42 },
  { name: 'Rahul Sen', status: 'Earned a badge 1h ago', color: 'teal', x: 68, y: 35 },
  { name: 'Sneha Rao', status: 'Online — Playing Detective', color: 'purple', x: 35, y: 55 },
];

/* ─── Zone Detail Overlay ───────────────────────── */
function ZoneDetail({ zone, onBack, onLaunch }: {
  zone: ZoneData;
  onBack: () => void;
  onLaunch: () => void;
}) {
  const starArray = Array.from({ length: zone.totalStars }, (_, i) => i < zone.starsEarned);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center bg-game-deep/70 backdrop-blur-sm p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-lg w-full bg-gradient-to-b from-game-dark to-game-deep rounded-2xl border-2 overflow-hidden shadow-2xl"
        style={{ borderColor: `${zone.color}30` }}
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* Header banner */}
        <div
          className="relative p-6 pb-8 flex flex-col items-center text-center"
          style={{
            background: `linear-gradient(135deg, ${zone.color}20 0%, ${zone.color}08 100%)`,
            borderBottom: `1px solid ${zone.color}20`,
          }}
        >
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 rounded-xl bg-game-deep/50 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-5xl mb-3">{zone.icon}</span>
          <h2 className="text-2xl font-game-round font-bold text-white">{zone.name}</h2>
          <p className="text-sm text-slate-400 mt-1">{zone.subtitle}</p>

          {/* Stars */}
          <div className="flex items-center gap-1.5 mt-3">
            {starArray.map((earned, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${earned ? 'fill-game-yellow text-game-yellow' : 'text-slate-700'}`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-300 leading-relaxed">{zone.description}</p>

          {zone.status === 'locked' ? (
            <div className="flex items-center justify-center gap-2 bg-slate-800/50 rounded-xl p-4 text-slate-500 text-sm">
              <Lock className="h-5 w-5" />
              <span className="font-semibold">Complete previous worlds to unlock</span>
            </div>
          ) : (
            <button
              onClick={onLaunch}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-base text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${zone.color}, ${zone.color}cc)`,
                boxShadow: `0 4px 20px ${zone.color}30`,
              }}
            >
              <Zap className="h-5 w-5" />
              {zone.id === 'detective' ? 'Investigate Clues' : 'Launch Startup'}
              <ArrowRight className="h-5 w-5" />
            </button>
          )}

          <div className="flex justify-center gap-6 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {zone.chapterCount} Chapters
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              {zone.starsEarned}/{zone.totalStars} Stars
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Zone Building SVG ─────────────────────────── */
function ZoneBuilding({ zone, isHovered, onClick }: {
  zone: ZoneData;
  isHovered: boolean;
  onClick: () => void;
}) {
  const isLocked = zone.status === 'locked';
  const isAvailable = zone.status === 'available';

  return (
    <motion.g
      className={isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
      onClick={isLocked ? undefined : onClick}
      whileHover={!isLocked ? { scale: 1.05 } : {}}
      whileTap={!isLocked ? { scale: 0.97 } : {}}
    >          {/* Glow behind zone */}
      {!isLocked && (
        <circle
          r="50"
          fill={zone.color}
          opacity={isHovered ? 0.15 : 0.06}
          className="transition-opacity"
        />
      )}          {/* Zone icon */}
      <text
        fontSize="36"
        textAnchor="middle"
        dy="10"
        opacity={isLocked ? 0.3 : 1}
        fontWeight="bold"
      >
        {zone.icon}
      </text>

      {/* Lock overlay */}
      {isLocked && (
        <g>
          <rect x="-18" y="8" width="36" height="26" rx="5" fill="#334155" opacity="0.8" />
          <circle cx="0" cy="21" r="5" fill="#475569" />
          <rect x="-3" y="19" width="6" height="10" rx="1.5" fill="#1E293B" />
        </g>
      )}

      {/* Fog of war */}
      {isLocked && (
        <g className="animate-fog">
          <rect x="-30" y="-30" width="60" height="60" rx="8" fill="#1E293B" opacity="0.5" />
          <text textAnchor="middle" dy="10" fontSize="16" fill="#64748B" fontWeight="bold">???</text>
        </g>
      )}

      {/* Available indicator - subtle pulse ring */}
      {isAvailable && !isLocked && (
        <>            <motion.circle
            r="38"
            fill="none"
            stroke={zone.color}
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity={0.4}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}
    </motion.g>
  );
}

/* ─── Main WorldMap Component ───────────────────── */
export default function WorldMap({
  studentName,
  studentLevel,
  coins,
  streak,
  detProgress,
  simProgress,
  onZoneClick,
  onChestOpen,
  dailyChestAvailable,
}: WorldMapProps) {
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoneClick = (zone: ZoneData) => {
    if (zone.status === 'locked') return;
    setSelectedZone(zone);
  };

  const handleLaunchGame = () => {
    if (!selectedZone) return;
    onZoneClick(selectedZone.id);
    setSelectedZone(null);
  };

  const handleChestOpen = () => {
    onChestOpen();
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMapMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const newZoom = Math.max(1, Math.min(3, zoomLevel - e.deltaY * 0.002));
    setZoomLevel(newZoom);
  };

  // Memoize star positions so they don't regenerate on every render
  const stars = useMemo(() =>
    Array.from({ length: 30 }, () => ({
      cx: Math.random() * 1200,
      cy: Math.random() * 300,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    })),
  []);

  // Update zone stars from progress
  const zonesWithProgress = ZONES.map((zone) => {
    if (zone.id === 'detective' && detProgress) {
      return { ...zone, starsEarned: detProgress.totalScore ? Math.min(9, Math.floor(detProgress.totalScore / 100)) : 0 };
    }
    if (zone.id === 'simulator' && simProgress) {
      return { ...zone, starsEarned: simProgress.totalScore ? Math.min(12, Math.floor(simProgress.totalScore / 50)) : 0 };
    }
    return zone;
  });

  // Unlock simulator if detective is completed
  const finalZones = zonesWithProgress.map((zone) => {
    if (zone.id === 'simulator' && detProgress?.status === 'COMPLETED') {
      return { ...zone, status: 'unlocked' as const };
    }
    if (zone.id === 'showcase' && simProgress?.status === 'COMPLETED') {
      return { ...zone, status: 'available' as const };
    }
    return zone;
  });

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      onMouseDown={handleMapMouseDown}
      onMouseMove={handleMapMouseMove}
      onMouseUp={handleMapMouseUp}
      onMouseLeave={handleMapMouseUp}
      onWheel={handleWheel}
      style={{ cursor: zoomLevel > 1 && isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default' }}
    >
      {/* Map container with zoom/pan */}
      <motion.div
        className="absolute inset-0"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      >
        {/* ─── SVG Map ─────────────────────────────── */}
        <svg
          viewBox="0 0 1200 700"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1a3e" />
              <stop offset="60%" stopColor="#16213e" />
              <stop offset="100%" stopColor="#0f3460" />
            </linearGradient>
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a2a1a" />
              <stop offset="100%" stopColor="#0d1b0d" />
            </linearGradient>
            <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2a3e" />
              <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE66D" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFE66D" stopOpacity="0" />
            </radialGradient>
            {/* Building patterns */}
            <pattern id="windowPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="none" />
              <rect x="1" y="1" width="3" height="3" rx="0.5" fill="#FFE66D" opacity="0.3" />
              <rect x="5" y="5" width="3" height="3" rx="0.5" fill="#FFE66D" opacity="0.2" />
            </pattern>
            <pattern id="schoolWindowPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="none" />
              <rect x="1" y="1" width="4" height="4" rx="0.5" fill="#FFE66D" opacity="0.4" />
              <rect x="6" y="6" width="4" height="4" rx="0.5" fill="#FFE66D" opacity="0.3" />
            </pattern>
          </defs>

          {/* Background sky */}
          <rect width="1200" height="700" fill="url(#skyGrad)" />

          {/* Stars in sky */}
          {stars.map((star, i) => (
            <circle
              key={i}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill="white"
              opacity={star.opacity}
            />
          ))}

          {/* Moon/Sun glow */}
          <circle cx="1000" cy="80" r="80" fill="url(#sunGlow)" />
          <circle cx="1000" cy="80" r="20" fill="#FFE66D" opacity="0.6" />

          {/* Ground */}
          <rect x="0" y="380" width="1200" height="320" fill="url(#groundGrad)" />
          <rect x="0" y="378" width="1200" height="4" fill="#2a4a2a" opacity="0.3" />

          {/* ─── ROADS ──────────────────────────────── */}
          {/* Main road horizontal */}
          <rect x="0" y="420" width="1200" height="28" fill="url(#roadGrad)" />
          {/* Road dashed center line */}
          {Array.from({ length: 30 }).map((_, i) => (
            <rect key={i} x={i * 42} y="432" width="20" height="4" rx="2" fill="#4a4a5e" opacity="0.5" />
          ))}

          {/* Road vertical left */}
          <rect x="200" y="380" width="24" height="320" fill="url(#roadGrad)" />
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x="210" y={380 + i * 42} width="4" height="20" rx="2" fill="#4a4a5e" opacity="0.5" />
          ))}

          {/* Road vertical right */}
          <rect x="530" y="380" width="24" height="320" fill="url(#roadGrad)" />
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x="540" y={380 + i * 42} width="4" height="20" rx="2" fill="#4a4a5e" opacity="0.5" />
          ))}

          {/* Road connecting right side */}
          <rect x="800" y="380" width="24" height="320" fill="url(#roadGrad)" />
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x="810" y={380 + i * 42} width="4" height="20" rx="2" fill="#4a4a5e" opacity="0.5" />
          ))}

          {/* ─── TREES & GREENERY ────────────────────── */}
          {[
            { x: 50, y: 400 }, { x: 130, y: 460 }, { x: 330, y: 500 },
            { x: 460, y: 440 }, { x: 650, y: 480 }, { x: 720, y: 530 },
            { x: 920, y: 450 }, { x: 1050, y: 500 }, { x: 1120, y: 440 },
            { x: 380, y: 600 },
          ].map((pos, i) => (
            <g key={i}>
              {/* Trunk */}
              <rect x={pos.x - 2} y={pos.y - 8} width="4" height="12" rx="1" fill="#3d2b1f" />
              {/* Canopy */}
              <ellipse cx={pos.x} cy={pos.y - 14} rx="10" ry="8" fill="#1a5a2a" opacity="0.7" />
              <ellipse cx={pos.x - 3} cy={pos.y - 16} rx="6" ry="5" fill="#2a7a3a" opacity="0.5" />
              <ellipse cx={pos.x + 3} cy={pos.y - 15} rx="5" ry="4" fill="#1a6a2a" opacity="0.4" />
            </g>
          ))}

          {/* ─── SCENE: SCHOOL BUILDING (World 1) ──── */}
          <g transform="translate(100, 258)">
            {/* School building */}
            <rect x="0" y="55" width="140" height="95" rx="2" fill="#4a6a8a" stroke="#5a7a9a" strokeWidth="1.5" />
            {/* School roof */}
            <polygon points="-5,55 70,15 145,55" fill="#3a5a7a" stroke="#5a7a9a" strokeWidth="1.5" />
            {/* School windows */}
            <rect x="18" y="72" width="14" height="16" rx="1.5" fill="#FFE66D" opacity="0.4" />
            <rect x="42" y="72" width="14" height="16" rx="1.5" fill="#FFE66D" opacity="0.3" />
            <rect x="66" y="72" width="14" height="16" rx="1.5" fill="#FFE66D" opacity="0.5" />
            <rect x="90" y="72" width="14" height="16" rx="1.5" fill="#FFE66D" opacity="0.3" />
            {/* Door */}
            <rect x="52" y="110" width="28" height="40" rx="3" fill="#3a5a7a" stroke="#5a7a9a" strokeWidth="1" />
            {/* School sign */}
            <rect x="20" y="38" width="94" height="14" rx="3" fill="#2a4a6a" stroke="#5a7a9a" strokeWidth="1" />
            <text x="67" y="49" textAnchor="middle" fontSize="10" fill="#FFE66D" fontWeight="bold" fontFamily="Nunito, sans-serif">GREENFIELD SCHOOL</text>
            {/* Clock */}
            <circle cx="70" cy="64" r="6" fill="#1a3a5a" stroke="#5a7a9a" strokeWidth="1" />
            <line x1="70" y1="64" x2="70" y2="61" stroke="#FFE66D" strokeWidth="1" />
            <line x1="70" y1="64" x2="73" y2="64" stroke="#FFE66D" strokeWidth="1" />
            {/* Flag */}
            <line x1="70" y1="15" x2="70" y2="4" stroke="#5a7a9a" strokeWidth="1.5" />
            <polygon points="70,4 88,8 70,12" fill="#FF6B35" />
          </g>

          {/* ─── SCENE: MARKET AREA (World 1 cont.) ── */}
          <g transform="translate(260, 310)">
            {/* Market stalls */}
            <rect x="0" y="42" width="48" height="55" rx="3" fill="#8B6914" stroke="#A0862A" strokeWidth="1" />
            <rect x="54" y="42" width="48" height="55" rx="3" fill="#7a5a10" stroke="#A0862A" strokeWidth="1" />
            <rect x="108" y="42" width="48" height="55" rx="3" fill="#8B6914" stroke="#A0862A" strokeWidth="1" />
            {/* Awning */}
            <rect x="-2" y="38" width="162" height="8" rx="2" fill="#FF6B35" opacity="0.7" />
            {/* Stalls content */}
            <text x="24" y="78" textAnchor="middle" fontSize="14">☕</text>
            <text x="78" y="78" textAnchor="middle" fontSize="14">🍛</text>
            <text x="132" y="78" textAnchor="middle" fontSize="14">📱</text>
            {/* Market sign */}
            <rect x="24" y="24" width="112" height="12" rx="3" fill="#2a1a0a" />
            <text x="80" y="34" textAnchor="middle" fontSize="9" fill="#FFE66D" fontWeight="bold" fontFamily="Nunito, sans-serif">RAJPUR MARKET 🏪</text>
          </g>

          {/* ─── WORLD 1 ZONE MARKER ─────────────── */}
          <g transform="translate(248, 370)">
            <circle r="24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" opacity="0.5" />
            <motion.circle
              r="22"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2"
              opacity={0.3}
              animate={{ r: [22, 28, 22], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </g>

          {/* ─── WORLD 1 INTERACTIVE ZONE ────────── */}
          <g
            transform="translate(248, 325)"
            className="cursor-pointer"
            onClick={() => handleZoneClick(finalZones[0])}
          >
            <ZoneBuilding zone={finalZones[0]} isHovered={false} onClick={() => handleZoneClick(finalZones[0])} />
          </g>

          {/* ─── SCENE: BUSINESS DISTRICT (World 2) ── */}
          <g transform="translate(600, 256)">
            {/* Modern office building 1 */}
            <rect x="0" y="42" width="70" height="110" rx="1.5" fill="#1a3a5a" stroke="#2a5a7a" strokeWidth="1" />
            <rect x="8" y="50" width="10" height="8" rx="1" fill="#FFE66D" opacity="0.4" />
            <rect x="26" y="50" width="10" height="8" rx="1" fill="#FFE66D" opacity="0.3" />
            <rect x="44" y="50" width="10" height="8" rx="1" fill="#FFE66D" opacity="0.5" />
            <rect x="8" y="65" width="10" height="8" rx="1" fill="#FFE66D" opacity="0.3" />
            <rect x="26" y="65" width="10" height="8" rx="1" fill="#FFE66D" opacity="0.4" />
            <rect x="44" y="65" width="10" height="8" rx="1" fill="#FFE66D" opacity="0.3" />
            <rect x="8" y="80" width="10" height="8" rx="1" fill="#FFE66D" opacity="0.5" />
            <rect x="26" y="80" width="10" height="8" rx="1" fill="#FFE66D" opacity="0.3" />
            <rect x="44" y="80" width="10" height="8" rx="1" fill="#FFE66D" opacity="0.4" />
            {/* Building sign */}
            <rect x="8" y="14" width="54" height="20" rx="3" fill="#1a2a4a" stroke="#2a5a7a" strokeWidth="1" />
            <text x="35" y="28" textAnchor="middle" fontSize="8" fill="#4ECDC4" fontWeight="bold" fontFamily="Nunito, sans-serif">STARTUP HUB</text>

            {/* Office building 2 */}
            <rect x="82" y="55" width="55" height="95" rx="1.5" fill="#1a4a3a" stroke="#2a5a4a" strokeWidth="1" />
            <rect x="88" y="62" width="8" height="7" rx="1" fill="#FFE66D" opacity="0.3" />
            <rect x="102" y="62" width="8" height="7" rx="1" fill="#FFE66D" opacity="0.4" />
            <rect x="116" y="62" width="8" height="7" rx="1" fill="#FFE66D" opacity="0.3" />
            <rect x="88" y="76" width="8" height="7" rx="1" fill="#FFE66D" opacity="0.5" />
            <rect x="102" y="76" width="8" height="7" rx="1" fill="#FFE66D" opacity="0.3" />
            <rect x="116" y="76" width="8" height="7" rx="1" fill="#FFE66D" opacity="0.4" />

            {/* Rocket on roof */}
            <g transform="translate(35, -14)">
              <ellipse cx="0" cy="0" rx="8" ry="16" fill="#E94560" stroke="#FF6B35" strokeWidth="1" />
              <ellipse cx="0" cy="-13" rx="4" ry="3" fill="#FF6B35" />
              <polygon points="-5,12 0,22 5,12" fill="#FFE66D" opacity="0.7" />
              {/* Rocket window */}
              <circle cx="0" cy="-3" r="3" fill="#4ECDC4" />
              {/* Flame */}
              <motion.ellipse
                cx="0" cy="19" rx="5" ry="8"
                fill="#FF6B35"
                opacity={0.6}
                animate={{ ry: [8, 11, 8], opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.ellipse
                cx="0" cy="19" rx="3" ry="5"
                fill="#FFE66D"
                opacity={0.4}
                animate={{ ry: [5, 7, 5] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </g>
          </g>

          {/* ─── WORLD 2 ZONE MARKER ─────────────── */}
          <g transform="translate(650, 370)">
            {finalZones[1].status !== 'locked' && (
              <>
                <circle r="24" fill="none" stroke="#3B82F6" strokeWidth="2.5" opacity="0.5" />
                <motion.circle
                  r="22"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  opacity={0.3}
                  animate={{ r: [22, 28, 22], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
              </>
            )}
          </g>

          {/* ─── WORLD 2 INTERACTIVE ZONE ────────── */}
          <g
            transform="translate(630, 320)"
            className={finalZones[1].status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}
            onClick={() => finalZones[1].status !== 'locked' && handleZoneClick(finalZones[1])}
          >
            <ZoneBuilding zone={finalZones[1]} isHovered={false} onClick={() => handleZoneClick(finalZones[1])} />
          </g>

          {/* ─── SCENE: AUDITORIUM (World 3) ──────── */}
          <g transform="translate(920, 256)">
            {/* Auditorium building */}
            <rect x="0" y="42" width="110" height="110" rx="4" fill="#2a1a3a" stroke="#4a2a5a" strokeWidth="1" />
            {/* Dome roof */}
            <ellipse cx="55" cy="42" rx="55" ry="20" fill="#3a2a4a" stroke="#4a2a5a" strokeWidth="1" />
            {/* Entrance */}
            <rect x="35" y="98" width="40" height="54" rx="4" fill="#1a0a2a" stroke="#4a2a5a" strokeWidth="1" />
            {/* Columns */}
            <rect x="28" y="90" width="5" height="62" fill="#3a2a4a" />
            <rect x="77" y="90" width="5" height="62" fill="#3a2a4a" />
            {/* Stage lights */}
            <motion.circle cx="28" cy="32" r="6" fill="#FFE66D" opacity={0.3}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle cx="55" cy="32" r="6" fill="#FF6B35" opacity={0.3}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.circle cx="82" cy="32" r="6" fill="#4ECDC4" opacity={0.3}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            {/* Sign */}
            <rect x="18" y="14" width="74" height="16" rx="3" fill="#1a0a2a" stroke="#4a2a5a" strokeWidth="1" />
            <text x="55" y="25" textAnchor="middle" fontSize="9" fill="#FFE66D" fontWeight="bold" fontFamily="Nunito, sans-serif">GRAND SHOWCASE</text>
          </g>

          {/* ─── WORLD 3 INTERACTIVE ZONE ────────── */}
          <g
            transform="translate(960, 370)"
            className={finalZones[2].status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}
            onClick={() => finalZones[2].status !== 'locked' && handleZoneClick(finalZones[2])}
          >
            <ZoneBuilding zone={finalZones[2]} isHovered={false} onClick={() => handleZoneClick(finalZones[2])} />
          </g>

          {/* ─── DECORATIVE ELEMENTS ──────────────── */}
          {/* Lamp posts */}
          {[
            { x: 60, y: 410 }, { x: 250, y: 410 }, { x: 400, y: 410 },
            { x: 580, y: 410 }, { x: 700, y: 410 }, { x: 850, y: 410 },
          ].map((pos, i) => (
            <g key={`lamp-${i}`}>
              <rect x={pos.x - 1} y={pos.y + 10} width="2" height="20" fill="#4a4a5e" />
              <circle cx={pos.x} cy={pos.y + 8} r="3" fill="#FFE66D" opacity="0.2" />
              <circle cx={pos.x} cy={pos.y + 8} r="1.5" fill="#FFE66D" opacity="0.4" />
            </g>
          ))}

          {/* Cars on road */}
          {[
            { x: 80, y: 430, color: '#FF6B35' },
            { x: 350, y: 430, color: '#3B82F6' },
            { x: 550, y: 430, color: '#4ECDC4' },
          ].map((car, i) => (
            <g key={`car-${i}`}>
              <rect x={car.x} y={car.y} width="16" height="8" rx="2" fill={car.color} opacity="0.6" />
              <rect x={car.x + 2} y={car.y - 2} width="10" height="4" rx="2" fill={car.color} opacity="0.5" />
              <circle cx={car.x + 4} cy={car.y + 8} r="2" fill="#1a1a2e" />
              <circle cx={car.x + 12} cy={car.y + 8} r="2" fill="#1a1a2e" />
            </g>
          ))}

          {/* ─── PATH CONNECTIONS ───────────────────── */}
          {/* Dotted path from World 1 to World 2 */}
          {Array.from({ length: 12 }).map((_, i) => (
            <circle
              key={`path1-${i}`}
              cx={300 + i * 30}
              cy={380 + Math.sin(i * 0.5) * 8}
              r="2.5"
              fill="#8B5CF6"
              opacity={0.3}
            />
          ))}

          {/* Dotted path from World 2 to World 3 (faded if locked) */}
          {Array.from({ length: 10 }).map((_, i) => (
            <circle
              key={`path2-${i}`}
              cx={680 + i * 30}
              cy={380 + Math.sin(i * 0.7) * 6}
              r="2.5"
              fill={finalZones[2].status === 'locked' ? '#475569' : '#F59E0B'}
              opacity={finalZones[2].status === 'locked' ? 0.2 : 0.3}
            />
          ))}

          {/* ─── AVATAR CHARACTER ──────────────────── */}
          <g transform="translate(90, 390)">
            {/* Character shadow */}
            <ellipse cx="0" cy="24" rx="12" ry="4" fill="#000" opacity="0.2" />
            {/* Body */}
            <motion.g
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Body */}
              <rect x="-8" y="5" width="16" height="20" rx="4" fill="#8B5CF6" />
              {/* Head */}
              <circle cx="0" cy="-3" r="10" fill="#F3D2C1" />
              {/* Hair */}
              <path d="M-10,-3 Q-10,-11 0,-14 Q10,-11 10,-3" fill="#4a2a1a" />
              {/* Eyes */}
              <circle cx="-3.5" cy="-4" r="1.8" fill="#1a1a2e" />
              <circle cx="3.5" cy="-4" r="1.8" fill="#1a1a2e" />
              {/* Smile */}
              <path d="M-3,1 Q0,4 3,1" fill="none" stroke="#1a1a2e" strokeWidth="1.2" strokeLinecap="round" />
              {/* Backpack */}
              <rect x="7" y="8" width="5" height="11" rx="1.5" fill="#7C3AED" />
              {/* Legs */}
              <rect x="-6" y="25" width="4" height="8" rx="1.5" fill="#1a1a3e" />
              <rect x="2" y="25" width="4" height="8" rx="1.5" fill="#1a1a3e" />
            </motion.g>
            {/* Name tag */}
            <rect x="-20" y="38" width="40" height="12" rx="4" fill="#1a1a2e" opacity="0.85" />
            <text x="0" y="47" textAnchor="middle" fontSize="8" fill="#A78BFA" fontWeight="bold" fontFamily="Nunito, sans-serif">{studentName}</text>
          </g>

          {/* ─── ZONE LABELS ───────────────────────── */}
          {/* World 1 Label */}
          <g transform="translate(180, 280)">
            <rect x="-55" y="-12" width="110" height="24" rx="10" fill="#8B5CF6" opacity="0.15" />
            <text x="0" y="3" textAnchor="middle" fontSize="11" fill="#A78BFA" fontWeight="bold" fontFamily="Nunito, sans-serif">
              🔍 Problem Hunt
            </text>
            {/* Progress */}
            <text x="0" y="16" textAnchor="middle" fontSize="8" fill="#A78BFA" opacity="0.6">
              {finalZones[0].starsEarned}/{finalZones[0].totalStars} ★
            </text>
          </g>

          {/* World 2 Label */}
          <g transform="translate(630, 260)">
            <rect x="-55" y="-12" width="110" height="24" rx="10" fill={finalZones[1].status === 'locked' ? '#475569' : '#3B82F6'} opacity={finalZones[1].status === 'locked' ? 0.1 : 0.15} />
            <text x="0" y="3" textAnchor="middle" fontSize="11" fill={finalZones[1].status === 'locked' ? '#64748B' : '#60A5FA'} fontWeight="bold" fontFamily="Nunito, sans-serif">
              {finalZones[1].status === 'locked' ? '🔒 Startup Galaxy' : '🚀 Startup Galaxy'}
            </text>
            {finalZones[1].status === 'locked' && (
              <text x="0" y="16" textAnchor="middle" fontSize="8" fill="#64748B">
                Complete Ch.1-3 to unlock
              </text>
            )}
            {finalZones[1].status === 'unlocked' && (
              <text x="0" y="16" textAnchor="middle" fontSize="8" fill="#60A5FA" opacity="0.6">
                {finalZones[1].starsEarned}/{finalZones[1].totalStars} ★
              </text>
            )}
          </g>

          {/* World 3 Label */}
          <g transform="translate(960, 270)">
            <rect x="-50" y="-12" width="100" height="24" rx="10" fill="#475569" opacity="0.1" />
            <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#64748B" fontWeight="bold" fontFamily="Nunito, sans-serif">
              🔒 Showcase Stage
            </text>
            <text x="0" y="16" textAnchor="middle" fontSize="8" fill="#64748B">
              Complete all quests
            </text>
          </g>

          {/* ─── DAILY CHEST ON MAP ─────────────────── */}
        </svg>

        {/* ─── DAILY CHEST ────────────────────────── */}
        <div className="absolute" style={{ left: '78%', top: '52%' }}>
          <DailyChest
            canOpen={dailyChestAvailable}
            onOpen={handleChestOpen}
          />
        </div>

        {/* ─── CLASSMATE GHOSTS ───────────────────── */}
        <ClassmateGhosts ghosts={SAMPLE_GHOSTS} />
      </motion.div>

      {/* ─── ZOOM CONTROLS ────────────────────────── */}
      <div className="absolute bottom-24 right-4 md:bottom-6 md:right-6 flex flex-col gap-2 z-20">
        <button
          onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.3))}
          className="w-10 h-10 bg-game-dark/80 backdrop-blur-md border border-slate-700/50 rounded-xl flex items-center justify-center text-white text-lg font-bold hover:bg-game-dark/90 hover:border-game-teal/30 transition-all shadow-lg"
        >
          +
        </button>
        <div className="w-10 h-0.5 bg-slate-700/30 mx-auto" />
        <button
          onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.3))}
          className="w-10 h-10 bg-game-dark/80 backdrop-blur-md border border-slate-700/50 rounded-xl flex items-center justify-center text-white text-lg font-bold hover:bg-game-dark/90 hover:border-game-teal/30 transition-all shadow-lg"
        >
          −
        </button>
      </div>

      {/* ─── ZONE DETAIL OVERLAY ──────────────────── */}
      <AnimatePresence>
        {selectedZone && (
          <ZoneDetail
            zone={selectedZone}
            onBack={() => setSelectedZone(null)}
            onLaunch={handleLaunchGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
