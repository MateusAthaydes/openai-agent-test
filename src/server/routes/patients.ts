import { Router } from 'express';
import { Patient } from '../types';

const router = Router();

// In-memory storage for demo purposes
const patients: Patient[] = [];

// POST /api/patients - Create/save patient information
router.post('/', (req, res) => {
  const patientData: Patient = req.body;
  
  // Generate ID if not provided
  const patient: Patient = {
    ...patientData,
    id: patientData.id || `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  
  patients.push(patient);
  
  console.log('👤 API: Patient information saved:');
  console.log(`   Name: ${patient.firstName} ${patient.lastName}`);
  console.log(`   DOB: ${patient.dateOfBirth}`);
  console.log(`   Phone: ${patient.phone}`);
  console.log(`   Email: ${patient.email || 'Not provided'}`);
  console.log(`   Insurance: ${patient.insurance || 'Not provided'}`);
  console.log(`   Patient ID: ${patient.id}`);
  console.log('');
  
  res.status(201).json({ 
    message: 'Patient information saved successfully',
    patient: patient
  });
});

// GET /api/patients/:id - Get patient by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`👤 API: Fetching patient with ID: ${id}`);
  
  const patient = patients.find(p => p.id === id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  res.json(patient);
});

// GET /api/patients - Get all patients (for testing)
router.get('/', (req, res) => {
  console.log('👤 API: Fetching all patients');
  res.json(patients);
});

export default router;