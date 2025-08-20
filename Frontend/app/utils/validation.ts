import { z } from 'zod';

// Signup validation schema
export const signupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must not exceed 60 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/, 
           'Password must contain at least 1 uppercase letter and 1 special character'),
  address: z
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .optional()
    .or(z.literal('')),
  role: z.enum(['user', 'owner'], {
    message: 'Please select a role',
  }),
});

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// TypeScript types from schemas
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
