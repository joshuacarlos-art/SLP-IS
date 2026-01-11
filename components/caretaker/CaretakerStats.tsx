'use client';

interface CaretakerStatsProps {
  stats: {
    total: number;
    active: number;
    onLeave: number;
    inactive: number;
  };
}

// Helper function to safely convert to number
const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const CaretakerStats: React.FC<CaretakerStatsProps> = ({ stats }) => {
  // Ensure all values are safe numbers
  const safeStats = {
    total: safeNumber(stats?.total),
    active: safeNumber(stats?.active),
    onLeave: safeNumber(stats?.onLeave),
    inactive: safeNumber(stats?.inactive),
  };

  const statCards = [
    {
      label: 'Total Caretakers',
      value: safeStats.total,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      label: 'Active',
      value: safeStats.active,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      label: 'On Leave',
      value: safeStats.onLeave,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      label: 'Inactive',
      value: safeStats.inactive,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className={`w-4 h-4 ${stat.color} rounded-full mr-3`}></div>
            <div>
              {/* Double safety check for the displayed value */}
              <div className={`text-2xl font-bold ${stat.textColor}`}>
                {safeNumber(stat.value)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {stat.label}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CaretakerStats;