// apps/api/src/services/dailyChallenge.ts
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export interface DailyChallenge {
  id: string;
  type: 'QUIZ_SPRINT' | 'CLUE_MEMORY' | 'PRICING_DECISION' | 'TEAM_DECISION' | 'CASE_STUDY';
  title: string;
  description: string;
  content: any; // Questions, options, or pricing parameters
  xpReward: number;
  coinReward: number;
}

const CHALLENGE_TYPES = ['QUIZ_SPRINT', 'CLUE_MEMORY', 'PRICING_DECISION', 'TEAM_DECISION', 'CASE_STUDY'] as const;

export async function getDailyChallenge(studentId: string): Promise<DailyChallenge> {
  const cacheKey = `daily-challenge:${studentId}:${new Date().toDateString()}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // If parsing fails, fall back to generating new
    }
  }

  // Generate a random challenge type
  const typeIndex = Math.floor(Math.random() * CHALLENGE_TYPES.length);
  const type = CHALLENGE_TYPES[typeIndex];

  let challenge: DailyChallenge;

  switch (type) {
    case 'QUIZ_SPRINT':
      challenge = {
        id: `challenge_quiz_${Date.now()}`,
        type,
        title: 'Quiz Sprint! ⚡',
        description: 'Answer 3 fast-paced business questions to prove your knowledge.',
        content: {
          questions: [
            {
              question: 'What is a minimum viable product (MVP)?',
              options: [
                'A product with the maximum features possible',
                'The simplest version of a product that allows you to collect customer validation',
                'A cheap, low-quality replica of a competitors product',
                'A fully polished version ready for global launch'
              ],
              correctIndex: 1
            },
            {
              question: 'Which of the following is a fixed cost?',
              options: [
                'Manufacturing raw materials',
                'Sales commission per product',
                'Office monthly rent',
                'Delivery shipping fees'
              ],
              correctIndex: 2
            },
            {
              question: 'What does "Customer Acquisition Cost" (CAC) measure?',
              options: [
                'The value of products a customer buys over time',
                'The total marketing and sales cost to acquire a single customer',
                'The cost of customer support',
                'The discount percentage offered to new customers'
              ],
              correctIndex: 1
            }
          ]
        },
        xpReward: 100,
        coinReward: 50
      };
      break;

    case 'CLUE_MEMORY':
      challenge = {
        id: `challenge_memory_${Date.now()}`,
        type,
        title: 'Clue Memory Hunt! 🔍',
        description: 'Kabir found evidence, but the whiteboard has been scrambled. Identify the correct problem fit.',
        content: {
          scenario: 'A student canteen has high demand but long queues. Greenfield students only have 15 minutes for recess. What is the root problem?',
          options: [
            'Canteen food is too expensive',
            'Canteen transaction speed and kitchen throughput is too slow for the short recess window',
            'Students do not want to eat healthy food',
            'Canteen needs more tables'
          ],
          correctIndex: 1
        },
        xpReward: 100,
        coinReward: 50
      };
      break;

    case 'PRICING_DECISION':
      challenge = {
        id: `challenge_price_${Date.now()}`,
        type,
        title: 'Optimal Pricing! 🏷️',
        description: 'Your startup sells organic juices. Raw cost is ₹25/unit. Competitors sell at ₹60. At ₹70, volume is low. At ₹40, margin is low. What is the best price point?',
        content: {
          options: [
            '₹20 (sell at a loss to gain customers)',
            '₹55 (strong margin while undercutting competitors)',
            '₹120 (premium pricing without brand power)',
            '₹30 (extremely low margin)'
          ],
          correctIndex: 1
        },
        xpReward: 100,
        coinReward: 50
      };
      break;

    case 'TEAM_DECISION':
      challenge = {
        id: `challenge_team_${Date.now()}`,
        type,
        title: 'Hiring Strategy! 👥',
        description: 'You are building a tech app. You have a developer, but no one is doing marketing or sales. Who should you hire next?',
        content: {
          options: [
            'A second developer to build code faster',
            'A growth marketer / growth hacker to acquire users',
            'An expensive CFO to manage the seed money',
            'An administrative assistant'
          ],
          correctIndex: 1
        },
        xpReward: 100,
        coinReward: 50
      };
      break;

    case 'CASE_STUDY':
    default:
      challenge = {
        id: `challenge_case_${Date.now()}`,
        type,
        title: 'Case Study: Zomato vs Swiggy! 🚴',
        description: 'Swiggy launched dark kitchens (access kitchens) to support restaurants in low density zones. Why did they do this?',
        content: {
          options: [
            'To compete directly with restaurants by selling their own food',
            'To reduce delivery times and increase choice in suburban locations for restaurant brands',
            'To replace delivery riders with automated pick-up points',
            'To decrease commissions from partners'
          ],
          correctIndex: 1
        },
        xpReward: 120,
        coinReward: 60
      };
      break;
  }

  // Cache in Redis for 24 hours (86400 seconds)
  await redis.setex(cacheKey, 86400, JSON.stringify(challenge));

  return challenge;
}
