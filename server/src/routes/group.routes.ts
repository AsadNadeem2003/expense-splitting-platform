import { Router } from 'express';
import * as groupController from '../controllers/group.controller';
import validateRequest from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth.middleware';
import { groupAccessMiddleware } from '../middleware/groupAccess.middleware';
import { createGroupSchema, joinGroupSchema, inviteUserSchema } from '../validators/group.schema';

const router = Router();

router.use(authMiddleware);

router.post('/', validateRequest(createGroupSchema), groupController.createGroup);
router.post('/join', validateRequest(joinGroupSchema), groupController.joinGroup);
router.get('/my', groupController.getUserGroups);

router.get('/:groupId', groupAccessMiddleware, groupController.getGroupDetails);
router.get('/:groupId/balances', groupAccessMiddleware, groupController.getBalances);
router.post('/:groupId/invite', groupAccessMiddleware, validateRequest(inviteUserSchema), groupController.inviteUser);
router.post('/:groupId/approve/:requestId', groupAccessMiddleware, groupController.approveRequest);
router.post('/:groupId/reject/:requestId', groupAccessMiddleware, groupController.rejectRequest);
router.delete('/:groupId/leave', groupAccessMiddleware, groupController.leaveGroup);

export default router;
