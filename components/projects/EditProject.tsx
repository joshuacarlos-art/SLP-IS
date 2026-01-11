'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExtendedProject, Association } from '@/types/project';

interface EditProjectProps {
  project: ExtendedProject;
  associations: Association[];
  onClose: () => void;
  onSave: (updatedProject: ExtendedProject) => void;
}

interface ProjectFormData {
  enterpriseSetup: {
    projectName: string;
    enterpriseType: string;
    status: 'active' | 'inactive' | 'pending' | 'completed';
    startDate: string;
    region: string;
    province: string;
    cityMunicipality: string;
    barangay: string;
  };
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    sex: string;
    birthDate: string;
    civilStatus: string;
    contactNumber: string;
    email: string;
  };
  financialInformation: {
    totalSales: number;
    netIncomeLoss: number;
    totalSavingsGenerated: number;
    cashOnHand: number;
    cashOnBank: number;
  };
  operationalInformation: {
    microfinancingInstitutions: boolean;
    microfinancingServices: boolean;
    enterprisePlanExists: boolean;
    beingDelivered: boolean;
    availedServices: string[];
    assets: string[];
    institutionalBuyers: string[];
    multipleAssociations?: any[];
    membershipDetails?: any;
  };
  // Association Membership Fields
  associationIds: string[];
  membershipType: string;
  membershipStatus: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipRenewalDate: string;
}

export function EditProject({ project, associations, onClose, onSave }: EditProjectProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    enterpriseSetup: {
      projectName: '',
      enterpriseType: '',
      status: 'active',
      startDate: '',
      region: '',
      province: '',
      cityMunicipality: '',
      barangay: '',
    },
    participant: {
      id: '',
      firstName: '',
      lastName: '',
      sex: '',
      birthDate: '',
      civilStatus: '',
      contactNumber: '',
      email: '',
    },
    financialInformation: {
      totalSales: 0,
      netIncomeLoss: 0,
      totalSavingsGenerated: 0,
      cashOnHand: 0,
      cashOnBank: 0,
    },
    operationalInformation: {
      microfinancingInstitutions: false,
      microfinancingServices: false,
      enterprisePlanExists: false,
      beingDelivered: false,
      availedServices: [],
      assets: [],
      institutionalBuyers: [],
    },
    // Association Membership Fields
    associationIds: [],
    membershipType: 'Regular',
    membershipStatus: 'active',
    membershipStartDate: '',
    membershipEndDate: '',
    membershipRenewalDate: '',
  });

  // Available options for association membership
  const membershipTypes = ['Regular', 'Associate', 'Honorary', 'Lifetime'];
  const membershipStatusOptions = ['active', 'pending', 'expired', 'suspended'];

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      // Get current association IDs from multipleAssociations or single associationId
      const currentAssociationIds = project.multipleAssociations?.map(assoc => assoc.id) || 
                                   (project.associationId ? [project.associationId] : []);

      // Get membership details from operationalInformation
      const membershipDetails = project.operationalInformation?.membershipDetails;

      console.log('📥 EditProject: Initializing form with project data:', {
        projectId: project.id,
        currentAssociationIds,
        membershipDetails,
        projectMembershipType: project.membershipType
      });

      setFormData({
        enterpriseSetup: {
          projectName: project.enterpriseSetup?.projectName || '',
          enterpriseType: project.enterpriseSetup?.enterpriseType || '',
          status: project.enterpriseSetup?.status || 'active',
          startDate: project.enterpriseSetup?.startDate || '',
          region: project.enterpriseSetup?.region || '',
          province: project.enterpriseSetup?.province || '',
          cityMunicipality: project.enterpriseSetup?.cityMunicipality || '',
          barangay: project.enterpriseSetup?.barangay || '',
        },
        participant: {
          id: project.participant?.id || 'unknown',
          firstName: project.participant?.firstName || '',
          lastName: project.participant?.lastName || '',
          sex: project.participant?.sex || '',
          birthDate: project.participant?.birthDate || '',
          civilStatus: project.participant?.civilStatus || '',
          contactNumber: project.participant?.contactNumber || '',
          email: project.participant?.email || '',
        },
        financialInformation: {
          totalSales: project.financialInformation?.totalSales || 0,
          netIncomeLoss: project.financialInformation?.netIncomeLoss || 0,
          totalSavingsGenerated: project.financialInformation?.totalSavingsGenerated || 0,
          cashOnHand: project.financialInformation?.cashOnHand || 0,
          cashOnBank: project.financialInformation?.cashOnBank || 0,
        },
        operationalInformation: {
          microfinancingInstitutions: project.operationalInformation?.microfinancingInstitutions || false,
          microfinancingServices: project.operationalInformation?.microfinancingServices || false,
          enterprisePlanExists: project.operationalInformation?.enterprisePlanExists || false,
          beingDelivered: project.operationalInformation?.beingDelivered || false,
          availedServices: project.operationalInformation?.availedServices || [],
          assets: project.operationalInformation?.assets || [],
          institutionalBuyers: project.operationalInformation?.institutionalBuyers || [],
        },
        // Association Membership Fields
        associationIds: currentAssociationIds,
        membershipType: project.membershipType || membershipDetails?.type || 'Regular',
        membershipStatus: membershipDetails?.status || 'active',
        membershipStartDate: membershipDetails?.startDate || '',
        membershipEndDate: membershipDetails?.endDate || '',
        membershipRenewalDate: membershipDetails?.renewalDate || '',
      });
    }
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    console.log('🖊️ EditProject: Handling input change:', { name, value, type });

    // Handle membership fields (they are direct properties, not nested)
    if (name.startsWith('membership')) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }

    // Handle nested object fields (enterpriseSetup, participant, etc.)
    const [section, field] = name.split('.');

    // Only allow changes to association membership fields
    if (section === 'associationIds' || name.startsWith('membership')) {
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...(prev[section as keyof ProjectFormData] as object),
            [field]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...(prev[section as keyof ProjectFormData] as object),
            [field]: value
          }
        }));
      }
    }
  };

  // Handle multiple association selection
  const handleAssociationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map(option => option.value);
    
    console.log('🔗 EditProject: Association selection changed:', selectedIds);
    
    setFormData(prev => ({
      ...prev,
      associationIds: selectedIds
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    console.log('🔄 EditProject: Starting update process for project:', project.id);
    console.log('📊 EditProject: Current form data:', formData);

    // DEBUG: Check project ID and data
    console.log('🔍 DEBUG Project Info:', {
      projectId: project.id,
      projectIdType: typeof project.id,
      projectIdLength: project.id?.length,
      projectHas_id: !!project._id,
      project_id: project._id,
      projectKeys: Object.keys(project)
    });

    // Validate that at least one association is selected
    if (formData.associationIds.length === 0) {
      alert('Please select at least one association');
      setIsLoading(false);
      return;
    }

    // Get association details for the selected associations
    const selectedAssociations = associations.filter(assoc => 
      formData.associationIds.includes(assoc._id || '')
    );

    console.log('🤝 EditProject: Selected associations:', selectedAssociations);

    if (selectedAssociations.length === 0) {
      alert('No valid associations found for the selected IDs');
      setIsLoading(false);
      return;
    }

    // Use the first association as primary for backward compatibility
    const primaryAssociationId = formData.associationIds[0] || '';
    const primaryAssociation = selectedAssociations[0];

    console.log('⭐ EditProject: Primary association:', primaryAssociation);

    // Create updated project object - only update association and membership data
    const updatedProject: ExtendedProject = {
      ...project,
      // Update association data
      associationIds: formData.associationIds,
      associationId: primaryAssociationId, // For backward compatibility
      associationName: primaryAssociation?.name || '',
      isAssociationMember: true,
      membershipType: formData.membershipType,
      
      // Update operational information with new membership details and associations
      operationalInformation: {
        ...project.operationalInformation,
        // Update multiple associations
        multipleAssociations: selectedAssociations.map(assoc => ({
          id: assoc._id || '',
          name: assoc.name,
          location: assoc.location,
          no_active_members: assoc.no_active_members,
          region: assoc.region || '',
          province: assoc.province || ''
        })),
        // Update membership details
        membershipDetails: {
          status: formData.membershipStatus,
          startDate: formData.membershipStartDate,
          endDate: formData.membershipEndDate,
          renewalDate: formData.membershipRenewalDate,
          isRenewable: true,
          type: formData.membershipType
        }
      },
      // Update timestamp
      updatedAt: new Date()
    };

    console.log('🚀 EditProject: Prepared updated project for saving:', {
      projectId: updatedProject.id,
      project_id: updatedProject._id,
      associationIds: updatedProject.associationIds,
      membershipType: updatedProject.membershipType,
      multipleAssociations: updatedProject.operationalInformation?.multipleAssociations?.length || 0
    });

    // Call the onSave callback
    onSave(updatedProject);
    
  } catch (error) {
    console.error('💥 EditProject: Error in handleSubmit:', error);
    alert(`Failed to prepare project update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setIsLoading(false);
  }
};
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold truncate">
                Edit Project Associations: {project.enterpriseSetup.projectName}
              </h2>
              <p className="text-green-100 mt-1">Update association membership information only</p>
              <p className="text-green-200 text-sm mt-1">Project ID: {project.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-green-100 hover:text-white text-2xl transition-colors duration-150 ml-4"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Enterprise Setup - DISABLED */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 opacity-60">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Enterprise Setup (View Only)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={formData.enterpriseSetup.projectName}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enterprise Type</label>
                  <input
                    type="text"
                    value={formData.enterpriseSetup.enterpriseType}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <input
                    type="text"
                    value={formData.enterpriseSetup.status}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="text"
                    value={formData.enterpriseSetup.startDate}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <input
                    type="text"
                    value={formData.enterpriseSetup.region}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                  <input
                    type="text"
                    value={formData.enterpriseSetup.province}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City/Municipality</label>
                  <input
                    type="text"
                    value={formData.enterpriseSetup.cityMunicipality}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
                  <input
                    type="text"
                    value={formData.enterpriseSetup.barangay}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Participant Information - DISABLED */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 opacity-60">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Participant Information (View Only)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.participant.firstName}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.participant.lastName}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                  <input
                    type="text"
                    value={formData.participant.sex}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
                  <input
                    type="text"
                    value={formData.participant.birthDate}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Civil Status</label>
                  <input
                    type="text"
                    value={formData.participant.civilStatus}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="text"
                    value={formData.participant.contactNumber}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="text"
                    value={formData.participant.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Association Membership - EDITABLE */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 border-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Association Membership (Editable)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Associations (Select multiple) *
                  </label>
                  <select
                    name="associationIds"
                    value={formData.associationIds}
                    onChange={handleAssociationChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                    multiple
                    size={5}
                    required
                  >
                    {associations.map((association) => (
                      <option 
                        key={association._id} 
                        value={association._id}
                      >
                        {association.name} - {association.location} ({association.no_active_members} members)
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Hold Ctrl (or Cmd on Mac) to select multiple associations
                  </p>
                  {formData.associationIds.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Selected Associations:</p>
                      <ul className="text-sm text-gray-600 mt-1">
                        {formData.associationIds.map(associationId => {
                          const association = associations.find(a => a._id === associationId);
                          return (
                            <li key={associationId}>• {association?.name}</li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Renewable Membership Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Type
                  </label>
                  <select
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  >
                    {membershipTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Status
                  </label>
                  <select
                    name="membershipStatus"
                    value={formData.membershipStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  >
                    {membershipStatusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Start Date
                  </label>
                  <input
                    type="date"
                    name="membershipStartDate"
                    value={formData.membershipStartDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership End Date
                  </label>
                  <input
                    type="date"
                    name="membershipEndDate"
                    value={formData.membershipEndDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renewal Date
                  </label>
                  <input
                    type="date"
                    name="membershipRenewalDate"
                    value={formData.membershipRenewalDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating Associations...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Update Associations</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}