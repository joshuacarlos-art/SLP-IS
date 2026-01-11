'use client';

import { Association } from '@/types/project';

interface Filters {
  search: string;
  status: string;
  enterpriseType: string;
  associationId: string;
  region: string;
  province: string;
  membershipType: string;
}

interface ProjectFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  associations: Association[];
}

export function ProjectFilters({ filters, onFiltersChange, associations }: ProjectFiltersProps) {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      enterpriseType: '',
      associationId: '',
      region: '',
      province: '',
      membershipType: ''
    });
  };

  // Unique values for filters
  const statusOptions = ['active', 'inactive', 'pending', 'completed'];
  const enterpriseTypeOptions = ['agriculture', 'livestock', 'fishery', 'handicraft', 'retail', 'service', 'manufacturing'];
  const membershipTypeOptions = ['regular', 'associate', 'honorary'];

  // Get unique regions and provinces from associations
  const uniqueRegions = Array.from(new Set(associations
    .filter(assoc => assoc.region)
    .map(assoc => assoc.region!)
  ));

  const uniqueProvinces = Array.from(new Set(associations
    .filter(assoc => assoc.province)
    .map(assoc => assoc.province!)
  ));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Clear All Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search projects..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statusOptions.map((status, index) => (
              <option key={`status-${status}-${index}`} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Enterprise Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enterprise Type</label>
          <select
            value={filters.enterpriseType}
            onChange={(e) => handleFilterChange('enterpriseType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {enterpriseTypeOptions.map((type, index) => (
              <option key={`type-${type}-${index}`} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Association */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Association</label>
          <select
            value={filters.associationId}
            onChange={(e) => handleFilterChange('associationId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Associations</option>
            {associations.map((association, index) => (
              <option key={`association-${association._id}-${index}`} value={association._id}>
                {association.name} - {association.location}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Regions</option>
            {uniqueRegions.map((region, index) => (
              <option key={`region-${region}-${index}`} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Province */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
          <select
            value={filters.province}
            onChange={(e) => handleFilterChange('province', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Provinces</option>
            {uniqueProvinces.map((province, index) => (
              <option key={`province-${province}-${index}`} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        {/* Membership Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Membership Type</label>
          <select
            value={filters.membershipType}
            onChange={(e) => handleFilterChange('membershipType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Membership Types</option>
            {membershipTypeOptions.map((type, index) => (
              <option key={`membership-${type}-${index}`} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Indicator */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(filters).map(([key, value]) => {
          if (value && value !== '') {
            return (
              <span 
                key={`active-filter-${key}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {key}: {value}
                <button
                  onClick={() => handleFilterChange(key as keyof Filters, '')}
                  className="ml-2 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            );
          }
          return null;
        }).filter(Boolean)}
      </div>
    </div>
  );
}