'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Association } from '@/types/project';

interface InstitutionalBuyer {
  id: string;
  buyerName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  address: string;
  buyerType: string;
  requirements: string;
}

interface PartnershipEngagement {
  id: string;
  partnerName: string;
  engagementType: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface ProjectFormData {
  // Enterprise Setup
  projectName: string;
  enterpriseType: string;
  startDate: string;
  region: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
  houseLotNo: string;
  street: string;

  // Financial Information
  totalSales: number;
  netIncomeLoss: number;
  totalSavingsGenerated: number;
  cashOnHand: number;
  cashOnBank: number;

  // Operational Information
  microfinancingInstitutions: boolean;
  microfinancingServices: boolean;
  enterprisePlanExists: boolean;
  beingDelivered: boolean;

  // Market Assessment
  marketDemandCode: string;
  marketDemandRemarks: string;
  marketSupplyCode: string;
  marketSupplyRemarks: string;

  // Operational Assessment
  efficiencyOfResourcesCode: string;
  efficiencyRemarks: string;
  capabilitySkillsAcquiredCode: string;
  capabilityRemarks: string;

  // Financial Assessment
  financialStandingCode: string;
  financialRemarks: string;
  accessRepaymentCapacityCode: string;
  accessRepaymentRemarks: string;

  // Association
  associationIds: string[];
  membershipType: string;
  
  // Renewable Membership Fields
  membershipStatus: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipRenewalDate: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Institutional Buyers state
  const [institutionalBuyers, setInstitutionalBuyers] = useState<InstitutionalBuyer[]>([]);
  const [newBuyer, setNewBuyer] = useState<Omit<InstitutionalBuyer, 'id'>>({
    buyerName: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    address: '',
    buyerType: '',
    requirements: ''
  });

  // Partnership Engagements state
  const [partnershipEngagements, setPartnershipEngagements] = useState<PartnershipEngagement[]>([]);
  const [newPartner, setNewPartner] = useState<Omit<PartnershipEngagement, 'id'>>({
    partnerName: '',
    engagementType: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  // Availed Services state
  const [availedServices, setAvailedServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');

  // Assets state
  const [assets, setAssets] = useState<string[]>([]);
  const [newAsset, setNewAsset] = useState('');

  const [formData, setFormData] = useState<ProjectFormData>({
    // Enterprise Setup
    projectName: '',
    enterpriseType: '',
    startDate: '',
    region: '',
    province: '',
    cityMunicipality: '',
    barangay: '',
    houseLotNo: '',
    street: '',

    // Financial Information
    totalSales: 0,
    netIncomeLoss: 0,
    totalSavingsGenerated: 0,
    cashOnHand: 0,
    cashOnBank: 0,

    // Operational Information
    microfinancingInstitutions: false,
    microfinancingServices: false,
    enterprisePlanExists: false,
    beingDelivered: false,

    // Market Assessment
    marketDemandCode: '',
    marketDemandRemarks: '',
    marketSupplyCode: '',
    marketSupplyRemarks: '',

    // Operational Assessment
    efficiencyOfResourcesCode: '',
    efficiencyRemarks: '',
    capabilitySkillsAcquiredCode: '',
    capabilityRemarks: '',

    // Financial Assessment
    financialStandingCode: '',
    financialRemarks: '',
    accessRepaymentCapacityCode: '',
    accessRepaymentRemarks: '',

    // Association
    associationIds: [],
    membershipType: 'Regular',
    
    // Renewable Membership Fields
    membershipStatus: 'active',
    membershipStartDate: '',
    membershipEndDate: '',
    membershipRenewalDate: '',
  });

  // Fetch associations
  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const response = await fetch('/api/associations');
        if (response.ok) {
          const data = await response.json();
          // Handle different response formats
          let associationsArray: Association[] = [];
          
          if (Array.isArray(data)) {
            associationsArray = data;
          } else if (data.associations && Array.isArray(data.associations)) {
            associationsArray = data.associations;
          } else if (data.data && Array.isArray(data.data)) {
            associationsArray = data.data;
          }
          
          const activeAssociations = associationsArray.filter((assoc: Association) => !assoc.archived);
          setAssociations(activeAssociations);
        } else {
          console.error('Failed to fetch associations');
        }
      } catch (error) {
        console.error('Error fetching associations:', error);
      }
    };

    fetchAssociations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle multiple association selection
  const handleAssociationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map(option => option.value);
    setFormData(prev => ({
      ...prev,
      associationIds: selectedIds
    }));
  };

  // Institutional Buyers functions
  const addInstitutionalBuyer = () => {
    if (newBuyer.buyerName.trim()) {
      const buyer: InstitutionalBuyer = {
        ...newBuyer,
        id: Date.now().toString()
      };
      setInstitutionalBuyers(prev => [...prev, buyer]);
      setNewBuyer({
        buyerName: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        address: '',
        buyerType: '',
        requirements: ''
      });
    }
  };

  const removeInstitutionalBuyer = (id: string) => {
    setInstitutionalBuyers(prev => prev.filter(buyer => buyer.id !== id));
  };

  // Partnership Engagements functions
  const addPartnershipEngagement = () => {
    if (newPartner.partnerName.trim()) {
      const partner: PartnershipEngagement = {
        ...newPartner,
        id: Date.now().toString()
      };
      setPartnershipEngagements(prev => [...prev, partner]);
      setNewPartner({
        partnerName: '',
        engagementType: '',
        description: '',
        startDate: '',
        endDate: ''
      });
    }
  };

  const removePartnershipEngagement = (id: string) => {
    setPartnershipEngagements(prev => prev.filter(partner => partner.id !== id));
  };

  // Availed Services functions
  const addAvailedService = () => {
    if (newService.trim()) {
      setAvailedServices(prev => [...prev, newService.trim()]);
      setNewService('');
    }
  };

  const removeAvailedService = (index: number) => {
    setAvailedServices(prev => prev.filter((_, i) => i !== index));
  };

  // Assets functions
  const addAsset = () => {
    if (newAsset.trim()) {
      setAssets(prev => [...prev, newAsset.trim()]);
      setNewAsset('');
    }
  };

  const removeAsset = (index: number) => {
    setAssets(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get association details for the selected associations
      const selectedAssociations = associations.filter(assoc => 
        formData.associationIds.includes(assoc._id || '')
      );

      // Use the first association as primary for backward compatibility
      const primaryAssociationId = formData.associationIds[0] || '';
      const primaryAssociation = selectedAssociations[0];

      // Create operational information with multiple associations
      const operationalInfo = {
        microfinancingInstitutions: formData.microfinancingInstitutions,
        microfinancingServices: formData.microfinancingServices,
        enterprisePlanExists: formData.enterprisePlanExists,
        beingDelivered: formData.beingDelivered,
        availedServices: availedServices,
        assets: assets,
        institutionalBuyers: institutionalBuyers,
        // Store all selected associations here for multiple association support
        multipleAssociations: selectedAssociations.map(assoc => ({
          id: assoc._id,
          name: assoc.name,
          location: assoc.location,
          no_active_members: assoc.no_active_members,
          region: assoc.region || '',
          province: assoc.province || ''
        })),
        // Store renewable membership information
        membershipDetails: {
          status: formData.membershipStatus,
          startDate: formData.membershipStartDate,
          endDate: formData.membershipEndDate,
          renewalDate: formData.membershipRenewalDate,
          isRenewable: true, // Automatically set to true
          type: formData.membershipType
        }
      };

      const projectData = {
        // Basic project info - automatically set status to "active"
        projectName: formData.projectName,
        enterpriseType: formData.enterpriseType,
        status: 'active', // Automatically set to active
        
        // Location
        region: formData.region,
        province: formData.province,
        cityMunicipality: formData.cityMunicipality,
        barangay: formData.barangay,
        houseLotNo: formData.houseLotNo,
        street: formData.street,
        
        // Dates
        startDate: formData.startDate,
        
        // Financial
        totalSales: formData.totalSales,
        netIncomeLoss: formData.netIncomeLoss,
        totalSavingsGenerated: formData.totalSavingsGenerated,
        cashOnHand: formData.cashOnHand,
        cashOnBank: formData.cashOnBank,
        
        // Operational
        operationalInformation: operationalInfo,
        
        // Partnerships
        partnershipEngagements: partnershipEngagements,
        
        // Assessments
        marketAssessment: {
          marketDemandCode: formData.marketDemandCode,
          marketDemandRemarks: formData.marketDemandRemarks,
          marketSupplyCode: formData.marketSupplyCode,
          marketSupplyRemarks: formData.marketSupplyRemarks,
        },
        operationalAssessment: {
          efficiencyOfResourcesCode: formData.efficiencyOfResourcesCode,
          efficiencyRemarks: formData.efficiencyRemarks,
          capabilitySkillsAcquiredCode: formData.capabilitySkillsAcquiredCode,
          capabilityRemarks: formData.capabilityRemarks,
        },
        financialAssessment: {
          financialStandingCode: formData.financialStandingCode,
          financialRemarks: formData.financialRemarks,
          accessRepaymentCapacityCode: formData.accessRepaymentCapacityCode,
          accessRepaymentRemarks: formData.accessRepaymentRemarks,
        },
        
        // Association data
        associationIds: formData.associationIds,
        associationId: primaryAssociationId, // For backward compatibility
        associationName: primaryAssociation?.name || '',
        isAssociationMember: true, // Automatically set to true
        membershipType: formData.membershipType,

        // Participant info (required by your schema)
        participant: {
          id: 'p' + Date.now(),
          firstName: '',
          lastName: '',
          sex: '',
          birthDate: '',
          civilStatus: '',
          contactNumber: '',
          email: '',
        }
      };

      console.log('Submitting project data:', projectData);

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Project created successfully!');
        router.push('/admin/projects');
      } else {
        const error = await response.json();
        alert(`Failed to create project: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600 mt-2">Add a new project to the system - All projects are automatically set to Active status</p>
          </div>
          <button
            onClick={() => router.push('/admin/projects')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Projects
          </button>
        </div>

        {/* Project Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-8">
          {/* Enterprise Setup */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Enterprise Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
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
                  value={formData.enterpriseType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Association">Association</option>
                 
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region *
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
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
                  value={formData.province}
                  onChange={handleInputChange}
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
                  value={formData.cityMunicipality}
                  onChange={handleInputChange}
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
                  value={formData.barangay}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  House/Lot No.
                </label>
                <input
                  type="text"
                  name="houseLotNo"
                  value={formData.houseLotNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Financial Information (₱)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Sales
                </label>
                <input
                  type="number"
                  name="totalSales"
                  value={formData.totalSales}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Net Income/Loss
                </label>
                <input
                  type="number"
                  name="netIncomeLoss"
                  value={formData.netIncomeLoss}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Savings Generated
                </label>
                <input
                  type="number"
                  name="totalSavingsGenerated"
                  value={formData.totalSavingsGenerated}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cash on Hand
                </label>
                <input
                  type="number"
                  name="cashOnHand"
                  value={formData.cashOnHand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cash on Bank
                </label>
                <input
                  type="number"
                  name="cashOnBank"
                  value={formData.cashOnBank}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Institutional Buyers */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Institutional Buyers</h2>
            <div className="space-y-4">
              {institutionalBuyers.map((buyer) => (
                <div key={buyer.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{buyer.buyerName}</h4>
                    <button
                      type="button"
                      onClick={() => removeInstitutionalBuyer(buyer.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>Contact:</strong> {buyer.contactPerson}</div>
                    <div><strong>Phone:</strong> {buyer.contactNumber}</div>
                    <div><strong>Email:</strong> {buyer.email}</div>
                    <div><strong>Type:</strong> {buyer.buyerType}</div>
                    <div className="md:col-span-2"><strong>Address:</strong> {buyer.address}</div>
                    <div className="md:col-span-2"><strong>Requirements:</strong> {buyer.requirements}</div>
                  </div>
                </div>
              ))}
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Add New Buyer</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Buyer Name *"
                    value={newBuyer.buyerName}
                    onChange={(e) => setNewBuyer(prev => ({ ...prev, buyerName: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Contact Person"
                    value={newBuyer.contactPerson}
                    onChange={(e) => setNewBuyer(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Contact Number"
                    value={newBuyer.contactNumber}
                    onChange={(e) => setNewBuyer(prev => ({ ...prev, contactNumber: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newBuyer.email}
                    onChange={(e) => setNewBuyer(prev => ({ ...prev, email: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={newBuyer.address}
                    onChange={(e) => setNewBuyer(prev => ({ ...prev, address: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Buyer Type"
                    value={newBuyer.buyerType}
                    onChange={(e) => setNewBuyer(prev => ({ ...prev, buyerType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="md:col-span-2">
                    <textarea
                      placeholder="Requirements"
                      value={newBuyer.requirements}
                      onChange={(e) => setNewBuyer(prev => ({ ...prev, requirements: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addInstitutionalBuyer}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 md:col-span-2"
                  >
                    Add Buyer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Partnership Engagements */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Partnership Engagements</h2>
            <div className="space-y-4">
              {partnershipEngagements.map((partner) => (
                <div key={partner.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{partner.partnerName}</h4>
                    <button
                      type="button"
                      onClick={() => removePartnershipEngagement(partner.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>Type:</strong> {partner.engagementType}</div>
                    <div><strong>Description:</strong> {partner.description}</div>
                    <div><strong>Start:</strong> {partner.startDate}</div>
                    <div><strong>End:</strong> {partner.endDate}</div>
                  </div>
                </div>
              ))}
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Add New Partnership</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Partner Name *"
                    value={newPartner.partnerName}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, partnerName: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Engagement Type"
                    value={newPartner.engagementType}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, engagementType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={newPartner.startDate}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, startDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={newPartner.endDate}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, endDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="md:col-span-2">
                    <textarea
                      placeholder="Description"
                      value={newPartner.description}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addPartnershipEngagement}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 md:col-span-2"
                  >
                    Add Partnership
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Operational Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="microfinancingInstitutions"
                    checked={formData.microfinancingInstitutions}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Microfinancing Institutions</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="microfinancingServices"
                    checked={formData.microfinancingServices}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Microfinancing Services</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enterprisePlanExists"
                    checked={formData.enterprisePlanExists}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enterprise Plan Exists</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="beingDelivered"
                    checked={formData.beingDelivered}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Being Delivered</span>
                </label>
              </div>

              {/* Availed Services */}
              <div>
                <h4 className="font-medium mb-2">Availed Services</h4>
                <div className="space-y-2 mb-3">
                  {availedServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span>{service}</span>
                      <button
                        type="button"
                        onClick={() => removeAvailedService(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add service"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addAvailedService}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Assets */}
              <div>
                <h4 className="font-medium mb-2">Assets</h4>
                <div className="space-y-2 mb-3">
                  {assets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span>{asset}</span>
                      <button
                        type="button"
                        onClick={() => removeAsset(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add asset"
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addAsset}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Market Assessment */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Market Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Demand Code
                </label>
                <input
                  type="text"
                  name="marketDemandCode"
                  value={formData.marketDemandCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Supply Code
                </label>
                <input
                  type="text"
                  name="marketSupplyCode"
                  value={formData.marketSupplyCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Demand Remarks
                </label>
                <textarea
                  name="marketDemandRemarks"
                  value={formData.marketDemandRemarks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Supply Remarks
                </label>
                <textarea
                  name="marketSupplyRemarks"
                  value={formData.marketSupplyRemarks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Operational Assessment */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Operational Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Efficiency of Resources Code
                </label>
                <input
                  type="text"
                  name="efficiencyOfResourcesCode"
                  value={formData.efficiencyOfResourcesCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capability/Skills Acquired Code
                </label>
                <input
                  type="text"
                  name="capabilitySkillsAcquiredCode"
                  value={formData.capabilitySkillsAcquiredCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Efficiency Remarks
                </label>
                <textarea
                  name="efficiencyRemarks"
                  value={formData.efficiencyRemarks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capability Remarks
                </label>
                <textarea
                  name="capabilityRemarks"
                  value={formData.capabilityRemarks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Financial Assessment */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Financial Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Financial Standing Code
                </label>
                <input
                  type="text"
                  name="financialStandingCode"
                  value={formData.financialStandingCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access and Repayment Capacity Code
                </label>
                <input
                  type="text"
                  name="accessRepaymentCapacityCode"
                  value={formData.accessRepaymentCapacityCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Financial Remarks
                </label>
                <textarea
                  name="financialRemarks"
                  value={formData.financialRemarks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access and Repayment Remarks
                </label>
                <textarea
                  name="accessRepaymentRemarks"
                  value={formData.accessRepaymentRemarks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Association - Multiple Selection with Renewable Membership */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Association Membership</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associations (Select multiple) *
                </label>
                <select
                  name="associationIds"
                  value={formData.associationIds}
                  onChange={handleAssociationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Regular">Regular</option>
                  <option value="Associate">Associate</option>
                  <option value="Honorary">Honorary</option>
                  <option value="Lifetime">Lifetime</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/admin/projects')}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}