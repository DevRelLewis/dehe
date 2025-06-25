'use client';

import { useState, useEffect } from 'react';
import PatientProfile from '../components/PatientProfile';
import { usePatientData } from '../hooks/usePatientData';

export default function Home() {
  const { patientData, loading, error } = usePatientData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Patient Data</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Add this null check
  if (!patientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-2">No Patient Data</h1>
          <p className="text-gray-500">Patient data could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientProfile data={patientData} />
    </div>
  );
}