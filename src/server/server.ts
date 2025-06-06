import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

import cliniciansRouter from './routes/clinicians';
import locationsRouter from './routes/locations';
import patientsRouter from './routes/patients';
import availabilityRouter from './routes/availability';
import appointmentsRouter from './routes/appointments';
import chatRouter from './routes/chat';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Global logger for real-time streaming
export class RealTimeLogger {
  private static instance: RealTimeLogger;
  private io: Server;

  constructor(socketIO: Server) {
    this.io = socketIO;
  }

  static initialize(socketIO: Server) {
    RealTimeLogger.instance = new RealTimeLogger(socketIO);
  }

  static getInstance(): RealTimeLogger {
    return RealTimeLogger.instance;
  }

  log(level: 'info' | 'success' | 'warning' | 'error', category: string, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: data ? JSON.stringify(data, null, 2) : undefined
    };

    // Emit to all connected clients
    this.io.emit('log', logEntry);

    // Also log to console with color coding
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m'    // Red
    };
    const reset = '\x1b[0m';
    
    console.log(`${colors[level]}[${category}] ${message}${reset}`, data ? data : '');
  }
}

// Initialize WebSocket connections
io.on('connection', (socket) => {
  console.log('🔌 Client connected to real-time logs');
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected from real-time logs');
  });
});

// Initialize the logger
RealTimeLogger.initialize(io);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from web interface
app.use(express.static(path.join(__dirname, '../web/public')));

// Logging middleware with real-time streaming
app.use((req, res, next) => {
  const logger = RealTimeLogger.getInstance();
  const timestamp = new Date().toISOString();
  
  // Log the incoming request
  logger.log('info', 'HTTP', `${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    body: req.method === 'POST' && req.body ? req.body : undefined
  });

  // Capture the original res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    logger.log('success', 'HTTP', `${req.method} ${req.path} → ${res.statusCode}`, {
      statusCode: res.statusCode,
      responseSize: JSON.stringify(data).length,
      responsePreview: typeof data === 'object' ? JSON.stringify(data).substring(0, 200) + '...' : data
    });
    return originalJson.call(this, data);
  };

  // Also console log for server logs
  console.log(`${timestamp} - ${req.method} ${req.path}`);
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

server.listen(PORT, () => {
  const logger = RealTimeLogger.getInstance();
  
  console.log('🏥 EHR Mock Server Started!');
  console.log('===============================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/`);
  console.log(`WebSocket: Real-time logs enabled`);
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
  console.log('  WS   Real-time logs');
  console.log('===============================');

  // Log server startup to real-time stream
  logger.log('success', 'SERVER', `🏥 EHR Mock Server started successfully on port ${PORT}`, {
    port: PORT,
    endpoints: {
      web: `http://localhost:${PORT}`,
      health: `http://localhost:${PORT}/health`,
      chat: `http://localhost:${PORT}/api/chat`
    },
    features: ['Real-time WebSocket logging', 'AI Agent Integration', 'EHR Mock Data']
  });
  
  logger.log('info', 'DATABASE', '📋 Mock EHR database initialized', {
    clinicians: 5,
    locations: 3,
    timeSlots: 'Dynamic generation enabled'
  });
});

export default app;