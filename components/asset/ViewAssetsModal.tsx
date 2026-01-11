'use client';

import { useState, useEffect } from 'react';
import { Package, Eye, Archive, RotateCcw, X, Filter, Download, Search } from 'lucide-react';

interface Asset {
  _id?: string;
  asset_id: string;
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
  description?: string;
  location?: string;
  maintenance_schedule?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ViewAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Asset Detail Modal Component
function AssetDetailModal({ asset, isOpen, onClose }: { asset: Asset | null; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !asset) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      disposed: 'bg-red-100 text-red-800',
      lost: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSourceTypeColor = (sourceType: string) => {
    const colors = {
      purchased: 'bg-blue-100 text-blue-800',
      donated: 'bg-purple-100 text-purple-800',
      leased: 'bg-orange-100 text-orange-800',
      government_provided: 'bg-green-100 text-green-800'
    };
    return colors[sourceType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Asset Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                ID: {asset.asset_id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <p className="text-sm text-gray-900 font-medium">{asset.asset_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                <p className="text-sm text-gray-900">{asset.asset_type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <p className="text-sm text-gray-900 font-medium">{asset.project_name}</p>
                <p className="text-xs text-gray-500">ID: {asset.project_id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <p className="text-sm text-gray-900">{asset.provider_name}</p>
              </div>
            </div>

            {/* Status & Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Status & Financial</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                  {asset.status.toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceTypeColor(asset.source_type)}`}>
                  {asset.source_type.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <p className="text-sm text-gray-900">{asset.quantity}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Value</label>
                <p className="text-sm text-gray-900">{formatCurrency(asset.unit_value)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                <p className="text-sm font-semibold text-green-600">{formatCurrency(asset.total_value)}</p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acquisition Date</label>
                <p className="text-sm text-gray-900">{formatDate(asset.acquisition_date)}</p>
              </div>

              {asset.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-sm text-gray-900">{asset.location}</p>
                </div>
              )}

              {asset.maintenance_schedule && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Schedule</label>
                  <p className="text-sm text-gray-900">{asset.maintenance_schedule}</p>
                </div>
              )}

              {asset.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{asset.description}</p>
                </div>
              )}

              {asset.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
                  <p className="text-sm text-gray-900">{formatDate(asset.createdAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewAssetsModal({ isOpen, onClose }: ViewAssetsModalProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    project_id: '',
    asset_type: '',
    status: '',
    search: '',
    showArchived: false // New filter for showing archived assets
  });
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetDetail, setShowAssetDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all assets when modal opens or filters change
  useEffect(() => {
    if (isOpen) {
      fetchAllAssets();
    }
  }, [isOpen, filters.showArchived]);

  // Fetch all assets
  const fetchAllAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assets');
      if (response.ok) {
        const assetsData = await response.json();
        setAssets(assetsData);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view asset
  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetDetail(true);
  };

  // Handle archive asset
  const handleArchiveAsset = async (asset: Asset) => {
    if (!confirm(`Are you sure you want to archive "${asset.asset_name}"? This asset will be moved to archived items.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/assets?id=${asset.asset_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'disposed' })
      });

      if (response.ok) {
        // Refresh the assets list
        fetchAllAssets();
        alert('Asset archived successfully!');
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to archive asset');
      }
    } catch (error: any) {
      console.error('Error archiving asset:', error);
      alert('Error archiving asset. Please check your connection.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle restore asset
  const handleRestoreAsset = async (asset: Asset) => {
    if (!confirm(`Are you sure you want to restore "${asset.asset_name}"? This asset will be moved back to active items.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/assets?id=${asset.asset_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        // Refresh the assets list
        fetchAllAssets();
        alert('Asset restored successfully!');
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to restore asset');
      }
    } catch (error: any) {
      console.error('Error restoring asset:', error);
      alert('Error restoring asset. Please check your connection.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      project_id: '',
      asset_type: '',
      status: '',
      search: '',
      showArchived: false
    });
  };

  // Filter assets based on current filters
  const filteredAssets = assets.filter(asset => {
    const matchesProject = !filters.project_id || asset.project_id === filters.project_id;
    const matchesType = !filters.asset_type || asset.asset_type.toLowerCase().includes(filters.asset_type.toLowerCase());
    const matchesStatus = !filters.status || asset.status === filters.status;
    const matchesSearch = !filters.search || 
      asset.asset_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      asset.project_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      asset.provider_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      asset.asset_id.toLowerCase().includes(filters.search.toLowerCase());
    
    // Filter by archived status
    const matchesArchived = filters.showArchived ? asset.status === 'disposed' : asset.status !== 'disposed';
    
    return matchesProject && matchesType && matchesStatus && matchesSearch && matchesArchived;
  });

  // Calculate total assets value
  const calculateTotalAssetsValue = () => {
    return filteredAssets.reduce((total, asset) => total + asset.total_value, 0);
  };

  // Get unique project list for filter
  const uniqueProjects = Array.from(new Set(assets.map(asset => asset.project_id))).map(projectId => {
    const asset = assets.find(a => a.project_id === projectId);
    return {
      project_id: projectId,
      project_name: asset?.project_name || 'Unknown Project'
    };
  });

  // Get status color for assets
  const getAssetStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      disposed: 'bg-red-100 text-red-800',
      lost: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Get source type color
  const getSourceTypeColor = (sourceType: string) => {
    const colors = {
      purchased: 'bg-blue-100 text-blue-800',
      donated: 'bg-purple-100 text-purple-800',
      leased: 'bg-orange-100 text-orange-800',
      government_provided: 'bg-green-100 text-green-800'
    };
    return colors[sourceType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH');
  };

  // Get active and archived counts
  const activeAssetsCount = assets.filter(asset => asset.status !== 'disposed').length;
  const archivedAssetsCount = assets.filter(asset => asset.status === 'disposed').length;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filters.showArchived ? 'Archived Assets' : 'Active Assets'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filters.showArchived ? 
                    `Archived: ${archivedAssetsCount} | Filtered: ${filteredAssets.length}` :
                    `Active: ${activeAssetsCount} | Filtered: ${filteredAssets.length} | Total Value: ${formatCurrency(calculateTotalAssetsValue())}`
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('showArchived', !filters.showArchived)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    filters.showArchived 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <RotateCcw size={16} />
                  {filters.showArchived ? 'View Active' : 'View Archived'}
                </button>
                <button
                  onClick={fetchAllAssets}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={16} />
                  Refresh
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
            {/* Filters */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={filters.project_id}
                    onChange={(e) => handleFilterChange('project_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Projects</option>
                    {uniqueProjects.map(project => (
                      <option key={project.project_id} value={project.project_id}>
                        {project.project_name} ({project.project_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                  <select
                    value={filters.asset_type}
                    onChange={(e) => handleFilterChange('asset_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
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

                {!filters.showArchived && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search assets..."
                    />
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Assets Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {filters.showArchived ? 'Archived Assets' : 'Active Assets'}
                  {!filters.showArchived && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      Total Value: {formatCurrency(calculateTotalAssetsValue())}
                    </span>
                  )}
                </h3>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {filters.showArchived ? 'No archived assets found' : 'No assets found'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acquisition Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAssets.map((asset) => (
                        <tr key={asset.asset_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {asset.asset_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{asset.project_name}</div>
                              <div className="text-xs text-gray-500">{asset.project_id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {asset.asset_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {asset.asset_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {asset.provider_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(asset.acquisition_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceTypeColor(asset.source_type)}`}>
                              {asset.source_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {asset.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(asset.unit_value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {formatCurrency(asset.total_value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAssetStatusColor(asset.status)}`}>
                              {asset.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleViewAsset(asset)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="View Asset Details"
                              >
                                <Eye size={16} />
                              </button>
                              {filters.showArchived ? (
                                <button 
                                  onClick={() => handleRestoreAsset(asset)}
                                  disabled={actionLoading}
                                  className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Restore Asset"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleArchiveAsset(asset)}
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Archive Asset"
                                >
                                  <Archive size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {!filters.showArchived && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                            Total Filtered Assets Value:
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-green-600">
                            {formatCurrency(calculateTotalAssetsValue())}
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        isOpen={showAssetDetail}
        onClose={() => {
          setShowAssetDetail(false);
          setSelectedAsset(null);
        }}
      />
    </>
  );
}