import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Clock, DollarSign, FileText, Bell, Brain } from 'lucide-react';
import PatientHeaderCard from './PatientHeaderCard';
import AppointmentsTable from './AppointmentsTable';
import NotesTimeline from '../components/NotesTimeline';
import BillingOverview from '../components/BillingOverview';
import AlertsFeed from '../components/AlertsFeed';
import QuickActionsMenu from './QuickActionsMenu';
import AISummary from './AISummary';
import { PatientData } from '../types/patient';

interface PatientProfileProps {
  data: PatientData;
}

interface CollapsibleSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  shouldAutoExpand: boolean;
  hasNotification: boolean;
  notificationCount?: number;
  notificationColor: string;
  component: React.ReactNode;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ data }) => {
  // Manage patient data state locally to enable real-time updates
  const [patientData, setPatientData] = useState<PatientData>(data);
  
  // State for collapsed sections (true = collapsed, false = expanded)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
  // State for dismissed alerts
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  
  // State for AI summary view tracking
  const [aiSummaryViewed, setAiSummaryViewed] = useState(false);

  // Handler to update patient data from child components
  const handlePatientDataUpdate = (updatedData: PatientData) => {
    setPatientData(updatedData);
    
    // Optional: Show success feedback to user
    console.log('Patient data updated successfully', {
      charges: updatedData.charges.length,
      alerts: updatedData.alerts.length,
      events: updatedData.events.length,
      memos: updatedData.memos.length,
      timestamp: new Date().toISOString()
    });
  };

  // Calculate section states using current patientData (not the original data prop)
  const sectionStates = useMemo(() => {
    // Filter out dismissed alerts
    const activeAlerts = patientData.alerts.filter(alert => !dismissedAlerts.has(alert.id));
    
    const outstandingBalance = patientData.charges.reduce((sum, charge) => sum + charge.totalOutstanding, 0);
    const upcomingAppointments = patientData.events.filter(event => {
      const eventDate = new Date(event.start);
      const now = new Date();
      const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return daysDiff >= 0 && daysDiff <= 7 && (event.status === 'CONFIRMED' || event.status === 'RESCHEDULED');
    });
          const recentNotes = patientData.doctorsNotes.filter(note => {
      const noteDate = new Date(note.createdDate);
      const now = new Date();
      const hoursDiff = (now.getTime() - noteDate.getTime()) / (1000 * 3600);
      return hoursDiff <= 24;
    });

    return {
      alerts: {
        shouldAutoExpand: activeAlerts.length > 0,
        hasNotification: activeAlerts.length > 0,
        notificationCount: activeAlerts.filter(alert => alert.actionRequired).length,
        activeAlerts
      },
      aiSummary: {
        shouldAutoExpand: false, // Start collapsed to encourage viewing
        hasNotification: !aiSummaryViewed,
        notificationCount: 0
      },
      billing: {
        shouldAutoExpand: outstandingBalance > 0,
        hasNotification: outstandingBalance > 0,
        notificationCount: patientData.charges.filter(charge => charge.totalOutstanding > 0).length
      },
      appointments: {
        shouldAutoExpand: upcomingAppointments.length > 0,
        hasNotification: upcomingAppointments.length > 0,
        notificationCount: upcomingAppointments.length
      },
      notes: {
        shouldAutoExpand: recentNotes.length > 0,
        hasNotification: recentNotes.length > 0,
        notificationCount: recentNotes.length
      }
    };
  }, [patientData, dismissedAlerts, aiSummaryViewed]); //

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => {
      const newSet = new Set(prev);
      newSet.add(alertId);
      return newSet;
    });
  };

  const handleToggleAiSummary = () => {
    toggleSection('aiSummary');
  };

  // Mark as viewed when section is expanded
  React.useEffect(() => {
    const isCurrentlyExpanded = isExpanded('aiSummary', sectionStates.aiSummary.shouldAutoExpand);
    if (isCurrentlyExpanded && !aiSummaryViewed) {
      setAiSummaryViewed(true);
    }
  }, [collapsedSections, sectionStates.aiSummary.shouldAutoExpand, aiSummaryViewed]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isExpanded = (sectionId: string, shouldAutoExpand: boolean) => {
    // If user hasn't interacted with this section, use auto-expand logic
    if (!(sectionId in collapsedSections)) {
      return shouldAutoExpand;
    }
    // Otherwise use user preference
    return !collapsedSections[sectionId];
  };

  const sections: CollapsibleSection[] = [
    {
      id: 'billing',
      title: 'Billing Overview',
      icon: DollarSign,
      shouldAutoExpand: sectionStates.billing.shouldAutoExpand,
      hasNotification: sectionStates.billing.hasNotification,
      notificationCount: sectionStates.billing.notificationCount,
      notificationColor: 'bg-red-500',
      component: <BillingOverview charges={patientData.charges} paymentMethods={patientData.paymentMethods} />
    },
    {
      id: 'appointments',
      title: 'Appointments',
      icon: Clock,
      shouldAutoExpand: sectionStates.appointments.shouldAutoExpand,
      hasNotification: sectionStates.appointments.hasNotification,
      notificationCount: sectionStates.appointments.notificationCount,
      notificationColor: 'bg-blue-500',
      component: (
        <div data-section="appointments">
          <AppointmentsTable 
            events={patientData.events} 
            onDataUpdate={handlePatientDataUpdate}
            patientData={patientData}
          />
        </div>
      )
    },
    {
      id: 'notes',
      title: 'Notes & Memos',
      icon: FileText,
      shouldAutoExpand: sectionStates.notes.shouldAutoExpand,
      hasNotification: sectionStates.notes.hasNotification,
      notificationCount: sectionStates.notes.notificationCount,
      notificationColor: 'bg-green-500',
      component: <NotesTimeline notes={patientData.doctorsNotes} memos={patientData.memos} />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header - Uses patientData for consistency */}
      <div className="mb-8">
        <PatientHeaderCard patient={patientData.patient} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActionsMenu 
          patientData={patientData} 
          onDataUpdate={handlePatientDataUpdate}
        />
      </div>

      {/* Alerts - Always show if present, auto-expand */}
      {sectionStates.alerts.activeAlerts.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-red-500">
            <div
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('alerts')}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
                {sectionStates.alerts.hasNotification && (
                  <div className="flex items-center space-x-1">
                    <Bell className="w-4 h-4 text-red-500" />
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                      {sectionStates.alerts.notificationCount}
                    </span>
                  </div>
                )}
              </div>
              {isExpanded('alerts', sectionStates.alerts.shouldAutoExpand) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            {isExpanded('alerts', sectionStates.alerts.shouldAutoExpand) && (
              <div className="px-6 pb-6">
                <AlertsFeed 
                  alerts={sectionStates.alerts.activeAlerts} 
                  onDismissAlert={handleDismissAlert}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Summary - Collapsible with View Tracking */}
      <div className="mb-8">
        <div className={`bg-white rounded-lg shadow-sm border-l-4 ${
          !aiSummaryViewed ? 'border-orange-500' : 'border-purple-500'
        }`}>
          <div
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50"
            onClick={handleToggleAiSummary}
          >
            <div className="flex items-center space-x-3">
              <Brain className={`w-5 h-5 ${
                !aiSummaryViewed ? 'text-orange-500' : 'text-purple-500'
              }`} />
              <h2 className="text-lg font-semibold text-gray-900">AI Patient Summary</h2>
              {!aiSummaryViewed && (
                <div className="flex items-center space-x-1">
                  <Bell className="w-4 h-4 text-orange-500" />
                  <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    NEW
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {isExpanded('aiSummary', sectionStates.aiSummary.shouldAutoExpand) ? (
                <span className="text-sm text-gray-600 font-medium">
                  {aiSummaryViewed ? 'Viewed ✓' : 'Viewing...'}
                </span>
              ) : (
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  !aiSummaryViewed 
                    ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {!aiSummaryViewed ? '⚠️ NEED TO VIEW' : '✓ Viewed'}
                </span>
              )}
            </div>
          </div>
          {isExpanded('aiSummary', sectionStates.aiSummary.shouldAutoExpand) && (
            <div className="px-6 pb-6">
              {/* 🔥 CHANGED: Now uses patientData instead of data */}
              <AISummary data={patientData} />
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Full Width Layout */}
      <div className="space-y-8">
        {/* Collapsible Sections - Full Width */}
        <div className="space-y-6">
          {sections.map((section) => {
            const expanded = isExpanded(section.id, section.shouldAutoExpand);
            const borderColor = section.hasNotification 
              ? section.notificationColor.replace('bg-', 'border-')
              : 'border-gray-200';

            return (
              <div key={section.id} className={`bg-white rounded-lg shadow-sm border-l-4 ${borderColor}`}>
                <div
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center space-x-3">
                    <section.icon className={`w-5 h-5 ${
                      section.hasNotification 
                        ? section.notificationColor.replace('bg-', 'text-')
                        : 'text-gray-600'
                    }`} />
                    <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                    {section.hasNotification && (
                      <div className="flex items-center space-x-1">
                        <Bell className={`w-4 h-4 ${section.notificationColor.replace('bg-', 'text-')}`} />
                        <span className={`${section.notificationColor} text-white px-2 py-0.5 rounded-full text-xs font-medium`}>
                          {section.notificationCount}
                        </span>
                      </div>
                    )}
                  </div>
                  {expanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                
                {expanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4">
                      {section.component}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;