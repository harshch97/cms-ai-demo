import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { FieldValidationError } from '../types/api.types';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors: FieldValidationError[] = (result.error as ZodError).errors.map(
        (e) => ({
          field: e.path.join('.'),
          message: e.message,
        })
      );

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    req[target] = result.data;
    next();
  };
}
