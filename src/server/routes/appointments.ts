import { Router } from 'express';
import { Appointment, CreateAppointmentRequest } from '../types';

const router = Router();

// In-memory storage for demo purposes
const appointments: Appointment[] = [];

// POST /api/appointments - Create a new appointment
router.post('/', (req, res) => {
  const appointmentRequest: CreateAppointmentRequest = req.body;
  
  // Generate appointment ID
  const appointmentId = `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create appointment
  const appointment: Appointment = {
    id: appointmentId,
    patientId: appointmentRequest.patient.id!,
    clinicianId: appointmentRequest.clinicianId,
    locationId: appointmentRequest.locationId,
    timeSlotId: appointmentRequest.timeSlotId,
    date: new Date().toISOString().split('T')[0], // Today's date for demo
    startTime: '10:00', // Mock time
    endTime: '10:30',   // Mock time
    reason: appointmentRequest.reason,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  
  appointments.push(appointment);
  
  console.log('📅 API: APPOINTMENT CREATED!');
  console.log('=====================================');
  console.log(`   Appointment ID: ${appointment.id}`);
  console.log(`   Patient: ${appointmentRequest.patient.firstName} ${appointmentRequest.patient.lastName}`);
  console.log(`   Patient ID: ${appointment.patientId}`);
  console.log(`   Clinician ID: ${appointment.clinicianId}`);
  console.log(`   Location ID: ${appointment.locationId}`);
  console.log(`   Time Slot ID: ${appointment.timeSlotId}`);
  console.log(`   Date: ${appointment.date}`);
  console.log(`   Time: ${appointment.startTime} - ${appointment.endTime}`);
  console.log(`   Reason: ${appointment.reason}`);
  console.log(`   Status: ${appointment.status}`);
  console.log(`   Created: ${appointment.createdAt}`);
  console.log('=====================================');
  console.log('');
  
  res.status(201).json({
    message: 'Appointment created successfully!',
    appointment: appointment
  });
});

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📅 API: Fetching appointment with ID: ${id}`);
  
  const appointment = appointments.find(a => a.id === id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  res.json(appointment);
});

// GET /api/appointments - Get all appointments (for testing)
router.get('/', (req, res) => {
  console.log('📅 API: Fetching all appointments');
  res.json(appointments);
});

// PUT /api/appointments/:id/status - Update appointment status
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log(`📅 API: Updating appointment ${id} status to: ${status}`);
  
  const appointment = appointments.find(a => a.id === id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  appointment.status = status;
  
  console.log(`📅 Appointment ${id} status updated to: ${status}`);
  
  res.json({
    message: 'Appointment status updated successfully',
    appointment: appointment
  });
});

export default router;