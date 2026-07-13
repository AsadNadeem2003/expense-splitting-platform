import { z } from 'zod';

export const createExpenseSchema = z.object({
  groupId: z.number().int().positive(),
  description: z.string().min(1, 'Description is required').max(255),
  totalAmount: z.number().positive('Total amount must be positive'), // expecting rupees from client
  participants: z.array(z.object({
    userId: z.number().int().positive(),
    shareAmount: z.number().nonnegative() // expecting rupees
  })).min(1, 'At least one participant required'),
  payers: z.array(z.object({
    userId: z.number().int().positive(),
    amountPaid: z.number().nonnegative() // expecting rupees
  })).optional()
});

export const updateExpenseSchema = z.object({
  groupId: z.number().int().positive(),
  description: z.string().min(1).max(255).optional(),
  totalAmount: z.number().positive().optional(),
  participants: z.array(z.object({
    userId: z.number().int().positive(),
    shareAmount: z.number().nonnegative()
  })).optional(),
  payers: z.array(z.object({
    userId: z.number().int().positive(),
    amountPaid: z.number().nonnegative()
  })).optional()
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
