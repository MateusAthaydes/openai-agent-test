import { Router } from 'express';
import { locations } from '../data/mockData';
import { RealTimeLogger } from '../server';

const router = Router();

// GET /api/locations - Get all locations
router.get('/', (req, res) => {
  const logger = RealTimeLogger.getInstance();
  logger.log('info', 'LOCATIONS', 'Fetching all locations from database', { 
    totalLocations: locations.length,
    locations: locations.map(l => ({ id: l.id, name: l.name, city: l.city }))
  });
  res.json(locations);
});

// GET /api/locations/:id - Get location by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const logger = RealTimeLogger.getInstance();
  
  const location = locations.find(l => l.id === id);
  if (!location) {
    logger.log('warning', 'LOCATIONS', `Location not found: ${id}`);
    return res.status(404).json({ error: 'Location not found' });
  }
  
  logger.log('success', 'LOCATIONS', `Found location: ${location.name}`, { location });
  res.json(location);
});

export default router;