'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Package } from 'lucide-react';
import ViewAssetsModal from './ViewAssetsModal'; // Import the ViewAssetsModal

// Asset Interfaces
interface AssetFormData {
  project_id: string;
  project_name: string;
  asset_type: string;
  asset_name: string;
  provider_name: string;
  acquisition_date: string;
  source_type: 'purchased' | 'donated' | 'leased' | 'government_provided';
  quantity: number;
  unit_value: number;
  total_value: number;
  status: 'active' | 'maintenance' | 'disposed' | 'lost';
  description: string;
  location: string;
  maintenance_schedule: string;
}

interface GeneralProject {
  _id?: string;
  project_id: string;
  project_name: string;
  participant_name: string;
  barangay: string;
  city_municipality: string;
  province: string;
  enterprise_type: string;
  association_name: string;
  monitoring_date: string;
  project_status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  budget_allocation?: number;
  start_date?: string;
  estimated_completion?: string;
  project_description?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AssetComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GeneralProject | null;
}

export default function AssetComponentModal({ isOpen, onClose, project }: AssetComponentModalProps) {
  const [assetFormData, setAssetFormData] = useState<AssetFormData>({
    project_id: '',
    project_name: '',
    asset_type: '',
    asset_name: '',
    provider_name: '',
    acquisition_date: new Date().toISOString().split('T')[0],
    source_type: 'purchased',
    quantity: 1,
    unit_value: 0,
    total_value: 0,
    status: 'active',
    description: '',
    location: '',
    maintenance_schedule: ''
  });
  const [assetFormLoading, setAssetFormLoading] = useState(false);
  const [assetFormError, setAssetFormError] = useState('');
  const [showViewAssetsModal, setShowViewAssetsModal] = useState(false); // State for ViewAssetsModal

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setAssetFormData(prev => ({
        ...prev,
        project_id: project.project_id,
        project_name: project.project_name
      }));
    }
  }, [project]);

  // Handle asset form submission
  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssetFormError('');
    setAssetFormLoading(true);

    try {
      const totalValue = assetFormData.quantity * assetFormData.unit_value;
      
      const assetData = {
        ...assetFormData,
        total_value: totalValue
      };

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData)
      });

      const result = await response.json();

      if (response.ok) {
        resetAssetForm();
        alert('Asset added successfully!');
      } else {
        setAssetFormError(result.error || 'Failed to add asset');
      }
    } catch (error: any) {
      console.error('Error adding asset:', error);
      setAssetFormError('Error adding asset. Please check your connection.');
    } finally {
      setAssetFormLoading(false);
    }
  };

  // Reset asset form
  const resetAssetForm = () => {
    setAssetFormData({
      project_id: project?.project_id || '',
      project_name: project?.project_name || '',
      asset_type: '',
      asset_name: '',
      provider_name: '',
      acquisition_date: new Date().toISOString().split('T')[0],
      source_type: 'purchased',
      quantity: 1,
      unit_value: 0,
      total_value: 0,
      status: 'active',
      description: '',
      location: '',
      maintenance_schedule: ''
    });
  };

  // Handle closing both modals
  const handleCloseAll = () => {
    setShowViewAssetsModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Asset Component Modal */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Asset to Project
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {project ? `Project: ${project.project_name} (${project.project_id})` : 'Add asset to project'}
                </p>
              </div>
              <div className="flex gap-2">
                {/* View Assets Button */}
                <button
                  onClick={() => setShowViewAssetsModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Package size={16} />
                  View Assets
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Add Asset Form */}
            <div className="bg-white rounded-lg">
              {assetFormError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {assetFormError}
                </div>
              )}
              <form onSubmit={handleAssetSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={assetFormData.project_id}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, project_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter project ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={assetFormData.project_name}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, project_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type *
                  </label>
                  <select
                    required
                    value={assetFormData.asset_type}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, asset_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Asset Type</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Building">Building</option>
                    <option value="Land">Land</option>
                    <option value="Livestock">Livestock</option>
                    <option value="Tools">Tools</option>
                    <option value="Machinery">Machinery</option>
                    <option value="Technology">Technology</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={assetFormData.asset_name}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, asset_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter asset name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={assetFormData.provider_name}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, provider_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter provider name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acquisition Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={assetFormData.acquisition_date}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, acquisition_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Type *
                  </label>
                  <select
                    required
                    value={assetFormData.source_type}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, source_type: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="purchased">Purchased</option>
                    <option value="donated">Donated</option>
                    <option value="leased">Leased</option>
                    <option value="government_provided">Government Provided</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={assetFormData.quantity}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Value (₱) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={assetFormData.unit_value}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, unit_value: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Value (₱)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={assetFormData.quantity * assetFormData.unit_value}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={assetFormData.status}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disposed">Disposed</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={assetFormData.description}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Asset description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Schedule
                  </label>
                  <input
                    type="text"
                    value={assetFormData.maintenance_schedule}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, maintenance_schedule: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Monthly, Quarterly"
                  />
                </div>

                <div className="flex gap-4 md:col-span-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={assetFormLoading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 font-medium shadow-lg hover:shadow-xl"
                  >
                    {assetFormLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Adding Asset...
                      </div>
                    ) : (
                      'Add Asset'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetAssetForm}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
                  >
                    Clear Form
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* View Assets Modal */}
      <ViewAssetsModal
        isOpen={showViewAssetsModal}
        onClose={() => setShowViewAssetsModal(false)}
      />
    </>
  );
}