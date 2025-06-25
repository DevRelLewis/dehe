// hooks/usePatientData.ts - Updated with Future Appointment
import { useState, useEffect } from 'react';
import { PatientData } from '../types/patient';

export const usePatientData = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockData: PatientData = {
          patient: {
            id: "pt_5f8a92a3eb28c15dc7a9a3d1",
            firstName: "Sarah",
            lastName: "Johnson",
            phoneNumber: "+12065551234",
            email: "sarah.johnson@example.com",
            address: "123 Main Street",
            addressLineTwo: "Apt 4B",
            city: "Seattle",
            state: "WA",
            zipCode: "98101",
            country: "USA",
            maritalStatus: "MARRIED",
            gender: "FEMALE",
            employmentStatus: "EMPLOYED",
            dateOfBirth: "1985-07-15",
            allergies: ["Penicillin", "Peanuts"],
            familyHistory: ["Diabetes", "Hypertension"],
            medicalHistory: ["Asthma", "Seasonal allergies"],
            prescriptions: ["Albuterol inhaler", "Zyrtec"],
            goalWeight: 145,
            isOnboardingComplete: true,
            createdDate: "2022-03-15T10:30:00Z",
            firebaseUid: "firebase_uid_12345",
            addressValid: true,
            guardianName: undefined,
            guardianPhoneNumber: undefined,
            measurements: [
              {
                id: "ms_9d8c7b6a5f4e3d2c1b0a",
                patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
                type: "WEIGHT",
                value: 155.5,
                unit: "lb",
                date: "2023-08-12T14:20:00Z"
              },
              {
                id: "ms_8c7d6e5f4g3h2i1j0k",
                patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
                type: "HEIGHT",
                value: 65.5,
                unit: "in",
                date: "2023-08-12T14:20:00Z"
              },
              {
                id: "ms_7b6c5d4e3f2g1h0i9j",
                patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
                type: "BLOOD_PRESSURE",
                value: "120/80",
                unit: "mmHg",
                date: "2023-09-05T09:15:00Z"
              }
            ],
            medications: [
              {
                id: "md_6f5e4d3c2b1a0z9y8x",
                patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
                name: "Albuterol",
                dosage: "90mcg",
                frequency: "As needed",
                startDate: "2022-05-10",
                endDate: undefined,
                active: true
              },
              {
                id: "md_5e4d3c2b1a0z9y8x7w",
                patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
                name: "Zyrtec",
                dosage: "10mg",
                frequency: "Once daily",
                startDate: "2023-02-20",
                endDate: undefined,
                active: true
              }
            ]
          },
          alerts: [
            {
              id: "alrt_1a2b3c4d5e6f7g8h9i",
              type: "FORM_SUBMITTED",
              data: {
                id: "frm_sub_7d8e9f0a1b2c3d4e",
                name: "Allergy Questionnaire",
                patient: {
                  id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                  firstName: "Sarah",
                  lastName: "Johnson"
                },
                submittedAt: "2023-10-02T11:15:00Z"
              },
              createdDate: "2023-10-02T11:15:00Z",
              actionRequired: true,
              resolvedDate: undefined,
              tags: [
                { id: "tag_5a4b3c2d1e", name: "Forms" },
                { id: "tag_6b5c4d3e2f", name: "Patient Intake" }
              ],
              assignedProvider: {
                id: "usr_3c4d5e6f7g8h9i0j1k",
                firstName: "Robert",
                lastName: "Davis",
                email: "robert.davis@decodahealth.com",
                title: "MD, Internal Medicine",
                department: "Primary Care",
                phone: "+1 (206) 555-0123"
              },
              resolvingProvider: undefined,
              occurances: 1,
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                email: "sarah.johnson@example.com",
                phoneNumber: "+12065551234"
              }
            },
            {
              id: "alrt_2b3c4d5e6f7g8h9i0j",
              type: "APPOINTMENT_SCHEDULED",
              data: {
                id: "evt_0a1b2c3d4e5f6g7h8i9",
                title: "Annual Physical",
                start: "2024-03-20T11:00:00.000Z",
                end: "2024-03-20T12:00:00.000Z",
                organizer: {
                  id: "usr_4d5e6f7g8h9i0j1k2l",
                  firstName: "Emily",
                  lastName: "Chen"
                },
                appointment: {
                  id: "apt_1b2c3d4e5f6g7h8i9j0",
                  reason: "Annual physical examination",
                  confirmationStatus: "CONFIRMED"
                }
              },
              createdDate: "2024-03-01T16:45:00Z",
              actionRequired: true,
              resolvedDate: undefined,
              tags: [
                { id: "tag_7c6d5e4f3g", name: "Appointments" }
              ],
              assignedProvider: {
                id: "usr_4d5e6f7g8h9i0j1k2l",
                firstName: "Emily",
                lastName: "Chen",
                email: "emily.chen@decodahealth.com",
                title: "MD, Family Medicine",
                department: "Family Practice",
                phone: "+1 (206) 555-0156"
              },
              resolvingProvider: undefined,
              occurances: 1,
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                email: "sarah.johnson@example.com",
                phoneNumber: "+12065551234"
              }
            },
            {
              id: "alrt_3c4d5e6f7g8h9i0j1k",
              type: "MESSAGE_RECEIVED",
              data: {
                message: "Hello Dr. Davis, I've been experiencing increased allergy symptoms despite taking the medication as prescribed. Could we discuss other options?",
                data: {
                  chatId: "cht_8g7f6e5d4c3b2a1z0y",
                  messageType: "TEXT"
                },
                patient: {
                  id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                  firstName: "Sarah",
                  lastName: "Johnson"
                }
              },
              createdDate: "2023-09-25T14:30:00Z",
              actionRequired: true,
              resolvedDate: undefined,
              tags: [
                { id: "tag_8d7e6f5g4h", name: "Messages" },
                { id: "tag_9e8f7g6h5i", name: "Urgent" }
              ],
              assignedProvider: {
                id: "usr_3c4d5e6f7g8h9i0j1k",
                firstName: "Robert",
                lastName: "Davis",
                email: "robert.davis@decodahealth.com",
                title: "MD, Internal Medicine",
                department: "Primary Care",
                phone: "+1 (206) 555-0123"
              },
              resolvingProvider: undefined,
              occurances: 1,
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                email: "sarah.johnson@example.com",
                phoneNumber: "+12065551234"
              }
            },
            // NEW BILLING ALERT
            {
              id: "alrt_4d5e6f7g8h9i0j1k2l",
              type: "OUTSTANDING_BALANCE",
              data: {
                totalOutstanding: 135.0,
                charges: [
                  {
                    id: "ch_7d8e9f0a1b2c3d4e5f6g",
                    description: "Initial Consultation",
                    amount: 50.0,
                    dueDate: "2023-07-15T00:00:00Z"
                  },
                  {
                    id: "ch_1a2s3d4f5g6h7j8k9l",
                    description: "Prescription Renewal",
                    amount: 85.0,
                    dueDate: "2023-11-05T00:00:00Z"
                  }
                ],
                paymentPlanAvailable: true
              },
              createdDate: "2023-10-05T12:00:00Z",
              actionRequired: true,
              resolvedDate: undefined,
              tags: [
                { id: "tag_10a9b8c7d6", name: "Billing" },
                { id: "tag_11b0a9c8d7", name: "Payment Required" }
              ],
              assignedProvider: {
                id: "usr_5e6f7g8h9i0j1k2l3m",
                firstName: "Maria",
                lastName: "Rodriguez",
                email: "maria.rodriguez@decodahealth.com",
                title: "Billing Coordinator",
                department: "Patient Financial Services",
                phone: "+1 (206) 555-0178"
              },
              resolvingProvider: undefined,
              occurances: 1,
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                email: "sarah.johnson@example.com",
                phoneNumber: "+12065551234"
              }
            }
          ],
          charges: [
            {
              id: "ch_7d8e9f0a1b2c3d4e5f6g",
              total: 250.0,
              totalOutstanding: 50.0,
              description: "Initial Consultation",
              status: "PARTIALLY_PAID",
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                phoneNumber: "+12065551234",
                email: "sarah.johnson@example.com",
                address: "123 Main Street",
                city: "Seattle",
                state: "WA",
                zipCode: "98101"
              },
              createdDate: "2023-06-15T09:30:00Z",
              creator: {
                id: "usr_3c4d5e6f7g8h9i0j1k",
                firstName: "Robert",
                lastName: "Davis",
                email: "robert.davis@decodahealth.com"
              },
              adjustments: [
                {
                  id: "adj_1a2b3c4d5e6f7g8h9i",
                  chargeId: "ch_7d8e9f0a1b2c3d4e5f6g",
                  amount: 25.0,
                  type: "DISCOUNT",
                  description: "New patient discount",
                  createdDate: "2023-06-15T09:35:00Z"
                }
              ],
              payments: [
                {
                  id: "pmt_9h8g7f6e5d4c3b2a1",
                  amount: 175.0,
                  createdDate: "2023-06-15T10:15:00Z",
                  paymentMethod: {
                    id: "pm_7y6t5r4e3w2q1z0x9",
                    patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
                    brand: "Visa",
                    last4: "4242",
                    expMonth: 12,
                    expYear: 2025,
                    description: "Primary Card",
                    type: "CARD",
                    isDefault: true
                  },
                  paymentMedium: "CARD",
                  refunds: []
                }
              ],
              plannedPayments: [
                {
                  id: "pln_5r4e3w2q1z0x9v8u7",
                  amount: 50.0,
                  paymentDate: "2023-07-15T00:00:00Z",
                  status: "SCHEDULED"
                }
              ],
              comment: "Patient requested payment plan for remaining balance",
              items: [
                {
                  item_id: "itm_3q2w1e4r5t6y7u8i9o",
                  charge_id: "ch_7d8e9f0a1b2c3d4e5f6g",
                  quantity: 1,
                  item: {
                    id: "itm_3q2w1e4r5t6y7u8i9o",
                    name: "Initial Consultation",
                    description: "First-time comprehensive health evaluation",
                    price: 250.0,
                    active: true,
                    createdDate: "2022-01-10T08:00:00Z",
                    category: "Consultations"
                  }
                }
              ],
              locationId: "loc_1q2w3e4r5t6y7u8i9o",
              locationName: "Main Clinic"
            },
            {
              id: "ch_2b3c4d5e6f7g8h9i0j",
              total: 175.0,
              totalOutstanding: 0.0,
              description: "Follow-up Appointment",
              status: "PAID",
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                phoneNumber: "+12065551234",
                email: "sarah.johnson@example.com",
                address: "123 Main Street",
                city: "Seattle",
                state: "WA",
                zipCode: "98101"
              },
              createdDate: "2023-08-20T14:00:00Z",
              creator: {
                id: "usr_3c4d5e6f7g8h9i0j1k",
                firstName: "Robert",
                lastName: "Davis",
                email: "robert.davis@decodahealth.com"
              },
              adjustments: [],
              payments: [
                {
                  id: "pmt_8g7f6e5d4c3b2a1z0",
                  amount: 175.0,
                  createdDate: "2023-08-20T14:30:00Z",
                  paymentMethod: {
                    id: "pm_7y6t5r4e3w2q1z0x9",
                    patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
                    brand: "Visa",
                    last4: "4242",
                    expMonth: 12,
                    expYear: 2025,
                    description: "Primary Card",
                    type: "CARD",
                    isDefault: true
                  },
                  paymentMedium: "CARD",
                  refunds: []
                }
              ],
              plannedPayments: [],
              comment: undefined,
              items: [
                {
                  item_id: "itm_5t6y7u8i9o0p1a2s3d",
                  charge_id: "ch_2b3c4d5e6f7g8h9i0j",
                  quantity: 1,
                  item: {
                    id: "itm_5t6y7u8i9o0p1a2s3d",
                    name: "Follow-up Appointment",
                    description: "Scheduled follow-up visit",
                    price: 175.0,
                    active: true,
                    createdDate: "2022-01-10T08:00:00Z",
                    category: "Consultations"
                  }
                }
              ],
              locationId: "loc_1q2w3e4r5t6y7u8i9o",
              locationName: "Main Clinic"
            },
            {
              id: "ch_1a2s3d4f5g6h7j8k9l",
              total: 85.0,
              totalOutstanding: 85.0,
              description: "Prescription Renewal",
              status: "UNPAID",
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                phoneNumber: "+12065551234",
                email: "sarah.johnson@example.com",
                address: "123 Main Street",
                city: "Seattle",
                state: "WA",
                zipCode: "98101"
              },
              createdDate: "2023-10-05T11:45:00Z",
              creator: {
                id: "usr_3c4d5e6f7g8h9i0j1k",
                firstName: "Robert",
                lastName: "Davis",
                email: "robert.davis@decodahealth.com"
              },
              adjustments: [],
              payments: [],
              plannedPayments: [],
              comment: "Prescription renewal without appointment",
              items: [
                {
                  item_id: "itm_7u8i9o0p1a2s3d4f5g",
                  charge_id: "ch_1a2s3d4f5g6h7j8k9l",
                  quantity: 1,
                  item: {
                    id: "itm_7u8i9o0p1a2s3d4f5g",
                    name: "Prescription Renewal",
                    description: "Renewal of existing prescriptions",
                    price: 85.0,
                    active: true,
                    createdDate: "2022-01-10T08:00:00Z",
                    category: "Medications"
                  }
                }
              ],
              locationId: undefined,
              locationName: undefined
            }
          ],
          events: [
            {
              id: "evt_0a1b2c3d4e5f6g7h8i9",
              title: "Annual Physical",
              organizer: {
                id: "usr_4d5e6f7g8h9i0j1k2l",
                firstName: "Emily",
                lastName: "Chen",
                email: "emily.chen@decodahealth.com"
              },
              start: "2024-03-20T11:00:00.000Z",
              end: "2024-03-20T12:00:00.000Z",
              type: "APPOINTMENT",
              status: "CONFIRMED",
              meetingLink: undefined,
              attendees: [
                {
                  user: {
                    id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                    firstName: "Sarah",
                    lastName: "Johnson",
                    email: "sarah.johnson@example.com"
                  },
                  inviteStatus: "ACCEPTED"
                },
                {
                  user: {
                    id: "usr_4d5e6f7g8h9i0j1k2l",
                    firstName: "Emily",
                    lastName: "Chen",
                    email: "emily.chen@decodahealth.com"
                  },
                  inviteStatus: "ACCEPTED"
                }
              ],
              location: {
                id: "loc_1q2w3e4r5t6y7u8i9o",
                name: "Main Clinic",
                address: "456 Medical Plaza",
                city: "Seattle",
                state: "WA",
                zipCode: "98101",
                country: "USA",
                isVirtual: false,
                meetingLink: undefined
              },
              formCompleted: false,
              appointment: {
                id: "apt_1b2c3d4e5f6g7h8i9j0",
                eventId: "evt_0a1b2c3d4e5f6g7h8i9",
                patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
                providerId: "usr_4d5e6f7g8h9i0j1k2l",
                reason: "Annual physical examination",
                confirmationStatus: "CONFIRMED",
                confirmationDate: "2024-03-01T16:45:00.000Z",
                checkedInDate: undefined,
                appointmentType: "ANNUAL_PHYSICAL"
              }
            },
            {
              id: "evt_7d8e9f0a1b2c3d4e5f6g",
              title: "Follow-up Appointment",
              organizer: {
                id: "usr_3c4d5e6f7g8h9i0j1k",
                firstName: "Robert",
                lastName: "Davis",
                email: "robert.davis@decodahealth.com"
              },
              start: "2023-08-20T14:00:00.000Z",
              end: "2023-08-20T14:30:00.000Z",
              type: "APPOINTMENT",
              status: "COMPLETED",
              meetingLink: undefined,
              attendees: [
                {
                  user: {
                    id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                    firstName: "Sarah",
                    lastName: "Johnson",
                    email: "sarah.johnson@example.com"
                  },
                  inviteStatus: "ACCEPTED"
                },
                {
                  user: {
                    id: "usr_3c4d5e6f7g8h9i0j1k",
                    firstName: "Robert",
                    lastName: "Davis",
                    email: "robert.davis@decodahealth.com"
                  },
                  inviteStatus: "ACCEPTED"
                }
              ],
              location: {
                id: "loc_1q2w3e4r5t6y7u8i9o",
                name: "Main Clinic",
                address: "456 Medical Plaza",
                city: "Seattle",
                state: "WA",
                zipCode: "98101",
                country: "USA",
                isVirtual: false,
                meetingLink: undefined
              },
              formCompleted: true,
              appointment: {
                id: "apt_8e9f0a1b2c3d4e5f6g7",
                eventId: "evt_7d8e9f0a1b2c3d4e5f6g",
                patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
                providerId: "usr_3c4d5e6f7g8h9i0j1k",
                reason: "Follow-up for seasonal allergies",
                confirmationStatus: "CONFIRMED",
                confirmationDate: "2023-08-15T09:22:00.000Z",
                checkedInDate: "2023-08-20T13:50:00.000Z",
                appointmentType: "FOLLOW_UP"
              }
            },
            // 🔥 NEW: Future Appointment for Testing Reschedule/Cancel Functionality
            {
              id: "evt_future_2025_test",
              title: "Allergy Follow-up",
              organizer: {
                id: "usr_3c4d5e6f7g8h9i0j1k",
                firstName: "Robert",
                lastName: "Davis",
                email: "robert.davis@decodahealth.com"
              },
              start: "2025-07-15T10:00:00.000Z",
              end: "2025-07-15T10:30:00.000Z",
              type: "APPOINTMENT",
              status: "CONFIRMED",
              meetingLink: undefined,
              attendees: [
                {
                  user: {
                    id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                    firstName: "Sarah",
                    lastName: "Johnson",
                    email: "sarah.johnson@example.com"
                  },
                  inviteStatus: "ACCEPTED"
                },
                {
                  user: {
                    id: "usr_3c4d5e6f7g8h9i0j1k",
                    firstName: "Robert",
                    lastName: "Davis",
                    email: "robert.davis@decodahealth.com"
                  },
                  inviteStatus: "ACCEPTED"
                }
              ],
              location: {
                id: "loc_1q2w3e4r5t6y7u8i9o",
                name: "Main Clinic",
                address: "456 Medical Plaza",
                city: "Seattle",
                state: "WA",
                zipCode: "98101",
                country: "USA",
                isVirtual: false,
                meetingLink: undefined
              },
              formCompleted: false,
              appointment: {
                id: "apt_future_allergy_followup",
                eventId: "evt_future_2025_test",
                patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
                providerId: "usr_3c4d5e6f7g8h9i0j1k",
                reason: "Follow-up on allergy treatment effectiveness",
                confirmationStatus: "CONFIRMED",
                confirmationDate: "2025-06-20T14:30:00.000Z",
                checkedInDate: undefined,
                appointmentType: "FOLLOW_UP"
              }
            }
          ],
          doctorsNotes: [
            {
              id: "nt_1a2b3c4d5e6f7g8h9i",
              eventId: "evt_7d8e9f0a1b2c3d4e5f6g",
              parentNoteId: "nt_1a2b3c4d5e6f7g8h9i",
              noteTranscriptId: "ntr_9h8g7f6e5d4c3b2a1z",
              duration: 1800,
              version: 2,
              currentVersion: 2,
              content: "Patient presented with complaints of seasonal allergies. Symptoms include nasal congestion, sneezing, and itchy eyes persisting for 2 weeks. Patient reports taking OTC Zyrtec with partial relief.\n\nVital signs within normal range. Clear lung sounds, no wheezing or distress. No sinus tenderness observed.\n\nAssessment: Seasonal allergic rhinitis\n\nPlan:\n1. Continue Zyrtec 10mg daily\n2. Add Flonase nasal spray 1-2 sprays each nostril daily\n3. Avoid known allergens, keep windows closed during high pollen times\n4. Return if symptoms worsen or do not improve within 2 weeks",
              summary: "Follow-up for seasonal allergies. Prescribed Flonase in addition to existing Zyrtec regimen. Patient advised on allergen avoidance.",
              aiGenerated: true,
              template: undefined,
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                phoneNumber: "+12065551234",
                email: "sarah.johnson@example.com"
              },
              createdDate: "2023-08-20T14:45:00.000Z",
              providerNames: ["Dr. Robert Davis", "Dr. Emily Chen"]
            },
            {
              id: "nt_2b3c4d5e6f7g8h9i0j",
              eventId: "evt_8e9f0a1b2c3d4e5f6g7",
              parentNoteId: "nt_2b3c4d5e6f7g8h9i0j",
              noteTranscriptId: "ntr_8g7f6e5d4c3b2a1z0y",
              duration: 1200,
              version: 1,
              currentVersion: 1,
              content: "Patient presented for asthma check-up. Reports using rescue inhaler about 2-3 times per week, mostly after exercise. No nighttime symptoms. No ER visits or systemic steroids needed since last visit.\n\nLung examination reveals good air entry bilaterally, occasional end-expiratory wheeze after forced exhalation.\n\nSpirometry results: FEV1 85% of predicted. No significant change from previous.\n\nAssessment: Moderate persistent asthma, well controlled.\n\nPlan:\n1. Continue Albuterol inhaler as needed\n2. Reviewed proper inhaler technique\n3. Encouraged regular exercise with appropriate warm-up\n4. Follow up in 6 months or sooner if symptoms worsen",
              summary: "Routine asthma check-up. Current regimen is effective with good control. No changes to medications needed.",
              aiGenerated: true,
              template: undefined,
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                phoneNumber: "+12065551234",
                email: "sarah.johnson@example.com"
              },
              createdDate: "2023-05-10T09:30:00.000Z",
              providerNames: ["Dr. Robert Davis"]
            }
          ],
          memos: [
            {
              id: "qn_1a2b3c4d5e6f7g8h9i",
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                email: "sarah.johnson@example.com",
                phoneNumber: "+12065551234"
              },
              note: "Patient called to discuss increased allergy symptoms. Advised to double Flonase dose temporarily and schedule follow-up if no improvement in 7 days.",
              creator: {
                id: "usr_3c4d5e6f7g8h9i0j1k",
                firstName: "Robert",
                lastName: "Davis",
                email: "robert.davis@decodahealth.com"
              },
              createdDate: "2023-09-26T10:15:00Z",
              updatedDate: "2023-09-26T10:15:00Z"
            },
            {
              id: "qn_2b3c4d5e6f7g8h9i0j",
              patient: {
                id: "pt_5f8a92a3eb28c15dc7a9a3d1",
                firstName: "Sarah",
                lastName: "Johnson",
                email: "sarah.johnson@example.com",
                phoneNumber: "+12065551234"
              },
              note: "Patient requested prescription refill for Albuterol inhaler. Approved 90-day supply with 2 refills.",
              creator: {
                id: "usr_4d5e6f7g8h9i0j1k2l",
                firstName: "Emily",
                lastName: "Chen",
                email: "emily.chen@decodahealth.com"
              },
              createdDate: "2023-07-12T14:30:00Z",
              updatedDate: "2023-07-12T14:30:00Z"
            }
          ],
          paymentMethods: [
            {
              id: "pm_7y6t5r4e3w2q1z0x9",
              patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
              brand: "Visa",
              last4: "4242",
              expMonth: 12,
              expYear: 2025,
              accountHolderType: undefined,
              accountNumberLast4: undefined,
              bankName: undefined,
              routingNumber: undefined,
              description: "Primary Card",
              type: "CARD",
              isDefault: true
            },
            {
              id: "pm_6x5w4v3u2t1s0r9q8",
              patientId: "pt_5f8a92a3eb28c15dc7a9a3d1",
              brand: undefined,
              last4: undefined,
              expMonth: undefined,
              expYear: undefined,
              accountHolderType: "individual",
              accountNumberLast4: 9876,
              bankName: "Chase Bank",
              routingNumber: 123456789,
              description: "Checking Account",
              type: "BANK_ACCOUNT",
              isDefault: false
            }
          ]
        };

        setPatientData(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading patient data:', err);
        setError('Failed to load patient data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { patientData, loading, error };
};