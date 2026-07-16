import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import validateRequest from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth.middleware';
import { groupAccessMiddleware } from '../middleware/groupAccess.middleware';
import { createExpenseSchema, updateExpenseSchema } from '../validators/expense.schema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense creation and management within groups
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense in a group
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpenseRequest'
 *     responses:
 *       201:
 *         description: Expense created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not a member of this group
 */
router.post('/', validateRequest(createExpenseSchema), groupAccessMiddleware, expenseController.createExpense);

/**
 * @swagger
 * /api/expenses/group/{groupId}:
 *   get:
 *     summary: Get all expenses for a group
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The group ID
 *     responses:
 *       200:
 *         description: List of group expenses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Not a member of this group
 */
router.get('/group/:groupId', groupAccessMiddleware, expenseController.getGroupExpenses);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get a single expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The expense ID
 *     responses:
 *       200:
 *         description: Expense details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Expense not found
 */
router.get('/:id', expenseController.getExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   patch:
 *     summary: Update an existing expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExpenseRequest'
 *     responses:
 *       200:
 *         description: Expense updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not a member of this group
 *       404:
 *         description: Expense not found
 */
router.patch('/:id', validateRequest(updateExpenseSchema), groupAccessMiddleware, expenseController.updateExpense);

export default router;
