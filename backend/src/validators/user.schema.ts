import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(50, 'Name cannot exceed 50 characters').optional(),
  defaultCurrency: z.string().trim().max(10, 'Currency symbol cannot exceed 10 characters').optional(),
  paymentMethod: z.string().trim().max(100, 'Payment method details cannot exceed 100 characters').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
