import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';

export const customerController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search } = req.query as {
        page: string;
        limit: string;
        search?: string;
      };

      const result = await customerService.listCustomers(
        Number(page),
        Number(limit),
        search
      );
      sendPaginated(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const customer = await customerService.getCustomerById(id);
      sendSuccess(res, customer);
    } catch (err) {
      next(err);
    }
  },

  /** POST /customers — create customer + address in one call */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.createCustomer(req.body);
      sendCreated(res, customer, 'Customer created successfully');
    } catch (err) {
      next(err);
    }
  },

  /** PUT /customers/:id — update customer and optionally their address in one call */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const customer = await customerService.updateCustomer(id, req.body);
      sendSuccess(res, customer, 'Customer updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await customerService.deleteCustomer(id);
      sendSuccess(res, null, 200, 'Customer deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};

