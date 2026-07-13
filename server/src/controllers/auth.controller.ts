import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
