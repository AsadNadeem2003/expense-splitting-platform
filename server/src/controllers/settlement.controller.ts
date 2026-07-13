import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { GroupAuthRequest } from '../middleware/groupAccess.middleware';
import * as settlementService from '../services/settlement.service';
import * as balanceService from '../services/balance.service';

export const createSettlement = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const filePath = req.file ? `/uploads/settlements/${req.file.filename}` : undefined;
    
    // Convert string amounts to number for validation
    if (req.body.amount) req.body.amount = parseFloat(req.body.amount);
    if (req.body.groupId) req.body.groupId = parseInt(req.body.groupId, 10);
    if (req.body.payeeId) req.body.payeeId = parseInt(req.body.payeeId, 10);

    const settlement = await settlementService.createSettlement(req.user!.id, req.body, filePath);
    res.status(201).json({ status: 'success', data: settlement });
  } catch (error) { next(error); }
};

export const confirmSettlement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const settlement = await settlementService.confirmSettlement(req.user!.id, id);
    res.status(200).json({ status: 'success', data: settlement });
  } catch (error) { next(error); }
};

export const rejectSettlement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const settlement = await settlementService.rejectSettlement(req.user!.id, id);
    res.status(200).json({ status: 'success', data: settlement });
  } catch (error) { next(error); }
};

export const getGroupSettlements = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const settlements = await settlementService.getGroupSettlements(groupId);
    res.status(200).json({ status: 'success', data: settlements });
  } catch (error) { next(error); }
};

export const getBalances = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const balances = await balanceService.getGroupBalances(groupId);
    const simplified = balanceService.simplifyDebts(balances);
    res.status(200).json({ status: 'success', data: { balances, simplified } });
  } catch (error) { next(error); }
};
