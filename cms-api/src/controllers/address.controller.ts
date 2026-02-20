import { Request, Response, NextFunction } from 'express';
import { addressService } from '../services/address.service';
import { sendSuccess, sendCreated } from '../utils/response.util';

export const addressController = {
  async listByCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = Number(req.params.id);
      const addresses = await addressService.getAddressesByCustomer(customerId);
      sendSuccess(res, addresses);
    } catch (err) {
      next(err);
    }
  },

  async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = Number(req.params.id);
      const address = await addressService.addAddress(customerId, req.body);
      sendCreated(res, address, 'Address added successfully');
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const addressId = Number(req.params.addressId);
      const address = await addressService.updateAddress(addressId, req.body);
      sendSuccess(res, address, 'Address updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const addressId = Number(req.params.addressId);
      await addressService.deleteAddress(addressId);
      sendSuccess(res, null, 200, 'Address deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};
