import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from '../repositories/auth.repository';
import { env } from '../config/env';
import { AuthResponse, LoginDto } from '../types/auth.types';
import { UnauthorizedError } from '../utils/errors';

export const authService = {
  /**
   * Validates email + password credentials and returns a signed JWT on success.
   * Throws UnauthorizedError for any invalid credential (intentionally vague
   * message to prevent user enumeration attacks).
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await authRepository.findByEmail(dto.email);

    // Use a constant-time comparison even when user is not found,
    // to prevent timing-based user enumeration.
    const dummyHash = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';
    const hashToCompare = user ? user.password_hash : dummyHash;
    const passwordMatch = await bcrypt.compare(dto.password, hashToCompare);

    if (!user || !passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, env.JWT.SECRET, {
      expiresIn: env.JWT.EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      token,
      expiresIn: env.JWT.EXPIRES_IN,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  },
};
