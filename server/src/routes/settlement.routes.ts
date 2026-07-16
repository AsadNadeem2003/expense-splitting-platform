import { Router } from 'express';
import * as settlementController from '../controllers/settlement.controller';
import validateRequest from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth.middleware';
import { groupAccessMiddleware } from '../middleware/groupAccess.middleware';
import { upload } from '../middleware/upload.middleware';
import { createSettlementSchema } from '../validators/settlement.schema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Settlements
 *   description: Settlement (payment) recording between group members
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/settlements:
 *   post:
 *     summary: Record a settlement payment (with optional screenshot)
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - payeeId
 *               - amount
 *             properties:
 *               groupId:
 *                 type: integer
 *                 example: 1
 *               payeeId:
 *                 type: integer
 *                 example: 2
 *               amount:
 *                 type: number
 *                 example: 500
 *               screenshot:
 *                 type: string
 *                 format: binary
 *                 description: Optional payment screenshot image
 *     responses:
 *       201:
 *         description: Settlement recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not a member of this group
 */
// Middleware hack: use upload.single first so req.body gets populated with text fields before validation
router.post(
  '/', 
  upload.single('screenshot'), 
  (req, res, next) => {
    // Parse numeric fields back before Zod validation since FormData sends everything as strings
    if (req.body.amount) req.body.amount = parseFloat(req.body.amount);
    if (req.body.groupId) req.body.groupId = parseInt(req.body.groupId, 10);
    if (req.body.payeeId) req.body.payeeId = parseInt(req.body.payeeId, 10);
    next();
  },
  validateRequest(createSettlementSchema), 
  groupAccessMiddleware, 
  settlementController.createSettlement
);

/**
 * @swagger
 * /api/settlements/{id}/confirm:
 *   post:
 *     summary: Confirm a pending settlement
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The settlement ID
 *     responses:
 *       200:
 *         description: Settlement confirmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Settlement not found
 */
router.post('/:id/confirm', settlementController.confirmSettlement);

/**
 * @swagger
 * /api/settlements/{id}/reject:
 *   post:
 *     summary: Reject a pending settlement
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The settlement ID
 *     responses:
 *       200:
 *         description: Settlement rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Settlement not found
 */
router.post('/:id/reject', settlementController.rejectSettlement);

/**
 * @swagger
 * /api/settlements/group/{groupId}:
 *   get:
 *     summary: Get all settlements for a group
 *     tags: [Settlements]
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
 *         description: List of group settlements
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Not a member of this group
 */
router.get('/group/:groupId', groupAccessMiddleware, settlementController.getGroupSettlements);

export default router;
