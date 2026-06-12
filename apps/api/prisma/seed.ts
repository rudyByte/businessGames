import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
  const dpsStudents = [
    { name: 'Aryan Goel', email: 'aryan@student.com', classroomId: dpsClassA.id, rollNumber: '01' },
    { name: 'Priya Patel', email: 'priya@student.com', classroomId: dpsClassA.id, rollNumber: '02' },
    { name: 'Rahul Sen', email: 'rahul@student.com', classroomId: dpsClassA.id, rollNumber: '03' },
    { name: 'Sneha Rao', email: 'sneha@student.com', classroomId: dpsClassB.id, rollNumber: '04' },
    { name: 'Amit Shah', email: 'amit@student.com', classroomId: dpsClassB.id, rollNumber: '05' },
  ];

  const misStudents = [
    { name: 'Kunal Kapoor', email: 'kunal@student.com', classroomId: misClassA.id, rollNumber: '10' },
    { name: 'Diya Verma', email: 'diya@student.com', classroomId: misClassA.id, rollNumber: '11' },
    { name: 'Rohan Joshi', email: 'rohan@student.com', classroomId: misClassA.id, rollNumber: '12' },
    { name: 'Neha Nair', email: 'neha@student.com', classroomId: misClassA.id, rollNumber: '13' },
    { name: 'Vikram Singh', email: 'vikram@student.com', classroomId: misClassA.id, rollNumber: '14' },
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
        totalXP: 120,
        level: 2,
        coins: 150,
      },
    });

    students.push(student);
  }

  console.log('Students created.');

  // 7. Create Parents and link
  const parentData = [
    { name: 'Mrs. Goel', email: 'parent.goel@parent.com', childEmail: 'aryan@student.com' },
    { name: 'Mr. Patel', email: 'parent.patel@parent.com', childEmail: 'priya@student.com' },
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

    const childUser = await prisma.user.findUnique({
      where: { email: p.childEmail },
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

  // 12. Create GameProgress for seed students to display details on dashboard
  for (const student of students.slice(0, 3)) {
    await prisma.gameProgress.create({
      data: {
        studentId: student.id,
        gameId: detectiveGame.id,
        currentChapter: 2,
        currentLevel: 3,
        status: 'IN_PROGRESS',
        totalScore: 1800,
        totalXPEarned: 350,
        detectiveSave: JSON.stringify({
          scenario: 'school',
          discoveredClues: ['canteen_queue', 'library_chaos'],
          identifiedProblems: [
            {
              id: 'canteen_queue',
              title: 'Long Canteen Queues',
              description: 'Students spend their entire recess waiting in line for food, leaving no time to eat.',
              affectedPeople: 'Students at lunch recess',
              frequency: 'daily',
              discoveredVia: ['long_queue_visual'],
              fromScene: 'school',
            },
          ],
        }),
      },
    });

    await prisma.gameProgress.create({
      data: {
        studentId: student.id,
        gameId: simulatorGame.id,
        currentChapter: 1,
        currentLevel: 1,
        status: 'NOT_STARTED',
      },
    });
  }

  console.log('Seed database completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
