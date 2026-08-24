import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(35, 'Name cannot exceed 35 characters').optional(),
  defaultCurrency: z.string().trim().max(10, 'Currency symbol cannot exceed 10 characters').nullable().optional().or(z.literal('')),
  paymentMethod: z.string().trim().max(255, 'Payment method details cannot exceed 255 characters').nullable().optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
