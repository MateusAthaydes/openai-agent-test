import { Router } from 'express';
import { clinicians } from '../data/mockData';

const router = Router();

// GET /api/clinicians - Get all clinicians
router.get('/', (req, res) => {
  console.log('📋 API: Fetching all clinicians');
  res.json(clinicians);
});

// GET /api/clinicians/:id - Get clinician by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📋 API: Fetching clinician with ID: ${id}`);
  
  const clinician = clinicians.find(c => c.id === id);
  if (!clinician) {
    return res.status(404).json({ error: 'Clinician not found' });
  }
  
  res.json(clinician);
});

// GET /api/clinicians/location/:locationId - Get clinicians by location
router.get('/location/:locationId', (req, res) => {
  const { locationId } = req.params;
  console.log(`📋 API: Fetching clinicians for location: ${locationId}`);
  
  const locationClinicians = clinicians.filter(c => c.locationId === locationId);
  res.json(locationClinicians);
});

export default router;