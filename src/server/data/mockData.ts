import { Clinician, Location, TimeSlot } from '../types';

export const locations: Location[] = [
  {
    id: 'loc-1',
    name: 'Downtown Medical Center',
    address: '123 Main Street',
    phone: '(555) 123-4567',
    city: 'New York',
    state: 'NY',
    zipCode: '10001'
  },
  {
    id: 'loc-2',
    name: 'Westside Health Clinic',
    address: '456 Oak Avenue',
    phone: '(555) 234-5678',
    city: 'New York',
    state: 'NY',
    zipCode: '10025'
  },
  {
    id: 'loc-3',
    name: 'Brooklyn Family Practice',
    address: '789 Brooklyn Bridge Blvd',
    phone: '(555) 345-6789',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201'
  }
];

export const clinicians: Clinician[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Family Medicine',
    locationId: 'loc-1',
    email: 'sarah.johnson@example.com'
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen',
    specialty: 'Internal Medicine',
    locationId: 'loc-1',
    email: 'michael.chen@example.com'
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrics',
    locationId: 'loc-2',
    email: 'emily.rodriguez@example.com'
  },
  {
    id: 'doc-4',
    name: 'Dr. James Wilson',
    specialty: 'Cardiology',
    locationId: 'loc-2',
    email: 'james.wilson@example.com'
  },
  {
    id: 'doc-5',
    name: 'Dr. Lisa Thompson',
    specialty: 'Family Medicine',
    locationId: 'loc-3',
    email: 'lisa.thompson@example.com'
  }
];

function generateTimeSlots(date: string, clinicianId: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const times = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  times.forEach((time, index) => {
    const [hour, minute] = time.split(':').map(Number);
    const endHour = minute === 30 ? hour + 1 : hour;
    const endMinute = minute === 30 ? '00' : '30';
    
    slots.push({
      id: `slot-${clinicianId}-${date}-${index}`,
      startTime: time,
      endTime: `${endHour.toString().padStart(2, '0')}:${endMinute}`,
      available: Math.random() > 0.3, // 70% chance of being available
      date
    });
  });

  return slots;
}

export function getAvailableSlots(clinicianId: string, date: string): TimeSlot[] {
  return generateTimeSlots(date, clinicianId).filter(slot => slot.available);
}

export function getAllSlots(clinicianId: string, date: string): TimeSlot[] {
  return generateTimeSlots(date, clinicianId);
}