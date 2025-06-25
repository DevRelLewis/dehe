import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, Edit3, X, Save, RotateCcw } from 'lucide-react';
import { Event, PatientData } from '../types/patient';

interface AppointmentsTableProps {
  events: Event[];
  compact?: boolean;
  onDataUpdate?: (updatedData: PatientData) => void;
  patientData?: PatientData;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ 
  events, 
  compact = false, 
  onDataUpdate, 
  patientData 
}) => {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'RESCHEDULED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CONFIRMED':
        return <Calendar className="w-4 h-4" />;
      case 'CANCELLED':
        return <X className="w-4 h-4" />;
      case 'RESCHEDULED':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const canModifyAppointment = (event: Event) => {
    const appointmentDate = new Date(event.start);
    const now = new Date();
    const isUpcoming = appointmentDate > now;
    const isNotCompleted = event.status !== 'COMPLETED' && event.status !== 'CANCELLED';
    
    // Debug logging to help troubleshoot
    console.log('Appointment check:', {
      title: event.title,
      appointmentDate: appointmentDate.toISOString(),
      now: now.toISOString(),
      isUpcoming,
      status: event.status,
      isNotCompleted,
      canModify: isUpcoming && isNotCompleted
    });
    
    return isUpcoming && isNotCompleted;
  };

  const handleReschedule = (event: Event) => {
    setSelectedEvent(event);
    const eventDate = new Date(event.start);
    setNewDate(eventDate.toISOString().split('T')[0]);
    setNewTime(eventDate.toTimeString().slice(0, 5));
    setShowRescheduleModal(true);
  };

  const handleCancel = (event: Event) => {
    setSelectedEvent(event);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const processReschedule = async () => {
    if (!selectedEvent || !newDate || !newTime || !patientData || !onDataUpdate) return;
    
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDateTime = new Date(`${newDate}T${newTime}`);
    const duration = new Date(selectedEvent.end).getTime() - new Date(selectedEvent.start).getTime();
    const newEndTime = new Date(newDateTime.getTime() + duration);
    
    const updatedEvents = patientData.events.map(event => {
      if (event.id === selectedEvent.id) {
        return {
          ...event,
          start: newDateTime.toISOString(),
          end: newEndTime.toISOString(),
          status: 'CONFIRMED' // Reset to confirmed after reschedule
        };
      }
      return event;
    });

    // Create a memo about the reschedule
    const rescheduleNote = `Appointment "${selectedEvent.title}" rescheduled from ${new Date(selectedEvent.start).toLocaleString()} to ${newDateTime.toLocaleString()}`;
    
    const newMemo = {
      id: `memo_reschedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patient: {
        id: patientData.patient.id,
        firstName: patientData.patient.firstName,
        lastName: patientData.patient.lastName,
        email: patientData.patient.email,
        phoneNumber: patientData.patient.phoneNumber
      },
      note: rescheduleNote,
      creator: {
        id: "usr_current_provider",
        firstName: "Current",
        lastName: "Provider",
        email: "provider@decodahealth.com"
      },
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    const updatedPatientData = {
      ...patientData,
      events: updatedEvents,
      memos: [newMemo, ...patientData.memos]
    };

    onDataUpdate(updatedPatientData);
    
    setIsProcessing(false);
    setShowRescheduleModal(false);
    setSelectedEvent(null);
    
    alert(`✅ Appointment Rescheduled Successfully!\n\nAppointment: ${selectedEvent.title}\nNew Date: ${newDateTime.toLocaleDateString()}\nNew Time: ${newDateTime.toLocaleTimeString()}\n\nA memo has been added to the patient's record.`);
  };

  const processCancel = async () => {
    if (!selectedEvent || !cancelReason.trim() || !patientData || !onDataUpdate) return;
    
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedEvents = patientData.events.map(event => {
      if (event.id === selectedEvent.id) {
        return {
          ...event,
          status: 'CANCELLED'
        };
      }
      return event;
    });

    // Create a memo about the cancellation
    const cancelNote = `Appointment "${selectedEvent.title}" cancelled. Reason: ${cancelReason.trim()}. Original date: ${new Date(selectedEvent.start).toLocaleString()}`;
    
    const newMemo = {
      id: `memo_cancel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patient: {
        id: patientData.patient.id,
        firstName: patientData.patient.firstName,
        lastName: patientData.patient.lastName,
        email: patientData.patient.email,
        phoneNumber: patientData.patient.phoneNumber
      },
      note: cancelNote,
      creator: {
        id: "usr_current_provider",
        firstName: "Current",
        lastName: "Provider",
        email: "provider@decodahealth.com"
      },
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    const updatedPatientData = {
      ...patientData,
      events: updatedEvents,
      memos: [newMemo, ...patientData.memos]
    };

    onDataUpdate(updatedPatientData);
    
    setIsProcessing(false);
    setShowCancelModal(false);
    setSelectedEvent(null);
    setCancelReason('');
    
    alert(`✅ Appointment Cancelled Successfully!\n\nAppointment: ${selectedEvent.title}\nReason: ${cancelReason}\nDate: ${new Date(selectedEvent.start).toLocaleString()}\n\nA memo has been added to the patient's record.`);
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {compact ? 'Recent Appointments' : 'Appointments'}
        </h2>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No appointments found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {compact ? 'Recent Appointments' : 'Appointments'}
          </h2>
          {compact && events.length > 3 && (
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          )}
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                      <span className="ml-1">{event.status}</span>
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(event.start).toLocaleDateString()} at{' '}
                        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location.name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Provider:</span>
                      <span>{event.organizer.firstName} {event.organizer.lastName}</span>
                    </div>

                    {event.appointment?.reason && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Reason:</span>
                        <span>{event.appointment.reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🔥 NEW: Action Buttons - Show for all appointments temporarily for debugging */}
                {(canModifyAppointment(event) || true) && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleReschedule(event)}
                      disabled={!canModifyAppointment(event)}
                      className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        canModifyAppointment(event)
                          ? 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                          : 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed'
                      }`}
                      title={canModifyAppointment(event) ? "Reschedule appointment" : "Cannot reschedule completed/past appointments"}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Reschedule</span>
                    </button>
                    <button
                      onClick={() => handleCancel(event)}
                      disabled={!canModifyAppointment(event)}
                      className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        canModifyAppointment(event)
                          ? 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100'
                          : 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed'
                      }`}
                      title={canModifyAppointment(event) ? "Cancel appointment" : "Cannot cancel completed/past appointments"}
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Reschedule Appointment</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedEvent.title} with {selectedEvent.organizer.firstName} {selectedEvent.organizer.lastName}
                </p>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Date & Time
                </label>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-sm text-gray-800">
                    {new Date(selectedEvent.start).toLocaleDateString()} at{' '}
                    {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={processReschedule}
                disabled={!newDate || !newTime || isProcessing}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  newDate && newTime && !isProcessing
                    ? 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Rescheduling...</span>
                  </div>
                ) : (
                  'Reschedule'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Cancel Appointment</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedEvent.title} on {new Date(selectedEvent.start).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this appointment..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                disabled={isProcessing}
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Confirm Cancellation
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    This action cannot be undone. The appointment will be marked as cancelled and a note will be added to the patient's record.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                disabled={isProcessing}
              >
                Keep Appointment
              </button>
              <button
                onClick={processCancel}
                disabled={!cancelReason.trim() || isProcessing}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  cancelReason.trim() && !isProcessing
                    ? 'bg-red-500 text-white hover:bg-red-600 transform hover:scale-105 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Cancelling...</span>
                  </div>
                ) : (
                  'Cancel Appointment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentsTable;