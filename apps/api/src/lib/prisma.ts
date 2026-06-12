import { PrismaClient } from '@prisma/client';

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const prisma = basePrisma.$extends({
  result: {
    student: {
      avatarConfig: {
        needs: { avatarConfig: true },
        compute(student) {
          if (typeof student.avatarConfig === 'string') {
            try { return JSON.parse(student.avatarConfig); } catch (e) { return null; }
          }
          return student.avatarConfig;
        }
      }
    },
    chapter: {
      unlockCondition: {
        needs: { unlockCondition: true },
        compute(chapter) {
          if (typeof chapter.unlockCondition === 'string') {
            try { return JSON.parse(chapter.unlockCondition); } catch (e) { return null; }
          }
          return chapter.unlockCondition;
        }
      }
    },
    level: {
      config: {
        needs: { config: true },
        compute(level) {
          if (typeof level.config === 'string') {
            try { return JSON.parse(level.config); } catch (e) { return {}; }
          }
          return level.config;
        }
      }
    },
    gameProgress: {
      detectiveSave: {
        needs: { detectiveSave: true },
        compute(progress) {
          if (typeof progress.detectiveSave === 'string') {
            try { return JSON.parse(progress.detectiveSave); } catch (e) { return null; }
          }
          return progress.detectiveSave;
        }
      },
      simulatorSave: {
        needs: { simulatorSave: true },
        compute(progress) {
          if (typeof progress.simulatorSave === 'string') {
            try { return JSON.parse(progress.simulatorSave); } catch (e) { return null; }
          }
          return progress.simulatorSave;
        }
      }
    },
    levelAttempt: {
      choices: {
        needs: { choices: true },
        compute(attempt) {
          if (typeof attempt.choices === 'string') {
            try { return JSON.parse(attempt.choices); } catch (e) { return null; }
          }
          return attempt.choices;
        }
      }
    },
    achievement: {
      condition: {
        needs: { condition: true },
        compute(achievement) {
          if (typeof achievement.condition === 'string') {
            try { return JSON.parse(achievement.condition); } catch (e) { return {}; }
          }
          return achievement.condition;
        }
      }
    },
    leaderboard: {
      entries: {
        needs: { entries: true },
        compute(leaderboard) {
          if (typeof leaderboard.entries === 'string') {
            try { return JSON.parse(leaderboard.entries); } catch (e) { return []; }
          }
          return leaderboard.entries;
        }
      }
    },
    quizAttempt: {
      questions: {
        needs: { questions: true },
        compute(attempt) {
          if (typeof attempt.questions === 'string') {
            try { return JSON.parse(attempt.questions); } catch (e) { return []; }
          }
          return attempt.questions;
        }
      }
    }
  }
});

const globalForPrisma = globalThis as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

