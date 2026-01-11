'use client';

import { Pig } from './types';
import { PiggyBank, Heart, Scale, Users } from 'lucide-react';

interface PigStatsProps {
  pigs: Pig[];
}

const PigStats: React.FC<PigStatsProps> = ({ pigs }) => {
  const totalPigs = pigs.length;
  const malePigs = pigs.filter(pig => pig.sex === 'Male').length;
  const femalePigs = pigs.filter(pig => pig.sex === 'Female').length;
  const unknownPigs = pigs.filter(pig => !pig.sex || pig.sex === 'Unknown').length;
  const averageWeight = totalPigs > 0 
    ? pigs.reduce((sum, pig) => sum + pig.weight, 0) / totalPigs 
    : 0;

  const healthStats = {
    Excellent: pigs.filter(pig => pig.healthStatus === 'Excellent').length,
    Good: pigs.filter(pig => pig.healthStatus === 'Good').length,
    Fair: pigs.filter(pig => pig.healthStatus === 'Fair').length,
    Poor: pigs.filter(pig => pig.healthStatus === 'Poor').length,
    Critical: pigs.filter(pig => pig.healthStatus === 'Critical').length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Pigs</p>
            <p className="text-2xl font-bold text-gray-900">{totalPigs}</p>
          </div>
          <PiggyBank className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Male/Female</p>
            <p className="text-2xl font-bold text-gray-900">{malePigs}/{femalePigs}</p>
            <p className="text-xs text-gray-500 mt-1">{unknownPigs} unknown</p>
          </div>
          <Users className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg Weight</p>
            <p className="text-2xl font-bold text-gray-900">{averageWeight.toFixed(1)}kg</p>
          </div>
          <Scale className="h-8 w-8 text-orange-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Healthy</p>
            <p className="text-2xl font-bold text-gray-900">{healthStats.Excellent + healthStats.Good}</p>
            <p className="text-xs text-gray-500 mt-1">
              {healthStats.Excellent} Excellent, {healthStats.Good} Good
            </p>
          </div>
          <Heart className="h-8 w-8 text-red-600" />
        </div>
      </div>
    </div>
  );
};

export default PigStats;