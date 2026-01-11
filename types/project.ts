export interface Association {
  _id: string;
  id?: string;
  name: string;
  date_formulated: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
  location: string;
  contact_person: string;
  contact_number: string;
  email: string;
  operational_reason: string;
  no_active_members: number;
  no_inactive_members: number;
  covid_affected: boolean;
  profit_sharing: boolean;
  profit_sharing_amount: number;
  loan_scheme: boolean;
  loan_scheme_amount: number;
  registrations_certifications: string[];
  final_org_adjectival_rating: string;
  final_org_rating_assessment: string;
  archived: boolean;
  region?: string;
  province?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Caretaker {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  extension?: string;
  participantType: string;
  sex: string;
  contactNumber: string;
  slpAssociation: string;
  status: string;
}

export interface OperationalInformation {
  microfinancingInstitutions: boolean;
  microfinancingServices: boolean;
  enterprisePlanExists: boolean;
  beingDelivered: boolean;
  availedServices: string[];
  assets: string[];
  institutionalBuyers: string[];
  multipleAssociations?: Array<{
    id: string;
    name: string;
    location: string;
    no_active_members: number;
    region?: string;
    province?: string;
  }>;
  membershipDetails?: {
    status: string;
    startDate: string;
    endDate: string;
    renewalDate: string;
    isRenewable: boolean;
    type: string;
  };
}

export interface Project {
  id: string;
  _id?: string;
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
  financialInformation: {
    totalSales: number;
    netIncomeLoss: number;
    totalSavingsGenerated: number;
    cashOnHand: number;
    cashOnBank: number;
  };
  operationalInformation: OperationalInformation;
  partnershipEngagements: any[];
  marketAssessment: {
    marketDemandCode: string;
    marketDemandRemarks: string;
    marketSupplyCode: string;
    marketSupplyRemarks: string;
  };
  operationalAssessment: {
    efficiencyOfResourcesCode: string;
    efficiencyRemarks: string;
    capabilitySkillsAcquiredCode: string;
    capabilityRemarks: string;
  };
  financialAssessment: {
    financialStandingCode: string;
    financialRemarks: string;
    accessRepaymentCapacityCode: string;
    accessRepaymentRemarks: string;
  };
  associationId?: string;
  associationName?: string;
  isAssociationMember?: boolean;
  membershipType?: string;
  caretakerId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ExtendedProject extends Project {
  associationNames?: string[];
  associationIds?: string[];
  multipleAssociations?: Array<{
    id: string;
    name: string;
    location: string;
    no_active_members: number;
    region?: string;
    province?: string;
  }>;
  associationLocation?: string;
  associationRegion?: string;
  associationProvince?: string;
}