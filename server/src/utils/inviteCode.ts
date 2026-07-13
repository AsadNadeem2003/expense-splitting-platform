import crypto from 'crypto';
import prisma from '../config/prisma';

export const generateInviteCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let inviteCode = '';
  let isUnique = false;
  let maxRetries = 10;

  while (!isUnique && maxRetries > 0) {
    inviteCode = '';
    for (let i = 0; i < 8; i++) {
      inviteCode += chars.charAt(crypto.randomInt(0, chars.length));
    }

    const existing = await prisma.group.findUnique({
      where: { inviteCode }
    });

    if (!existing) {
      isUnique = true;
    }
    maxRetries--;
  }

  if (!isUnique) {
    throw new Error('Failed to generate a unique invite code after 10 attempts');
  }

  return inviteCode;
};
