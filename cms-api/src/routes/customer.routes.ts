import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { addressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerListQuerySchema,
} from '../validators/customer.validator';
import { createAddressSchema } from '../validators/address.validator';

const router = Router();

// GET /customers — list with pagination + optional search
router.get(
  '/',
  authenticate,
  validate(customerListQuerySchema, 'query'),
  customerController.list
);

// POST /customers — create customer + address in a single call
router.post(
  '/',
  authenticate,
  validate(createCustomerSchema),
  customerController.create
);

// GET /customers/:id — get customer with all addresses
router.get('/:id', authenticate, customerController.getById);

// PUT /customers/:id — update customer and/or address in a single call
router.put(
  '/:id',
  authenticate,
  validate(updateCustomerSchema),
  customerController.update
);

// DELETE /customers/:id — hard-delete customer (+ cascade addresses)
router.delete('/:id', authenticate, customerController.remove);

// GET /customers/:id/addresses — list addresses for a customer
router.get('/:id/addresses', authenticate, addressController.listByCustomer);

// POST /customers/:id/addresses — add a new address to an existing customer
router.post(
  '/:id/addresses',
  authenticate,
  validate(createAddressSchema),
  addressController.add
);

export default router;

