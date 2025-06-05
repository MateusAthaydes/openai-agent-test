import { Router } from 'express';
import { getAvailableSlots, getAllSlots } from '../data/mockData';

const router = Router();

// GET /api/availability/:clinicianId/:date - Get available slots for a clinician on a specific date
router.get('/:clinicianId/:date', (req, res) => {
  const { clinicianId, date } = req.params;
  const { includeUnavailable } = req.query;
  
  console.log(`📅 API: Fetching availability for clinician ${clinicianId} on ${date}`);
  
  try {
    const slots = includeUnavailable === 'true' 
      ? getAllSlots(clinicianId, date)
      : getAvailableSlots(clinicianId, date);
    
    console.log(`📅 Found ${slots.length} ${includeUnavailable === 'true' ? 'total' : 'available'} slots`);
    
    res.json({
      clinicianId,
      date,
      slots
    });
  } catch (error) {
    console.error('📅 Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;