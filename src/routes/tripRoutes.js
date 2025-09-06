import express from 'express';
import { addTrip, listTrips, getMatches } from '../controllers/tripController.js';

const router = express.Router();

router.post('/', addTrip);
router.get('/', listTrips);
router.get('/matches/:tripId', getMatches);

export default router;