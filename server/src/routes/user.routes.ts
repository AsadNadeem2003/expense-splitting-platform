import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/dashboard', userController.getDashboardStats);
router.get('/search', userController.searchUsers);
router.get('/activity', userController.getActivityFeed);
router.put('/profile', userController.updateProfile);

export default router;
