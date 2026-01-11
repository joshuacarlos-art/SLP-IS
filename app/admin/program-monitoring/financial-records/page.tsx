'use client';

import { useState, useEffect } from 'react';
import { FinancialRecord, FinancialSummary, CreateFinancialRecordInput } from '@/types/financialRecord';
import { ExtendedProject, Association } from '@/types/project';
import { FinancialRecordForm } from '@/components/financial/FinancialRecordForm';
import { activityLogger, logFinancialCreate, logFinancialUpdate, logFinancialArchive, logError } from '@/lib/activity/activity-logger';

// Mock data for testing when APIs are not available
const mockFinancialRecords: FinancialRecord[] = [
  {
    _id: '1',
    project_id: 'project1',
    record_date: '2024-01-15',
    record_type: 'income',
    category: 'Sales',
    description: 'Product sales for January',
    amount: 50000,
    cash_on_hand: 15000,
    cash_on_bank: 35000,
    total_savings: 10000,
    verification_method: 'receipt',
    is_profit_share: false,
    recorded_by: 'John Doe',
    archived: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    _id: '2',
    project_id: 'project1',
    record_date: '2024-01-10',
    record_type: 'expense',
    category: 'Materials',
    description: 'Purchase of raw materials',
    amount: 20000,
    cash_on_hand: 5000,
    cash_on_bank: 25000,
    total_savings: 8000,
    verification_method: 'invoice',
    is_profit_share: false,
    recorded_by: 'Jane Smith',
    archived: false,
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z'
  }
];

const mockProjects: ExtendedProject[] = [
  {
    _id: 'project1',
    enterpriseSetup: {
      projectName: 'Sample Project 1',
      enterpriseType: 'Agriculture',
      status: 'active',
      startDate: '2024-01-01',
      region: 'Region 1',
      province: 'Sample Province',
      cityMunicipality: 'Sample City',
      barangay: 'Sample Barangay'
    },
    associationName: 'Sample Association',
    associationId: 'assoc1',
    associationNames: ['Sample Association'],
    associationIds: ['assoc1']
  } as ExtendedProject
];

// Fixed mock associations with correct types
const mockAssociations: Association[] = [
  {
    _id: 'assoc1',
    name: 'Farmers Cooperative of Region 1',
    date_formulated: '2023-01-15', // Fixed: string instead of Date
    status: 'active',
    location: 'Region I, La Union, San Fernando City, Bangbangolan', // Fixed: string instead of object
    contact_person: 'Juan Dela Cruz',
    contact_number: '+63 912 345 6789',
    email: 'farmers.coop@example.com',
    operational_reason: 'Agricultural operations',
    no_active_members: 45,
    no_inactive_members: 5,
    covid_affected: false,
    profit_sharing: true,
    profit_sharing_amount: 50000,
    loan_scheme: true,
    loan_scheme_amount: 100000,
    registrations_certifications: ['SEC Registration', 'DA Accreditation'],
    final_org_adjectival_rating: 'Excellent',
    final_org_rating_assessment: 'Meets all criteria',
    archived: false,
    region: 'Region I',
    province: 'La Union',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

// Helper function to normalize project structure
const normalizeProjectStructure = (project: any): ExtendedProject => {
  if (project.enterpriseSetup) {
    return project;
  }

  return {
    ...project,
    enterpriseSetup: {
      projectName: project.projectName || '',
      enterpriseType: project.enterpriseType || '',
      status: project.status || 'active',
      startDate: project.startDate || '',
      region: project.region || '',
      province: project.province || '',
      cityMunicipality: project.cityMunicipality || '',
      barangay: project.barangay || '',
    },
    financialInformation: project.financialInformation || {
      totalSales: 0,
      netIncomeLoss: 0,
      totalSavingsGenerated: 0,
      cashOnHand: 0,
      cashOnBank: 0,
    },
    operationalInformation: project.operationalInformation || {
      microfinancingInstitutions: false,
      microfinancingServices: false,
      enterprisePlanExists: false,
      beingDelivered: false,
      availedServices: [],
      assets: [],
      institutionalBuyers: [],
    },
    partnershipEngagements: project.partnershipEngagements || [],
    marketAssessment: project.marketAssessment || {
      marketDemandCode: '',
      marketDemandRemarks: '',
      marketSupplyCode: '',
      marketSupplyRemarks: '',
    },
    operationalAssessment: project.operationalAssessment || {
      efficiencyOfResourcesCode: '',
      efficiencyRemarks: '',
      capabilitySkillsAcquiredCode: '',
      capabilityRemarks: '',
    },
    financialAssessment: project.financialAssessment || {
      financialStandingCode: '',
      financialRemarks: '',
      accessRepaymentCapacityCode: '',
      accessRepaymentRemarks: '',
    },
    participant: project.participant || {
      id: 'unknown',
      firstName: '',
      lastName: '',
      sex: '',
      birthDate: '',
      civilStatus: '',
      contactNumber: '',
      email: '',
    }
  };
};

// Helper function to handle errors safely
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'An unknown error occurred';
  }
};

// Helper function to safely extract error details
const getErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  } else {
    return {
      name: 'UnknownError',
      message: String(error),
      stack: undefined
    };
  }
};

export default function FinancialRecordsPage() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedAssociation, setSelectedAssociation] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    currentCashOnHand: 0,
    currentCashOnBank: 0,
    totalSavings: 0,
    profitShareDistributed: 0
  });

  // Archive modal states
  const [archivedRecords, setArchivedRecords] = useState<FinancialRecord[]>([]);
  const [archiveSelectedProject, setArchiveSelectedProject] = useState<string>('all');
  const [archiveSelectedAssociation, setArchiveSelectedAssociation] = useState<string>('all');
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);

  // Debug states
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Group records by project for better organization
  const [groupedRecords, setGroupedRecords] = useState<Map<string, FinancialRecord[]>>(new Map());

  // Database connection test
  const testDatabaseConnection = async () => {
    try {
      console.log('🧪 Testing database connection...');
      const response = await fetch('/api/test-db');
      const result = await response.json();
      console.log('🧪 Database test result:', result);
      setDebugInfo(prev => prev + `Database test: ${result.success ? 'SUCCESS' : 'FAILED'}\n`);
      return result.success;
    } catch (error) {
      console.error('🧪 Database test failed:', error);
      setDebugInfo(prev => prev + 'Database test: FAILED - API not available\n');
      return false;
    }
  };

  useEffect(() => {
    // Log page access
    activityLogger.logSuccess(
      'Financial Records',
      'PAGE_ACCESS',
      'User accessed Financial Records page',
      'System'
    );
    
    fetchData();
    testDatabaseConnection();
  }, []);

  useEffect(() => {
    calculateSummary();
    groupRecordsByProject();
  }, [records, selectedProject, selectedAssociation]);

  const groupRecordsByProject = () => {
    const filtered = getFilteredRecords();
    const grouped = new Map<string, FinancialRecord[]>();
    
    filtered.forEach(record => {
      const projectId = record.project_id;
      if (!grouped.has(projectId)) {
        grouped.set(projectId, []);
      }
      grouped.get(projectId)!.push(record);
    });
    
    setGroupedRecords(grouped);
    console.log('📊 Grouped records:', Array.from(grouped.entries()));
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setDebugInfo('Starting data fetch...\n');
      
      console.log('📡 Fetching data from APIs...');
      
      let associationsLoaded = false;
      let projectsLoaded = false;
      let recordsLoaded = false;

      // Try to fetch associations
      try {
        console.log('🔗 Fetching associations...');
        const associationsResponse = await fetch('/api/associations');
        console.log('🔗 Associations response status:', associationsResponse.status);
        
        if (associationsResponse.ok) {
          const associationsData = await associationsResponse.json();
          console.log('🔗 Associations raw data:', associationsData);
          
          let associationsArray: Association[] = [];
          
          // Handle different response structures
          if (associationsData.success && Array.isArray(associationsData.data)) {
            associationsArray = associationsData.data;
          } else if (Array.isArray(associationsData)) {
            associationsArray = associationsData;
          } else if (associationsData.associations && Array.isArray(associationsData.associations)) {
            associationsArray = associationsData.associations;
          } else if (associationsData.data && Array.isArray(associationsData.data)) {
            associationsArray = associationsData.data;
          }
          
          const activeAssociations = associationsArray.filter((assoc: Association) => !assoc.archived);
          setAssociations(activeAssociations);
          associationsLoaded = true;
          console.log(`✅ Loaded ${activeAssociations.length} associations`);
          setDebugInfo(prev => prev + `Associations: Loaded ${activeAssociations.length} items\n`);
        } else {
          throw new Error(`HTTP ${associationsResponse.status}`);
        }
      } catch (error) {
        console.log('❌ Associations API not available, using mock data');
        setAssociations(mockAssociations);
        setDebugInfo(prev => prev + 'Associations: Using mock data\n');
      }

      // Try to fetch projects
      try {
        console.log('🔗 Fetching projects...');
        const projectsResponse = await fetch('/api/projects');
        console.log('🔗 Projects response status:', projectsResponse.status);
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          console.log('🔗 Projects raw data:', projectsData);
          
          let projectsArray: any[] = [];
          
          // Handle different response structures
          if (projectsData.success && Array.isArray(projectsData.data)) {
            projectsArray = projectsData.data;
          } else if (Array.isArray(projectsData)) {
            projectsArray = projectsData;
          } else if (projectsData.projects && Array.isArray(projectsData.projects)) {
            projectsArray = projectsData.projects;
          } else if (projectsData.data && Array.isArray(projectsData.data)) {
            projectsArray = projectsData.data;
          }

          // Normalize projects for dropdown
          const enrichedProjects: ExtendedProject[] = projectsArray.map((project: any) => {
            const normalizedProject = normalizeProjectStructure(project);
            
            const multipleAssociations = normalizedProject.operationalInformation?.multipleAssociations || [];
            
            const allAssociationNames = multipleAssociations.length > 0 
              ? multipleAssociations.map((assoc: any) => assoc.name)
              : [];

            const associationNames = allAssociationNames.length > 0 
              ? allAssociationNames 
              : ['Unknown Association'];

            const allAssociationIds = multipleAssociations.length > 0 
              ? multipleAssociations.map((assoc: any) => assoc.id)
              : normalizedProject.associationId 
                ? [normalizedProject.associationId] 
                : [];

            return {
              ...normalizedProject,
              associationNames,
              associationIds: allAssociationIds,
              associationName: associationNames.join(', '),
            };
          });
          
          setProjects(enrichedProjects);
          projectsLoaded = true;
          console.log(`✅ Loaded ${enrichedProjects.length} projects`);
          setDebugInfo(prev => prev + `Projects: Loaded ${enrichedProjects.length} items\n`);
        } else {
          throw new Error(`HTTP ${projectsResponse.status}`);
        }
      } catch (error) {
        console.log('❌ Projects API not available, using mock data');
        setProjects(mockProjects);
        setDebugInfo(prev => prev + 'Projects: Using mock data\n');
      }

      // Try to fetch financial records - ONLY NON-ARCHIVED
      try {
        console.log('🔗 Fetching financial records...');
        const recordsResponse = await fetch('/api/financial-records');
        console.log('🔗 Records response status:', recordsResponse.status);
        
        if (recordsResponse.ok) {
          const recordsData = await recordsResponse.json();
          console.log('🔗 Records raw data:', recordsData);
          
          let recordsArray: FinancialRecord[] = [];
          
          // Handle different response structures
          if (recordsData.success && Array.isArray(recordsData.data)) {
            recordsArray = recordsData.data;
          } else if (Array.isArray(recordsData)) {
            recordsArray = recordsData;
          } else if (recordsData.records && Array.isArray(recordsData.records)) {
            recordsArray = recordsData.records;
          } else if (recordsData.data && Array.isArray(recordsData.data)) {
            recordsArray = recordsData.data;
          }
          
          // Filter out archived records - only show active ones
          const activeRecords = recordsArray.filter((record: FinancialRecord) => !record.archived);
          setRecords(activeRecords);
          recordsLoaded = true;
          console.log(`✅ Loaded ${activeRecords.length} active financial records`);
          setDebugInfo(prev => prev + `Records: Loaded ${activeRecords.length} items\n`);
        } else {
          throw new Error(`HTTP ${recordsResponse.status}`);
        }
      } catch (error) {
        console.log('❌ Financial records API not available, using mock data');
        setRecords(mockFinancialRecords);
        setDebugInfo(prev => prev + 'Records: Using mock data\n');
      }

      // If no APIs worked, use mock data
      if (!associationsLoaded && !projectsLoaded && !recordsLoaded) {
        console.log('🔄 All APIs failed, using complete mock dataset');
        setAssociations(mockAssociations);
        setProjects(mockProjects);
        setRecords(mockFinancialRecords);
        setDebugInfo(prev => prev + 'All: Using complete mock dataset\n');
      }

    } catch (error) {
      console.error('💥 Error fetching data:', error);
      setRecords(mockFinancialRecords);
      setProjects(mockProjects);
      setAssociations(mockAssociations);
      setDebugInfo(prev => prev + 'Error: Fell back to mock data\n');
    } finally {
      setIsLoading(false);
      console.log('📊 Final records state:', records);
      console.log('📊 Final projects state:', projects);
      console.log('📊 Final associations state:', associations);
    }
  };

  const fetchArchivedRecords = async () => {
    try {
      setIsLoadingArchive(true);
      setDebugInfo(prev => prev + 'Fetching archived records...\n');
      
      try {
        const recordsResponse = await fetch('/api/financial-records/archive');
        console.log('🔗 Archived records response status:', recordsResponse.status);
        
        if (recordsResponse.ok) {
          const recordsData = await recordsResponse.json();
          console.log('🔗 Archived records raw data:', recordsData);
          
          let recordsArray: FinancialRecord[] = [];
          
          // Handle different response structures
          if (recordsData.success && Array.isArray(recordsData.data)) {
            recordsArray = recordsData.data;
          } else if (Array.isArray(recordsData)) {
            recordsArray = recordsData;
          } else if (recordsData.records && Array.isArray(recordsData.records)) {
            recordsArray = recordsData.records;
          } else if (recordsData.data && Array.isArray(recordsData.data)) {
            recordsArray = recordsData.data;
          }
          
          setArchivedRecords(recordsArray);
          console.log(`✅ Loaded ${recordsArray.length} archived financial records`);
          setDebugInfo(prev => prev + `Archived: Loaded ${recordsArray.length} items\n`);
        } else {
          throw new Error(`HTTP ${recordsResponse.status}`);
        }
      } catch (error) {
        console.log('❌ Archived records API not available, using empty array');
        setArchivedRecords([]);
        setDebugInfo(prev => prev + 'Archived: Using empty array\n');
      }
    } catch (error) {
      console.error('💥 Error fetching archived records:', error);
      setArchivedRecords([]);
      setDebugInfo(prev => prev + 'Archived: Error - using empty array\n');
    } finally {
      setIsLoadingArchive(false);
    }
  };

  const calculateSummary = () => {
    let filteredRecords = selectedProject === 'all' 
      ? records 
      : records.filter(record => record.project_id === selectedProject);

    // Filter by association if selected
    if (selectedAssociation !== 'all') {
      filteredRecords = filteredRecords.filter(record => {
        const project = projects.find(p => (p._id || p.id) === record.project_id);
        if (!project) return false;
        
        return project.associationIds?.includes(selectedAssociation) || 
               project.associationId === selectedAssociation;
      });
    }

    const totalIncome = filteredRecords
      .filter(record => record.record_type === 'income')
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = filteredRecords
      .filter(record => record.record_type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0);

    const profitShareDistributed = filteredRecords
      .filter(record => record.is_profit_share)
      .reduce((sum, record) => sum + record.amount, 0);

    const latestRecord = filteredRecords
      .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())[0];

    setSummary({
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      currentCashOnHand: latestRecord?.cash_on_hand || 0,
      currentCashOnBank: latestRecord?.cash_on_bank || 0,
      totalSavings: latestRecord?.total_savings || 0,
      profitShareDistributed
    });
  };

  const handleCreateRecord = async (data: CreateFinancialRecordInput) => {
    try {
      setIsSubmitting(true);
      setDebugInfo(prev => prev + 'Creating new record...\n');
      
      console.log('➕ Creating new record:', data);
      
      // Get project name for logging
      const project = projects.find(p => (p._id || p.id) === data.project_id);
      const projectName = project?.enterpriseSetup?.projectName || 'Unknown Project';
      
      try {
        const response = await fetch('/api/financial-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        console.log('📡 Create API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📡 Create API response data:', result);
          
          if (result.success) {
            setRecords(prev => [result.data, ...prev]);
            setIsFormOpen(false);
            setDebugInfo(prev => prev + 'Create: SUCCESS\n');
            
            // LOG SUCCESS
            await logFinancialCreate(
              projectName,
              data.record_type,
              data.amount,
              data.recorded_by,
              {
                projectId: data.project_id,
                recordId: result.data._id,
                description: data.description,
                category: data.category
              }
            );
            
            alert('Financial record created successfully!');
          } else {
            throw new Error(result.error);
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (apiError) {
        console.log('❌ API call failed, creating in local state only');
        const newRecord: FinancialRecord = {
          _id: Date.now().toString(),
          ...data,
          archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setRecords(prev => [newRecord, ...prev]);
        setIsFormOpen(false);
        setDebugInfo(prev => prev + 'Create: Local state only\n');
        
        // LOG SUCCESS WITH LOCAL STATE
        await logFinancialCreate(
          projectName,
          data.record_type,
          data.amount,
          data.recorded_by,
          {
            projectId: data.project_id,
            recordId: newRecord._id,
            description: data.description,
            category: data.category,
            localState: true
          }
        );
        
        alert('Financial record created in local state! (API not available)');
      }
      
    } catch (error) {
      console.error('💥 Error creating record:', error);
      setDebugInfo(prev => prev + `Create: ERROR - ${getErrorMessage(error)}\n`);
      
      // LOG ERROR
      await logError(
        'Financial Records',
        'CREATE_RECORD',
        `Failed to create record: ${getErrorMessage(error)}`,
        data.recorded_by,
        {
          projectId: data.project_id,
          recordType: data.record_type,
          amount: data.amount,
          error: getErrorMessage(error)
        }
      );
      
      alert(`Failed to create financial record: ${getErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRecord = async (id: string, recordData: Partial<FinancialRecord>) => {
    try {
      setIsSubmitting(true);
      setDebugInfo(prev => prev + `Updating record ${id}...\n`);
      
      console.log('🔧 Starting update for record ID:', id);
      
      // Get project name and existing record for logging
      const existingRecord = records.find(r => r._id === id);
      const project = projects.find(p => (p._id || p.id) === existingRecord?.project_id);
      const projectName = project?.enterpriseSetup?.projectName || 'Unknown Project';

      // Prepare the data for API - remove MongoDB _id and other fields that shouldn't be updated
      const { _id, created_at, archived, ...cleanUpdateData } = recordData;

      console.log('📦 Clean update payload:', cleanUpdateData);

      try {
        const apiUrl = `/api/financial-records/id?id=${id}`;
        console.log('🌐 Calling API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanUpdateData),
        });
        
        console.log('📡 API Response status:', response.status);
        
        const result = await response.json();
        console.log('📡 API Response data:', result);
        
        if (response.ok && result.success) {
          console.log('✅ API update successful');
          
          // If API call succeeds, update local state with the returned data
          setRecords(prev => prev.map(record => 
            record._id === id ? { ...record, ...result.data } : record
          ));
          setSelectedRecord(null);
          setDebugInfo(prev => prev + `Update: SUCCESS\n`);
          
          // LOG SUCCESS
          await logFinancialUpdate(
            projectName,
            recordData.record_type || existingRecord?.record_type || 'unknown',
            recordData.amount || existingRecord?.amount || 0,
            existingRecord?.recorded_by || 'System',
            {
              projectId: existingRecord?.project_id,
              recordId: id,
              description: recordData.description || existingRecord?.description,
              changes: Object.keys(cleanUpdateData)
            }
          );
          
          alert('Financial record updated successfully!');
          return;
        } else {
          // If API returns an error, throw it
          const errorMessage = result.error || `HTTP ${response.status}: ${response.statusText}`;
          console.error('❌ API returned error:', errorMessage);
          setDebugInfo(prev => prev + `Update: API ERROR - ${errorMessage}\n`);
          throw new Error(errorMessage);
        }
      } catch (apiError) {
        console.error('❌ API call failed:', apiError);
        
        // If API call throws an error, fall back to local state only
        console.log('🔄 Falling back to local state update');
        setRecords(prev => prev.map(record => 
          record._id === id ? { ...record, ...recordData, updated_at: new Date().toISOString() } : record
        ));
        setSelectedRecord(null);
        setDebugInfo(prev => prev + 'Update: Local state only\n');
        
        // LOG SUCCESS WITH LOCAL STATE
        await logFinancialUpdate(
          projectName,
          recordData.record_type || existingRecord?.record_type || 'unknown',
          recordData.amount || existingRecord?.amount || 0,
          existingRecord?.recorded_by || 'System',
          {
            projectId: existingRecord?.project_id,
            recordId: id,
            description: recordData.description || existingRecord?.description,
            changes: Object.keys(recordData),
            localState: true
          }
        );
        
        alert('Financial record updated in local state! (API not available)');
        return;
      }
      
    } catch (error) {
      console.error('💥 Error in handleUpdateRecord:', error);
      setDebugInfo(prev => prev + `Update: ERROR - ${getErrorMessage(error)}\n`);
      
      // LOG ERROR
      await logError(
        'Financial Records',
        'UPDATE_RECORD',
        `Failed to update record ${id}: ${getErrorMessage(error)}`,
        'System',
        {
          recordId: id,
          error: getErrorMessage(error)
        }
      );
      
      alert(`Failed to update financial record: ${getErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveRecord = async (id: string) => {
    if (confirm('Are you sure you want to archive this financial record?')) {
      try {
        setIsSubmitting(true);
        setDebugInfo(prev => prev + `Archiving record ${id}...\n`);
        
        // Get record details for logging
        const record = records.find(r => r._id === id);
        const project = projects.find(p => (p._id || p.id) === record?.project_id);
        const projectName = project?.enterpriseSetup?.projectName || 'Unknown Project';
        
        try {
          const response = await fetch(`/api/financial-records/id/archive?id=${id}`, {
            method: 'POST',
          });
          
          console.log('📡 Archive API response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('📡 Archive API response data:', result);
            
            if (result.success) {
              setRecords(prev => prev.filter(record => record._id !== id));
              setDebugInfo(prev => prev + 'Archive: SUCCESS\n');
              
              // LOG ARCHIVE
              await logFinancialArchive(
                projectName,
                record?.record_type || 'unknown',
                record?.amount || 0,
                record?.recorded_by || 'System',
                {
                  projectId: record?.project_id,
                  recordId: id,
                  description: record?.description
                }
              );
              
              alert('Financial record archived successfully!');
            } else {
              throw new Error(result.error);
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (apiError) {
          console.log('❌ API call failed, updating local state only');
          setRecords(prev => prev.filter(record => record._id !== id));
          setDebugInfo(prev => prev + 'Archive: Local state only\n');
          
          // LOG ARCHIVE WITH LOCAL STATE
          await logFinancialArchive(
            projectName,
            record?.record_type || 'unknown',
            record?.amount || 0,
            record?.recorded_by || 'System',
            {
              projectId: record?.project_id,
              recordId: id,
              description: record?.description,
              localState: true
            }
          );
          
          alert('Financial record archived in local state! (API not available)');
        }
        
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('💥 Error archiving record:', errorMessage);
        setDebugInfo(prev => prev + `Archive: ERROR - ${errorMessage}\n`);
        
        // LOG ERROR
        await logError(
          'Financial Records',
          'ARCHIVE_RECORD',
          `Failed to archive record ${id}: ${errorMessage}`,
          'System',
          {
            recordId: id,
            error: errorMessage
          }
        );
        
        alert(`Failed to archive financial record: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRestoreRecord = async (id: string) => {
    if (confirm('Are you sure you want to restore this financial record?')) {
      try {
        setIsSubmitting(true);
        setDebugInfo(prev => prev + `Restoring record ${id}...\n`);
        
        // Get record details for logging
        const record = archivedRecords.find(r => r._id === id);
        const project = projects.find(p => (p._id || p.id) === record?.project_id);
        const projectName = project?.enterpriseSetup?.projectName || 'Unknown Project';
        
        try {
          const response = await fetch(`/api/financial-records/id/restore?id=${id}`, {
            method: 'POST',
          });
          
          console.log('📡 Restore API response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('📡 Restore API response data:', result);
            
            if (result.success) {
              setArchivedRecords(prev => prev.filter(record => record._id !== id));
              setDebugInfo(prev => prev + 'Restore: SUCCESS\n');
              
              // LOG RESTORE
              await activityLogger.logSuccess(
                'Financial Records',
                'RESTORE_RECORD',
                `Restored archived record for ${projectName}: ${record?.record_type} - ₱${record?.amount?.toLocaleString()}`,
                record?.recorded_by || 'System',
                {
                  projectName,
                  recordType: record?.record_type,
                  amount: record?.amount,
                  recordId: id
                }
              );
              
              alert('Financial record restored successfully!');
            } else {
              throw new Error(result.error);
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (apiError) {
          console.log('❌ API call failed, updating local state only');
          setArchivedRecords(prev => prev.filter(record => record._id !== id));
          setDebugInfo(prev => prev + 'Restore: Local state only\n');
          
          // LOG RESTORE WITH LOCAL STATE
          await activityLogger.logSuccess(
            'Financial Records',
            'RESTORE_RECORD',
            `Restored archived record for ${projectName}: ${record?.record_type} - ₱${record?.amount?.toLocaleString()} (local state only)`,
            record?.recorded_by || 'System',
            {
              projectName,
              recordType: record?.record_type,
              amount: record?.amount,
              recordId: id,
              localState: true
            }
          );
          
          alert('Financial record restored in local state! (API not available)');
        }
        
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('💥 Error restoring record:', errorMessage);
        setDebugInfo(prev => prev + `Restore: ERROR - ${errorMessage}\n`);
        
        // LOG ERROR
        await logError(
          'Financial Records',
          'RESTORE_RECORD',
          `Failed to restore record ${id}: ${errorMessage}`,
          'System',
          {
            recordId: id,
            error: errorMessage
          }
        );
        
        alert(`Failed to restore financial record: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const openArchiveModal = async () => {
    setIsArchiveModalOpen(true);
    await fetchArchivedRecords();
    
    // Log archive view access
    await activityLogger.logSuccess(
      'Financial Records',
      'VIEW_ARCHIVE',
      'User accessed archived financial records',
      'System'
    );
  };

  const exportToCSV = () => {
    let filteredRecords = selectedProject === 'all' 
      ? records 
      : records.filter(record => record.project_id === selectedProject);

    if (selectedAssociation !== 'all') {
      filteredRecords = filteredRecords.filter(record => {
        const project = projects.find(p => (p._id || p.id) === record.project_id);
        return project?.associationIds?.includes(selectedAssociation) || 
               project?.associationId === selectedAssociation;
      });
    }

    // LOG EXPORT
    activityLogger.logExport(
      'Financial Records',
      'CSV',
      'System',
      {
        recordCount: filteredRecords.length,
        filters: {
          project: selectedProject,
          association: selectedAssociation
        }
      }
    );

    const headers = [
      'Record Date',
      'Project',
      'Association',
      'Type',
      'Category',
      'Description',
      'Amount',
      'Cash on Hand',
      'Cash on Bank',
      'Total Savings',
      'Verification Method',
      'Profit Share',
      'Recorded By'
    ];

    const csvData = filteredRecords.map(record => {
      const project = projects.find(p => (p._id || p.id) === record.project_id);
      return [
        record.record_date,
        project?.enterpriseSetup?.projectName || 'Unknown Project',
        project?.associationName || 'Unknown Association',
        record.record_type,
        record.category,
        record.description,
        record.amount,
        record.cash_on_hand,
        record.cash_on_bank,
        record.total_savings,
        record.verification_method,
        record.is_profit_share ? 'Yes' : 'No',
        record.recorded_by
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportArchivedToCSV = () => {
    let filteredRecords = archiveSelectedProject === 'all' 
      ? archivedRecords 
      : archivedRecords.filter(record => record.project_id === archiveSelectedProject);

    if (archiveSelectedAssociation !== 'all') {
      filteredRecords = filteredRecords.filter(record => {
        const project = projects.find(p => (p._id || p.id) === record.project_id);
        return project?.associationIds?.includes(archiveSelectedAssociation) || 
               project?.associationId === archiveSelectedAssociation;
      });
    }

    // LOG ARCHIVED EXPORT
    activityLogger.logExport(
      'Archived Financial Records',
      'CSV',
      'System',
      {
        recordCount: filteredRecords.length,
        filters: {
          project: archiveSelectedProject,
          association: archiveSelectedAssociation
        }
      }
    );

    const headers = [
      'Record Date',
      'Project',
      'Association',
      'Type',
      'Category',
      'Description',
      'Amount',
      'Cash on Hand',
      'Cash on Bank',
      'Total Savings',
      'Verification Method',
      'Profit Share',
      'Recorded By',
      'Archived Date'
    ];

    const csvData = filteredRecords.map(record => {
      const project = projects.find(p => (p._id || p.id) === record.project_id);
      return [
        record.record_date,
        project?.enterpriseSetup?.projectName || 'Unknown Project',
        project?.associationName || 'Unknown Association',
        record.record_type,
        record.category,
        record.description,
        record.amount,
        record.cash_on_hand,
        record.cash_on_bank,
        record.total_savings,
        record.verification_method,
        record.is_profit_share ? 'Yes' : 'No',
        record.recorded_by,
        record.updated_at || 'Unknown'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archived-financial-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFilteredRecords = () => {
    let filtered = selectedProject === 'all' 
      ? records 
      : records.filter(record => record.project_id === selectedProject);

    if (selectedAssociation !== 'all') {
      filtered = filtered.filter(record => {
        const project = projects.find(p => (p._id || p.id) === record.project_id);
        return project?.associationIds?.includes(selectedAssociation) || 
               project?.associationId === selectedAssociation;
      });
    }

    return filtered;
  };

  const getFilteredArchivedRecords = () => {
    let filtered = archiveSelectedProject === 'all' 
      ? archivedRecords 
      : archivedRecords.filter(record => record.project_id === archiveSelectedProject);

    if (archiveSelectedAssociation !== 'all') {
      filtered = filtered.filter(record => {
        const project = projects.find(p => (p._id || p.id) === record.project_id);
        return project?.associationIds?.includes(archiveSelectedAssociation) || 
               project?.associationId === archiveSelectedAssociation;
      });
    }

    return filtered;
  };

  const getProjectFinancialSummary = (projectId: string) => {
    const projectRecords = groupedRecords.get(projectId) || [];
    const project = projects.find(p => (p._id || p.id) === projectId);
    
    const income = projectRecords
      .filter(record => record.record_type === 'income')
      .reduce((sum, record) => sum + record.amount, 0);

    const expenses = projectRecords
      .filter(record => record.record_type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0);

    const netProfit = income - expenses;

    const latestRecord = projectRecords
      .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())[0];

    return {
      project,
      income,
      expenses,
      netProfit,
      cashOnHand: latestRecord?.cash_on_hand || 0,
      cashOnBank: latestRecord?.cash_on_bank || 0,
      totalSavings: latestRecord?.total_savings || 0,
      recordCount: projectRecords.length
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600 mt-2">
              Manage financial records for {projects.length} projects across {associations.length} associations
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openArchiveModal}
              className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              View Archive
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Record
                </>
              )}
            </button>
          </div>
        </div>

        {/* Financial Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Project
            </label>
            <select
              id="project-filter"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project._id || project.id} value={project._id || project.id}>
                  {project.enterpriseSetup?.projectName || 'Unknown Project'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="association-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Association
            </label>
            <select
              id="association-filter"
              value={selectedAssociation}
              onChange={(e) => setSelectedAssociation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Associations</option>
              {associations.map(association => (
                <option key={association._id} value={association._id}>
                  {association.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Income</h3>
            <p className="text-2xl font-bold text-green-600">₱{summary.totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">₱{summary.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Profit</h3>
            <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₱{summary.netProfit.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Savings</h3>
            <p className="text-2xl font-bold text-blue-600">₱{summary.totalSavings.toLocaleString()}</p>
          </div>
        </div>

        {/* Projects Financial Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Projects Financial Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(groupedRecords.entries()).map(([projectId, projectRecords]) => {
              const summary = getProjectFinancialSummary(projectId);
              if (!summary.project) return null;

              return (
                <div key={projectId} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {summary.project.enterpriseSetup?.projectName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {summary.project.associationName}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      summary.project.enterpriseSetup?.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {summary.project.enterpriseSetup?.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Income:</span>
                      <span className="text-sm font-semibold text-green-600">
                        ₱{summary.income.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expenses:</span>
                      <span className="text-sm font-semibold text-red-600">
                        ₱{summary.expenses.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium text-gray-700">Net Profit:</span>
                      <span className={`text-sm font-semibold ${
                        summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₱{summary.netProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Records: {summary.recordCount}</span>
                      <span>Savings: ₱{summary.totalSavings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Records Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Financial Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {getFilteredRecords().length} records
              {selectedProject !== 'all' && ` for selected project`}
              {selectedAssociation !== 'all' && ` and association`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project & Association
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredRecords().map(record => {
                  const project = projects.find(p => (p._id || p.id) === record.project_id);
                  return (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.record_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {project?.enterpriseSetup?.projectName || 'Unknown Project'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {project?.associationName || 'Unknown Association'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.record_type === 'income' 
                            ? 'bg-green-100 text-green-800'
                            : record.record_type === 'expense'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {record.record_type}
                        </span>
                        {record.is_profit_share && (
                          <span className="ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Profit Share
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{record.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {record.category} • {record.verification_method}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₱{record.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit record"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleArchiveRecord(record._id)}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                            title="Archive record"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {getFilteredRecords().length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💰</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No financial records found</h3>
              <p className="text-gray-500 mb-4">
                {selectedProject !== 'all' || selectedAssociation !== 'all' 
                  ? 'Try changing your filters or add a new financial record.'
                  : 'Start by adding your first financial record.'
                }
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Record
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Financial Record Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-white/10 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsFormOpen(false)}
          />
          
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Financial Record</h2>
              <FinancialRecordForm
                projects={projects}
                onSubmit={handleCreateRecord}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-white/10 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setSelectedRecord(null)}
          />
          
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Financial Record</h2>
              <FinancialRecordForm
                projects={projects}
                record={selectedRecord}
                onSubmit={(data) => handleUpdateRecord(selectedRecord._id, data)}
                onCancel={() => setSelectedRecord(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Archive Records Modal */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-white/10 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsArchiveModalOpen(false)}
          />
          
          <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Archived Financial Records</h2>
                <button
                  onClick={() => setIsArchiveModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Archive Stats and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Archived</h3>
                  <p className="text-2xl font-bold text-gray-600">{archivedRecords.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Archived Income</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ₱{archivedRecords.filter(r => r.record_type === 'income').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Archived Expenses</h3>
                  <p className="text-2xl font-bold text-red-600">
                    ₱{archivedRecords.filter(r => r.record_type === 'expense').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <button
                    onClick={exportArchivedToCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Archive Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Project</label>
                  <select
                    value={archiveSelectedProject}
                    onChange={(e) => setArchiveSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Projects</option>
                    {projects.map(project => (
                      <option key={project._id || project.id} value={project._id || project.id}>
                        {project.enterpriseSetup?.projectName || 'Unknown Project'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Association</label>
                  <select
                    value={archiveSelectedAssociation}
                    onChange={(e) => setArchiveSelectedAssociation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Associations</option>
                    {associations.map(association => (
                      <option key={association._id} value={association._id}>
                        {association.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Archived Records Table */}
              <div className="bg-gray-50 rounded-lg border">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Archived Records ({getFilteredArchivedRecords().length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project & Association</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingArchive ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                            <p className="mt-2 text-gray-600">Loading archived records...</p>
                          </td>
                        </tr>
                      ) : getFilteredArchivedRecords().map(record => {
                        const project = projects.find(p => (p._id || p.id) === record.project_id);
                        
                        return (
                          <tr key={record._id} className="bg-gray-50 hover:bg-gray-100">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(record.record_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {project?.enterpriseSetup?.projectName || 'Unknown Project'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {project?.associationName || 'Unknown Association'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                record.record_type === 'income' 
                                  ? 'bg-green-100 text-green-800'
                                  : record.record_type === 'expense'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {record.record_type}
                              </span>
                              {record.is_profit_share && (
                                <span className="ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                  Profit Share
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div>{record.description}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {record.category} • {record.verification_method}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₱{record.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleRestoreRecord(record._id)}
                                disabled={isSubmitting}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Restore record"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {!isLoadingArchive && getFilteredArchivedRecords().length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📁</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No archived financial records</h3>
                      <p className="text-gray-600">
                        Archived records will appear here when you archive them from the main table.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}