// components/caretaker/CaretakerCard.tsx
'use client';

import { Caretaker } from './types';
import { getFullName } from './types';

interface CaretakerCardProps {
  caretaker: Caretaker;
  onViewAssessment: (caretakerId: string) => void;
  onDeleteCaretaker?: (caretakerId: string) => void;
}

const CaretakerCard: React.FC<CaretakerCardProps> = ({ 
  caretaker, 
  onViewAssessment,
  onDeleteCaretaker 
}) => {
  const fullName = getFullName(caretaker);

  const handleDelete = () => {
    if (onDeleteCaretaker && caretaker.id) {
      if (confirm(`Are you sure you want to delete ${fullName}?`)) {
        onDeleteCaretaker(caretaker.id);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          {caretaker.profilePhoto ? (
            <img
              src={caretaker.profilePhoto}
              alt={fullName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-lg font-semibold">
                {caretaker.firstName[0]}{caretaker.lastName[0]}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {fullName}
            </h3>
            <p className="text-sm text-gray-500 truncate">{caretaker.id}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              caretaker.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : caretaker.status === 'on-leave' || caretaker.status === 'on_leave'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {caretaker.status || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <span className="font-medium w-20">Contact:</span>
            <span>{caretaker.contactNumber || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium w-20">Email:</span>
            <span className="truncate">{caretaker.email || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium w-20">Modality:</span>
            <span>{caretaker.modality}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium w-20">Location:</span>
            <span className="truncate">{caretaker.cityMunicipality}</span>
          </div>
          {caretaker.slpAssociation && (
            <div className="flex items-center">
              <span className="font-medium w-20">Association:</span>
              <span className="truncate">{caretaker.slpAssociation}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onViewAssessment(caretaker.id!)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            View Assessment
          </button>
          {onDeleteCaretaker && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
              title="Delete Caretaker"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaretakerCard;