'use client';

import { ExtendedProject, Association } from '@/types/project';

interface ProjectTableProps {
  projects: ExtendedProject[];
  associations: Association[];
  onEdit: (project: ExtendedProject) => void;
  onDelete: (projectId: string) => void;
  onView: (project: ExtendedProject) => void;
}

export function ProjectTable({ 
  projects, 
  associations, 
  onEdit, 
  onView 
}: ProjectTableProps) {
  const getAssociationNames = (project: ExtendedProject): string => {
    if (project.multipleAssociations && project.multipleAssociations.length > 0) {
      return project.multipleAssociations.map(assoc => assoc.name).join(', ');
    }
    if (project.operationalInformation?.multipleAssociations && project.operationalInformation.multipleAssociations.length > 0) {
      return project.operationalInformation.multipleAssociations.map(assoc => assoc.name).join(', ');
    }
    return project.associationName || 'No association';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Project Info
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Associations
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Status & Type
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-500 max-w-sm">
                      No projects match your current filters. Try adjusting your search criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              projects.map((project, index) => (
                <tr 
                  key={`project-${project.id}-${index}`} 
                  className="hover:bg-gray-50 transition-colors duration-150 group"
                >
                  {/* Project Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {project.enterpriseSetup.projectName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {project.enterpriseSetup.projectName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {project.participant.firstName} {project.participant.lastName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Started: {new Date(project.enterpriseSetup.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Associations */}
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {getAssociationNames(project)}
                      </p>
                      {(project.multipleAssociations && project.multipleAssociations.length > 1) || 
                       (project.operationalInformation?.multipleAssociations && project.operationalInformation.multipleAssociations.length > 1) ? (
                        <span className="inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                          </svg>
                          {project.multipleAssociations?.length || project.operationalInformation?.multipleAssociations?.length} associations
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Status & Type */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.enterpriseSetup.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                        {project.enterpriseSetup.status}
                      </span>
                      <p className="text-sm text-gray-600">
                        {project.enterpriseSetup.enterpriseType}
                      </p>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {project.enterpriseSetup.cityMunicipality}
                      </div>
                      <p className="text-gray-500 text-xs mt-1 ml-5.5">
                        {project.enterpriseSetup.province}
                      </p>
                    </div>
                  </td>

                  {/* Actions - Icons Only */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {/* View Icon */}
                      <button
                        onClick={() => onView(project)}
                        className="inline-flex items-center p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-150 border border-blue-200"
                        title="View project details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {/* Edit Icon */}
                      <button
                        onClick={() => onEdit(project)}
                        className="inline-flex items-center p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-150 border border-green-200"
                        title="Edit associations"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}