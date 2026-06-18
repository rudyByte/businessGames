import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function hoursAgo(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data
  await prisma.studentParentLink.deleteMany();
  await prisma.coinTransaction.deleteMany();
  await prisma.studentAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.levelAttempt.deleteMany();
  await prisma.gameProgress.deleteMany();
  await prisma.level.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.game.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.superAdmin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const userPasswordHash = await bcrypt.hash('User@123', 12);

  // 2. Create SuperAdmin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@campusedge.in',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.superAdmin.create({
    data: {
      userId: adminUser.id,
      name: 'Rajiv Sir',
    },
  });

  console.log('Super Admin created.');

  // 3. Create Schools
  const dps = await prisma.school.create({
    data: {
      name: 'Delhi Public School',
      city: 'Delhi',
      state: 'Delhi',
      boardType: 'CBSE',
    },
  });

  const mis = await prisma.school.create({
    data: {
      name: 'Mumbai International School',
      city: 'Mumbai',
      state: 'Maharashtra',
      boardType: 'ICSE',
    },
  });

  console.log('Schools created.');

  // 4. Create Classrooms
  const dpsClassA = await prisma.classroom.create({
    data: {
      name: '7-A',
      grade: 7,
      schoolId: dps.id,
    },
  });

  const dpsClassB = await prisma.classroom.create({
    data: {
      name: '7-B',
      grade: 7,
      schoolId: dps.id,
    },
  });

  const misClassA = await prisma.classroom.create({
    data: {
      name: 'Grade 7 Section A',
      grade: 7,
      schoolId: mis.id,
    },
  });

  console.log('Classrooms created.');

  // 5. Create Faculty
  const facultyData = [
    { name: 'Ms. Sharma', email: 'sharma@dps.in', schoolId: dps.id, classroomId: dpsClassA.id },
    { name: 'Mr. Gupta', email: 'gupta@dps.in', schoolId: dps.id, classroomId: dpsClassB.id },
    { name: 'Mrs. Iyer', email: 'iyer@mis.in', schoolId: mis.id, classroomId: misClassA.id },
    { name: 'Mr. Mehta', email: 'mehta@mis.in', schoolId: mis.id },
  ];

  const facultyMembers: any[] = [];
  for (const fac of facultyData) {
    const user = await prisma.user.create({
      data: {
        email: fac.email,
        passwordHash: userPasswordHash,
        role: 'FACULTY',
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        userId: user.id,
        name: fac.name,
        schoolId: fac.schoolId,
      },
    });

    if (fac.classroomId) {
      await prisma.classroom.update({
        where: { id: fac.classroomId },
        data: { facultyId: faculty.id },
      });
    }

    facultyMembers.push(faculty);
  }

  console.log('Faculty members created.');

  // 6. Create Students
  // Varied student data for rich demo
  type StudentSeed = {
    name: string;
    email: string;
    classroomId: string;
    rollNumber: string;
    totalXP: number;
    level: number;
    coins: number;
    streak: number;
    lastActiveAt: Date;
    detStatus: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
    detChapter: number;
    detLevel: number;
    detScore: number;
    detXp: number;
    simStatus: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
    simChapter: number;
    simLevel: number;
    simScore: number;
    simXp: number;
  };

  const dpsStudents: StudentSeed[] = [
    { name: 'Aryan Goel', email: 'aryan@student.com', classroomId: dpsClassA.id, rollNumber: '01', totalXP: 2850, level: 5, coins: 1240, streak: 12, lastActiveAt: hoursAgo(2), detStatus: 'COMPLETED', detChapter: 3, detLevel: 10, detScore: 8700, detXp: 1800, simStatus: 'IN_PROGRESS', simChapter: 2, simLevel: 4, simScore: 3200, simXp: 600 },
    { name: 'Priya Patel', email: 'priya@student.com', classroomId: dpsClassA.id, rollNumber: '02', totalXP: 2100, level: 4, coins: 980, streak: 8, lastActiveAt: hoursAgo(6), detStatus: 'IN_PROGRESS', detChapter: 2, detLevel: 7, detScore: 4200, detXp: 900, simStatus: 'NOT_STARTED', simChapter: 1, simLevel: 1, simScore: 0, simXp: 0 },
    { name: 'Rahul Sen', email: 'rahul@student.com', classroomId: dpsClassA.id, rollNumber: '03', totalXP: 3400, level: 6, coins: 1560, streak: 15, lastActiveAt: hoursAgo(1), detStatus: 'COMPLETED', detChapter: 3, detLevel: 10, detScore: 9200, detXp: 2000, simStatus: 'IN_PROGRESS', simChapter: 3, simLevel: 6, simScore: 5100, simXp: 1000 },
    { name: 'Sneha Rao', email: 'sneha@student.com', classroomId: dpsClassB.id, rollNumber: '04', totalXP: 1800, level: 3, coins: 750, streak: 5, lastActiveAt: hoursAgo(24), detStatus: 'IN_PROGRESS', detChapter: 2, detLevel: 4, detScore: 2100, detXp: 450, simStatus: 'NOT_STARTED', simChapter: 1, simLevel: 1, simScore: 0, simXp: 0 },
    { name: 'Amit Shah', email: 'amit@student.com', classroomId: dpsClassB.id, rollNumber: '05', totalXP: 650, level: 2, coins: 320, streak: 2, lastActiveAt: daysAgo(3), detStatus: 'IN_PROGRESS', detChapter: 1, detLevel: 5, detScore: 900, detXp: 200, simStatus: 'NOT_STARTED', simChapter: 1, simLevel: 1, simScore: 0, simXp: 0 },
  ];

  const misStudents: StudentSeed[] = [
    { name: 'Kunal Kapoor', email: 'kunal@student.com', classroomId: misClassA.id, rollNumber: '10', totalXP: 4100, level: 7, coins: 2050, streak: 20, lastActiveAt: hoursAgo(4), detStatus: 'COMPLETED', detChapter: 3, detLevel: 10, detScore: 9500, detXp: 2100, simStatus: 'COMPLETED', simChapter: 4, simLevel: 8, simScore: 7800, simXp: 1600 },
    { name: 'Diya Verma', email: 'diya@student.com', classroomId: misClassA.id, rollNumber: '11', totalXP: 2800, level: 5, coins: 1320, streak: 14, lastActiveAt: hoursAgo(3), detStatus: 'COMPLETED', detChapter: 3, detLevel: 10, detScore: 8100, detXp: 1750, simStatus: 'IN_PROGRESS', simChapter: 2, simLevel: 3, simScore: 2100, simXp: 400 },
    { name: 'Rohan Joshi', email: 'rohan@student.com', classroomId: misClassA.id, rollNumber: '12', totalXP: 1500, level: 3, coins: 680, streak: 6, lastActiveAt: daysAgo(1), detStatus: 'IN_PROGRESS', detChapter: 1, detLevel: 8, detScore: 2400, detXp: 500, simStatus: 'NOT_STARTED', simChapter: 1, simLevel: 1, simScore: 0, simXp: 0 },
    { name: 'Neha Nair', email: 'neha@student.com', classroomId: misClassA.id, rollNumber: '13', totalXP: 2200, level: 4, coins: 1050, streak: 9, lastActiveAt: hoursAgo(12), detStatus: 'COMPLETED', detChapter: 3, detLevel: 10, detScore: 7800, detXp: 1650, simStatus: 'IN_PROGRESS', simChapter: 1, simLevel: 5, simScore: 1800, simXp: 350 },
    { name: 'Vikram Singh', email: 'vikram@student.com', classroomId: misClassA.id, rollNumber: '14', totalXP: 3200, level: 6, coins: 1480, streak: 18, lastActiveAt: hoursAgo(5), detStatus: 'COMPLETED', detChapter: 3, detLevel: 10, detScore: 8800, detXp: 1900, simStatus: 'COMPLETED', simChapter: 4, simLevel: 8, simScore: 7200, simXp: 1500 },
  ];

  const students: any[] = [];

  for (const s of [...dpsStudents, ...misStudents]) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: userPasswordHash,
        role: 'STUDENT',
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        name: s.name,
        rollNumber: s.rollNumber,
        schoolId: s.classroomId === dpsClassA.id || s.classroomId === dpsClassB.id ? dps.id : mis.id,
        classroomId: s.classroomId,
        totalXP: s.totalXP,
        level: s.level,
        coins: s.coins,
        streak: s.streak,
        lastActiveAt: s.lastActiveAt,
      },
    });

    students.push(student);
  }

  console.log('Students created.');

  // 7. Create Parents and link
  const parentData = [
    { name: 'Mrs. Goel', email: 'parent.goel@parent.com', children: ['aryan@student.com', 'priya@student.com'] },
    { name: 'Mr. Patel', email: 'parent.patel@parent.com', children: ['priya@student.com'] },
    { name: 'Mrs. Sen', email: 'parent.sen@parent.com', children: ['rahul@student.com', 'sneha@student.com'] },
    { name: 'Mr. Kapoor', email: 'parent.kapoor@parent.com', children: ['kunal@student.com', 'diya@student.com'] },
    { name: 'Mrs. Nair', email: 'parent.nair@parent.com', children: ['neha@student.com', 'vikram@student.com'] },
  ];

  for (const p of parentData) {
    const user = await prisma.user.create({
      data: {
        email: p.email,
        passwordHash: userPasswordHash,
        role: 'PARENT',
      },
    });

    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
        name: p.name,
      },
    });

    for (const childEmail of p.children) {
      const childUser = await prisma.user.findUnique({
        where: { email: childEmail },
        include: { student: true },
      });

      if (childUser && childUser.student) {
        await prisma.studentParentLink.create({
          data: {
            studentId: childUser.student.id,
            parentId: parent.id,
          },
        });
      }
    }
  }

  console.log('Parents created and linked.');

  // 8. Create Games
  const detectiveGame = await prisma.game.create({
    data: {
      slug: 'problem-hunt',
      name: 'Problem Hunt Detective',
      description: 'Explore environments, interview characters, discover problems and evaluate them as entrepreneurial opportunities.',
      totalChapters: 3,
    },
  });

  const simulatorGame = await prisma.game.create({
    data: {
      slug: 'startup-simulator',
      name: 'Startup Simulator',
      description: 'Name your startup, build a logo, hire your team, set prices, manage inventory and pitch to virtual sharks.',
      totalChapters: 4,
    },
  });

  console.log('Games created.');

  // 9. Create Chapters & Levels for Detective
  const detChapters = [
    { number: 1, slug: 'intro-mindset', title: 'Who is an Entrepreneur?', desc: 'Discover the basic mindset of an entrepreneur and explore Paytm story.', curriculum: 'Chapter 1: Entrepreneurship Basics' },
    { number: 2, slug: 'observation-school', title: 'Finding Problems in School', desc: 'Observe Greenfield School and collect problem clues around the canteen, library and notices.', curriculum: 'Chapter 3: Finding Problems Around You' },
    { number: 3, slug: 'opportunity-market', title: 'Opportunities in Rajpur Market', desc: 'Visit Rajpur Market, talk to shopkeepers, and evaluate market problems.', curriculum: 'Chapter 4: Opportunity Mapping' },
  ];

  for (const ch of detChapters) {
    const chapter = await prisma.chapter.create({
      data: {
        gameId: detectiveGame.id,
        number: ch.number,
        slug: ch.slug,
        title: ch.title,
        description: ch.desc,
        curriculumRef: ch.curriculum,
        xpReward: 150,
        coinReward: 75,
      },
    });

    // Create 10 levels for each chapter
    for (let i = 1; i <= 10; i++) {
      await prisma.level.create({
        data: {
          chapterId: chapter.id,
          number: i,
          title: `Mission ${ch.number}.${i}: ${i === 1 ? 'Getting Briefed' : i === 10 ? 'Chapter Assessment' : 'Investigation Detail'}`,
          type: i === 1 ? 'CUTSCENE' : i === 10 ? 'QUIZ' : 'EXPLORATION',
          config: JSON.stringify({
            scene: ch.number === 2 ? 'school' : ch.number === 3 ? 'market' : 'home',
            missionObjectives: ['Discover the major problem', 'Speak to at least 2 NPCs'],
          }),
          maxScore: 1000,
          passingScore: 600,
        },
      });
    }
  }

  console.log('Detective chapters and levels created.');

  // 10. Create Chapters & Levels for Simulator
  const simChapters = [
    { number: 1, slug: 'brand-identity', title: 'Building a Brand', desc: 'Define your startup identity: choose a name, design a logo and color schemes.', curriculum: 'Chapter 7: Brand Foundations' },
    { number: 2, slug: 'team-synergy', title: 'Assembling the Team', desc: 'Hire team members, assign them complementary roles, and balance chemistry.', curriculum: 'Chapter 8: Building Effective Teams' },
    { number: 3, slug: 'economics-launch', title: 'Launch & Economics', desc: 'Choose a business model, experiment with pricing, and launch the startup.', curriculum: 'Chapter 9: Revenue & Pricing Models' },
    { number: 4, slug: 'scaling-showcase', title: 'Scale & Pitch', desc: 'Grow your business through rounds of simulation, and pitch to Virtual Sharks.', curriculum: 'Chapter 10 & Capstone: Scaling and Pitching' },
  ];

  for (const ch of simChapters) {
    const chapter = await prisma.chapter.create({
      data: {
        gameId: simulatorGame.id,
        number: ch.number,
        slug: ch.slug,
        title: ch.title,
        description: ch.desc,
        curriculumRef: ch.curriculum,
        xpReward: 200,
        coinReward: 100,
      },
    });

    // Create 8 levels for each chapter
    for (let i = 1; i <= 8; i++) {
      await prisma.level.create({
        data: {
          chapterId: chapter.id,
          number: i,
          title: `Round ${i}: ${i === 1 ? 'Deciding Direction' : i === 8 ? 'Pitch Preparation' : 'Business Round'}`,
          type: i === 8 ? 'SIMULATION' : 'MINI_GAME',
          config: JSON.stringify({
            roundNumber: i,
            marketDemandRatio: 1.1,
          }),
          maxScore: 1000,
          passingScore: 600,
        },
      });
    }
  }

  console.log('Simulator chapters and levels created.');

  // 11. Seed Achievements
  const achievements = [
    { slug: 'first-steps', name: 'First Steps', desc: 'Complete your first level', color: '#CD7F32', bonus: 25, rarity: 'COMMON' },
    { slug: 'clue-hunter', name: 'Clue Hunter', desc: 'Find 3 clues', color: '#CD7F32', bonus: 25, rarity: 'COMMON' },
    { slug: 'problem-spotter', name: 'Problem Spotter', desc: 'Identify 5 unique problems', color: '#C0C0C0', bonus: 75, rarity: 'RARE' },
    { slug: 'detective-pro', name: 'Detective Pro', desc: 'Complete all 3 Detective scenes', color: '#FFD700', bonus: 150, rarity: 'EPIC' },
    { slug: 'master-detective', name: 'Master Detective', desc: 'Score 90%+ on all Detective levels', color: '#E5E4E2', bonus: 300, rarity: 'LEGENDARY' },
    { slug: 'brand-born', name: 'Brand Born', desc: 'Complete Brand Builder', color: '#CD7F32', bonus: 50, rarity: 'COMMON' },
    { slug: 'open-for-business', name: 'Open for Business', desc: 'Complete first Simulator round', color: '#CD7F32', bonus: 50, rarity: 'COMMON' },
    { slug: 'profitable', name: 'Profitable!', desc: 'Earn first profit in Simulator', color: '#C0C0C0', bonus: 100, rarity: 'RARE' },
    { slug: 'millionaire', name: 'Millionaire', desc: 'Accumulate ₹1,00,000 total revenue', color: '#FFD700', bonus: 200, rarity: 'EPIC' },
    { slug: 'startup-master', name: 'Startup Master', desc: 'Complete full Simulator with A grade', color: '#E5E4E2', bonus: 500, rarity: 'LEGENDARY' },
  ];

  for (const ach of achievements) {
    await prisma.achievement.create({
      data: {
        slug: ach.slug,
        name: ach.name,
        description: ach.desc,
        badgeColor: ach.color,
        xpBonus: ach.bonus,
        rarity: ach.rarity as any,
        condition: JSON.stringify({}),
      },
    });
  }

  console.log('Achievements seeded.');

  // Build a name-to-seed mapping for matching
  const seedByName = new Map<string, StudentSeed>();
  for (const sd of [...dpsStudents, ...misStudents]) {
    seedByName.set(sd.name, sd);
  }

  // 12. Create GameProgress for all seed students
  for (const student of students) {
    const s = seedByName.get(student.name)!;

    await prisma.gameProgress.create({
      data: {
        studentId: student.id,
        gameId: detectiveGame.id,
        currentChapter: s.detChapter,
        currentLevel: s.detLevel,
        status: s.detStatus,
        totalScore: s.detScore,
        totalXPEarned: s.detXp,
        detectiveSave: JSON.stringify({
          scenario: s.detChapter >= 2 ? 'school' : 'home',
          discoveredClues: s.detStatus === 'COMPLETED'
            ? ['canteen_queue', 'library_chaos', 'broken_bench', 'water_logged_path', 'traffic_jam']
            : ['canteen_queue', 'library_chaos'],
          identifiedProblems: [
            {
              id: 'canteen_queue',
              title: 'Long Canteen Queues',
              description: 'Students spend their entire recess waiting in line for food, leaving no time to eat.',
              affectedPeople: 'Students at lunch recess',
              frequency: 'daily',
              score: 85,
            },
            {
              id: 'library_chaos',
              title: 'Disorganised Library',
              description: 'Books are scattered everywhere, students cannot find what they need on time.',
              affectedPeople: 'Students and staff',
              frequency: 'daily',
              score: 72,
            },
          ],
        }),
      },
    });

    await prisma.gameProgress.create({
      data: {
        studentId: student.id,
        gameId: simulatorGame.id,
        currentChapter: s.simChapter,
        currentLevel: s.simLevel,
        status: s.simStatus,
        totalScore: s.simScore,
        totalXPEarned: s.simXp,
        simulatorSave: s.simStatus !== 'NOT_STARTED' ? JSON.stringify({
          startupName: ['EcoBites', 'QuickCart', 'LearnHub', 'GreenClean', 'SmartStudy'][students.indexOf(student) % 5],
          brandColor: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'][students.indexOf(student) % 5],
          team: [
            { name: 'Riya', role: 'Marketing', skill: 8 },
            { name: 'Arjun', role: 'Operations', skill: 7 },
            { name: 'Maya', role: 'Finance', skill: 9 },
          ],
          revenue: 125000,
          profit: 32000,
          valuation: 500000,
        }) : null,
      },
    });
  }

  // 13. Award achievements to students
  const allAchievements = await prisma.achievement.findMany();
  const achievementMap = new Map(allAchievements.map(a => [a.slug, a]));

  const studentAchievements = [
    { email: 'aryan@student.com', slugs: ['first-steps', 'clue-hunter', 'problem-spotter', 'detective-pro', 'brand-born'] },
    { email: 'priya@student.com', slugs: ['first-steps', 'clue-hunter'] },
    { email: 'rahul@student.com', slugs: ['first-steps', 'clue-hunter', 'problem-spotter', 'detective-pro', 'brand-born', 'open-for-business', 'profitable'] },
    { email: 'sneha@student.com', slugs: ['first-steps', 'clue-hunter'] },
    { email: 'amit@student.com', slugs: ['first-steps'] },
    { email: 'kunal@student.com', slugs: ['first-steps', 'clue-hunter', 'problem-spotter', 'detective-pro', 'master-detective', 'brand-born', 'open-for-business', 'profitable', 'millionaire', 'startup-master'] },
    { email: 'diya@student.com', slugs: ['first-steps', 'clue-hunter', 'problem-spotter', 'detective-pro', 'brand-born'] },
    { email: 'rohan@student.com', slugs: ['first-steps', 'clue-hunter'] },
    { email: 'neha@student.com', slugs: ['first-steps', 'clue-hunter', 'problem-spotter', 'detective-pro', 'brand-born', 'open-for-business'] },
    { email: 'vikram@student.com', slugs: ['first-steps', 'clue-hunter', 'problem-spotter', 'detective-pro', 'master-detective', 'brand-born', 'open-for-business', 'profitable', 'millionaire', 'startup-master'] },
  ];

  for (const sa of studentAchievements) {
    const user = await prisma.user.findUnique({
      where: { email: sa.email },
      include: { student: true },
    });
    if (!user || !user.student) continue;

    for (const slug of sa.slugs) {
      const ach = achievementMap.get(slug);
      if (!ach) continue;

      await prisma.studentAchievement.create({
        data: {
          studentId: user.student.id,
          achievementId: ach.id,
          earnedAt: daysAgo(Math.floor(Math.random() * 30)),
        },
      });
    }
  }

  console.log('Achievements awarded to students.');

  // 14. Create Coin Transactions
  const transactionReasons = [
    { reason: 'Completed Level 1.1 - Getting Briefed', amount: 50 },
    { reason: 'Completed Level 2.3 - Investigation Detail', amount: 75 },
    { reason: 'Completed Chapter 1: Who is an Entrepreneur?', amount: 150 },
    { reason: 'Completed Chapter 3: Finding Problems Around You', amount: 200 },
    { reason: 'Achievement Bonus: Clue Hunter', amount: 25 },
    { reason: 'Achievement Bonus: Problem Spotter', amount: 75 },
    { reason: 'Achievement Bonus: Detective Pro', amount: 150 },
    { reason: 'Daily login bonus (Day 5)', amount: 10 },
    { reason: 'Daily login bonus (Day 10)', amount: 25 },
    { reason: 'Quiz Score: 85% - Chapter 1 Assessment', amount: 100 },
    { reason: 'Quiz Score: 92% - Chapter 3 Assessment', amount: 120 },
    { reason: 'Streak milestone: 7 days', amount: 50 },
    { reason: 'Streak milestone: 14 days', amount: 100 },
    { reason: 'Purchased avatar accessory: Glasses', amount: -50 },
  ];

  for (const student of students) {
    const numTransactions = 5 + Math.floor(Math.random() * 8);
    const usedIndices = new Set<number>();

    for (let i = 0; i < numTransactions; i++) {
      let idx: number;
      do {
        idx = Math.floor(Math.random() * transactionReasons.length);
      } while (usedIndices.has(idx));
      usedIndices.add(idx);

      const t = transactionReasons[idx];
      await prisma.coinTransaction.create({
        data: {
          studentId: student.id,
          amount: t.amount,
          reason: t.reason,
          createdAt: daysAgo(Math.floor(Math.random() * 20)),
        },
      });
    }
  }

  console.log('Coin transactions created.');

  // 15. Create Quiz Attempts
  const quizTemplates = [
    { chapterRef: 'Chapter 1', questions: JSON.stringify([
      { question: 'What is an entrepreneur?', correct: 'Someone who starts a business' },
      { question: 'What is a business model?', correct: 'How a company makes money' },
    ]), maxScore: 100 },
    { chapterRef: 'Chapter 3', questions: JSON.stringify([
      { question: 'What makes a good problem to solve?', correct: 'It affects many people daily' },
      { question: 'How do you identify customer needs?', correct: 'Observation and interviews' },
    ]), maxScore: 100 },
    { chapterRef: 'Chapter 4', questions: JSON.stringify([
      { question: 'What is opportunity mapping?', correct: 'A way to evaluate problems' },
      { question: 'What is market size?', correct: 'Number of potential customers' },
    ]), maxScore: 100 },
  ];

  for (const student of students) {
    for (const quiz of quizTemplates) {
      const score = 60 + Math.floor(Math.random() * 40);
      await prisma.quizAttempt.create({
        data: {
          studentId: student.id,
          chapterRef: quiz.chapterRef,
          questions: quiz.questions,
          score,
          maxScore: quiz.maxScore,
          completedAt: daysAgo(Math.floor(Math.random() * 15)),
        },
      });
    }
  }

  console.log('Quiz attempts created.');

  // 16. Create Level Attempts for first few students
  for (const student of students.slice(0, 5)) {
    const detProgress = await prisma.gameProgress.findFirst({
      where: { studentId: student.id, gameId: detectiveGame.id },
    });
    if (!detProgress) continue;

    const levels = await prisma.level.findMany({
      where: {
        chapter: { gameId: detectiveGame.id },
      },
      orderBy: [{ chapter: { number: 'asc' } }, { number: 'asc' }],
    });

    // Simulate attempts for some levels
    for (const level of levels.slice(0, detProgress.currentLevel)) {
      const passed = level.number < detProgress.currentLevel || (level.number === detProgress.currentLevel && detProgress.status === 'COMPLETED');
      const score = passed ? level.maxScore - Math.floor(Math.random() * 200) : Math.floor(Math.random() * 500);

      await prisma.levelAttempt.create({
        data: {
          progressId: detProgress.id,
          chapterNumber: level.chapterId === (await prisma.chapter.findFirst({ where: { gameId: detectiveGame.id, number: 1 } }))?.id ? 1 : 2,
          levelNumber: level.number,
          score,
          maxScore: level.maxScore,
          passed: passed || score >= level.passingScore,
          timeSpent: 120 + Math.floor(Math.random() * 480),
          completedAt: daysAgo(Math.floor(Math.random() * 20)),
        },
      });
    }
  }

  console.log('Level attempts created.');

  console.log('Seed database completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
