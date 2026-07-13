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

    if (!membership) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this group' });
      return;
    }

    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};
