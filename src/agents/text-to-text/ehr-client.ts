import axios from 'axios';

const EHR_BASE_URL = 'http://localhost:3001/api';

// Import logger type for optional logging
let logger: any = null;
try {
  const { RealTimeLogger } = require('../../server/server');
  logger = RealTimeLogger.getInstance();
} catch (e) {
  // Logger not available (e.g., in CLI mode)
}

export class EHRClient {
  private baseURL: string;

  constructor(baseURL: string = EHR_BASE_URL) {
    this.baseURL = baseURL;
  }

  private log(level: 'info' | 'success' | 'warning' | 'error', message: string, data?: any) {
    if (logger) {
      logger.log(level, 'EHR_API', message, data);
    }
  }

  async getLocations() {
    try {
      this.log('info', 'Fetching all locations...');
      const response = await axios.get(`${this.baseURL}/locations`);
      this.log('success', `Retrieved ${response.data.length} locations`, { locations: response.data });
      return response.data;
    } catch (error) {
      this.log('error', 'Failed to fetch locations', { error: error instanceof Error ? error.message : error });
      throw new Error(`Failed to fetch locations: ${error}`);
    }
  }

  async getClinicians() {
    try {
      this.log('info', 'Fetching all clinicians...');
      const response = await axios.get(`${this.baseURL}/clinicians`);
      this.log('success', `Retrieved ${response.data.length} clinicians`, { clinicians: response.data });
      return response.data;
    } catch (error) {
      this.log('error', 'Failed to fetch clinicians', { error: error instanceof Error ? error.message : error });
      throw new Error(`Failed to fetch clinicians: ${error}`);
    }
  }

  async getCliniciansByLocation(locationId: string) {
    try {
      this.log('info', `Fetching clinicians for location: ${locationId}`);
      const response = await axios.get(`${this.baseURL}/clinicians/location/${locationId}`);
      this.log('success', `Retrieved ${response.data.length} clinicians for location ${locationId}`, { clinicians: response.data });
      return response.data;
    } catch (error) {
      this.log('error', `Failed to fetch clinicians for location ${locationId}`, { error: error instanceof Error ? error.message : error });
      throw new Error(`Failed to fetch clinicians for location ${locationId}: ${error}`);
    }
  }

  async getAvailability(clinicianId: string, date: string) {
    try {
      this.log('info', `Checking availability for clinician ${clinicianId} on ${date}`);
      const response = await axios.get(`${this.baseURL}/availability/${clinicianId}/${date}`);
      const availableSlots = response.data.slots || [];
      this.log('success', `Found ${availableSlots.length} available slots for ${clinicianId} on ${date}`, { 
        clinicianId, 
        date, 
        availableSlots: availableSlots.length,
        slots: availableSlots 
      });
      return response.data;
    } catch (error) {
      this.log('error', `Failed to fetch availability for clinician ${clinicianId} on ${date}`, { error: error instanceof Error ? error.message : error });
      throw new Error(`Failed to fetch availability for clinician ${clinicianId} on ${date}: ${error}`);
    }
  }

  async createPatient(patientData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    email?: string;
    insurance?: string;
  }) {
    try {
      this.log('info', `Creating patient record for ${patientData.firstName} ${patientData.lastName}`, { patientData });
      const response = await axios.post(`${this.baseURL}/patients`, patientData);
      this.log('success', `Patient record created successfully`, { 
        patientId: response.data.patient?.id,
        patientName: `${patientData.firstName} ${patientData.lastName}`
      });
      return response.data;
    } catch (error) {
      this.log('error', 'Failed to create patient record', { 
        patientData,
        error: error instanceof Error ? error.message : error 
      });
      throw new Error(`Failed to create patient: ${error}`);
    }
  }

  async createAppointment(appointmentData: {
    patient: any;
    clinicianId: string;
    locationId: string;
    timeSlotId: string;
    reason: string;
  }) {
    try {
      this.log('info', `Creating appointment for patient ${appointmentData.patient.firstName} ${appointmentData.patient.lastName}`, {
        clinicianId: appointmentData.clinicianId,
        locationId: appointmentData.locationId,
        timeSlotId: appointmentData.timeSlotId,
        reason: appointmentData.reason
      });
      const response = await axios.post(`${this.baseURL}/appointments`, appointmentData);
      this.log('success', `🎉 APPOINTMENT BOOKED SUCCESSFULLY!`, { 
        appointmentId: response.data.appointment?.id,
        patientName: `${appointmentData.patient.firstName} ${appointmentData.patient.lastName}`,
        clinicianId: appointmentData.clinicianId,
        timeSlot: appointmentData.timeSlotId
      });
      return response.data;
    } catch (error) {
      this.log('error', 'Failed to create appointment', { 
        appointmentData,
        error: error instanceof Error ? error.message : error 
      });
      throw new Error(`Failed to create appointment: ${error}`);
    }
  }
}