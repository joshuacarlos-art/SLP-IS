'use client';

import { ExtendedProject, Association } from '@/types/project';

interface ProjectDetailsViewProps {
  project: ExtendedProject;
  associations: Association[];
  onClose: () => void;
  onEdit: (project: ExtendedProject) => void;
  onEditProject?: (project: ExtendedProject) => void;
}

export function ProjectDetailsView({ 
  project, 
  onClose, 
  onEdit 
}: ProjectDetailsViewProps) {
  const getAssociationsList = (project: ExtendedProject) => {
    return project.multipleAssociations || project.operationalInformation?.multipleAssociations || [];
  };

  const associationsList = getAssociationsList(project);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {project.enterpriseSetup.projectName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Project Details</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content - All in one scrollable view */}
        <div className="flex-1 overflow-y-auto p-6 bg-white/60 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Enterprise Type</label>
                    <p className="mt-1 text-gray-900">{project.enterpriseSetup.enterpriseType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="mt-1 text-gray-900 capitalize">{project.enterpriseSetup.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="mt-1 text-gray-900">{new Date(project.enterpriseSetup.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <div className="mt-1 space-y-1 text-gray-900">
                    <p>{project.enterpriseSetup.cityMunicipality}</p>
                    <p className="text-gray-600">{project.enterpriseSetup.province}, {project.enterpriseSetup.region}</p>
                    <p className="text-sm text-gray-500">Barangay {project.enterpriseSetup.barangay}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Participant Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Participant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="mt-1 font-medium text-gray-900">
                      {project.participant.firstName} {project.participant.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contact</label>
                    <p className="mt-1 text-gray-900">{project.participant.contactNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1 text-gray-900">{project.participant.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Sex</label>
                    <p className="mt-1 text-gray-900">{project.participant.sex}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Birth Date</label>
                    <p className="mt-1 text-gray-900">{new Date(project.participant.birthDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Civil Status</label>
                    <p className="mt-1 text-gray-900">{project.participant.civilStatus}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Associations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Association Memberships</h3>
              {associationsList.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50">
                    <p className="text-sm text-blue-800">
                      Associated with <strong>{associationsList.length}</strong> association(s)
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {associationsList.map((association, index) => (
                      <div key={index} className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
                        <div className="font-medium text-gray-900">{association.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{association.location}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {association.no_active_members} members
                          {association.region && ` • ${association.region}`}
                          {association.province && ` • ${association.province}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : project.associationName ? (
                <div className="text-center py-6 border rounded-lg bg-orange-50/80 backdrop-blur-sm">
                  <div className="text-lg font-medium text-gray-900">{project.associationName}</div>
                  <p className="text-sm text-gray-600 mt-2">Single Association</p>
                </div>
              ) : (
                <div className="text-center py-6 border rounded-lg bg-gray-50/80 backdrop-blur-sm">
                  <p className="text-gray-600">No associations</p>
                </div>
              )}
            </div>

           
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-lg hover:bg-gray-50/80 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(project)}
              className="px-4 py-2 text-sm text-white bg-blue-600/90 backdrop-blur-sm rounded-lg hover:bg-blue-700/90 transition-colors border border-blue-500/20"
            >
              Edit Associations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}