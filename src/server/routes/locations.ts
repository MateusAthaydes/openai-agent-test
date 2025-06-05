import { Router } from 'express';
import { locations } from '../data/mockData';

const router = Router();

// GET /api/locations - Get all locations
router.get('/', (req, res) => {
  console.log('🏥 API: Fetching all locations');
  res.json(locations);
});

// GET /api/locations/:id - Get location by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🏥 API: Fetching location with ID: ${id}`);
  
  const location = locations.find(l => l.id === id);
  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }
  
  res.json(location);
});

export default router;