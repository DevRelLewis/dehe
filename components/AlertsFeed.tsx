import React from 'react';
import { Clock, User, Tag, FileText, MessageSquare, Calendar, X } from 'lucide-react';
import { Alert } from '../types/patient';

interface AlertsFeedProps {
  alerts: Alert[];
  onDismissAlert: (alertId: string) => void;
}

const AlertsFeed: React.FC<AlertsFeedProps> = ({ alerts, onDismissAlert }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'FORM_SUBMITTED':
        return <FileText className="w-5 h-5" />;
      case 'MESSAGE_RECEIVED':
        return <MessageSquare className="w-5 h-5" />;
      case 'APPOINTMENT_SCHEDULED':
        return <Calendar className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string, actionRequired: boolean) => {
    if (actionRequired) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    
    switch (type) {
      case 'FORM_SUBMITTED':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'MESSAGE_RECEIVED':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'APPOINTMENT_SCHEDULED':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertTitle = (alert: Alert) => {
    switch (alert.type) {
      case 'FORM_SUBMITTED':
        return `Form Submitted: ${alert.data.name}`;
      case 'MESSAGE_RECEIVED':
        return 'New Message Received';
      case 'APPOINTMENT_SCHEDULED':
        return `Appointment Scheduled: ${alert.data.title}`;
      default:
        return alert.type.replace('_', ' ');
    }
  };

  const getAlertDescription = (alert: Alert) => {
    switch (alert.type) {
      case 'FORM_SUBMITTED':
        return `${alert.patient.firstName} ${alert.patient.lastName} submitted a form`;
      case 'MESSAGE_RECEIVED':
        return alert.data.message.substring(0, 100) + (alert.data.message.length > 100 ? '...' : '');
      case 'APPOINTMENT_SCHEDULED':
        return `Scheduled for ${new Date(alert.data.start).toLocaleDateString()}`;
      default:
        return 'Alert requires attention';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 ${getAlertColor(alert.type, alert.actionRequired)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getAlertIcon(alert.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-base">{getAlertTitle(alert)}</h3>
                <div className="flex items-center space-x-2">
                  {alert.actionRequired && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
                      Action Required
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissAlert(alert.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors group"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm mb-3 leading-relaxed">{getAlertDescription(alert)}</p>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.createdDate).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{alert.assignedProvider.firstName} {alert.assignedProvider.lastName}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {alert.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertsFeed;