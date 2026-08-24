import { z } from 'zod';

export const createExpenseSchema = z.object({
  groupId: z.number().int().positive(),
  description: z.string().trim().min(2, 'Description must be at least 2 characters long').max(60, 'Description cannot exceed 60 characters'),
  totalAmount: z.number().positive('Total amount must be greater than 0').max(10000000, 'Amount cannot exceed Rs. 10,000,000'), // expecting rupees from client
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
  description: z.string().trim().min(2, 'Description must be at least 2 characters long').max(60, 'Description cannot exceed 60 characters').optional(),
  totalAmount: z.number().positive('Total amount must be greater than 0').max(10000000, 'Amount cannot exceed Rs. 10,000,000').optional(),
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
