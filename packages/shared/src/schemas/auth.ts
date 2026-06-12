import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional()
});

export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['STUDENT', 'FACULTY', 'PARENT', 'SUPER_ADMIN'], {
    required_error: 'Role is required'
  }),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  schoolId: z.string().optional(),
  classroomId: z.string().optional(),
  rollNumber: z.string().optional(),
  phone: z.string().optional(),
  childRollNumber: z.string().optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
