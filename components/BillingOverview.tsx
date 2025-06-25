import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, AlertTriangle, CheckCircle, Calendar, User, Clock, Bell, Zap, TrendingUp } from 'lucide-react';
import { Charge, PaymentMethod, PatientData } from '../types/patient';

interface BillingOverviewProps {
  charges: Charge[];
  paymentMethods?: PaymentMethod[];
  compact?: boolean;
  onDataUpdate?: (updatedData: PatientData) => void;
  patientData?: PatientData;
}

const BillingOverview: React.FC<BillingOverviewProps> = ({ 
  charges, 
  paymentMethods = [], 
  compact = false,
  onDataUpdate,
  patientData
}) => {
  const [processedCharges, setProcessedCharges] = useState<Charge[]>(charges);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number>(Date.now());

  // More robust effect to handle scheduled payments and sync updates
  useEffect(() => {
    const processScheduledPayments = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let hasChanges = false;
      const updatedCharges = charges.map(charge => {
        if (charge.scheduledPaymentDate && charge.totalOutstanding > 0) {
          const scheduledDate = new Date(charge.scheduledPaymentDate);
          scheduledDate.setHours(0, 0, 0, 0);
          
          // If scheduled date is today or in the past, simulate auto-payment
          if (scheduledDate <= today && charge.autoPayEnabled) {
            const paymentAmount = charge.scheduledPaymentAmount || charge.totalOutstanding;
            
            // Create new payment record
            const newPayment = {
              id: `auto_pmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              amount: paymentAmount,
              createdDate: new Date().toISOString(),
              paymentMethod: charge.scheduledPaymentMethod,
              paymentMedium: "SCHEDULED_AUTO_PAY",
              refunds: []
            };

            // Update charge status
            const newOutstanding = Math.max(0, charge.totalOutstanding - paymentAmount);
            const newStatus = newOutstanding === 0 ? "PAID" : "PARTIALLY_PAID";

            hasChanges = true;
            return {
              ...charge,
              totalOutstanding: newOutstanding,
              status: newStatus,
              payments: [...charge.payments, newPayment],
              comment: `${charge.comment || ''} [Auto-payment processed on ${scheduledDate.toLocaleDateString()}]`.trim(),
              // Clear scheduled payment info after processing
              scheduledPaymentDate: undefined,
              scheduledPaymentAmount: undefined,
              scheduledPaymentMethod: undefined,
              autoPayEnabled: undefined
            };
          }
        }
        return charge;
      });

      // Always update processedCharges to reflect latest data, even if no auto-payments processed
      setProcessedCharges(updatedCharges);
      setLastUpdateTimestamp(Date.now());

      // If actual auto-payments were processed, update parent component
      if (hasChanges && onDataUpdate && patientData) {
        const updatedPatientData = {
          ...patientData,
          charges: updatedCharges
        };
        onDataUpdate(updatedPatientData);
      }
    };

    processScheduledPayments();
  }, [charges, onDataUpdate, patientData]); // React to charges prop changes

  // Additional effect to handle real-time updates from Quick Actions
  useEffect(() => {
    // Force re-render when charges prop changes (e.g., from QuickActions scheduling)
    setProcessedCharges(charges);
    setLastUpdateTimestamp(Date.now());
  }, [charges]);

  // Helper functions for enhanced scheduled payment analysis
  const getScheduledPaymentStatus = (charge: Charge) => {
    if (!charge.scheduledPaymentDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDate = new Date(charge.scheduledPaymentDate);
    scheduledDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return { 
        status: 'overdue', 
        text: `Scheduled payment was ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''} ago`, 
        color: 'bg-red-100 text-red-800 border-red-200',
        urgency: 'high'
      };
    } else if (daysDiff === 0) {
      return { 
        status: 'today', 
        text: 'Scheduled payment today', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        urgency: 'high'
      };
    } else if (daysDiff === 1) {
      return { 
        status: 'tomorrow', 
        text: 'Scheduled payment tomorrow', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        urgency: 'medium'
      };
    } else if (daysDiff <= 7) {
      return { 
        status: 'this-week', 
        text: `Scheduled payment in ${daysDiff} days`, 
        color: 'bg-green-100 text-green-800 border-green-200',
        urgency: 'low'
      };
    } else {
      return { 
        status: 'future', 
        text: `Scheduled payment on ${scheduledDate.toLocaleDateString()}`, 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        urgency: 'low'
      };
    }
  };

  const getScheduledPaymentsStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const scheduledCharges = processedCharges.filter(charge => 
      charge.scheduledPaymentDate && charge.totalOutstanding > 0
    );
    
    const upcomingPayments = scheduledCharges.filter(charge => {
      const scheduledDate = new Date(charge.scheduledPaymentDate!);
      scheduledDate.setHours(0, 0, 0, 0);
      return scheduledDate > today;
    });
    
    const todayPayments = scheduledCharges.filter(charge => {
      const scheduledDate = new Date(charge.scheduledPaymentDate!);
      scheduledDate.setHours(0, 0, 0, 0);
      return scheduledDate.getTime() === today.getTime();
    });

    const thisWeekPayments = scheduledCharges.filter(charge => {
      const scheduledDate = new Date(charge.scheduledPaymentDate!);
      scheduledDate.setHours(0, 0, 0, 0);
      const daysDiff = (scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff >= 0 && daysDiff <= 7;
    });

    const totalScheduledAmount = scheduledCharges.reduce((sum, charge) => 
      sum + (charge.scheduledPaymentAmount || charge.totalOutstanding), 0
    );

    const autoPayCount = scheduledCharges.filter(charge => charge.autoPayEnabled).length;

    return {
      total: scheduledCharges.length,
      upcoming: upcomingPayments.length,
      today: todayPayments.length,
      thisWeek: thisWeekPayments.length,
      totalAmount: totalScheduledAmount,
      autoPayCount,
      charges: scheduledCharges
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UNPAID':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />;
      case 'PARTIALLY_PAID':
      case 'UNPAID':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const totalOutstanding = processedCharges.reduce((sum, charge) => sum + charge.totalOutstanding, 0);
  const totalPaid = processedCharges.reduce((sum, charge) => sum + (charge.total - charge.totalOutstanding), 0);
  const scheduledStats = getScheduledPaymentsStats();

  if (processedCharges.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No charges found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Update Indicator */}
      {!compact && (
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Last updated: {new Date(lastUpdateTimestamp).toLocaleTimeString()}</span>
          {scheduledStats.total > 0 && (
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{scheduledStats.total} scheduled payment{scheduledStats.total !== 1 ? 's' : ''}</span>
            </span>
          )}
        </div>
      )}

      {/* Enhanced Summary Cards with Real-time Scheduled Payments */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-medium">Total Paid</span>
            </div>
            <p className="text-lg font-bold text-blue-900">${totalPaid.toFixed(2)}</p>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-600 font-medium">Outstanding</span>
            </div>
            <p className="text-lg font-bold text-red-900">${totalOutstanding.toFixed(2)}</p>
          </div>

          {/* Scheduled Payments Summary with Real-time Updates */}
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg relative">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-purple-600 font-medium">Scheduled</span>
              {scheduledStats.today > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                  {scheduledStats.today}
                </div>
              )}
            </div>
            <p className="text-lg font-bold text-purple-900">${scheduledStats.totalAmount.toFixed(2)}</p>
            <div className="flex items-center justify-between text-xs text-purple-700 mt-1">
              <span>{scheduledStats.total} payment{scheduledStats.total !== 1 ? 's' : ''}</span>
              {scheduledStats.autoPayCount > 0 && (
                <span className="flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>{scheduledStats.autoPayCount} auto</span>
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 font-medium">Payment Methods</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{paymentMethods.length}</p>
          </div>
        </div>
      )}

      {/* Dynamic Scheduled Payments Alert Bar */}
      {scheduledStats.today > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg animate-pulse">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-blue-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                🔄 Auto-Payment Processing Today
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {scheduledStats.today} scheduled payment{scheduledStats.today !== 1 ? 's' : ''} will be processed automatically today
              </p>
            </div>
          </div>
        </div>
      )}

      {/* This Week's Scheduled Payments Preview */}
      {scheduledStats.thisWeek > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h4 className="text-sm font-bold text-purple-900">This Week's Scheduled Payments</h4>
            </div>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              {scheduledStats.thisWeek} payment{scheduledStats.thisWeek !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-2">
            {scheduledStats.charges
              .filter(charge => {
                const scheduledDate = new Date(charge.scheduledPaymentDate!);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                scheduledDate.setHours(0, 0, 0, 0);
                const daysDiff = (scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                return daysDiff >= 0 && daysDiff <= 7;
              })
              .sort((a, b) => new Date(a.scheduledPaymentDate!).getTime() - new Date(b.scheduledPaymentDate!).getTime())
              .slice(0, 3)
              .map(charge => {
                const scheduledStatus = getScheduledPaymentStatus(charge);
                return (
                  <div key={charge.id} className="bg-white rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{charge.description}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(charge.scheduledPaymentDate!).toLocaleDateString()} at{' '}
                          {new Date(charge.scheduledPaymentDate!).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-900">
                          ${(charge.scheduledPaymentAmount || charge.totalOutstanding).toFixed(2)}
                        </p>
                        {scheduledStatus && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${scheduledStatus.color}`}>
                            {scheduledStatus.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            
            {scheduledStats.thisWeek > 3 && (
              <div className="text-center py-2">
                <span className="text-xs text-purple-600 font-medium">
                  +{scheduledStats.thisWeek - 3} more scheduled payment{scheduledStats.thisWeek - 3 !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charges List with Enhanced Scheduling Information */}
      <div className="space-y-4">
        {processedCharges.map((charge) => {
          const scheduledStatus = getScheduledPaymentStatus(charge);
          
          return (
            <div
              key={charge.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:bg-gray-100 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">{charge.description}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(charge.status)}`}>
                    {getStatusIcon(charge.status)}
                    <span className="ml-2">{charge.status.replace('_', ' ')}</span>
                  </span>
                  
                  {/* ENHANCED: Scheduled Payment Badge with Status Indication */}
                  {scheduledStatus && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${scheduledStatus.color} ${
                      scheduledStatus.urgency === 'high' ? 'animate-pulse' : ''
                    }`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {scheduledStatus.text}
                      {charge.autoPayEnabled && (
                        <Zap className="w-3 h-3 ml-1" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center bg-white p-3 rounded-lg border">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">${charge.total.toFixed(2)}</p>
                </div>
                <div className="text-center bg-white p-3 rounded-lg border">
                  <p className="text-sm text-gray-500 mb-1">Outstanding</p>
                  <p className={`text-xl font-bold ${charge.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${charge.totalOutstanding.toFixed(2)}
                  </p>
                </div>
                <div className="text-center bg-white p-3 rounded-lg border">
                  <p className="text-sm text-gray-500 mb-1">Paid</p>
                  <p className="text-xl font-bold text-green-600">
                    ${(charge.total - charge.totalOutstanding).toFixed(2)}
                  </p>
                </div>
                <div className="text-center bg-white p-3 rounded-lg border">
                  <p className="text-sm text-gray-500 mb-1">Service Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(charge.createdDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* ENHANCED: Scheduled Payment Details with Real-time Updates */}
              {charge.scheduledPaymentDate && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-purple-900">Scheduled Payment</h4>
                        <p className="text-xs text-purple-700">
                          {new Date(charge.scheduledPaymentDate).toLocaleDateString()} at {new Date(charge.scheduledPaymentDate).toLocaleTimeString()}
                        </p>
                        {charge.scheduledPaymentMethod && (
                          <p className="text-xs text-purple-600">
                            {charge.scheduledPaymentMethod.brand} ****{charge.scheduledPaymentMethod.last4}
                          </p>
                        )}
                        {scheduledStatus && scheduledStatus.urgency === 'high' && (
                          <p className="text-xs font-bold text-purple-800 mt-1">
                            ⚡ {scheduledStatus.status === 'today' ? 'Processing today!' : 'Overdue!'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-purple-100 px-3 py-1 rounded-lg">
                        <p className="text-xs text-purple-600 font-medium">Amount</p>
                        <p className="text-lg font-bold text-purple-900">
                          ${(charge.scheduledPaymentAmount || charge.totalOutstanding).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {charge.autoPayEnabled && (
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700">Auto-payment enabled</span>
                        </div>
                      )}
                      
                      {scheduledStatus && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${scheduledStatus.color}`}>
                          {scheduledStatus.text}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-purple-600">
                      Updated: {new Date(lastUpdateTimestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-600 bg-white p-3 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(charge.createdDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Provider: {charge.creator.firstName} {charge.creator.lastName}</span>
                  </div>
                </div>
                
                {charge.locationName && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {charge.locationName}
                  </span>
                )}
              </div>

              {/* Comment */}
              {charge.comment && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 italic">💬 {charge.comment}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer for Scheduled Payments */}
      {scheduledStats.total > 0 && !compact && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-purple-900">Scheduled Payments Summary</h4>
              <p className="text-xs text-purple-700">
                {scheduledStats.total} total • {scheduledStats.autoPayCount} auto-pay enabled • ${scheduledStats.totalAmount.toFixed(2)} total amount
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-purple-600">
              <Clock className="w-4 h-4" />
              <span>Next sync: {new Date(lastUpdateTimestamp + 60000).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingOverview;