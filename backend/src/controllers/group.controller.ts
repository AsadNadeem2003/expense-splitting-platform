import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { GroupAuthRequest } from '../middleware/groupAccess.middleware';
import * as groupService from '../services/group.service';
import * as balanceService from '../services/balance.service';

export const createGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const group = await groupService.createGroup(req.user!.id, req.body);
    res.status(201).json({ status: 'success', data: group });
  } catch (error) { next(error); }
};

export const joinGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const request = await groupService.joinGroup(req.user!.id, req.body.inviteCode);
    res.status(200).json({ status: 'success', data: request });
  } catch (error) { next(error); }
};

export const getUserGroups = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const groups = await groupService.getUserGroups(req.user!.id);
    res.status(200).json({ status: 'success', data: groups });
  } catch (error) { next(error); }
};

export const getGroupDetails = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const group = await groupService.getGroupDetails(groupId);
    res.status(200).json({ status: 'success', data: group });
  } catch (error) { next(error); }
};

export const approveRequest = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const requestId = parseInt(req.params.requestId, 10);
    const result = await groupService.approveRequest(req.user!.id, groupId, requestId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

export const rejectRequest = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const requestId = parseInt(req.params.requestId, 10);
    const result = await groupService.rejectRequest(req.user!.id, groupId, requestId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

export const inviteUser = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const result = await groupService.inviteUser(req.user!.id, groupId, req.body.email);
    res.status(200).json({ status: 'success', data: result });
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

export const leaveGroup = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const userId = req.user!.id;
    
    const balances = await balanceService.getGroupBalances(groupId);
    // Allow leaving if balance is negligible (less than 1 Rupee / 100 paisa)
    if (balances[userId] !== undefined && Math.abs(balances[userId]) >= 100) {
      throw new Error("Cannot leave group with a balance of Rs. 1 or more.");
    }
    
    // Call the actual leave group service which we didn't fully implement in groupService but let's do it now
    await groupService.leaveGroup(userId, groupId);
    
    res.status(200).json({ status: 'success', message: 'Left group' });
  } catch (error) { next(error); }
};

export const removeMember = async (req: GroupAuthRequest, res: Response, next: NextFunction) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const userIdToRemove = parseInt(req.params.userId, 10);
    const result = await groupService.removeMember(req.user!.id, groupId, userIdToRemove);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};
