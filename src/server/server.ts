import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';

import cliniciansRouter from './routes/clinicians';
import locationsRouter from './routes/locations';
import patientsRouter from './routes/patients';
import availabilityRouter from './routes/availability';
import appointmentsRouter from './routes/appointments';
import chatRouter from './routes/chat';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from web interface
app.use(express.static(path.join(__dirname, '../web/public')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/clinicians', cliniciansRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/chat', chatRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'EHR Mock Server is running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'EHR Mock Server API',
    version: '1.0.0',
    endpoints: {
      clinicians: '/api/clinicians',
      locations: '/api/locations',
      patients: '/api/patients',
      availability: '/api/availability/:clinicianId/:date',
      appointments: '/api/appointments',
      chat: '/api/chat',
      health: '/health',
      web: '/ (web interface)'
    }
  });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log('🏥 EHR Mock Server Started!');
  console.log('===============================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/`);
  console.log('===============================');
  console.log('Available endpoints:');
  console.log('  GET  /api/clinicians');
  console.log('  GET  /api/clinicians/:id');
  console.log('  GET  /api/clinicians/location/:locationId');
  console.log('  GET  /api/locations');
  console.log('  GET  /api/locations/:id');
  console.log('  POST /api/patients');
  console.log('  GET  /api/patients/:id');
  console.log('  GET  /api/availability/:clinicianId/:date');
  console.log('  POST /api/appointments');
  console.log('  GET  /api/appointments/:id');
  console.log('  PUT  /api/appointments/:id/status');
  console.log('  POST /api/chat');
  console.log('  POST /api/chat/reset');
  console.log('  WEB  / (interface)');
  console.log('===============================');
});

export default app;