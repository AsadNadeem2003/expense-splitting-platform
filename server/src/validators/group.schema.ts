import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
