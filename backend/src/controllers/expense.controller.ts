import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { GroupAuthRequest } from '../middleware/groupAccess.middleware';
import * as expenseService from '../services/expense.service';

export const createExpense = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const expense = await expenseService.createExpense(req.user!.id, req.body);
    res.status(201).json({ status: 'success', data: expense });
  } catch (error) { next(error); }
};

export const updateExpense = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const expenseId = parseInt(req.params.id, 10);
    const expense = await expenseService.updateExpense(req.user!.id, expenseId, req.body);
    res.status(200).json({ status: 'success', data: expense });
  } catch (error) { next(error); }
};

export const getExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const expenseId = parseInt(req.params.id, 10);
    const expense = await expenseService.getExpense(expenseId);
    res.status(200).json({ status: 'success', data: expense });
  } catch (error) { next(error); }
};

export const getGroupExpenses = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const expenses = await expenseService.getGroupExpenses(groupId);
    res.status(200).json({ status: 'success', data: expenses });
  } catch (error) { next(error); }
};
