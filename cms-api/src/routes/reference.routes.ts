import { Router } from 'express';
import { referenceController } from '../controllers/reference.controller';

const router = Router();

// GET /reference/cities — all cities (no auth required)
router.get('/cities', referenceController.getCities);

// GET /reference/states — all states (no auth required)
router.get('/states', referenceController.getStates);

// GET /reference/states/:stateId/cities — cities filtered by state (no auth required)
router.get('/states/:stateId/cities', referenceController.getCitiesByState);

export default router;
