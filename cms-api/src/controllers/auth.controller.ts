import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response.util';

export const authController = {
  /**
   * POST /auth/login
   * Body: { email, password }
   * Returns: { token, expiresIn, user: { id, name, email } }
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  },
};
