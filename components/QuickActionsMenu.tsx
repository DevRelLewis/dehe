import React, { useState } from 'react';
import { CreditCard, FileText, Plus, Calendar, CreditCard as CardIcon, X, Building, CalendarCheck, CalendarPlus } from 'lucide-react';
import { PatientData, Charge, Memo } from '../types/patient';

interface QuickActionsMenuProps {
  patientData: PatientData;
  onDataUpdate?: (updatedData: PatientData) => void;
}

const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({ patientData, onDataUpdate }) => {
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);
  // Schedule Payment Modal State
  const [showSchedulePaymentModal, setShowSchedulePaymentModal] = useState(false);
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [memoText, setMemoText] = useState('');
  const [isAddingMemo, setIsAddingMemo] = useState(false);

  // Schedule Payment Form State
  const [scheduleForm, setScheduleForm] = useState({
    selectedChargeIds: [] as string[],
    scheduledDate: '',
    scheduledTime: '',
    paymentMethodId: '',
    autoPayEnabled: true,
    customAmount: false,
    amounts: {} as Record<string, number>
  });
  const [isSchedulingPayment, setIsSchedulingPayment] = useState(false);

  // Local state for charges to allow real-time updates - sync with patientData changes
  const [localCharges, setLocalCharges] = useState<Charge[]>(patientData.charges);
  const [localAlerts, setLocalAlerts] = useState(patientData.alerts);

  // Sync local state when patientData changes
  React.useEffect(() => {
    setLocalCharges(patientData.charges);
    setLocalAlerts(patientData.alerts);
  }, [patientData]);

  const getAppointmentStats = () => {
    const now = new Date();
    const upcomingAppointments = patientData.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate > now && (event.status === 'CONFIRMED' || event.status === 'RESCHEDULED');
    });
    
    const nextAppointment = upcomingAppointments
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];
    
    const thisWeekAppointments = upcomingAppointments.filter(event => {
      const eventDate = new Date(event.start);
      const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    });

    return {
      total: upcomingAppointments.length,
      thisWeek: thisWeekAppointments.length,
      next: nextAppointment
    };
  };

  const appointmentStats = getAppointmentStats();
  const defaultPaymentMethod = patientData.paymentMethods.find(pm => pm.isDefault);
  const outstandingCharges = localCharges.filter(charge => charge.totalOutstanding > 0);
  const totalOutstanding = outstandingCharges.reduce((sum, charge) => sum + charge.totalOutstanding, 0);

  // Get charges eligible for scheduling (no existing scheduled payment)
  const eligibleChargesForScheduling = outstandingCharges.filter(charge => !charge.scheduledPaymentDate);

  const actions = [
    {
      icon: CalendarCheck,
      label: 'Appointments',
      description: appointmentStats.total > 0 
        ? `${appointmentStats.total} upcoming, ${appointmentStats.thisWeek} this week`
        : 'No upcoming appointments',
      onClick: () => {
        const appointmentsSection = document.querySelector('[data-section="appointments"]');
        if (appointmentsSection) {
          appointmentsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          if (appointmentStats.next) {
            alert(`📅 Next Appointment:\n\n${appointmentStats.next.title}\nDate: ${new Date(appointmentStats.next.start).toLocaleDateString()}\nTime: ${new Date(appointmentStats.next.start).toLocaleTimeString()}\nProvider: ${appointmentStats.next.organizer.firstName} ${appointmentStats.next.organizer.lastName}`);
          } else {
            alert('📅 No upcoming appointments scheduled.');
          }
        }
      },
      disabled: false,
      color: appointmentStats.thisWeek > 0 
        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
        : appointmentStats.total > 0
        ? 'bg-gradient-to-br from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700'
        : 'bg-gradient-to-br from-gray-400 to-gray-500',
      textColor: 'text-white',
      badge: appointmentStats.thisWeek > 0 ? appointmentStats.thisWeek : undefined,
      badgeColor: 'bg-white text-blue-600'
    },
    {
      icon: CreditCard,
      label: 'Charge Card',
      description: defaultPaymentMethod ? `****${defaultPaymentMethod.last4}` : 'No default card',
      onClick: () => setShowChargeModal(true),
      disabled: !defaultPaymentMethod || totalOutstanding === 0,
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
      textColor: 'text-white'
    },
    // Schedule Payment Action
    {
      icon: CalendarPlus,
      label: 'Schedule Payment',
      description: eligibleChargesForScheduling.length > 0 
        ? `${eligibleChargesForScheduling.length} charge${eligibleChargesForScheduling.length !== 1 ? 's' : ''} available`
        : 'No charges to schedule',
      onClick: () => setShowSchedulePaymentModal(true),
      disabled: eligibleChargesForScheduling.length === 0 || !defaultPaymentMethod,
      color: 'bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
      textColor: 'text-white',
      badge: eligibleChargesForScheduling.length > 0 ? eligibleChargesForScheduling.length : undefined,
      badgeColor: 'bg-white text-purple-600'
    },
    {
      icon: Plus,
      label: 'Add Memo',
      description: 'Quick note about patient',
      onClick: () => setShowMemoModal(true),
      disabled: false,
      color: 'bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700',
      textColor: 'text-white'
    },
    {
      icon: FileText,
      label: 'Generate Note',
      description: 'Create doctor\'s note',
      onClick: () => alert('Note generation feature coming soon!'),
      disabled: false,
      color: 'bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
      textColor: 'text-white'
    }
  ];

  // Handle Schedule Payment Form Changes
  const handleScheduleFormChange = (field: string, value: any) => {
    setScheduleForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChargeAmountChange = (chargeId: string, amount: number) => {
    setScheduleForm(prev => ({
      ...prev,
      amounts: {
        ...prev.amounts,
        [chargeId]: amount
      }
    }));
  };

  const getScheduledTotal = () => {
    return scheduleForm.selectedChargeIds.reduce((total, chargeId) => {
      const charge = eligibleChargesForScheduling.find(c => c.id === chargeId);
      if (!charge) return total;
      
      if (scheduleForm.customAmount && scheduleForm.amounts[chargeId]) {
        return total + scheduleForm.amounts[chargeId];
      }
      return total + charge.totalOutstanding;
    }, 0);
  };

  // Process Scheduled Payment
  const processSchedulePayment = async () => {
    if (scheduleForm.selectedChargeIds.length === 0 || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSchedulingPayment(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const scheduledDateTime = new Date(`${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}`);
    const selectedPaymentMethod = patientData.paymentMethods.find(pm => pm.id === scheduleForm.paymentMethodId) || defaultPaymentMethod;

    // Update charges with scheduled payment information
    const updatedCharges = localCharges.map(charge => {
      if (scheduleForm.selectedChargeIds.includes(charge.id)) {
        const scheduledAmount = scheduleForm.customAmount && scheduleForm.amounts[charge.id] 
          ? scheduleForm.amounts[charge.id] 
          : charge.totalOutstanding;

        return {
          ...charge,
          scheduledPaymentDate: scheduledDateTime.toISOString(),
          scheduledPaymentAmount: scheduledAmount,
          scheduledPaymentMethod: selectedPaymentMethod,
          autoPayEnabled: scheduleForm.autoPayEnabled,
          comment: charge.comment 
            ? `${charge.comment} [Scheduled payment: ${scheduledDateTime.toLocaleDateString()} ${scheduledDateTime.toLocaleTimeString()}]`
            : `Scheduled payment: ${scheduledDateTime.toLocaleDateString()} ${scheduledDateTime.toLocaleTimeString()}`
        };
      }
      return charge;
    });

    // Create a memo about the scheduled payment
    const scheduledChargeDescriptions = scheduleForm.selectedChargeIds
      .map(chargeId => {
        const charge = eligibleChargesForScheduling.find(c => c.id === chargeId);
        return charge?.description || 'Unknown charge';
      })
      .join(', ');

    const newMemo: Memo = {
      id: `memo_schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patient: {
        id: patientData.patient.id,
        firstName: patientData.patient.firstName,
        lastName: patientData.patient.lastName,
        email: patientData.patient.email,
        phoneNumber: patientData.patient.phoneNumber
      },
      note: `Scheduled payment setup: ${scheduleForm.selectedChargeIds.length} charge${scheduleForm.selectedChargeIds.length !== 1 ? 's' : ''} (${scheduledChargeDescriptions}) for ${scheduledDateTime.toLocaleDateString()} at ${scheduledDateTime.toLocaleTimeString()}. Total amount: $${getScheduledTotal().toFixed(2)}. Auto-pay: ${scheduleForm.autoPayEnabled ? 'Enabled' : 'Disabled'}.`,
      creator: {
        id: "usr_current_provider",
        firstName: "Current",
        lastName: "Provider",
        email: "provider@decodahealth.com"
      },
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    // Update patient data with new charges and memo
    const updatedPatientData: PatientData = {
      ...patientData,
      charges: updatedCharges,
      memos: [newMemo, ...patientData.memos]
    };

    // Update local state immediately for responsive UI
    setLocalCharges(updatedCharges);

    // Propagate changes to parent components via callback
    if (onDataUpdate) {
      onDataUpdate(updatedPatientData);
    }

    setIsSchedulingPayment(false);
    setShowSchedulePaymentModal(false);
    
    // Reset form
    setScheduleForm({
      selectedChargeIds: [],
      scheduledDate: '',
      scheduledTime: '',
      paymentMethodId: '',
      autoPayEnabled: true,
      customAmount: false,
      amounts: {}
    });

    // Success feedback
    alert(`✅ Payment Scheduled Successfully!\n\nCharges: ${scheduledChargeDescriptions}\nScheduled for: ${scheduledDateTime.toLocaleDateString()} at ${scheduledDateTime.toLocaleTimeString()}\nTotal Amount: $${getScheduledTotal().toFixed(2)}\nPayment Method: ${selectedPaymentMethod?.brand} ****${selectedPaymentMethod?.last4}\nAuto-pay: ${scheduleForm.autoPayEnabled ? 'Enabled' : 'Disabled'}\n\nThe scheduled payment information has been updated in the billing overview.`);
  };

  const handleChargeSelection = (chargeId: string) => {
    setSelectedCharges(prev => 
      prev.includes(chargeId) 
        ? prev.filter(id => id !== chargeId)
        : [...prev, chargeId]
    );
  };

  const getSelectedTotal = () => {
    return outstandingCharges
      .filter(charge => selectedCharges.includes(charge.id))
      .reduce((sum, charge) => sum + charge.totalOutstanding, 0);
  };

  const getChargeDetails = (charge: Charge) => {
    const hasPaymentPlan = charge.plannedPayments && charge.plannedPayments.length > 0;
    const daysOverdue = Math.floor((new Date().getTime() - new Date(charge.createdDate).getTime()) / (1000 * 3600 * 24));
    
    return {
      hasPaymentPlan,
      daysOverdue,
      isOverdue: daysOverdue > 30,
      nextPaymentDate: hasPaymentPlan && charge.plannedPayments ? charge.plannedPayments[0]?.paymentDate : null
    };
  };

  const handleAddMemo = async () => {
    if (!memoText.trim()) {
      alert('Please enter a memo before saving.');
      return;
    }
    
    setIsAddingMemo(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newMemo: Memo = {
      id: `qn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patient: {
        id: patientData.patient.id,
        firstName: patientData.patient.firstName,
        lastName: patientData.patient.lastName,
        email: patientData.patient.email,
        phoneNumber: patientData.patient.phoneNumber
      },
      note: memoText.trim(),
      creator: {
        id: "usr_current_provider",
        firstName: "Current",
        lastName: "Provider",
        email: "provider@decodahealth.com"
      },
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    const updatedPatientData: PatientData = {
      ...patientData,
      memos: [newMemo, ...patientData.memos]
    };

    if (onDataUpdate) {
      onDataUpdate(updatedPatientData);
    }

    setIsAddingMemo(false);
    setMemoText('');
    setShowMemoModal(false);
    
    alert(`✅ Memo Added Successfully!\n\nNote: "${memoText.substring(0, 50)}${memoText.length > 50 ? '...' : ''}"\nCreated: ${new Date().toLocaleString()}\n\nThe memo has been added to the patient's timeline.`);
  };

  const processPayment = async () => {
    if (selectedCharges.length === 0) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selectedTotal = getSelectedTotal();
    const updatedCharges = localCharges.map(charge => {
      if (selectedCharges.includes(charge.id)) {
        const newPayment = {
          id: `pmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: charge.totalOutstanding,
          createdDate: new Date().toISOString(),
          paymentMethod: defaultPaymentMethod,
          paymentMedium: "CARD",
          refunds: []
        };

        const wasOnPaymentPlan = charge.plannedPayments && charge.plannedPayments.length > 0;
        const isPaidInFull = true;

        return {
          ...charge,
          totalOutstanding: 0,
          status: "PAID",
          payments: [...charge.payments, newPayment],
          plannedPayments: isPaidInFull ? [] : (charge.plannedPayments || []),
          comment: wasOnPaymentPlan && isPaidInFull 
            ? `Charge paid in full - payment plan cancelled. Original comment: ${charge.comment || 'None'}`
            : charge.comment
        };
      }
      return charge;
    });

    const paidChargeIds = selectedCharges;
    const updatedAlerts = localAlerts.filter(alert => {
      if (alert.type === 'OUTSTANDING_BALANCE') {
        const alertChargeIds = alert.data.charges?.map((c: any) => c.id) || [];
        const hasUnpaidCharges = alertChargeIds.some((id: string) => !paidChargeIds.includes(id));
        return hasUnpaidCharges;
      }
      return true;
    });

    setLocalCharges(updatedCharges);
    setLocalAlerts(updatedAlerts);
    
    if (onDataUpdate) {
      const updatedPatientData = {
        ...patientData,
        charges: updatedCharges,
        alerts: updatedAlerts
      };
      onDataUpdate(updatedPatientData);
    }

    setIsProcessing(false);
    setSelectedCharges([]);
    setShowChargeModal(false);
    
    const paymentPlanCharges = selectedCharges.filter(chargeId => {
      const charge = localCharges.find(c => c.id === chargeId);
      return charge?.plannedPayments && charge.plannedPayments.length > 0;
    });

    let successMessage = `✅ Payment Successful!\n\nProcessed: ${selectedTotal.toFixed(2)}\nCard: ${defaultPaymentMethod?.brand} ****${defaultPaymentMethod?.last4}\nDate: ${new Date().toLocaleString()}`;
    
    if (paymentPlanCharges.length > 0) {
      successMessage += `\n\n📋 Payment Plan Updates:\n${paymentPlanCharges.length} charge${paymentPlanCharges.length > 1 ? 's' : ''} with payment plans have been paid in full and marked as current. Payment plans have been cancelled.`;
    }

    const processedChargeNames = selectedCharges.map(chargeId => {
      const charge = localCharges.find(c => c.id === chargeId);
      return charge?.description || 'Unknown';
    }).join(', ');
    
    successMessage += `\n\n📄 Charges Updated:\n${processedChargeNames} - Status changed to PAID`;

    alert(successMessage);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`relative p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                action.disabled 
                  ? 'bg-gray-200 cursor-not-allowed !text-gray-500 shadow-sm' 
                  : `${action.color} !text-white shadow-lg hover:shadow-xl`
              }`}
              style={{
                boxShadow: action.disabled 
                  ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' 
                  : '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
              }}
            >
              {action.badge && !action.disabled && (
                <div className={`absolute -top-2 -right-2 ${action.badgeColor || 'bg-red-500 text-white'} rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white shadow-md`}>
                  {action.badge}
                </div>
              )}
              
              <action.icon className={`w-6 h-6 mx-auto mb-2 ${action.disabled ? '!text-gray-500' : '!text-white'}`} />
              <p className="font-bold text-sm mb-1 !text-current">{action.label}</p>
              <p className="text-xs opacity-90 leading-tight !text-current">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Payment Modal */}
      {showSchedulePaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-xl">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Schedule Payment</h3>
                <p className="text-gray-600 mt-1">Set up future payments for outstanding charges</p>
              </div>
              <button
                onClick={() => setShowSchedulePaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isSchedulingPayment}
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              {/* Payment Method Section */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <CardIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-purple-900">Payment Method</h4>
                      <div className="space-y-2">
                        {patientData.paymentMethods.map(method => (
                          <label key={method.id} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              checked={scheduleForm.paymentMethodId === method.id || (scheduleForm.paymentMethodId === '' && method.isDefault)}
                              onChange={(e) => handleScheduleFormChange('paymentMethodId', e.target.value)}
                              className="text-purple-600"
                              disabled={isSchedulingPayment}
                            />
                            <span className="text-sm text-purple-800">
                              {method.brand} ****{method.last4} {method.isDefault && '(Default)'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => handleScheduleFormChange('scheduledDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isSchedulingPayment}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Time *
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => handleScheduleFormChange('scheduledTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isSchedulingPayment}
                  />
                </div>
              </div>

              {/* Auto-pay Toggle */}
              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleForm.autoPayEnabled}
                    onChange={(e) => handleScheduleFormChange('autoPayEnabled', e.target.checked)}
                    className="text-purple-600 focus:ring-purple-500"
                    disabled={isSchedulingPayment}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enable automatic payment processing (recommended)
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  When enabled, payments will be processed automatically on the scheduled date and time.
                </p>
              </div>

              {/* Charge Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-900">Select Charges to Schedule</h4>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {eligibleChargesForScheduling.length} available
                  </span>
                </div>

                <div className="space-y-4">
                  {eligibleChargesForScheduling.map((charge) => {
                    const isSelected = scheduleForm.selectedChargeIds.includes(charge.id);
                    
                    return (
                      <div
                        key={charge.id}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => {
                          const newSelectedIds = isSelected
                            ? scheduleForm.selectedChargeIds.filter(id => id !== charge.id)
                            : [...scheduleForm.selectedChargeIds, charge.id];
                          handleScheduleFormChange('selectedChargeIds', newSelectedIds);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="mt-1">
                              <div 
                                className={`w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-purple-600 border-purple-600' 
                                    : 'bg-white border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h5 className="text-lg font-bold text-gray-900">{charge.description}</h5>
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-red-200">
                                  {charge.status.replace('_', ' ')}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-white p-3 rounded-lg border">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Outstanding</p>
                                  <p className="text-lg font-bold text-red-600">${charge.totalOutstanding.toFixed(2)}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Service Date</p>
                                  <p className="text-sm font-bold text-gray-900">{new Date(charge.createdDate).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Provider</p>
                                  <p className="text-sm font-bold text-gray-900">{charge.creator.firstName} {charge.creator.lastName}</p>
                                </div>
                              </div>

                              {/* Custom Amount Input for Selected Charges */}
                              {isSelected && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                  <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={scheduleForm.customAmount}
                                        onChange={(e) => handleScheduleFormChange('customAmount', e.target.checked)}
                                        className="text-purple-600 focus:ring-purple-500"
                                        disabled={isSchedulingPayment}
                                      />
                                      <span className="text-sm font-medium text-purple-900">Custom Amount</span>
                                    </label>
                                    
                                    {scheduleForm.customAmount && (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-purple-700">$</span>
                                        <input
                                          type="number"
                                          min="0.01"
                                          max={charge.totalOutstanding}
                                          step="0.01"
                                          value={scheduleForm.amounts[charge.id] || ''}
                                          onChange={(e) => handleChargeAmountChange(charge.id, parseFloat(e.target.value) || 0)}
                                          placeholder={charge.totalOutstanding.toFixed(2)}
                                          className="w-24 px-2 py-1 border border-purple-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                          disabled={isSchedulingPayment}
                                        />
                                        <span className="text-xs text-purple-600">
                                          (Max: ${charge.totalOutstanding.toFixed(2)})
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {!scheduleForm.customAmount && (
                                    <p className="text-xs text-purple-700 mt-2">
                                      Full outstanding amount will be scheduled: ${charge.totalOutstanding.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right ml-4">
                            <div className={`text-2xl font-black ${isSelected ? 'text-purple-600' : 'text-gray-900'}`}>
                              ${charge.totalOutstanding.toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-500">outstanding</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Summary */}
              {scheduleForm.selectedChargeIds.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-purple-900">Scheduled Payment Summary</h4>
                      <p className="text-purple-700">
                        {scheduleForm.selectedChargeIds.length} charge{scheduleForm.selectedChargeIds.length !== 1 ? 's' : ''} selected
                      </p>
                      {scheduleForm.scheduledDate && scheduleForm.scheduledTime && (
                        <p className="text-sm text-purple-600 mt-1">
                          📅 {new Date(`${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}`).toLocaleDateString()} at{' '}
                          {new Date(`${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}`).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-600 font-medium">Total Amount</p>
                      <p className="text-4xl font-black text-purple-900">${getScheduledTotal().toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className="p-6 border-t border-gray-200 bg-white rounded-b-xl">
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowSchedulePaymentModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-bold text-lg"
                  disabled={isSchedulingPayment}
                >
                  Cancel
                </button>
                <button
                  onClick={processSchedulePayment}
                  disabled={scheduleForm.selectedChargeIds.length === 0 || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime || isSchedulingPayment}
                  className={`flex-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    scheduleForm.selectedChargeIds.length > 0 && scheduleForm.scheduledDate && scheduleForm.scheduledTime && !isSchedulingPayment
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-pink-700 transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSchedulingPayment ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Scheduling Payment...</span>
                    </div>
                  ) : (
                    `Schedule Payment ${scheduleForm.selectedChargeIds.length > 0 ? `(${getScheduledTotal().toFixed(2)})` : ''}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Charge Modal with Detailed Billing */}
      {showChargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-xl">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Process Payment</h3>
                <p className="text-gray-600 mt-1">Review and select charges to process</p>
              </div>
              <button
                onClick={() => setShowChargeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              <style jsx>{`
                .scrollable-content::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

            {/* Payment Method Section */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <CardIcon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-emerald-900">
                      {defaultPaymentMethod?.brand} ****{defaultPaymentMethod?.last4}
                    </h4>
                    <p className="text-emerald-700">
                      Expires {defaultPaymentMethod?.expMonth}/{defaultPaymentMethod?.expYear} • {defaultPaymentMethod?.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-emerald-100 px-4 py-2 rounded-lg">
                    <p className="text-sm text-emerald-600 font-medium">Available to Charge</p>
                    <p className="text-2xl font-bold text-emerald-900">${totalOutstanding.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Outstanding Charges Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900">Outstanding Charges</h4>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {outstandingCharges.length} charge{outstandingCharges.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4">
                {outstandingCharges.map((charge) => {
                  const details = getChargeDetails(charge);
                  const isSelected = selectedCharges.includes(charge.id);
                  
                  return (
                    <div
                      key={charge.id}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={(e) => {
                        handleChargeSelection(charge.id);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="mt-1">
                            <div 
                              className={`w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-emerald-600 border-emerald-600' 
                                  : 'bg-white border-gray-300 hover:border-gray-400'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChargeSelection(charge.id);
                              }}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h5 className="text-lg font-bold text-gray-900">{charge.description}</h5>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                charge.status === 'UNPAID' 
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}>
                                {charge.status.replace('_', ' ')}
                              </span>
                              
                              {details.isOverdue && (
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  {details.daysOverdue} days overdue
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="bg-white p-3 rounded-lg border">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Amount</p>
                                <p className="text-lg font-bold text-gray-900">${charge.total.toFixed(2)}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg border">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Outstanding</p>
                                <p className="text-lg font-bold text-red-600">${charge.totalOutstanding.toFixed(2)}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg border">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Already Paid</p>
                                <p className="text-lg font-bold text-green-600">${(charge.total - charge.totalOutstanding).toFixed(2)}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg border">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Service Date</p>
                                <p className="text-sm font-bold text-gray-900">{new Date(charge.createdDate).toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-4 text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Building className="w-4 h-4" />
                                  <span>{charge.locationName || 'Main Clinic'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span>Provider: {charge.creator.firstName} {charge.creator.lastName}</span>
                                </div>
                              </div>
                              
                              {details.hasPaymentPlan && (
                                <div className="flex items-center space-x-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-xs font-medium">Payment Plan Active</span>
                                </div>
                              )}
                            </div>

                            {charge.comment && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">💬 {charge.comment}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className={`text-3xl font-black ${isSelected ? 'text-emerald-600' : 'text-gray-900'}`}>
                            ${charge.totalOutstanding.toFixed(2)}
                          </div>
                          <p className="text-sm text-gray-500">to charge</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Summary */}
            {selectedCharges.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-emerald-900">Payment Summary</h4>
                    <p className="text-emerald-700">
                      {selectedCharges.length} charge{selectedCharges.length !== 1 ? 's' : ''} selected for processing
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-600 font-medium">Total to Charge</p>
                    <p className="text-4xl font-black text-emerald-900">${getSelectedTotal().toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className="p-6 border-t border-gray-200 bg-white rounded-b-xl">
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowChargeModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-bold text-lg"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={selectedCharges.length === 0 || isProcessing}
                  className={`flex-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    selectedCharges.length > 0 && !isProcessing
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    `Charge ${selectedCharges.length > 0 ? `${getSelectedTotal().toFixed(2)}` : 'Selected Items'}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Memo Modal */}
      {showMemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Add Quick Memo</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Add a note about {patientData.patient.firstName} {patientData.patient.lastName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMemoModal(false);
                  setMemoText('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isAddingMemo}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Memo Note
              </label>
              <textarea
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                placeholder="Enter your note about the patient..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isAddingMemo}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {memoText.length} characters
                </span>
                {memoText.length > 500 && (
                  <span className="text-xs text-amber-600">
                    Consider keeping memos concise
                  </span>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {memoText.trim() && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Preview:</h4>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Memo - {new Date().toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">Current Provider</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{memoText}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowMemoModal(false);
                  setMemoText('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                disabled={isAddingMemo}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemo}
                disabled={!memoText.trim() || isAddingMemo}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  memoText.trim() && !isAddingMemo
                    ? 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAddingMemo ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding Memo...</span>
                  </div>
                ) : (
                  'Add Memo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActionsMenu;