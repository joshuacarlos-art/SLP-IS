'use client';

import { ExtendedProject, Association } from '@/types/project';

interface ProjectStatsProps {
  projects: ExtendedProject[];
  associations: Association[];
}

export function ProjectStats({ projects, associations }: ProjectStatsProps) {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => 
    p.enterpriseSetup.status?.toLowerCase() === 'active'
  ).length;
  
  const projectsWithMultipleAssociations = projects.filter(p => 
    (p.multipleAssociations && p.multipleAssociations.length > 1) || 
    (p.operationalInformation?.multipleAssociations && p.operationalInformation.multipleAssociations.length > 1)
  ).length;

  const totalAssociations = associations.length;

  const stats = [
    {
      name: 'Total Projects',
      value: totalProjects,
      color: 'from-blue-500 to-blue-600',
      icon: '📊',
      description: 'All projects in system'
    },
    {
      name: 'Active Projects',
      value: activeProjects,
      color: 'from-green-500 to-green-600',
      icon: '✅',
      description: 'Currently active'
    },
    {
      name: 'Multiple Associations',
      value: projectsWithMultipleAssociations,
      color: 'from-purple-500 to-purple-600',
      icon: '🤝',
      description: 'With multiple associations'
    },
    {
      name: 'Active Associations',
      value: totalAssociations,
      color: 'from-orange-500 to-orange-600',
      icon: '🏢',
      description: 'Total associations'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={`stat-${stat.name}-${index}`}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white text-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">{stat.description}</p>
            </div>
          </div>
          
          {/* Progress bar for visual interest */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full bg-gradient-to-r ${stat.color}`}
                style={{ width: `${(stat.value / Math.max(...stats.map(s => s.value))) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}