'use client';

import { useState, useEffect, useMemo } from 'react';
import { Pig, PigFormData } from './types';
import PigCard from './pig-card';
import PigModal from './pig-modal';
import PigStats from './pig-stats';
import { Search, Filter, PiggyBank } from 'lucide-react';

export default function PigRecordsPage() {
  const [pigs, setPigs] = useState<Pig[]>([]);
  const [caretakers, setCaretakers] = useState<any[]>([]);
  const [filteredPigs, setFilteredPigs] = useState<Pig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [breedingFilter, setBreedingFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPig, setSelectedPig] = useState<Pig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPigs();
    fetchCaretakers();
  }, []);

  useEffect(() => {
    filterPigs();
  }, [searchTerm, healthFilter, breedingFilter, pigs]);

  const fetchPigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pigs');
      if (response.ok) {
        const data = await response.json();
        // Ensure sex is properly handled for existing data
        const processedData = data.map((pig: Pig) => ({
          ...pig,
          sex: pig.sex || 'Unknown'
        }));
        setPigs(processedData);
      }
    } catch (error) {
      console.error('Error fetching pigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaretakers = async () => {
    try {
      const response = await fetch('/api/caretakers');
      if (response.ok) {
        const data = await response.json();
        setCaretakers(data);
      }
    } catch (error) {
      console.error('Error fetching caretakers:', error);
    }
  };

  const filterPigs = () => {
    let filtered = pigs;

    if (searchTerm) {
      filtered = filtered.filter(pig =>
        pig.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pig.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pig.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pig.caretakerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (healthFilter !== 'all') {
      filtered = filtered.filter(pig => pig.healthStatus === healthFilter);
    }

    if (breedingFilter !== 'all') {
      filtered = filtered.filter(pig => pig.breedingStatus === breedingFilter);
    }

    setFilteredPigs(filtered);
  };

  const handleEditPig = async (pigData: PigFormData) => {
    if (!selectedPig) return;

    try {
      const response = await fetch(`/api/pigs/${selectedPig.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pigData,
          sex: pigData.sex || 'Unknown', // Ensure sex is never undefined
          updatedAt: new Date()
        }),
      });

      if (response.ok) {
        fetchPigs();
        setIsModalOpen(false);
        setSelectedPig(null);
      }
    } catch (error) {
      console.error('Error updating pig:', error);
    }
  };

  const handleDeletePig = async (pigId: string) => {
    if (confirm('Are you sure you want to delete this pig record?')) {
      try {
        const response = await fetch(`/api/pigs/${pigId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchPigs();
        }
      } catch (error) {
        console.error('Error deleting pig:', error);
      }
    }
  };

  const openEditModal = (pig: Pig) => {
    setSelectedPig(pig);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPig(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pig records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pig Records Management</h1>
              <p className="text-gray-600">View and manage pig records added by mobile app users</p>
            </div>
            <div className="text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              Sex is optional for pig records
            </div>
          </div>
        </div>

        {/* Stats */}
        <PigStats pigs={pigs} />

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by tag, participant, breed, or caretaker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
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
                onChange={(e) => setBreedingFilter(e.target.value)}
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

        {/* Pigs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPigs.map(pig => (
            <PigCard
              key={pig.id}
              pig={pig}
              onView={(id) => {
                const pig = pigs.find(p => p.id === id);
                if (pig) openEditModal(pig);
              }}
              onEdit={openEditModal}
              onDelete={handleDeletePig}
            />
          ))}
        </div>

        {filteredPigs.length === 0 && pigs.length > 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <div className="text-gray-500 text-lg mb-2">No pigs found</div>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {pigs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <div className="text-gray-500 text-lg mb-2">No pig records yet</div>
            <p className="text-gray-400 mb-4">Pigs will appear here when added by mobile app users</p>
            <div className="text-sm text-gray-500 bg-yellow-50 px-4 py-3 rounded-lg border border-yellow-200 inline-block">
              Users can add pigs through the mobile application
            </div>
          </div>
        )}

        {/* Modal - Only for viewing/editing health, weight, feeding, breeding */}
        <PigModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleEditPig}
          pig={selectedPig}
          caretakers={caretakers}
          isAdminView={true}
        />
      </div>
    </div>
  );
}