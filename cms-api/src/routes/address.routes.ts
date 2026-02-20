import { Router } from 'express';
import { addressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateAddressSchema } from '../validators/address.validator';

const router = Router();

// PUT /addresses/:addressId — update a specific address
router.put(
  '/:addressId',
  authenticate,
  validate(updateAddressSchema),
  addressController.update
);

// DELETE /addresses/:addressId — delete a specific address
router.delete('/:addressId', authenticate, addressController.remove);

export default router;
