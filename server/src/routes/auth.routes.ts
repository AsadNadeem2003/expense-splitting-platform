import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import validateRequest from '../middleware/validateRequest';
import { registerSchema, loginSchema } from '../validators/auth.schema';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

export default router;
