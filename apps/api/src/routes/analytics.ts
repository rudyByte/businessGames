import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { schoolScopeMiddleware, scopeFilter } from '../middleware/schoolScope';

const router = Router();

// ─── ADMIN: Download school performance report as JSON/PDF data ──────
router.get(
  '/admin/school/:schoolId',
  authMiddleware,
  requireRole(['SUPER_ADMIN']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const schoolId = req.params.schoolId;

      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
          students: {
            include: {
              gameProgress: true,
            },
          },
          faculty: true,
          classrooms: true,
        },
      });

      if (!school) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'School not found.' },
        });
      }

      // Compute aggregate metrics
      const totalStudents = school.students.length;
      const activeStudents = school.students.filter((s) => s.lastActiveAt).length;
      const avgXP = totalStudents > 0
        ? Math.round(school.students.reduce((sum, s) => sum + s.totalXP, 0) / totalStudents)
        : 0;
      const avgLevel = totalStudents > 0
        ? Math.round(school.students.reduce((sum, s) => sum + s.level, 0) / totalStudents)
        : 0;

      // Chapter completion stats
      const chapterCompletions: Record<number, number> = {};
      for (const s of school.students) {
        for (const gp of s.gameProgress) {
          const ch = gp.currentChapter;
          chapterCompletions[ch] = (chapterCompletions[ch] || 0) + 1;
        }
      }

      const reportData = {
        schoolName: school.name,
        city: school.city,
        state: school.state,
        boardType: school.boardType,
        curriculumVersion: school.curriculumVersion,
        subscriptionTier: school.subscriptionTier,
        generatedAt: new Date().toISOString(),
        totalStudents,
        activeStudents,
        totalFaculty: school.faculty.length,
        totalClassrooms: school.classrooms.length,
        avgXP,
        avgLevel,
        chapterCompletions,
        studentList: school.students.map((s) => ({
          name: s.name,
          rollNumber: s.rollNumber,
          level: s.level,
          totalXP: s.totalXP,
          coins: s.coins,
          lastActiveAt: s.lastActiveAt,
          gameProgress: s.gameProgress.map((gp) => ({
            gameSlug: gp.gameId === 'problem-hunt' ? 'Problem Hunt' : 'Startup Simulator',
            currentChapter: gp.currentChapter,
            status: gp.status,
            totalScore: gp.totalScore,
          })),
        })),
      };

      return res.json({ success: true, data: reportData });
    } catch (error) {
      next(error);
    }
  }
);

// ─── FACULTY: Download classroom report as JSON/PDF data ─────────────
router.get(
  '/faculty/classroom/:classroomId',
  authMiddleware,
  requireRole(['FACULTY']),
  schoolScopeMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const classroomId = req.params.classroomId;

      const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId },
        include: {
          school: true,
          students: {
            include: {
              gameProgress: true,
            },
          },
        },
      });

      if (!classroom) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Classroom not found.' },
        });
      }

      // Verify faculty owns this classroom
      const faculty = await prisma.faculty.findUnique({
        where: { userId: req.user!.id },
      });
      if (!faculty || classroom.facultyId !== faculty.id) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have access to this classroom.' },
        });
      }

      const totalStudents = classroom.students.length;
      const avgXP = totalStudents > 0
        ? Math.round(classroom.students.reduce((sum, s) => sum + s.totalXP, 0) / totalStudents)
        : 0;
      const avgScore = totalStudents > 0
        ? Math.round(
            classroom.students.reduce((sum, s) => {
              const scores = s.gameProgress.map((gp) => gp.totalScore);
              return sum + (scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
            }, 0) / totalStudents
          )
        : 0;

      const reportData = {
        schoolName: classroom.school.name,
        classroomName: classroom.name,
        grade: classroom.grade,
        section: classroom.section,
        generatedAt: new Date().toISOString(),
        totalStudents,
        avgXP,
        avgScore,
        studentList: classroom.students.map((s) => ({
          name: s.name,
          rollNumber: s.rollNumber,
          level: s.level,
          totalXP: s.totalXP,
          lastActiveAt: s.lastActiveAt,
          gameProgress: s.gameProgress.map((gp) => ({
            gameName: gp.gameId === 'problem-hunt' ? 'Problem Hunt' : 'Startup Simulator',
            chapter: gp.currentChapter,
            score: gp.totalScore,
            status: gp.status,
            completedAt: gp.completedAt,
          })),
        })),
      };

      return res.json({ success: true, data: reportData });
    } catch (error) {
      next(error);
    }
  }
);

// ─── FACULTY: Download individual student report ─────────────────────
router.get(
  '/faculty/student/:studentId',
  authMiddleware,
  requireRole(['FACULTY']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.findUnique({
        where: { id: req.params.studentId },
        include: {
          school: true,
          classroom: true,
          gameProgress: {
            include: { game: true },
          },
          achievements: {
            include: { achievement: true },
          },
          quizAttempts: true,
        },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Student not found.' },
        });
      }

      return res.json({
        success: true,
        data: {
          name: student.name,
          rollNumber: student.rollNumber,
          schoolName: student.school.name,
          classroomName: student.classroom?.name,
          level: student.level,
          totalXP: student.totalXP,
          coins: student.coins,
          streak: student.streak,
          lastActiveAt: student.lastActiveAt,
          gameProgress: student.gameProgress,
          achievements: student.achievements.map((sa) => ({
            name: sa.achievement.name,
            description: sa.achievement.description,
            earnedAt: sa.earnedAt,
            badgeColor: sa.achievement.badgeColor,
          })),
          quizAttempts: student.quizAttempts,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
