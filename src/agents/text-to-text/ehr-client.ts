import axios from 'axios';

const EHR_BASE_URL = 'http://localhost:3001/api';

export class EHRClient {
  private baseURL: string;

  constructor(baseURL: string = EHR_BASE_URL) {
    this.baseURL = baseURL;
  }

  async getLocations() {
    try {
      const response = await axios.get(`${this.baseURL}/locations`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch locations: ${error}`);
    }
  }

  async getClinicians() {
    try {
      const response = await axios.get(`${this.baseURL}/clinicians`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch clinicians: ${error}`);
    }
  }

  async getCliniciansByLocation(locationId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/clinicians/location/${locationId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch clinicians for location ${locationId}: ${error}`);
    }
  }

  async getAvailability(clinicianId: string, date: string) {
    try {
      const response = await axios.get(`${this.baseURL}/availability/${clinicianId}/${date}`);
      return response.data;
    } catch (error) {
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
      const response = await axios.post(`${this.baseURL}/patients`, patientData);
      return response.data;
    } catch (error) {
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
      const response = await axios.post(`${this.baseURL}/appointments`, appointmentData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create appointment: ${error}`);
    }
  }
}