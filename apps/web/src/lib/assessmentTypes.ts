/* ───────────────────────────────────────────────
 *  assessmentTypes.ts — Action-Based Assessment Types
 *
 *  Defines the 6 assessment types that replace MCQ quizzes:
 *    1. DragDropSort    — rank/categorise by dragging
 *    2. SwipeDecision   — Tinder-style yes/no
 *    3. BuildTheAnswer  — word tiles into sentence
 *    4. HotspotClick    — click correct object
 *    5. RapidFireEmoji  — timed emoji quiz
 *    6. PriceNegotiation — slider + customer reaction
 * ─────────────────────────────────────────────── */

export type AssessmentType =
  | 'drag-drop-sort'
  | 'swipe-decision'
  | 'build-the-answer'
  | 'hotspot-click'
  | 'rapid-fire-emoji'
  | 'price-negotiation';

/* ─── Base ────────────────────────────────────── */
export interface BaseAssessment {
  id: string;
  type: AssessmentType;
  title: string;
  instructions: string;
  pointsPerCorrect: number;
  timeLimit?: number;          // seconds, optional
  context?: string;            // story context shown before the assessment
  emoji?: string;              // theme emoji
}

/* ─── 1. Drag & Drop Sort ────────────────────── */
export interface DragDropSortAssessment extends BaseAssessment {
  type: 'drag-drop-sort';
  categories: { id: string; label: string; color?: string }[];
  items: { id: string; label: string; emoji?: string; categoryId: string }[];
  autoSubmit: true;            // submits when all slots filled
}

/* ─── 2. Swipe Decision (Tinder-style) ────────── */
export interface SwipeDecisionAssessment extends BaseAssessment {
  type: 'swipe-decision';
  cards: {
    id: string;
    text: string;
    emoji?: string;
    correctAnswer: 'yes' | 'no';
    explanation: string;
  }[];
}

/* ─── 3. Build the Answer (Word Constructor) ──── */
export interface BuildTheAnswerAssessment extends BaseAssessment {
  type: 'build-the-answer';
  template: string;            // e.g. "___ helps ___ by ___"
  blanks: {                    // each blank has its own pool & solution
    id: string;
    placeholder: string;       // e.g. "Who"
    correctTileId: string;
    tiles: { id: string; text: string }[];
  }[];
}

/* ─── 4. Hotspot Click ────────────────────────── */
export interface HotspotClickAssessment extends BaseAssessment {
  type: 'hotspot-click';
  sceneImage?: string;         // optional background description for the scene
  hotspots: {
    id: string;
    x: number;                 // percentage 0-100
    y: number;                 // percentage 0-100
    label: string;
    isCorrect: boolean;
    wrongFeedback: string;
  }[];
  totalRounds: number;         // how many correct to find
  timeLimit: number;           // seconds
}

/* ─── 5. Rapid Fire Emoji Quiz ────────────────── */
export interface RapidFireEmojiAssessment extends BaseAssessment {
  type: 'rapid-fire-emoji';
  questions: {
    id: string;
    text: string;
    options: { emoji: string; label: string; isCorrect: boolean }[];
  }[];
  timeLimit: number;           // total seconds for all questions
  speedBonus: boolean;         // faster answers get more XP
  totalQuestions: number;
}

/* ─── 6. Price Negotiation ────────────────────── */
export interface PriceNegotiationAssessment extends BaseAssessment {
  type: 'price-negotiation';
  productName: string;
  productEmoji: string;
  costPrice: number;           // minimum price to break even
  maxPrice: number;            // maximum customer will pay
  startingPrice: number;       // customer's initial offer
  tiers: {
    min: number;
    max: number;
    reaction: 'angry' | 'neutral' | 'happy' | 'excited';
    dialogue: string;
    willBuy: boolean;
    priceFactor: number;       // multiplier for final score
  }[];
}

/* ─── Union type ──────────────────────────────── */
export type Assessment =
  | DragDropSortAssessment
  | SwipeDecisionAssessment
  | BuildTheAnswerAssessment
  | HotspotClickAssessment
  | RapidFireEmojiAssessment
  | PriceNegotiationAssessment;

/* ─── Assessment Result ───────────────────────── */
export interface AssessmentResult {
  assessmentId: string;
  type: AssessmentType;
  score: number;
  maxScore: number;
  correctCount: number;
  totalCount: number;
  timeSpent: number;           // seconds
  answers: Record<string, any>;
  passed: boolean;
  feedback?: string;
}

/* ─── Helpers ─────────────────────────────────── */
export function calculateGrade(score: number, maxScore: number): {
  letter: string; color: string; label: string; feedback: string;
} {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 90) return { letter: 'A+', color: 'text-yellow-400', label: 'Outstanding!', feedback: 'Perfect understanding! You really know your stuff.' };
  if (pct >= 75) return { letter: 'A', color: 'text-green-400', label: 'Excellent!', feedback: 'Great work! Strong grasp of the concepts.' };
  if (pct >= 60) return { letter: 'B+', color: 'text-blue-400', label: 'Good!', feedback: 'Solid effort. You\'re on the right track.' };
  if (pct >= 45) return { letter: 'B', color: 'text-purple-400', label: 'Fair', feedback: 'Not bad. Review the feedback and try again.' };
  if (pct >= 30) return { letter: 'C+', color: 'text-orange-400', label: 'Needs Work', feedback: 'You missed some key points. Study up!' };
  return { letter: 'D', color: 'text-red-400', label: 'Try Again', feedback: 'Don\'t give up! Review the material and come back stronger.' };
}

export function createDefaultResult(assessment: Assessment, timeSpent: number): AssessmentResult {
  const totalCount = 'questions' in assessment ? assessment.questions.length :
                     'cards' in assessment ? assessment.cards.length :
                     'hotspots' in assessment ? assessment.hotspots.length :
                     'items' in assessment ? assessment.items.length : 0;
  return {
    assessmentId: assessment.id,
    type: assessment.type,
    score: 0,
    maxScore: totalCount * assessment.pointsPerCorrect,
    correctCount: 0,
    totalCount,
    timeSpent,
    answers: {},
    passed: false,
  };
}

/* ─── Sample Assessment Configs (for the Detective game) ───── */
export const DETECTIVE_ASSESSMENTS: Record<string, Assessment> = {
  /* Problem prioritisation — Drag & Drop Sort */
  prioritize_problems: {
    id: 'prioritize_problems',
    type: 'drag-drop-sort',
    title: 'Rank Problems by Priority',
    instructions: 'Drag each problem into the correct priority tier: S (Critical) → D (Ignore). Think like a real entrepreneur!',
    pointsPerCorrect: 20,
    context: 'Raju Uncle described his biggest challenges. Now YOU decide which problem to solve FIRST based on business potential.',
    emoji: '📊',
    autoSubmit: true,
    categories: [
      { id: 's', label: 'S — Critical', color: '#EF4444' },
      { id: 'a', label: 'A — High', color: '#F97316' },
      { id: 'b', label: 'B — Medium', color: '#EAB308' },
      { id: 'c', label: 'C — Low', color: '#64748B' },
      { id: 'd', label: 'D — Ignore', color: '#334155' },
    ],
    items: [
      { id: 'canteen_queue', label: 'Students miss recess due to canteen queues', emoji: '⏰', categoryId: 's' },
      { id: 'water_cooler', label: 'Empty water cooler in summer', emoji: '💧', categoryId: 'a' },
      { id: 'notice_board', label: 'Paper notices look boring', emoji: '📋', categoryId: 'c' },
      { id: 'lost_found', label: 'Lost & Found box overflow', emoji: '🔍', categoryId: 'd' },
      { id: 'parking_pickup', label: 'Chaotic gate pickup traffic', emoji: '🚗', categoryId: 'b' },
    ],
  } as DragDropSortAssessment,

  /* Is this a business opportunity? — Swipe Decision */
  opportunity_or_not: {
    id: 'opportunity_or_not',
    type: 'swipe-decision',
    title: 'Swipe: Opportunity or Not?',
    instructions: 'Swipe RIGHT (👍) if this is a REAL business opportunity. Swipe LEFT (👎) if it\'s just a minor annoyance. Go fast — 8 cards in 45 seconds!',
    pointsPerCorrect: 25,
    emoji: '💼',
    cards: [
      { id: 'q1', text: 'Students can\'t get hot food during 15-min recess because the queue is too long.', emoji: '🏫', correctAnswer: 'yes', explanation: 'Real problem with willingness to pay (pre-order fee).' },
      { id: 'q2', text: 'The school walls need a fresh coat of paint.', emoji: '🎨', correctAnswer: 'no', explanation: 'One-time maintenance issue, not a recurring business opportunity.' },
      { id: 'q3', text: 'Vegetables spoil in the afternoon sun, causing 40% loss for vendors.', emoji: '🥬', correctAnswer: 'yes', explanation: 'Clear pain point with measurable loss — a solution can save money.' },
      { id: 'q4', text: 'The school bell rings 2 minutes late sometimes.', emoji: '🔔', correctAnswer: 'no', explanation: 'Minor inconvenience, no one would pay to fix this.' },
      { id: 'q5', text: 'Parents struggle to find auto-rickshaws for their kids after school.', emoji: '🛺', correctAnswer: 'yes', explanation: 'Recurring need with a potential matching service.' },
      { id: 'q6', text: 'The classroom has 3 broken chairs in the back row.', emoji: '🪑', correctAnswer: 'no', explanation: 'One-time replacement, not a scalable business.' },
      { id: 'q7', text: 'Students wait 15 minutes for chai at the tea stall every morning.', emoji: '☕', correctAnswer: 'yes', explanation: 'Recurring daily pain with time waste — pre-ordering solves it.' },
      { id: 'q8', text: 'The school garden has too many butterflies in spring.', emoji: '🦋', correctAnswer: 'no', explanation: 'Not a problem — nobody would pay to remove butterflies.' },
    ],
  } as SwipeDecisionAssessment,

  /* Mission statement — Build the Answer */
  mission_builder: {
    id: 'mission_builder',
    type: 'build-the-answer',
    title: 'Build Your Mission Statement',
    instructions: 'Drag the correct word tiles into each blank to complete your startup\'s mission statement. Every tile must land in the right spot!',
    pointsPerCorrect: 30,
    emoji: '🎯',
    template: '___ helps ___ by ___',
    blanks: [
      {
        id: 'who',
        placeholder: 'Who',
        correctTileId: 'canteen_app',
        tiles: [
          { id: 'canteen_app', text: 'CampusBite App' },
          { id: 'school_principal', text: 'School Principal' },
          { id: 'local_government', text: 'Local Government' },
        ],
      },
      {
        id: 'target',
        placeholder: 'Target Customer',
        correctTileId: 'students',
        tiles: [
          { id: 'students', text: 'hungry students' },
          { id: 'teachers', text: 'busy teachers' },
          { id: 'suppliers', text: 'local suppliers' },
        ],
      },
      {
        id: 'value',
        placeholder: 'Value',
        correctTileId: 'skip_queue',
        tiles: [
          { id: 'skip_queue', text: 'skipping the canteen queue with pre-ordered hot samosas' },
          { id: 'free_food', text: 'getting free food every day' },
          { id: 'better_grades', text: 'improving their test scores' },
        ],
      },
    ],
  } as BuildTheAnswerAssessment,
};
