import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from './auth.middleware';

export interface GroupAuthRequest extends AuthRequest {
  membership?: {
    id: number;
    role: 'ADMIN' | 'MEMBER';
  };
}

export const groupAccessMiddleware = async (req: GroupAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: Authentication required before checking group access' });
    return;
  }

  // Group ID can come from params, body, or query
  const groupIdStr = req.params.groupId || req.body.groupId || req.query.groupId;
  
  if (!groupIdStr) {
    res.status(400).json({ error: 'Bad Request: Group ID is required' });
    return;
  }

  const groupId = parseInt(groupIdStr, 10);
  if (isNaN(groupId)) {
    res.status(400).json({ error: 'Bad Request: Invalid Group ID' });
    return;
  }

  try {
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: req.user.id
        }
      }
    });

    if (membership) {
      req.membership = membership;
      return next();
    }

    // Check for historical access (former members who have past expenses or settlements in this group)
    const [participated, paid, settlement] = await Promise.all([
      prisma.expenseParticipant.findFirst({
        where: { userId: req.user.id, expense: { groupId } }
      }),
      prisma.expensePayer.findFirst({
        where: { userId: req.user.id, expense: { groupId } }
      }),
      prisma.settlement.findFirst({
        where: { OR: [{ payerId: req.user.id }, { payeeId: req.user.id }], groupId }
      })
    ]);

    if (participated || paid || settlement) {
      req.membership = {
        id: 0,
        role: 'FORMER' as any
      };
      return next();
    }

    res.status(403).json({ error: 'Forbidden: You are not a member of this group' });
  } catch (error) {
    next(error);
  }
};
