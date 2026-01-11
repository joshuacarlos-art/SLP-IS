'use client';

import { useState, useEffect } from 'react';
import { CaretakerFormData } from './types';
import { Association } from '@/types/database';

interface AddCaretakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCaretaker: (caretakerData: CaretakerFormData) => void;
  initialAssociationId?: string;
}

const AddCaretakerModal: React.FC<AddCaretakerModalProps> = ({
  isOpen,
  onClose,
  onAddCaretaker,
  initialAssociationId
}) => {
  const [formData, setFormData] = useState<CaretakerFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    extension: '',
    participantType: '',
    sex: '',
    contactNumber: '',
    slpAssociation: initialAssociationId || '',
    houseLotNo: '',
    street: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
    region: '',
    slpaName: '',
    slpaDesignation: '',
    modality: '',
    dateProvided: '',
    status: 'active'
  });

  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoadingAssociations, setIsLoadingAssociations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch associations when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAssociations();
    }
  }, [isOpen]);

  // Update form data when initialAssociationId changes
  useEffect(() => {
    if (initialAssociationId) {
      setFormData(prev => ({
        ...prev,
        slpAssociation: initialAssociationId
      }));
    }
  }, [initialAssociationId]);

  const fetchAssociations = async () => {
    try {
      setIsLoadingAssociations(true);
      const response = await fetch('/api/associations');
      if (response.ok) {
        const data = await response.json();
        const activeAssociations = data.filter((assoc: Association) => 
          !assoc.archived && assoc.status === 'active'
        );
        setAssociations(activeAssociations);
      } else {
        console.error('Failed to fetch associations');
      }
    } catch (error) {
      console.error('Error fetching associations:', error);
    } finally {
      setIsLoadingAssociations(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.slpAssociation) {
      alert('Please select an SLP Association');
      return;
    }

    // Validate address fields
    if (!formData.barangay || !formData.cityMunicipality || !formData.province || !formData.region) {
      alert('Please fill in all required address fields: Barangay, City/Municipality, Province, and Region');
      return;
    }

    setIsSubmitting(true);
    
    try {
      onAddCaretaker(formData);
      
      // Reset form but keep the initialAssociationId if provided
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        extension: '',
        participantType: '',
        sex: '',
        contactNumber: '',
        slpAssociation: initialAssociationId || '',
        houseLotNo: '',
        street: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        region: '',
        slpaName: '',
        slpaDesignation: '',
        modality: '',
        dateProvided: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Error in form submission:', error);
      alert('Failed to create caretaker. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill contact person and designation when association is selected
    if (name === 'slpAssociation' && value) {
      const selectedAssociation = associations.find(assoc => assoc._id === value);
      if (selectedAssociation) {
        setFormData(prev => ({
          ...prev,
          slpaName: selectedAssociation.contact_person || '',
          slpaDesignation: selectedAssociation.contact_person ? 'Association Contact' : ''
        }));
      }
    }
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Add New Caretaker</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="extension" className="block text-sm font-medium text-gray-700 mb-1">
                    Extension
                  </label>
                  <input
                    type="text"
                    id="extension"
                    name="extension"
                    value={formData.extension}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Jr., Sr., III"
                  />
                </div>

                <div>
                  <label htmlFor="participantType" className="block text-sm font-medium text-gray-700 mb-1">
                    Participant Type *
                  </label>
                  <select
                    id="participantType"
                    name="participantType"
                    required
                    value={formData.participantType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Association Member">Association Member</option>
                    <option value="Individual">Individual</option>
                    <option value="Cooperative Member">Cooperative Member</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">
                    Sex *
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    required
                    value={formData.sex}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="09XXXXXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="houseLotNo" className="block text-sm font-medium text-gray-700 mb-1">
                    House/Lot No.
                  </label>
                  <input
                    type="text"
                    id="houseLotNo"
                    name="houseLotNo"
                    value={formData.houseLotNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-1">
                    Barangay *
                  </label>
                  <input
                    type="text"
                    id="barangay"
                    name="barangay"
                    required
                    value={formData.barangay}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="cityMunicipality" className="block text-sm font-medium text-gray-700 mb-1">
                    City/Municipality *
                  </label>
                  <input
                    type="text"
                    id="cityMunicipality"
                    name="cityMunicipality"
                    required
                    value={formData.cityMunicipality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                    Province *
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    required
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                    Region *
                  </label>
                  <select
                    id="region"
                    name="region"
                    required
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Region</option>
                    <option value="NCR">National Capital Region (NCR)</option>
                    <option value="Region I">Region I - Ilocos Region</option>
                    <option value="Region II">Region II - Cagayan Valley</option>
                    <option value="Region III">Region III - Central Luzon</option>
                    <option value="Region IV-A">Region IV-A - CALABARZON</option>
                    <option value="Region IV-B">Region IV-B - MIMAROPA</option>
                    <option value="Region V">Region V - Bicol Region</option>
                    <option value="Region VI">Region VI - Western Visayas</option>
                    <option value="Region VII">Region VII - Central Visayas</option>
                    <option value="Region VIII">Region VIII - Eastern Visayas</option>
                    <option value="Region IX">Region IX - Zamboanga Peninsula</option>
                    <option value="Region X">Region X - Northern Mindanao</option>
                    <option value="Region XI">Region XI - Davao Region</option>
                    <option value="Region XII">Region XII - SOCCSKSARGEN</option>
                    <option value="Region XIII">Region XIII - Caraga</option>
                    <option value="BARMM">Bangsamoro Autonomous Region (BARMM)</option>
                    <option value="CAR">Cordillera Administrative Region (CAR)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SLP Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">SLP Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="slpAssociation" className="block text-sm font-medium text-gray-700 mb-1">
                    SLP Association *
                  </label>
                  <select
                    id="slpAssociation"
                    name="slpAssociation"
                    required
                    value={formData.slpAssociation}
                    onChange={handleChange}
                    disabled={isLoadingAssociations || !!initialAssociationId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingAssociations ? 'Loading associations...' : 'Select Association'}
                    </option>
                    {associations.map(association => (
                      <option key={association._id} value={association._id}>
                        {association.name} - {association.location}
                      </option>
                    ))}
                  </select>
                  {initialAssociationId && (
                    <p className="text-xs text-blue-600 mt-1">
                      Association pre-selected from current view
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="slpaName" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    id="slpaName"
                    name="slpaName"
                    value={formData.slpaName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Auto-filled from association"
                  />
                </div>

                <div>
                  <label htmlFor="slpaDesignation" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Designation
                  </label>
                  <input
                    type="text"
                    id="slpaDesignation"
                    name="slpaDesignation"
                    value={formData.slpaDesignation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Auto-filled from association"
                  />
                </div>

                <div>
                  <label htmlFor="modality" className="block text-sm font-medium text-gray-700 mb-1">
                    Modality *
                  </label>
                  <select
                    id="modality"
                    name="modality"
                    required
                    value={formData.modality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Modality</option>
                    <option value="Livelihood Assistance">Livelihood Assistance</option>
                    <option value="Skills Training">Skills Training</option>
                    <option value="Financial Assistance">Financial Assistance</option>
                    <option value="Capacity Building">Capacity Building</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dateProvided" className="block text-sm font-medium text-gray-700 mb-1">
                    Date Provided *
                  </label>
                  <input
                    type="date"
                    id="dateProvided"
                    name="dateProvided"
                    required
                    value={formData.dateProvided}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Required Fields Notice */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Fields marked with * are required. Adding this caretaker will automatically increase the member count for the selected association.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Caretaker'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCaretakerModal;