'use client';

import { useState, useEffect } from 'react';
import { Pig, PigFormData } from './types';

interface PigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pigData: PigFormData) => void;
  pig?: Pig | null;
  caretakers: any[];
  isAdminView?: boolean;
}

const PigModal: React.FC<PigModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  pig, 
  caretakers,
  isAdminView = false 
}) => {
  const [formData, setFormData] = useState<PigFormData>({
    participantId: '',
    participantName: '',
    project: '',
    tagNumber: '',
    breed: '',
    sex: 'Unknown', // Default to Unknown
    healthStatus: 'Good',
    feedingSchedule: '',
    breedingStatus: 'Not Ready',
    weight: 0,
    dateOfBirth: new Date(),
    dateAcquired: new Date(),
    lastVetVisit: new Date(),
    nextVetVisit: new Date(),
    notes: '',
    caretakerId: '',
    caretakerName: ''
  });

  useEffect(() => {
    if (pig) {
      setFormData({
        participantId: pig.participantId,
        participantName: pig.participantName,
        project: pig.project,
        tagNumber: pig.tagNumber,
        breed: pig.breed,
        sex: pig.sex || 'Unknown', // Handle undefined sex
        healthStatus: pig.healthStatus,
        feedingSchedule: pig.feedingSchedule,
        breedingStatus: pig.breedingStatus,
        weight: pig.weight,
        dateOfBirth: pig.dateOfBirth,
        dateAcquired: pig.dateAcquired,
        lastVetVisit: pig.lastVetVisit,
        nextVetVisit: pig.nextVetVisit,
        notes: pig.notes,
        caretakerId: pig.caretakerId,
        caretakerName: pig.caretakerName
      });
    }
  }, [pig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen || !pig) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100 border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Pig Details - {pig.tagNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Added by: {pig.participantName} • Caretaker: {pig.caretakerName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Read-only Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Number
              </label>
              <input
                type="text"
                value={formData.tagNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed
              </label>
              <input
                type="text"
                value={formData.breed}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex
              </label>
              <select
                value={formData.sex || 'Unknown'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  sex: e.target.value as 'Male' | 'Female' | 'Unknown' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                disabled={!isAdminView} // Only admin can edit sex if needed
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <input
                type="text"
                value={formData.project}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>

            {/* Editable Health & Breeding Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Health & Breeding Management
                {isAdminView && (
                  <span className="text-sm font-normal text-blue-600 ml-2">
                    (Admin Editable)
                  </span>
                )}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Status *
              </label>
              <select
                required
                value={formData.healthStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, healthStatus: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breeding Status *
              </label>
              <select
                required
                value={formData.breedingStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, breedingStatus: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Not Ready">Not Ready</option>
                <option value="Ready">Ready</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Lactating">Lactating</option>
                <option value="Weaned">Weaned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg) *
              </label>
              <input
                type="number"
                required
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feeding Schedule *
              </label>
              <input
                type="text"
                required
                value={formData.feedingSchedule}
                onChange={(e) => setFormData(prev => ({ ...prev, feedingSchedule: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2x daily, morning and evening"
              />
            </div>

            {/* Read-only Dates */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Acquired
              </label>
              <input
                type="date"
                value={formData.dateAcquired ? new Date(formData.dateAcquired).toISOString().split('T')[0] : ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes about the pig..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Update Health & Breeding Info
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PigModal;