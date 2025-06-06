import { Router } from 'express';
import { clinicians } from '../data/mockData';
import { RealTimeLogger } from '../server';

const router = Router();

// GET /api/clinicians - Get all clinicians
router.get('/', (req, res) => {
  const logger = RealTimeLogger.getInstance();
  logger.log('info', 'CLINICIANS', 'Fetching all clinicians from database', { totalClinicians: clinicians.length });
  res.json(clinicians);
});

// GET /api/clinicians/:id - Get clinician by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const logger = RealTimeLogger.getInstance();
  
  const clinician = clinicians.find(c => c.id === id);
  if (!clinician) {
    logger.log('warning', 'CLINICIANS', `Clinician not found: ${id}`);
    return res.status(404).json({ error: 'Clinician not found' });
  }
  
  logger.log('success', 'CLINICIANS', `Found clinician: ${clinician.name}`, { clinician });
  res.json(clinician);
});

// GET /api/clinicians/location/:locationId - Get clinicians by location
router.get('/location/:locationId', (req, res) => {
  const { locationId } = req.params;
  const logger = RealTimeLogger.getInstance();
  
  const locationClinicians = clinicians.filter(c => c.locationId === locationId);
  logger.log('info', 'CLINICIANS', `Filtering clinicians by location: ${locationId}`, { 
    locationId, 
    foundClinicians: locationClinicians.length,
    clinicians: locationClinicians.map(c => ({ id: c.id, name: c.name, specialty: c.specialty }))
  });
  
  res.json(locationClinicians);
});

export default router;