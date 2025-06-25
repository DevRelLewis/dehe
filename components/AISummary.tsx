import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { PatientData } from '../types/patient';

interface AISummaryProps {
  data: PatientData;
}

const AISummary: React.FC<AISummaryProps> = ({ data }) => {
  const [summary, setSummary] = useState<string>('');
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI processing delay
    const timer = setTimeout(() => {
      generateAISummary();
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [data]);

  const generateAISummary = () => {
    const { patient, doctorsNotes, memos, alerts } = data;
    
    // Generate summary based on available data (excluding financial info)
    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
    const recentNotes = doctorsNotes.slice(0, 2);
    const activeAlerts = alerts.filter(alert => alert.actionRequired).length;

    let summaryText = `${patient.firstName} ${patient.lastName} is a ${age}-year-old ${patient.gender.toLowerCase()} patient with a medical history of ${patient.medicalHistory?.join(', ') || 'no significant conditions'}. `;

    if (patient.allergies?.length > 0) {
      summaryText += `Known allergies include ${patient.allergies.join(', ')}. `;
    }

    if (recentNotes.length > 0) {
      const latestNote = recentNotes[0];
      summaryText += `Most recent visit focused on ${latestNote.summary.toLowerCase()}. `;
    }

    if (activeAlerts > 0) {
      summaryText += `There are ${activeAlerts} active alerts requiring attention.`;
    }

    setSummary(summaryText);

    // Generate insights (excluding financial recommendations)
    const generatedInsights = [];
    
    if (patient.familyHistory?.includes('Diabetes')) {
      generatedInsights.push('Monitor blood glucose levels due to family history of diabetes');
    }
    
    if (patient.medicalHistory?.includes('Asthma')) {
      generatedInsights.push('Ensure asthma action plan is up to date');
    }
    
    if (recentNotes.some(note => note.content.includes('allergy'))) {
      generatedInsights.push('Recent allergy concerns - monitor treatment effectiveness');
    }

    if (patient.medications?.some(med => med.active)) {
      generatedInsights.push('Review current medications for effectiveness and interactions');
    }

    if (generatedInsights.length === 0) {
      generatedInsights.push('Patient appears to be managing conditions well');
      generatedInsights.push('Continue current treatment plan');
    }

    setInsights(generatedInsights);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">AI Patient Summary</h2>
        <Sparkles className="w-4 h-4 text-purple-500" />
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="animate-pulse bg-purple-100 h-4 rounded w-full"></div>
          <div className="animate-pulse bg-purple-100 h-4 rounded w-4/5"></div>
          <div className="animate-pulse bg-purple-100 h-4 rounded w-3/4"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg p-4 mb-4 border border-purple-100">
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-gray-900">Key Insights</h3>
            </div>
            
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 bg-white rounded-lg p-3 border border-blue-100"
                >
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-xs text-purple-600 bg-purple-50 p-2 rounded">
            💡 This summary is AI-generated based on patient data and should be reviewed by healthcare providers.
          </div>
        </>
      )}
    </div>
  );
};

export default AISummary;