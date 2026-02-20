import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import addressRoutes from './address.routes';
import referenceRoutes from './reference.routes';

const router = Router();

// Public
router.use('/auth', authRoutes);

// Protected (each route applies authenticate middleware internally)
router.use('/customers', customerRoutes);
router.use('/addresses', addressRoutes);
router.use('/reference', referenceRoutes);

export default router;
