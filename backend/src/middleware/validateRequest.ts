import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

const validateRequest = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstMessage = error.issues[0]?.message || 'Validation failed';
        res.status(400).json({
          status: 'fail',
          message: firstMessage,
          error: firstMessage,
          details: error.issues
        });
        return;
      }
      next(error);
    }
  };
};

export default validateRequest;
