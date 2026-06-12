export type UserRole = 'STUDENT' | 'FACULTY' | 'PARENT' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  rollNumber: string | null;
  avatarUrl: string | null;
  avatarConfig: AvatarConfig | null;
  schoolId: string;
  classroomId: string | null;
  totalXP: number;
  level: number;
  coins: number;
  streak: number;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  uniformColor: string;
  accessory: string;
  expression: string;
}

export interface Faculty {
  id: string;
  userId: string;
  name: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Parent {
  id: string;
  userId: string;
  name: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface School {
  id: string;
  name: string;
  city: string;
  state: string;
  boardType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Classroom {
  id: string;
  name: string;
  grade: number;
  section: string | null;
  schoolId: string;
  facultyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  totalChapters: number;
  isActive: boolean;
}

export interface Chapter {
  id: string;
  gameId: string;
  number: number;
  slug: string;
  title: string;
  description: string;
  curriculumRef: string | null;
  xpReward: number;
  coinReward: number;
  unlockCondition: any;
}

export type LevelType = 'EXPLORATION' | 'QUIZ' | 'MINI_GAME' | 'SIMULATION' | 'CUTSCENE' | 'CHALLENGE';

export interface Level {
  id: string;
  chapterId: string;
  number: number;
  title: string;
  type: LevelType;
  config: any;
  maxScore: number;
  passingScore: number;
  timeLimit: number | null;
}

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REPLAYING';

export interface GameProgress {
  id: string;
  studentId: string;
  gameId: string;
  currentChapter: number;
  currentLevel: number;
  status: ProgressStatus;
  totalScore: number;
  totalXPEarned: number;
  completedAt: Date | null;
  detectiveSave: any;
  simulatorSave: any;
}

export interface LevelAttempt {
  id: string;
  progressId: string;
  chapterNumber: number;
  levelNumber: number;
  score: number;
  maxScore: number;
  passed: boolean;
  timeSpent: number;
  choices: any;
  aiHintsUsed: number;
  completedAt: Date | null;
  createdAt: Date;
}

export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconUrl: string | null;
  badgeColor: string;
  xpBonus: number;
  rarity: AchievementRarity;
  condition: any;
}

export interface StudentAchievement {
  id: string;
  studentId: string;
  achievementId: string;
  earnedAt: Date;
}

export interface CoinTransaction {
  id: string;
  studentId: string;
  amount: number;
  reason: string;
  reference: string | null;
  createdAt: Date;
}

export type LeaderboardType = 'CLASSROOM' | 'SCHOOL' | 'GLOBAL';

export interface LeaderboardEntry {
  studentId: string;
  name: string;
  score: number;
  rank: number;
  avatarUrl: string | null;
  avatarConfig?: AvatarConfig | null;
  level?: number;
}

export interface Leaderboard {
  id: string;
  type: LeaderboardType;
  scopeId: string;
  period: string;
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  facultyId: string;
  classroomId: string;
  title: string;
  description: string | null;
  gameSlug: string;
  chapterNumber: number;
  dueDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  chapterRef: string;
  questions: any;
  score: number;
  maxScore: number;
  completedAt: Date;
}

export type AIInteractionType = 'HINT' | 'FEEDBACK' | 'NPC_DIALOGUE' | 'ASSESSMENT' | 'RECOMMENDATION';

export interface AIInteraction {
  id: string;
  studentId: string;
  type: AIInteractionType;
  prompt: string;
  response: string;
  tokensUsed: number | null;
  createdAt: Date;
}

// ─── GAME STATE INTERFACES ───────────────────────────────────

export interface Clue {
  id: string;
  sceneId: string;
  location: string;
  description: string;
  icon: string;
  xpValue: number;
  relatedProblem: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  affectedPeople: string;
  frequency: 'daily' | 'weekly' | 'sometimes';
  discoveredVia: string[];
  fromScene: string;
}

export interface ProblemRanking {
  size: number;
  frequency: number;
  solvability: number;
  totalScore: number;
}

export interface RankedProblem extends Problem {
  ranking?: ProblemRanking;
  opportunityScore?: number;
}

export interface DialogueEntry {
  sender: 'player' | 'npc';
  text: string;
  timestamp: string;
}

export interface DetectiveGameState {
  scenario: 'school' | 'home' | 'market';
  discoveredClues: string[];
  identifiedProblems: Problem[];
  rankedProblems: RankedProblem[];
  currentMission: string;
  npcDialogues: DialogueEntry[];
  playerPosition: { x: number; y: number; z: number };
}

// ─── STARTUP SIMULATOR INTERFACES ─────────────────────────────

export interface LogoConfig {
  iconId: string;
  color: string;
  fontStyle: string;
}

export interface TeamMember {
  id: string;
  role: 'CEO' | 'CFO' | 'CMO' | 'Operations' | 'CustomerService';
  name: string;
  avatar: string;
  salary: number;
  skillLevel: 1 | 2 | 3;
  effect: string;
}

export interface EventOption {
  text: string;
  cost?: number;
  effect: Partial<SimulatorState>;
  consequence: string;
}

export interface BusinessEvent {
  id: string;
  type: 'challenge' | 'opportunity' | 'crisis' | 'milestone';
  title: string;
  description: string;
  options: EventOption[];
  resolved: boolean;
  round_trigger?: number | string;
}

export interface Review {
  id: string;
  rating: number;
  text: string;
  author: string;
  round: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SimulatorState {
  startupId: string;
  startupName: string;
  tagline: string;
  logoConfig: LogoConfig;
  colors: { primary: string; secondary: string };
  validatedProblem: string;
  productType: 'physical' | 'service' | 'digital';
  productName: string;
  productDescription: string;
  cash: number;
  revenue: number;
  expenses: number;
  profit: number;
  currentRound: number;
  roundHistory: RoundResult[];
  unitCost: number;
  sellingPrice: number;
  inventory: number;
  teamMembers: TeamMember[];
  teamEfficiency: number;
  marketingBudget: number;
  brandStrength: number;
  customerAwareness: number;
  totalCustomers: number;
  happyCustomers: number;
  unhappyCustomers: number;
  customerReviews: Review[];
  repeatCustomerRate: number;
  pendingEvents: BusinessEvent[];
  eventHistory: BusinessEvent[];
  currentPhase: 'brand' | 'team' | 'launch' | 'scale' | 'showcase';
  unlockedFeatures: string[];
  achievements: string[];
}

export interface RoundResult {
  round: number;
  customersServed: number;
  revenue: number;
  expenses: number;
  profit: number;
  decisions: any[];
  event: BusinessEvent | null;
  feedback: string;
}
