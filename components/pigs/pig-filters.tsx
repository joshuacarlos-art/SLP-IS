'use client';

import { Search } from 'lucide-react';

interface PigFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  healthFilter: string;
  onHealthFilterChange: (value: string) => void;
  breedingFilter: string;
  onBreedingFilterChange: (value: string) => void;
  sexFilter?: string; // Add sex filter
  onSexFilterChange?: (value: string) => void; // Add sex filter change handler
}

const PigFilters: React.FC<PigFiltersProps> = ({
  searchTerm,
  onSearchChange,
  healthFilter,
  onHealthFilterChange,
  breedingFilter,
  onBreedingFilterChange,
  sexFilter = 'all',
  onSexFilterChange,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tag, participant, breed, or caretaker..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {onSexFilterChange && (
          <div>
            <select
              value={sexFilter}
              onChange={(e) => onSexFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown/Not Specified</option>
            </select>
          </div>
        )}

        <div>
          <select
            value={healthFilter}
            onChange={(e) => onHealthFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Health Status</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <select
            value={breedingFilter}
            onChange={(e) => onBreedingFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Breeding Status</option>
            <option value="Not Ready">Not Ready</option>
            <option value="Ready">Ready</option>
            <option value="Pregnant">Pregnant</option>
            <option value="Lactating">Lactating</option>
            <option value="Weaned">Weaned</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PigFilters;