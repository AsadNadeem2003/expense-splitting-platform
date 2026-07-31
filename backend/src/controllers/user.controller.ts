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

export const searchUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string || '';
    
    const users = await userService.searchUsers(query);
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    next(error);
  }
};

export const getActivityFeed = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const activities = await userService.getActivityFeed(req.user!.id, limit);
    res.status(200).json({ status: 'success', data: activities });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, defaultCurrency, paymentMethod } = req.body;
    const user = await userService.updateProfile(req.user!.id, { name, defaultCurrency, paymentMethod });
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};
