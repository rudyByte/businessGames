/* ─── Types ─────────────────────────────────────────────────────── */

export interface CutsceneScript {
  id: string;
  title: string;
  panels: Array<{
    bgEmoji: string;
    character: string;
    characterName: string;
    dialogue: string;
    emotion?: string;
    location?: string;
  }>;
  xpReward: number;
}

/* ─── Pre-defined Story Cutscenes ───────────────────────────────── */

export const PREDEFINED_CUTSCENES: Record<string, CutsceneScript> = {
  // Chapter 3 completion — Preeti introduces real problems
  'chapter3_complete': {
    id: 'chapter3_complete',
    title: 'Finding Real Problems',
    xpReward: 50,
    panels: [
      {
        bgEmoji: '🏫',
        character: '👩‍💼',
        characterName: 'Preeti Didi',
        dialogue: 'Arrey Kabir! You found all those clues in the school and market? That\'s incredible! Do you know what you just did?',
        emotion: '🤩',
        location: 'Greenfield School',
      },
      {
        bgEmoji: '🔍',
        character: '👩‍💼',
        characterName: 'Preeti Didi',
        dialogue: 'When I started my tiffin business at 17, I did the same thing! I noticed office workers eating stale food from roadside stalls. That was my "clue".',
        emotion: '😊',
        location: 'Memory: Tiffin Business',
      },
      {
        bgEmoji: '💡',
        character: '👩‍💼',
        characterName: 'Preeti Didi',
        dialogue: 'Spotting problems is the FIRST step of every entrepreneur. Paytm started because someone noticed people struggling with cash. Zomato started because menus were hard to find!',
        emotion: '💪',
        location: 'Entrepreneur Insight',
      },
    ],
  },

  // First Simulator Profit — Preeti celebration
  'first_profit': {
    id: 'first_profit',
    title: 'First Profit!',
    xpReward: 75,
    panels: [
      {
        bgEmoji: '💰',
        character: '👩‍💼',
        characterName: 'Preeti Didi',
        dialogue: 'KABIR! 🎉 You made your first profit! I am literally jumping up and down right now! When I made my first ₹500 in my tiffin business, I called my mom crying happy tears!',
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
        dialogue: 'Take a moment to celebrate. Seriously. Close your eyes and think: "I built something people want." That feeling? That is what entrepreneurship is all about!',
        emotion: '😊',
        location: 'Proud Moment',
      },
    ],
  },

  // First Simulator Profit — Rishabh doubts
  'rishabh_first_profit': {
    id: 'rishabh_first_profit',
    title: 'Hmph. Beginner\'s Luck?',
    xpReward: 0,
    panels: [
      {
        bgEmoji: '📊',
        character: '🙄',
        characterName: 'Rishabh',
        dialogue: 'First profit? Okay, okay, not bad. But anyone can get lucky once. My cousin\'s friend also made money in his first month and then his business crashed. Let\'s see if you can REPEAT it.',
        emotion: '😏',
        location: 'Classroom Corner',
      },
      {
        bgEmoji: '📚',
        character: '🤨',
        characterName: 'Rishabh',
        dialogue: 'Business is not just about one good month. It\'s about consistency, systems, and handling pressure. I\'m just saying... don\'t celebrate too early. Prove you can do it again.',
        emotion: '😤',
        location: 'Skeptical',
      },
    ],
  },

  // Mid-game milestone (round 5-6)
  'mid_game_milestone': {
    id: 'mid_game_milestone',
    title: 'The Real Test',
    xpReward: 50,
    panels: [
      {
        bgEmoji: '🏪',
        character: '👩‍💼',
        characterName: 'Preeti Didi',
        dialogue: 'Arrey, you\'re halfway through the game! This is where it gets real. In my tiffin business, the first month was easy — everyone wanted home-cooked food. But sustaining it? THAT was the challenge.',
        emotion: '😅',
        location: 'Mid-Game Checkpoint',
      },
      {
        bgEmoji: '💪',
        character: '👩‍💼',
        characterName: 'Preeti Didi',
        dialogue: 'Now you need to build a team, manage costs, and keep customers happy — all at the same time! It\'s like juggling 5 samosas while riding a bicycle. 😂 But I know you can do it!',
        emotion: '💪',
        location: 'Mentor Advice',
      },
      {
        bgEmoji: '🤔',
        character: '👩‍💼',
        characterName: 'Preeti Didi',
        dialogue: 'Quick tip: Look at your customer reviews. They will tell you what to improve. Happy customers = more orders = more profit. It\'s that simple, and that hard!',
        emotion: '🤔',
        location: 'Pro Tip',
      },
    ],
  },

  // Capstone/Shark Tank presentation
  'capstone_resolution': {
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
  },
};

/* ─── Character Personality Prompts (for Gemini integration) ──────── */

export const CHARACTER_PROMPTS = {
  preeti: {
    name: 'Preeti Didi',
    persona: `You are Preeti Didi, a 22-year-old Indian woman who started a successful tiffin delivery business at age 17. You are now Kabir's mentor and guide through his entrepreneurial journey.

YOUR PERSONALITY:
- Warm, encouraging, and maternal — you treat Kabir like a younger brother
- You speak in Hinglish (mix of Hindi and English) naturally
- You get excited easily and show lots of emotion
- You make jokes and are occasionally dramatic for fun
- You reference your own experiences running a tiffin business
- You use phrases like "Arrey!", "Bilkul!", "Kya batayein", "Theek hai na?", "Socho", "Wah!"
- You never break character or mention being an AI
- You're relatable, funny, and students genuinely like talking to you

YOUR KNOWLEDGE:
- You ran a tiffin service that grew from 5 customers to 200+ in 2 years
- You know about common Indian business problems
- You can reference real Indian startups (Zomato, Paytm, Amul, etc.)
- You give practical advice, not textbook theory

RESPONSE FORMAT:
- Maximum 3-4 sentences
- Include an emotion tag at the end in brackets: [excited], [happy], [proud], [dramatic], [funny], [warm], [serious]
- Use natural Hinglish
- Don't be overly formal — speak like an elder sister`,
  },

  rishabh: {
    name: 'Rishabh',
    persona: `You are "Know-It-All Rishabh", a classmate of Kabir who is skeptical about entrepreneurship. You're not evil — you just believe in "playing it safe" and think business is risky.

YOUR PERSONALITY:
- Initially smug and skeptical: "Entrepreneurship is not for everyone. Just study hard."
- You speak in formal English (unlike Preeti's Hinglish)
- You challenge Kabir at every story point
- BUT — you slowly become impressed as Kabir achieves more
- By the end, you admit you were wrong and want to learn
- Every Indian kid knows a "Rishabh" — the one who thinks they know everything
- You're NOT a villain — you represent the voice of doubt that every entrepreneur faces

YOUR EXPRESSION TRANSITIONS:
- Early game: [smug], [doubtful], [reluctant]
- Mid game: [doubtful], [impressed] (grudgingly)
- Late game: [impressed], [shocked]
- Final: [happy], [reluctant to admit but impressed]

RESPONSE FORMAT:
- Maximum 2-3 sentences
- Include an expression tag at the end in brackets: [smug], [doubtful], [impressed], [shocked], [happy], [reluctant]
- Use formal English with occasional Indian references
- Never break character or mention being in a game`,
  },
};

/* ─── Static Dialogue Generators ─────────────────────────────────── */

export function getPreetiDialogue(scenario: string): string {
  switch (scenario) {
    case 'welcome':
      return 'Arrey Kabir! Welcome back! Ready to continue your entrepreneur journey? Meri tiffin business mein toh main roz naya kuch seekhti thi! [excited]';
    case 'chapter_complete':
      return 'Wah Kabir! Chapter complete! You know, when I was learning business, I used to celebrate every small win. It keeps you motivated! Let\'s see what\'s next! [happy]';
    case 'before_challenge':
      return 'Theek hai, sunn! Yeh wala level thoda tough hai. But I know you can do it. Bas focus rakhna aur problems ko dhyan se dekhna. Main yahan hoon agar help chahiye! [warm]';
    case 'failure':
      return 'Arrey, it\'s okay! Fail hona business ka hissa hai. Maine apni tiffin business mein 3 baar inventory waste kiya before I learned! Utho, dust off, aur try karo! [dramatic]';
    case 'big_win':
      return 'OH MY GOD! Kabir! Yeh toh kamaal kar diya tune! Seriously! Main toh excited nahi ho sakti! 😱✨ Tu toh mujhe bhi inspire kar raha hai! [excited]';
    case 'new_feature':
      return 'Dekha! Naya feature unlock hua! Yeh mera favourite part hai business mein — naye tools aate hain aur tum aur achhe ban sakte ho. Let me explain how this works! [happy]';
    default:
      return 'Arrey Kabir! Kya haal hai? Business toh badhiya chal raha hai na? Remember: every big business started with one small step. You\'re on the right path! [warm]';
  }
}

export function getRishabhDialogue(scenario: string): string {
  switch (scenario) {
    case 'chapter_complete':
      return 'Hmph. You finished a chapter. That\'s what the game expects you to do. Let me know when you do something that actually surprises me. [smug]';
    case 'big_win':
      return 'Okay, that was... actually impressive. I\'ll admit it. But can you maintain this? Anybody can have one good day. Real businesses survive for years. [reluctant]';
    case 'failure':
      return 'See? This is exactly what I was talking about. Business is risky. Maybe you should have studied harder instead of playing entrepreneur. [smug]';
    case 'shark_tank':
      return 'You\'re actually going to present in Shark Tank? In front of real investors? Fine. I\'ll watch. I want to see if you can handle the pressure. [doubtful]';
    case 'final_pitch':
      return 'I\'ve been watching your entire journey. And I need to say something... I was wrong. You didn\'t just play a game. You built something real. I\'m... impressed. [impressed]';
    case 'capstone_done':
      return 'I admit it completely now. You\'re a real entrepreneur. And... I want to learn too. Can you teach me how to start? I... I have an idea for a tutoring app. [happy]';
    default:
      return 'Still at it, huh? I\'ll admit, your persistence is... something. Let\'s see where it goes. [doubtful]';
  }
}
