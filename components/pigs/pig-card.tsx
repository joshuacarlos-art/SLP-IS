'use client';

import { Pig } from './types';
import { Eye, Edit, Trash2, Scale, Heart, Utensils, Smartphone, User } from 'lucide-react';

interface PigCardProps {
  pig: Pig;
  onView: (pigId: string) => void;
  onEdit: (pig: Pig) => void;
  onDelete: (pigId: string) => void;
}

const PigCard: React.FC<PigCardProps> = ({ pig, onView, onEdit, onDelete }) => {
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-green-600 bg-green-100';
      case 'Good': return 'text-blue-600 bg-blue-100';
      case 'Fair': return 'text-yellow-600 bg-yellow-100';
      case 'Poor': return 'text-orange-600 bg-orange-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBreedingColor = (status: string) => {
    switch (status) {
      case 'Pregnant': return 'text-purple-600 bg-purple-100';
      case 'Lactating': return 'text-pink-600 bg-pink-100';
      case 'Ready': return 'text-green-600 bg-green-100';
      case 'Weaned': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSexDisplay = (sex?: string) => {
    if (!sex || sex === 'Unknown') {
      return 'Not specified';
    }
    return sex;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{pig.tagNumber}</h3>
            <div className="relative group">
              <Smartphone className="h-3 w-3 text-green-600" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Added via Mobile App
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">{pig.participantName}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onView(pig.id)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(pig)}
            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Edit Health & Breeding Info"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(pig.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Pig Record"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Breed:</span>
          <span className="font-medium">{pig.breed}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sex:</span>
          <span className="font-medium flex items-center gap-1">
            <User className="h-3 w-3 text-gray-400" />
            {getSexDisplay(pig.sex)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Weight:</span>
          <span className="font-medium flex items-center gap-1">
            <Scale className="h-3 w-3" />
            {pig.weight} kg
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Health:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(pig.healthStatus)}`}>
            <Heart className="h-3 w-3 inline mr-1" />
            {pig.healthStatus}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Breeding:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBreedingColor(pig.breedingStatus)}`}>
            {pig.breedingStatus}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Feeding:</span>
          <span className="font-medium flex items-center gap-1">
            <Utensils className="h-3 w-3" />
            {pig.feedingSchedule}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Caretaker:</span>
          <span className="font-medium">{pig.caretakerName}</span>
        </div>
      </div>
    </div>
  );
};

export default PigCard;