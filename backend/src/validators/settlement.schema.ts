import { z } from 'zod';

export const createSettlementSchema = z.object({
  groupId: z.number().int().positive(),
  payeeId: z.number().int().positive(),
  amount: z.number().positive('Amount must be positive'), // rupees
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
