import { Router } from 'express';
import { getAvailableSlots, getAllSlots } from '../data/mockData';
import { RealTimeLogger } from '../server';

const router = Router();

// GET /api/availability/:clinicianId/:date - Get available slots for a clinician on a specific date
router.get('/:clinicianId/:date', (req, res) => {
  const { clinicianId, date } = req.params;
  const { includeUnavailable } = req.query;
  const logger = RealTimeLogger.getInstance();
  
  logger.log('info', 'AVAILABILITY', `Checking schedule for clinician ${clinicianId} on ${date}`, {
    clinicianId,
    date,
    includeUnavailable: includeUnavailable === 'true'
  });
  
  try {
    const slots = includeUnavailable === 'true' 
      ? getAllSlots(clinicianId, date)
      : getAvailableSlots(clinicianId, date);
    
    logger.log('success', 'AVAILABILITY', `Found ${slots.length} ${includeUnavailable === 'true' ? 'total' : 'available'} slots`, {
      clinicianId,
      date,
      slotsFound: slots.length,
      availableSlots: slots.filter(s => s.available).map(s => s.startTime + '-' + s.endTime)
    });
    
    res.json({
      clinicianId,
      date,
      slots
    });
  } catch (error) {
    logger.log('error', 'AVAILABILITY', `Failed to fetch availability for ${clinicianId}`, { error: error instanceof Error ? error.message : error });
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;