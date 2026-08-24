import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().trim().min(2, 'Group name must be at least 2 characters long').max(35, 'Group name cannot exceed 35 characters'),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().trim().min(3, 'Invite code is required').max(10, 'Invalid invite code length'),
});

export const inviteUserSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
