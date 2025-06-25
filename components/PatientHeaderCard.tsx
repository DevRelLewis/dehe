import React from 'react';
import { User, Phone, Mail, MapPin, Calendar, Activity, Weight, Ruler, AlertTriangle, Pill, Heart, Users } from 'lucide-react';
import { Patient, Measurement } from '../types/patient';

interface PatientHeaderCardProps {
  patient: Patient;
}

const PatientHeaderCard: React.FC<PatientHeaderCardProps> = ({ patient }) => {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  const getLatestMeasurement = (type: string) => {
    return patient.measurements
      .filter(m => m.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const weight = getLatestMeasurement('WEIGHT');
  const height = getLatestMeasurement('HEIGHT');
  const bp = getLatestMeasurement('BLOOD_PRESSURE');

  const calculateBMI = () => {
    if (!weight || !height) return null;
    
    const weightValue = typeof weight.value === 'number' ? weight.value : parseFloat(weight.value.toString());
    const heightValue = typeof height.value === 'number' ? height.value : parseFloat(height.value.toString());
    
    if (isNaN(weightValue) || isNaN(heightValue) || weightValue <= 0 || heightValue <= 0) {
      return null;
    }
    
    const weightKg = weightValue * 0.453592; // Convert lbs to kg
    const heightM = heightValue * 0.0254; // Convert inches to meters
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  const bmi = calculateBMI();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-6 mb-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-sm text-gray-500">
                {patient.gender} • {age} years old • ID: {patient.id.slice(-8)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                patient.isOnboardingComplete 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {patient.isOnboardingComplete ? 'Active' : 'Onboarding'}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{patient.phoneNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{patient.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {patient.city}, {patient.state} {patient.zipCode}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vital Signs Section */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
          {weight && (
            <span className="text-xs text-gray-400">
              Last updated: {new Date(weight.date).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Weight */}
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Weight className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="text-lg font-semibold text-gray-900">
                {weight ? `${weight.value} ${weight.unit}` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Height */}
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Ruler className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Height</p>
              <p className="text-lg font-semibold text-gray-900">
                {height ? `${height.value}"` : 'N/A'}
              </p>
            </div>
          </div>

          {/* BMI */}
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">BMI</p>
              <p className="text-lg font-semibold text-gray-900">
                {bmi || 'N/A'}
              </p>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Blood Pressure</p>
              <p className="text-lg font-semibold text-gray-900">
                {bp ? `${bp.value} ${bp.unit}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Medical Information Section */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allergies */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <h4 className="font-medium text-gray-900">Allergies</h4>
            </div>
            {patient.allergies?.length > 0 ? (
              <div className="space-y-2">
                {patient.allergies.slice(0, 3).map((allergy, index) => (
                  <span
                    key={index}
                    className="inline-block bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs mr-1 mb-1 border border-red-200"
                  >
                    {allergy}
                  </span>
                ))}
                {patient.allergies.length > 3 && (
                  <span className="inline-block bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
                    +{patient.allergies.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No known allergies</p>
            )}
          </div>

          {/* Current Medications */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Pill className="w-4 h-4 text-blue-500" />
              </div>
              <h4 className="font-medium text-gray-900">Current Medications</h4>
            </div>
            {patient.medications?.filter(med => med.active).length > 0 ? (
              <div className="space-y-2">
                {patient.medications.filter(med => med.active).slice(0, 2).map((med) => (
                  <div key={med.id} className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <p className="font-medium text-blue-900 text-sm">{med.name}</p>
                    <p className="text-xs text-blue-700">{med.dosage} - {med.frequency}</p>
                  </div>
                ))}
                {patient.medications.filter(med => med.active).length > 2 && (
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 text-center">
                    <span className="text-xs text-blue-600 font-medium">
                      +{patient.medications.filter(med => med.active).length - 2} more medications
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No current medications</p>
            )}
          </div>

          {/* Medical History */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Heart className="w-4 h-4 text-green-500" />
              </div>
              <h4 className="font-medium text-gray-900">Medical History</h4>
            </div>
            {patient.medicalHistory?.length > 0 ? (
              <div className="space-y-1">
                {patient.medicalHistory.slice(0, 3).map((condition, index) => (
                  <span
                    key={index}
                    className="inline-block bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs mr-1 mb-1 border border-green-200"
                  >
                    {condition}
                  </span>
                ))}
                {patient.medicalHistory.length > 3 && (
                  <span className="inline-block bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                    +{patient.medicalHistory.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No medical history recorded</p>
            )}
          </div>

          {/* Family History */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <h4 className="font-medium text-gray-900">Family History</h4>
            </div>
            {patient.familyHistory?.length > 0 ? (
              <div className="space-y-1">
                {patient.familyHistory.slice(0, 3).map((condition, index) => (
                  <span
                    key={index}
                    className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs mr-1 mb-1 border border-purple-200"
                  >
                    {condition}
                  </span>
                ))}
                {patient.familyHistory.length > 3 && (
                  <span className="inline-block bg-purple-50 text-purple-600 px-2 py-1 rounded-full text-xs font-medium border border-purple-200">
                    +{patient.familyHistory.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No family history recorded</p>
            )}
          </div>
        </div>

        {/* Medical Summary Alert Bar (if critical allergies exist) */}
        {patient.allergies?.some(allergy => ['Penicillin', 'Sulfa', 'Latex', 'Shellfish'].includes(allergy)) && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  ⚠️ Critical Allergies Alert
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Patient has documented allergies to: {patient.allergies.filter(allergy => 
                    ['Penicillin', 'Sulfa', 'Latex', 'Shellfish'].includes(allergy)
                  ).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHeaderCard;