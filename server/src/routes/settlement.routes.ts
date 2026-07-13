import { Router } from 'express';
import * as settlementController from '../controllers/settlement.controller';
import validateRequest from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth.middleware';
import { groupAccessMiddleware } from '../middleware/groupAccess.middleware';
import { upload } from '../middleware/upload.middleware';
import { createSettlementSchema } from '../validators/settlement.schema';

const router = Router();

router.use(authMiddleware);

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

router.post('/:id/confirm', settlementController.confirmSettlement);
router.post('/:id/reject', settlementController.rejectSettlement);
router.get('/group/:groupId', groupAccessMiddleware, settlementController.getGroupSettlements);

// We'll put balance endpoints here too, or in groups. Let's put in groups or a new balances route.
// Actually, putting balances in group routes makes more sense since it's /groups/:groupId/balances

export default router;
