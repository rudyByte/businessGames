import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'campusedge-development-secret-key-32-chars';

// ─── Generate invite code (SuperAdmin only) ─────────────────────────
router.post(
  '/generate',
  authMiddleware,
  requireRole(['SUPER_ADMIN']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { schoolId, role, maxUses = 50 } = req.body;

      if (!schoolId || !role) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION', message: 'schoolId and role are required.' },
        });
      }

      if (!['FACULTY', 'STUDENT'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION', message: 'Role must be FACULTY or STUDENT.' },
        });
      }

      // Generate a unique 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();

      const inviteCode = await prisma.inviteCode.create({
        data: {
          code,
          schoolId,
          role,
          maxUses,
        },
      });

      return res.status(201).json({ success: true, data: inviteCode });
    } catch (error) {
      next(error);
    }
  }
);

// ─── Validate and register using invite code ────────────────────────
router.post(
  '/register',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { code, email, password, name, rollNumber } = req.body;

      if (!code || !email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION', message: 'code, email, password, and name are required.' },
        });
      }

      // Find and validate invite code
      const invite = await prisma.inviteCode.findUnique({
        where: { code: code.toUpperCase() },
        include: { school: true },
      });

      if (!invite || !invite.isActive) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INVITE', message: 'This invite code is invalid or has expired.' },
        });
      }

      if (invite.expiresAt && invite.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVITE_EXPIRED', message: 'This invite code has expired.' },
        });
      }

      if (invite.currentUses >= invite.maxUses) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVITE_EXHAUSTED', message: 'This invite code has reached its maximum uses.' },
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: { code: 'USER_EXISTS', message: 'A user with this email already exists.' },
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      // Create user and profile in transaction
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { email, passwordHash, role: invite.role },
        });

        if (invite.role === 'STUDENT') {
          await tx.student.create({
            data: {
              userId: newUser.id,
              name,
              schoolId: invite.schoolId,
              rollNumber: rollNumber || null,
              coins: 100,
              totalXP: 0,
              level: 1,
            },
          });
        } else if (invite.role === 'FACULTY') {
          await tx.faculty.create({
            data: {
              userId: newUser.id,
              name,
              schoolId: invite.schoolId,
            },
          });
        }

        // Increment invite usage
        await tx.inviteCode.update({
          where: { id: invite.id },
          data: { currentUses: invite.currentUses + 1 },
        });

        return newUser;
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userWithProfile = await prisma.user.findUnique({
        where: { id: user.id },
        include: { student: true, faculty: true },
      });

      const { passwordHash: _, ...userSafe } = userWithProfile as any;

      return res.status(201).json({
        success: true,
        data: { token, user: userSafe },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── Bulk import students via CSV (SuperAdmin) ──────────────────────
router.post(
  '/bulk-import',
  authMiddleware,
  requireRole(['SUPER_ADMIN']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { schoolId, classroomId, students: studentsData } = req.body;

      // studentsData: Array of { name, email, rollNumber, password? }
      if (!schoolId || !Array.isArray(studentsData) || studentsData.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION', message: 'schoolId and students array are required.' },
        });
      }

      const results = { created: 0, failed: 0, errors: [] as string[] };

      for (const s of studentsData) {
        try {
          if (!s.email || !s.name) {
            results.failed++;
            results.errors.push(`Missing name or email for entry: ${JSON.stringify(s)}`);
            continue;
          }

          const existing = await prisma.user.findUnique({ where: { email: s.email } });
          if (existing) {
            results.failed++;
            results.errors.push(`User already exists: ${s.email}`);
            continue;
          }

          const passwordHash = await bcrypt.hash(s.password || 'User@123', 12);

          await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
              data: { email: s.email, passwordHash, role: 'STUDENT' },
            });
            await tx.student.create({
              data: {
                userId: user.id,
                name: s.name,
                schoolId,
                classroomId: classroomId || null,
                rollNumber: s.rollNumber || null,
                coins: 100,
                totalXP: 0,
                level: 1,
              },
            });
          });

          results.created++;
        } catch (err: any) {
          results.failed++;
          results.errors.push(`${s.email}: ${err.message}`);
        }
      }

      return res.status(201).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }
);

// ─── List invite codes for a school (SuperAdmin) ────────────────────
router.get(
  '/school/:schoolId',
  authMiddleware,
  requireRole(['SUPER_ADMIN']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const codes = await prisma.inviteCode.findMany({
        where: { schoolId: req.params.schoolId },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: codes });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
