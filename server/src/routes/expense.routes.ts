import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import validateRequest from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth.middleware';
import { groupAccessMiddleware } from '../middleware/groupAccess.middleware';
import { createExpenseSchema, updateExpenseSchema } from '../validators/expense.schema';

const router = Router();

router.use(authMiddleware);

router.post('/', validateRequest(createExpenseSchema), groupAccessMiddleware, expenseController.createExpense);
router.get('/group/:groupId', groupAccessMiddleware, expenseController.getGroupExpenses);
router.get('/:id', expenseController.getExpense); // assuming access check in service or via groupAccess with body.groupId
router.patch('/:id', validateRequest(updateExpenseSchema), groupAccessMiddleware, expenseController.updateExpense);

export default router;
