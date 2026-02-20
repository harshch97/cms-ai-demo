import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

// POST /auth/login — obtain a JWT token
router.post('/login', validate(loginSchema, 'body'), authController.login);

export default router;
