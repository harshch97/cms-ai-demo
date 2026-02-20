import { Request, Response, NextFunction } from 'express';
import { referenceService } from '../services/reference.service';
import { sendSuccess } from '../utils/response.util';

export const referenceController = {
  async getCities(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cities = await referenceService.getCities();
      sendSuccess(res, cities);
    } catch (err) {
      next(err);
    }
  },

  async getStates(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const states = await referenceService.getStates();
      sendSuccess(res, states);
    } catch (err) {
      next(err);
    }
  },

  /** GET /reference/states/:stateId/cities — cities filtered by state */
  async getCitiesByState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stateId = parseInt(req.params.stateId, 10);
      const cities = await referenceService.getCitiesByState(stateId);
      sendSuccess(res, cities);
    } catch (err) {
      next(err);
    }
  },
};
