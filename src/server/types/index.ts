export interface Clinician {
  id: string;
  name: string;
  specialty: string;
  locationId: string;
  email: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Patient {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email?: string;
  insurance?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  date: string;
}

export interface Appointment {
  id?: string;
  patientId: string;
  clinicianId: string;
  locationId: string;
  timeSlotId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'cancelled';
  createdAt?: string;
}

export interface CreateAppointmentRequest {
  patient: Patient;
  clinicianId: string;
  locationId: string;
  timeSlotId: string;
  reason: string;
}