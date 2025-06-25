// types/patient.ts - Enhanced with Payment Scheduling
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  addressLineTwo?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  addressValid: boolean;
  guardianName?: string;
  guardianPhoneNumber?: string;
  maritalStatus: string;
  gender: string;
  employmentStatus: string;
  dateOfBirth: string;
  allergies: string[];
  familyHistory: string[];
  medicalHistory: string[];
  prescriptions: string[];
  goalWeight: number;
  isOnboardingComplete: boolean;
  createdDate: string;
  firebaseUid: string;
  measurements: Measurement[];
  medications: Medication[];
}

export interface Measurement {
  id: string;
  patientId: string;
  type: string;
  value: number | string;
  unit: string;
  date: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  active: boolean;
}

// Enhanced Provider interface with professional details
export interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;        // Professional title (e.g., "MD, Internal Medicine")
  department?: string;   // Department (e.g., "Primary Care", "Patient Financial Services")
  phone?: string;        // Phone number
}

export interface Alert {
  id: string;
  type: string;
  data: any;
  createdDate: string;
  actionRequired: boolean;
  resolvedDate?: string;
  tags: { id: string; name: string }[];
  assignedProvider: Provider;  // Enhanced Provider interface
  resolvingProvider?: Provider;
  occurances: number;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface PaymentMethod {
  id: string;
  patientId: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  accountHolderType?: string;
  accountNumberLast4?: number;
  bankName?: string;
  routingNumber?: number;
  description: string;
  type: string;
  isDefault: boolean;
}

export interface PlannedPayment {
  id: string;
  amount: number;
  paymentDate: string;
  status: string;
}

export interface Payment {
  id: string;
  amount: number;
  createdDate: string;
  paymentMethod?: PaymentMethod;
  paymentMedium: string;
  refunds: any[];
}

export interface Adjustment {
  id: string;
  chargeId: string;
  amount: number;
  type: string;
  description: string;
  createdDate: string;
}

export interface ChargeItem {
  item_id: string;
  charge_id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    active: boolean;
    createdDate: string;
    category: string;
  };
}

// 🔥 ENHANCED: Charge interface with scheduled payment support
export interface Charge {
  id: string;
  total: number;
  totalOutstanding: number;
  description: string;
  status: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdDate: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  adjustments: Adjustment[];
  payments: Payment[];
  plannedPayments?: PlannedPayment[]; // Made optional with proper typing
  comment?: string;
  items: ChargeItem[];
  locationId?: string;
  locationName?: string;
  // 🔥 NEW: Scheduled payment functionality
  scheduledPaymentDate?: string;     // ISO date string for when payment is scheduled
  scheduledPaymentAmount?: number;   // Amount to be charged on the scheduled date
  scheduledPaymentMethod?: PaymentMethod; // Payment method to use for scheduled payment
  autoPayEnabled?: boolean;          // Whether auto-payment is enabled for this charge
}

export interface Event {
  id: string;
  title: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  start: string;
  end: string;
  type: string;
  status: string;
  meetingLink?: string;
  attendees: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    inviteStatus: string;
  }[];
  location: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isVirtual: boolean;
    meetingLink?: string;
  };
  formCompleted: boolean;
  appointment: {
    id: string;
    eventId: string;
    patientId: string;
    providerId: string;
    reason: string;
    confirmationStatus: string;
    confirmationDate: string;
    checkedInDate?: string;
    appointmentType: string;
  };
}

export interface DoctorNote {
  id: string;
  eventId: string;
  parentNoteId: string;
  noteTranscriptId?: string;
  duration?: number;
  version: number;
  currentVersion: number;
  content: string;
  summary: string;
  aiGenerated: boolean;
  template?: any;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  createdDate: string;
  providerNames: string[];
}

export interface Memo {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  note: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdDate: string;
  updatedDate: string;
}

export interface PatientData {
  patient: Patient;
  alerts: Alert[];
  charges: Charge[];
  events: Event[];
  doctorsNotes: DoctorNote[];
  memos: Memo[];
  paymentMethods: PaymentMethod[];
}