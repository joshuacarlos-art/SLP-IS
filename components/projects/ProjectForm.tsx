'use client';

import { Project, Association, Caretaker } from '@/types/project';

interface ProjectFormProps {
  project?: Project;
  associations: Association[];
  caretakers: Caretaker[];
  onSubmit: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, associations, caretakers, onSubmit, onCancel }: ProjectFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const associationId = formData.get('associationId') as string;
    const association = associations.find(a => a.id === associationId || a._id === associationId);
    
    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      participant: {
        id: formData.get('participantId') as string || 'p' + Date.now(),
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        sex: formData.get('sex') as string,
        birthDate: formData.get('birthDate') as string,
        civilStatus: formData.get('civilStatus') as string,
        contactNumber: formData.get('contactNumber') as string,
        email: formData.get('email') as string,
      },
      enterpriseSetup: {
        projectName: formData.get('projectName') as string,
        enterpriseType: formData.get('enterpriseType') as string,
        status: formData.get('status') as 'active' | 'inactive' | 'pending' | 'completed',
        startDate: formData.get('startDate') as string,
        region: formData.get('region') as string,
        province: formData.get('province') as string,
        cityMunicipality: formData.get('cityMunicipality') as string,
        barangay: formData.get('barangay') as string,
      },
      financialInformation: {
        totalSales: Number(formData.get('totalSales')) || 0,
        netIncomeLoss: Number(formData.get('netIncome')) || 0,
        totalSavingsGenerated: Number(formData.get('totalSavings')) || 0,
        cashOnHand: Number(formData.get('cashOnHand')) || 0,
        cashOnBank: Number(formData.get('cashOnBank')) || 0,
      },
      operationalInformation: {
        microfinancingInstitutions: formData.get('microfinancing') === 'on',
        microfinancingServices: formData.get('microfinancingServices') === 'on',
        enterprisePlanExists: formData.get('enterprisePlan') === 'on',
        beingDelivered: formData.get('beingDelivered') === 'on',
        availedServices: [],
        assets: [],
        institutionalBuyers: [],
      },
      partnershipEngagements: [],
      marketAssessment: {
        marketDemandCode: 'HIGH',
        marketDemandRemarks: '',
        marketSupplyCode: 'MEDIUM',
        marketSupplyRemarks: '',
      },
      operationalAssessment: {
        efficiencyOfResourcesCode: 'GOOD',
        efficiencyRemarks: '',
        capabilitySkillsAcquiredCode: 'HIGH',
        capabilityRemarks: '',
      },
      financialAssessment: {
        financialStandingCode: 'STABLE',
        financialRemarks: '',
        accessRepaymentCapacityCode: 'GOOD',
        accessRepaymentRemarks: '',
      },
      associationId: associationId,
      associationName: association?.name || '', // Provide fallback empty string
      isAssociationMember: formData.get('isMember') === 'on',
      membershipType: formData.get('membershipType') as string,
      caretakerId: formData.get('caretakerId') as string || undefined,
    };

    onSubmit(projectData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {project ? 'Edit Project' : 'Create New Project'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              name="projectName"
              defaultValue={project?.enterpriseSetup.projectName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enterprise Type *
            </label>
            <select
              name="enterpriseType"
              defaultValue={project?.enterpriseSetup.enterpriseType}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Type</option>
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
              <option value="Association">Association</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Retail">Retail</option>
              <option value="Services">Services</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              defaultValue={project?.enterpriseSetup.status}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              defaultValue={project?.enterpriseSetup.startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Participant Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              defaultValue={project?.participant.firstName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              defaultValue={project?.participant.lastName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sex *
            </label>
            <select
              name="sex"
              defaultValue={project?.participant.sex}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birth Date
            </label>
            <input
              type="date"
              name="birthDate"
              defaultValue={project?.participant.birthDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Civil Status
            </label>
            <select
              name="civilStatus"
              defaultValue={project?.participant.civilStatus}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              defaultValue={project?.participant.contactNumber}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={project?.participant.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region *
            </label>
            <input
              type="text"
              name="region"
              defaultValue={project?.enterpriseSetup.region}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Province *
            </label>
            <input
              type="text"
              name="province"
              defaultValue={project?.enterpriseSetup.province}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City/Municipality *
            </label>
            <input
              type="text"
              name="cityMunicipality"
              defaultValue={project?.enterpriseSetup.cityMunicipality}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barangay
            </label>
            <input
              type="text"
              name="barangay"
              defaultValue={project?.enterpriseSetup.barangay}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Association */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Association *
            </label>
            <select
              name="associationId"
              defaultValue={project?.associationId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Association</option>
              {associations.map(association => (
                <option key={association._id || association.id} value={association._id || association.id}>
                  {association.name} - {association.location}
                </option>
              ))}
            </select>
          </div>

          {/* Caretaker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caretaker
            </label>
            <select
              name="caretakerId"
              defaultValue={project?.caretakerId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Caretaker</option>
              {caretakers.map(caretaker => (
                <option key={caretaker.id || caretaker._id} value={caretaker.id || caretaker._id}>
                  {caretaker.firstName} {caretaker.lastName} - {caretaker.participantType}
                </option>
              ))}
            </select>
          </div>

          {/* Membership Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membership Type
            </label>
            <select
              name="membershipType"
              defaultValue={project?.membershipType}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Regular">Regular</option>
              <option value="Associate">Associate</option>
              <option value="Honorary">Honorary</option>
              <option value="Lifetime">Lifetime</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isMember"
              defaultChecked={project?.isAssociationMember}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Association Member
            </label>
          </div>
        </div>

        {/* Financial Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Sales (₱)
              </label>
              <input
                type="number"
                name="totalSales"
                defaultValue={project?.financialInformation.totalSales}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Net Income/Loss (₱)
              </label>
              <input
                type="number"
                name="netIncome"
                defaultValue={project?.financialInformation.netIncomeLoss}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Savings (₱)
              </label>
              <input
                type="number"
                name="totalSavings"
                defaultValue={project?.financialInformation.totalSavingsGenerated}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash on Hand (₱)
              </label>
              <input
                type="number"
                name="cashOnHand"
                defaultValue={project?.financialInformation.cashOnHand}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash on Bank (₱)
              </label>
              <input
                type="number"
                name="cashOnBank"
                defaultValue={project?.financialInformation.cashOnBank}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Operational Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Operational Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="microfinancing"
                defaultChecked={project?.operationalInformation.microfinancingInstitutions}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Microfinancing Institutions
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="microfinancingServices"
                defaultChecked={project?.operationalInformation.microfinancingServices}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Microfinancing Services
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="enterprisePlan"
                defaultChecked={project?.operationalInformation.enterprisePlanExists}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Enterprise Plan Exists
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="beingDelivered"
                defaultChecked={project?.operationalInformation.beingDelivered}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Being Delivered
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {project ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}