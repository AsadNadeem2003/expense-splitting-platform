import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as userService from '../services/user.service';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await userService.getDashboardStats(req.user!.id);
    res.status(200).json({ status: 'success', data: stats });
  } catch (error) {
    next(error);
  }
};
