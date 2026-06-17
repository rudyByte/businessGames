import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { registerSchema, loginSchema } from '@campusedge/shared';
import { validateBody } from '../middleware/validate';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'campusedge-development-secret-key-32-chars';
const JWT_EXPIRES_IN_VALUE = (process.env.JWT_EXPIRES_IN || '7d').replace(/^["']|["']$/g, '').trim();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/v1/auth/register
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role, name, schoolId, classroomId, rollNumber, phone, childRollNumber } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'A user with this email address already exists.' }
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
        }
      });

      if (role === 'STUDENT') {
        if (!schoolId) throw new Error('School ID is required for student registration.');
        await tx.student.create({
          data: {
            userId: newUser.id,
            name,
            schoolId,
            classroomId: classroomId || null,
            rollNumber: rollNumber || null,
            coins: 100, // starting coins
            totalXP: 0,
            level: 1,
          }
        });
      } else if (role === 'FACULTY') {
        if (!schoolId) throw new Error('School ID is required for faculty registration.');
        await tx.faculty.create({
          data: {
            userId: newUser.id,
            name,
            schoolId,
          }
        });
      } else if (role === 'PARENT') {
        const newParent = await tx.parent.create({
          data: {
            userId: newUser.id,
            name,
            phone: phone || null,
          }
        });

        // Link parent to child student if rollNumber and schoolId supplied
        if (childRollNumber && schoolId) {
          const child = await tx.student.findFirst({
            where: {
              rollNumber: childRollNumber,
              schoolId: schoolId
            }
          });
          if (child) {
            await tx.studentParentLink.create({
              data: {
                studentId: child.id,
                parentId: newParent.id
              }
            });
          }
        }
      } else if (role === 'SUPER_ADMIN') {
        await tx.superAdmin.create({
          data: {
            userId: newUser.id,
            name,
          }
        });
      }

      return newUser;
    });

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN_VALUE as any,
    });

    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        student: true,
        faculty: true,
        parent: {
          include: {
            children: {
              include: {
                student: true
              }
            }
          }
        },
        superAdmin: true
      }
    });

    // Remove passwordHash
    const { passwordHash: _, ...userSafe } = userWithProfile as any;

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: userSafe
      }
    });
  } catch (error: any) {
    next(error);
  }
});

// POST /api/v1/auth/login
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        faculty: true,
        parent: {
          include: {
            children: {
              include: {
                student: true
              }
            }
          }
        },
        superAdmin: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    // Update student activity date if student logs in
    if (user.student) {
      try {
        await prisma.student.update({
          where: { id: user.student.id },
          data: { lastActiveAt: new Date() }
        });
      } catch (activeErr) {
        console.warn('Failed to update student activity:', activeErr);
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN_VALUE as any
    });

    const { passwordHash: _, ...userSafe } = user as any;

    return res.json({
      success: true,
      data: {
        token,
        user: userSafe
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        faculty: true,
        parent: {
          include: {
            children: {
              include: {
                student: true
              }
            }
          }
        },
        superAdmin: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' }
      });
    }

    const { passwordHash: _, ...userSafe } = user as any;

    return res.json({
      success: true,
      data: userSafe
    });
  } catch (error) {
    next(error);
  }
});

export default router;
