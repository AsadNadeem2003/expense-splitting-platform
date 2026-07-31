import { Router } from 'express';
import * as groupController from '../controllers/group.controller';
import validateRequest from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth.middleware';
import { groupAccessMiddleware } from '../middleware/groupAccess.middleware';
import { createGroupSchema, joinGroupSchema, inviteUserSchema } from '../validators/group.schema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group management – create, join, invite, and manage members
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new expense group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroupRequest'
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 */
router.post('/', validateRequest(createGroupSchema), groupController.createGroup);

/**
 * @swagger
 * /api/groups/join:
 *   post:
 *     summary: Join a group via invite code
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinGroupRequest'
 *     responses:
 *       200:
 *         description: Joined group successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid invite code
 */
router.post('/join', validateRequest(joinGroupSchema), groupController.joinGroup);

/**
 * @swagger
 * /api/groups/my:
 *   get:
 *     summary: Get all groups the authenticated user belongs to
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's groups
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/my', groupController.getUserGroups);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   get:
 *     summary: Get detailed information about a specific group
 *     tags: [Groups]
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
 *         description: Group details returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Not a member of this group
 *       404:
 *         description: Group not found
 */
router.get('/:groupId', groupAccessMiddleware, groupController.getGroupDetails);

/**
 * @swagger
 * /api/groups/{groupId}/balances:
 *   get:
 *     summary: Get balance summary for all members in a group
 *     tags: [Groups]
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
 *         description: Balance information returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Not a member of this group
 */
router.get('/:groupId/balances', groupAccessMiddleware, groupController.getBalances);

/**
 * @swagger
 * /api/groups/{groupId}/invite:
 *   post:
 *     summary: Invite a user to the group by email
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InviteUserRequest'
 *     responses:
 *       200:
 *         description: Invitation sent
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not a member of this group
 */
router.post('/:groupId/invite', groupAccessMiddleware, validateRequest(inviteUserSchema), groupController.inviteUser);

/**
 * @swagger
 * /api/groups/{groupId}/approve/{requestId}:
 *   post:
 *     summary: Approve a pending join request
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Request approved
 *       403:
 *         description: Not a member of this group
 *       404:
 *         description: Request not found
 */
router.post('/:groupId/approve/:requestId', groupAccessMiddleware, groupController.approveRequest);

/**
 * @swagger
 * /api/groups/{groupId}/reject/{requestId}:
 *   post:
 *     summary: Reject a pending join request
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Request rejected
 *       403:
 *         description: Not a member of this group
 *       404:
 *         description: Request not found
 */
router.post('/:groupId/reject/:requestId', groupAccessMiddleware, groupController.rejectRequest);

/**
 * @swagger
 * /api/groups/{groupId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from the group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member removed
 *       403:
 *         description: Not a member of this group
 *       404:
 *         description: User not found in group
 */
router.delete('/:groupId/members/:userId', groupAccessMiddleware, groupController.removeMember);

/**
 * @swagger
 * /api/groups/{groupId}/leave:
 *   delete:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Left the group
 *       403:
 *         description: Not a member of this group
 */
router.delete('/:groupId/leave', groupAccessMiddleware, groupController.leaveGroup);

export default router;
