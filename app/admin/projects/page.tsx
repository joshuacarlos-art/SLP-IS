'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Association, ExtendedProject } from '@/types/project';
import { 
  logSuccess, 
  logError, 
  logWarning 
} from '@/lib/activity/activity-logger';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Calendar, 
  Users, 
  Target, 
  TrendingUp,
  Building,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  MapPin,
  User,
  RefreshCw,
  FileText,
  DollarSign,
  Calculator,
  ArrowRight,
  Archive,
  Edit,
  Phone,
  Mail,
  Map,
  Trash2,
  MoreVertical
} from 'lucide-react';

// Components
import { ProjectStats } from '@/components/projects/ProjectStats';
import { EditProject } from '@/components/projects/EditProject';
import { ProjectDetailsView } from '@/components/projects/ProjectDetailsView';

// Helper function to normalize project structure
const normalizeProjectStructure = (project: any): Project => {
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

// Define interface for association data in operationalInformation
interface ProjectAssociation {
  id: string;
  name: string;
  location: string;
  no_active_members: number;
  region?: string;
  province?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
}

// View Monitoring Button Component - UPDATED VERSION
function ViewMonitoringButton({
  projectId,
  projectName,
  associationId,
  associationName,
  variant = 'outline',
  size = 'default',
  showIcon = true,
  showText = true,
  className = ''
}: {
  projectId: string;
  projectName: string;
  associationId?: string;
  associationName?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}) {
  const router = useRouter();

  const handleViewMonitoring = async () => {
    try {
      const params = new URLSearchParams();
      
      // Only add project filter if it's not "all"
      if (projectId && projectId !== 'all') {
        params.set('project', projectId);
      }
      
      // Only add association filter if provided
      if (associationId && associationId !== 'all') {
        params.set('association', associationId);
      }

      await logSuccess(
        'Projects Management',
        'NAVIGATE_TO_MONITORING',
        `Navigated to monitoring ${projectId === 'all' ? 'for all projects' : `for project: ${projectName}${associationName ? ` - ${associationName}` : ''}`}`,
        undefined,
        { 
          projectId,
          projectName: projectId === 'all' ? 'All Projects' : projectName,
          associationId,
          associationName
        }
      );
      
      // Navigate to monitoring records page with appropriate filters
      const queryString = params.toString();
      router.push(`/admin/monitoring/records${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.error('Failed to log monitoring navigation:', error);
      // Still navigate even if logging fails
      const params = new URLSearchParams();
      if (projectId && projectId !== 'all') {
        params.set('project', projectId);
      }
      if (associationId && associationId !== 'all') {
        params.set('association', associationId);
      }
      const queryString = params.toString();
      router.push(`/admin/monitoring/records${queryString ? `?${queryString}` : ''}`);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleViewMonitoring}
      className={`flex items-center gap-2 ${className}`}
    >
      {showIcon && <BarChart3 className="h-4 w-4" />}
      {showText && (
        <>
          {projectId === 'all' ? 'View All Monitoring' : 'View Monitoring'}
          {size !== 'icon' && <ArrowRight className="h-3 w-3" />}
        </>
      )}
    </Button>
  );
}
export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [viewingProject, setViewingProject] = useState<ExtendedProject | undefined>();
  const [editingProject, setEditingProject] = useState<ExtendedProject | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [enterpriseTypeFilter, setEnterpriseTypeFilter] = useState('all');
  const [associationFilter, setAssociationFilter] = useState('all');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Log page access
  useEffect(() => {
    const logPageAccess = async () => {
      try {
        await logSuccess(
          'Projects Management',
          'PAGE_ACCESS',
          'Accessed projects management page'
        );
      } catch (error) {
        console.error('Failed to log page access:', error);
      }
    };

    logPageAccess();
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      await logSuccess(
        'Projects Management',
        'FETCH_DATA_START',
        'Started fetching projects and associations data'
      );
      
      // Fetch associations first
      const associationsResponse = await fetch('/api/associations');
      
      let associationsArray: Association[] = [];
      
      if (associationsResponse.ok) {
        const associationsData = await associationsResponse.json();
        
        if (Array.isArray(associationsData)) {
          associationsArray = associationsData;
        } else if (associationsData.associations && Array.isArray(associationsData.associations)) {
          associationsArray = associationsData.associations;
        } else if (associationsData.data && Array.isArray(associationsData.data)) {
          associationsArray = associationsData.data;
        }
        
        const activeAssociations = associationsArray.filter((assoc: Association) => !assoc.archived);
        setAssociations(activeAssociations);
        
        await logSuccess(
          'Projects Management',
          'FETCH_ASSOCIATIONS_SUCCESS',
          `Successfully loaded ${activeAssociations.length} active associations`,
          undefined,
          { associationCount: activeAssociations.length }
        );
      }

      // Fetch projects from API
      const projectsResponse = await fetch('/api/projects');
      
      if (projectsResponse.ok) {
        let projectsData = await projectsResponse.json();
        
        let projectsArray: any[] = [];
        
        if (Array.isArray(projectsData)) {
          projectsArray = projectsData;
        } else if (projectsData.projects && Array.isArray(projectsData.projects)) {
          projectsArray = projectsData.projects;
        } else if (projectsData.data && Array.isArray(projectsData.data)) {
          projectsArray = projectsData.data;
        }
        
        // Normalize and enrich projects with association data
        const enrichedProjects: ExtendedProject[] = projectsArray.map((project: any) => {
          const normalizedProject = normalizeProjectStructure(project);
          
          const multipleAssociations = normalizedProject.operationalInformation?.multipleAssociations || [];
          
          const allAssociationNames = multipleAssociations.length > 0 
            ? multipleAssociations.map((assoc: any) => assoc.name)
            : [];

          const primaryAssociation = associationsArray.find(assoc => {
            const associationId = assoc._id || assoc.id;
            const projectAssociationId = normalizedProject.associationId;
            return associationId === projectAssociationId;
          });

          const associationNames = allAssociationNames.length > 0 
            ? allAssociationNames 
            : primaryAssociation?.name 
              ? [primaryAssociation.name] 
              : ['Unknown Association'];

          const displayAssociation = multipleAssociations.length > 0 
            ? multipleAssociations[0] 
            : primaryAssociation;

          const associationRegion = displayAssociation?.region || 
                                   normalizedProject.enterpriseSetup?.region || 
                                   '';
          
          const associationProvince = displayAssociation?.province || 
                                     normalizedProject.enterpriseSetup?.province || 
                                     '';

          const allAssociationIds = multipleAssociations.length > 0 
            ? multipleAssociations.map((assoc: any) => assoc.id)
            : normalizedProject.associationId 
              ? [normalizedProject.associationId] 
              : [];

          const extendedProject: ExtendedProject = {
            ...normalizedProject,
            associationNames,
            associationIds: allAssociationIds,
            multipleAssociations: multipleAssociations.length > 0 ? multipleAssociations : undefined,
            associationName: associationNames.join(', '),
            associationLocation: displayAssociation?.location || '',
            associationRegion,
            associationProvince
          };
          
          return extendedProject;
        });
        
        setProjects(enrichedProjects);
        
        await logSuccess(
          'Projects Management',
          'FETCH_PROJECTS_SUCCESS',
          `Successfully loaded ${enrichedProjects.length} projects`,
          undefined,
          { 
            projectCount: enrichedProjects.length,
            multiAssociationProjects: enrichedProjects.filter(p => p.multipleAssociations && p.multipleAssociations.length > 1).length
          }
        );
        
      } else {
        // Fallback to localStorage
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
          try {
            const parsedProjects = JSON.parse(savedProjects);
            const normalizedProjects = parsedProjects.map((project: any) => normalizeProjectStructure(project));
            setProjects(normalizedProjects);
            
            await logWarning(
              'Projects Management',
              'USING_LOCALSTORAGE_FALLBACK',
              'Using localStorage fallback for projects data',
              undefined,
              { projectCount: normalizedProjects.length }
            );
          } catch (e) {
            setProjects([]);
          }
        } else {
          setProjects([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      
      await logError(
        'Projects Management',
        'FETCH_DATA_ERROR',
        `Error fetching data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      // Fallback to localStorage
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        try {
          const parsedProjects = JSON.parse(savedProjects);
          const normalizedProjects = parsedProjects.map((project: any) => normalizeProjectStructure(project));
          setProjects(normalizedProjects);
        } catch (e) {
          setProjects([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProjectExpansion = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const isExpanding = !expandedProjects.has(projectId);
    
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) newSet.delete(projectId);
      else newSet.add(projectId);
      return newSet;
    });

    if (project) {
      try {
        await logSuccess(
          'Projects Management',
          isExpanding ? 'EXPAND_PROJECT' : 'COLLAPSE_PROJECT',
          `${isExpanding ? 'Expanded' : 'Collapsed'} project details: ${project.enterpriseSetup.projectName}`,
          undefined,
          {
            projectId,
            projectName: project.enterpriseSetup.projectName,
            associationCount: project.operationalInformation?.multipleAssociations?.length || 0
          }
        );
      } catch (error) {
        console.error('Failed to log expansion activity:', error);
      }
    }
  };

  const filteredProjects = projects.filter(project => {
    const projectName = project.enterpriseSetup?.projectName || '';
    const participantFirstName = project.participant?.firstName || '';
    const participantLastName = project.participant?.lastName || '';
    const cityMunicipality = project.enterpriseSetup?.cityMunicipality || '';
    const status = project.enterpriseSetup?.status || '';
    const enterpriseType = project.enterpriseSetup?.enterpriseType || '';

    const matchesSearch = 
      participantFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participantLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.associationNames?.some(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      cityMunicipality.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesType = enterpriseTypeFilter === 'all' || enterpriseType === enterpriseTypeFilter;
    const matchesAssociation = associationFilter === 'all' || 
      project.associationId === associationFilter ||
      project.associationIds?.includes(associationFilter) ||
      project.multipleAssociations?.some(assoc => assoc.id === associationFilter);

    return matchesSearch && matchesStatus && matchesType && matchesAssociation;
  });



  const handleSaveProject = async (updatedProject: ExtendedProject) => {
    try {
      setIsLoading(true);

      const projectId = updatedProject._id || updatedProject.id;
      
      if (!projectId) {
        throw new Error('Project ID is missing - both _id and id are undefined');
      }

      await logSuccess(
        'Projects Management',
        'UPDATE_PROJECT_ATTEMPT',
        `Attempting to update project: ${updatedProject.enterpriseSetup?.projectName || 'Unknown Project'}`,
        undefined,
        { 
          projectId,
          projectName: updatedProject.enterpriseSetup?.projectName,
          associations: updatedProject.associationNames,
          associationCount: updatedProject.associationNames?.length || 0
        }
      );

      const updateData = {
        associationIds: updatedProject.associationIds,
        associationId: updatedProject.associationId,
        associationName: updatedProject.associationName,
        isAssociationMember: updatedProject.isAssociationMember,
        membershipType: updatedProject.membershipType,
        operationalInformation: updatedProject.operationalInformation
      };

      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProjects(prev => 
          prev.map(p => (p._id === updatedProject._id || p.id === updatedProject.id) ? updatedProject : p)
        );
        setEditingProject(undefined);
        
        await logSuccess(
          'Projects Management',
          'UPDATE_PROJECT_SUCCESS',
          `Successfully updated project: ${updatedProject.enterpriseSetup?.projectName || 'Unknown Project'}`,
          undefined,
          { 
            projectId,
            projectName: updatedProject.enterpriseSetup?.projectName,
            associations: updatedProject.associationNames,
            associationCount: updatedProject.associationNames?.length || 0
          }
        );
        
        await fetchData();
      } else {
        throw new Error(result.error || `HTTP ${response.status}: Failed to update project`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      
      let errorMessage = 'Failed to update project';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      await logError(
        'Projects Management',
        'UPDATE_PROJECT_ERROR',
        `Error updating project: ${errorMessage}`,
        undefined,
        { 
          projectId: updatedProject._id || updatedProject.id,
          projectName: updatedProject.enterpriseSetup?.projectName,
          error: errorMessage 
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = async (project: ExtendedProject) => {
    try {
      await logSuccess(
        'Projects Management',
        'EDIT_PROJECT_START',
        `Started editing project: ${project.enterpriseSetup?.projectName || 'Unknown Project'}`,
        undefined,
        { 
          projectId: project._id || project.id,
          projectName: project.enterpriseSetup?.projectName,
          associations: project.associationNames 
        }
      );
      
      setEditingProject(project);
    } catch (error) {
      console.error('Failed to log edit start:', error);
      setEditingProject(project);
    }
  };

  const handleViewProject = async (project: ExtendedProject) => {
    try {
      await logSuccess(
        'Projects Management',
        'VIEW_PROJECT_DETAILS',
        `Viewed project details: ${project.enterpriseSetup?.projectName || 'Unknown Project'}`,
        undefined,
        { 
          projectId: project._id || project.id,
          projectName: project.enterpriseSetup?.projectName,
          status: project.enterpriseSetup?.status,
          associations: project.associationNames 
        }
      );
      
      setViewingProject(project);
    } catch (error) {
      console.error('Failed to log view details:', error);
      setViewingProject(project);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.trim()) {
      try {
        await logSuccess(
          'Projects Management',
          'SEARCH_PROJECTS',
          `Searched for projects: "${term}"`,
          undefined,
          { 
            searchTerm: term,
            resultsCount: filteredProjects.length 
          }
        );
      } catch (error) {
        console.error('Failed to log search activity:', error);
      }
    }
  };

  const handleFilterChange = async (filterType: string, value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'type') {
      setEnterpriseTypeFilter(value);
    } else if (filterType === 'association') {
      setAssociationFilter(value);
    }

    if (value !== 'all') {
      try {
        await logSuccess(
          'Projects Management',
          'FILTER_PROJECTS',
          `Applied ${filterType} filter: ${value}`,
          undefined,
          { 
            filterType,
            filterValue: value,
            resultsCount: filteredProjects.length 
          }
        );
      } catch (error) {
        console.error('Failed to log filter activity:', error);
      }
    }
  };

  const handleRefreshData = async () => {
    try {
      await logSuccess(
        'Projects Management',
        'MANUAL_REFRESH',
        'User manually refreshed projects data'
      );
      
      await fetchData();
    } catch (error) {
      console.error('Failed to log refresh:', error);
      await fetchData();
    }
  };

  const handleAddNewProject = async () => {
    try {
      await logSuccess(
        'Projects Management',
        'NAVIGATE_ADD_PROJECT',
        'Navigated to add new project page'
      );
      
      router.push('/admin/projects/new');
    } catch (error) {
      console.error('Failed to log navigation:', error);
      router.push('/admin/projects/new');
    }
  };

  const handleExportData = async () => {
    try {
      await logSuccess(
        'Projects Management',
        'EXPORT_DATA',
        'Exported projects data',
        undefined,
        {
          projectCount: projects.length,
          associationCount: associations.length
        }
      );
      
      // Simple CSV export implementation
      const headers = ["Project Name", "Associations", "Status", "Enterprise Type", "Location", "Start Date"];
      const csvData = projects.map(project => [
        project.enterpriseSetup.projectName,
        project.associationName,
        project.enterpriseSetup.status,
        project.enterpriseSetup.enterpriseType,
        `${project.enterpriseSetup.cityMunicipality}, ${project.enterpriseSetup.province}`,
        project.enterpriseSetup.startDate
      ]);
      
      const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `projects-management-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      
      await logError(
        'Projects Management',
        'EXPORT_ERROR',
        `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  const getStatusColor = (status: string) => ({
    active: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    inactive: "bg-red-50 text-red-700 border-red-200",
  }[status] || "bg-gray-50 text-gray-700 border-gray-200");

  const getStatusIcon = (status: string) => ({
    active: <CheckCircle className="h-3 w-3" />,
    completed: <Target className="h-3 w-3" />,
    pending: <Clock className="h-3 w-3" />,
    inactive: <AlertTriangle className="h-3 w-3" />,
  }[status] || <BarChart3 className="h-3 w-3" />);

  const getEnterpriseTypeIcon = (type: string) => ({
    Individual: <User className="h-3 w-3" />,
    Group: <Users className="h-3 w-3" />,
    Association: <Building className="h-3 w-3" />,
    Agriculture: <MapPin className="h-3 w-3" />,
  }[type] || <Building className="h-3 w-3" />);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) =>
    dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Loading projects data</p>
            <p className="text-gray-600 text-sm">Please wait while we load your projects</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Projects Management</h1>
            <p className="text-gray-600">Manage and monitor all enterprise projects</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <ViewMonitoringButton 
              projectId="all"
              projectName="All Projects"
              variant="outline"
              showText={true}
            />
            <Button 
              variant="outline"
              onClick={handleRefreshData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={handleAddNewProject}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add New Project
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <ProjectStats 
          projects={projects} 
          associations={associations} 
        />

        {/* Edit Project Modal */}
        {editingProject && (
          <EditProject
            project={editingProject}
            associations={associations}
            onClose={() => setEditingProject(undefined)}
            onSave={handleSaveProject}
          />
        )}

        {/* Project Details View */}
        {viewingProject && (
          <ProjectDetailsView 
            project={viewingProject} 
            onClose={() => setViewingProject(undefined)}
            associations={associations}
            onEdit={handleEditProject}
          />
        )}

        {/* Main Projects Table */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl text-gray-900">Projects Dashboard</CardTitle>
                <CardDescription className="text-gray-600">
                  Managing {filteredProjects.length} projects across {associations.length} associations
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects, associations, or participants..."
                    className="pl-10 w-full sm:w-64 bg-gray-50 border-gray-200"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
                        <Filter className="h-4 w-4" />
                        Status
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleFilterChange('status', "all")}>All Status</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('status', "active")}>Active</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('status', "completed")}>Completed</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('status', "pending")}>Pending</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('status', "inactive")}>Inactive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>


                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-white border-gray-200"
                    onClick={handleExportData}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableHead className="w-12 py-4"></TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Project Details</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Associations</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Location</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Financial Status</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Start Date</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project, index) => {
                    const isExpanded = expandedProjects.has(project.id);
                    const projectAssociations = (project.operationalInformation?.multipleAssociations || []) as ProjectAssociation[];
                    const hasMultipleAssociations = projectAssociations.length > 1;
                    
                    return (
                      <React.Fragment key={project.id || `project-${index}`}>
                        <TableRow className="border-gray-200 hover:bg-gray-50 group">
                          <TableCell className="py-4">
                            {hasMultipleAssociations && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-200"
                                onClick={() => toggleProjectExpansion(project.id)}
                              >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                            )}
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                                {project.enterpriseSetup.projectName || 'Unnamed Project'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {project.participant?.firstName} {project.participant?.lastName}
                              </div>
                              {project.participant?.contactNumber && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Phone className="h-3 w-3" />
                                  {project.participant.contactNumber}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {project.associationNames?.[0] || 'No Association'}
                              </div>
                              {hasMultipleAssociations && (
                                <div className="text-xs text-blue-600 font-medium">
                                  +{projectAssociations.length - 1} more associations
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <Badge 
                              variant="outline" 
                              className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-200 capitalize"
                            >
                              {getEnterpriseTypeIcon(project.enterpriseSetup.enterpriseType)}
                              {project.enterpriseSetup.enterpriseType}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <div>
                                <div>{project.enterpriseSetup.cityMunicipality}</div>
                                <div className="text-xs">{project.enterpriseSetup.province}</div>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <div className="space-y-1 text-sm">
                              <div className="font-medium text-gray-900 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(project.financialInformation?.totalSales || 0)}
                              </div>
                              <div className={project.financialInformation?.netIncomeLoss >= 0 ? "text-green-600 flex items-center gap-1" : "text-red-600 flex items-center gap-1"}>
                                <Calculator className="h-3 w-3" />
                                {formatCurrency(project.financialInformation?.netIncomeLoss || 0)} net
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {formatDate(project.enterpriseSetup.startDate)}
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <Badge 
                              variant="outline" 
                              className={`flex items-center gap-1.5 font-medium ${getStatusColor(project.enterpriseSetup.status)}`}
                            >
                              {getStatusIcon(project.enterpriseSetup.status)}
                              {project.enterpriseSetup.status.charAt(0).toUpperCase() + project.enterpriseSetup.status.slice(1)}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="py-4 text-right">
                            <div className="flex justify-end gap-1">
                              {/* View Monitoring Button */}
                              <ViewMonitoringButton
                                projectId={project.id}
                                projectName={project.enterpriseSetup.projectName || 'Unnamed Project'}
                                variant="ghost"
                                size="icon"
                                showText={false}
                                className="h-8 w-8 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                              />
                              
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewProject(project)}
                                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditProject(project)}
                                className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50"
                                title="Edit Project"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleViewProject(project)}
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleEditProject(project)}
                                    className="flex items-center gap-2"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Project
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      router.push(`/admin/program-monitoring?project=${project.id}`);
                                      logSuccess(
                                        'Projects Management',
                                        'NAVIGATE_TO_MONITORING',
                                        `Navigated to monitoring for project: ${project.enterpriseSetup?.projectName || 'Unknown Project'}`,
                                        undefined,
                                        { 
                                          projectId: project.id,
                                          projectName: project.enterpriseSetup?.projectName
                                        }
                                      );
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <BarChart3 className="h-4 w-4" />
                                    View Monitoring
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Association Details */}
                        {isExpanded && hasMultipleAssociations && (
                          <TableRow className="bg-gray-50 border-t-0">
                            <TableCell colSpan={9} className="p-0">
                              <div className="px-12 py-6 border-t border-gray-200 space-y-4">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  Associated Associations ({projectAssociations.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {projectAssociations.map((association, assocIndex) => (
                                    <Card 
                                      key={`${project.id}-assoc-${association.id || association.name}-${assocIndex}`} 
                                      className="p-4 bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                      <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                          <div className="font-semibold text-gray-900 text-sm">{association.name}</div>
                                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                            {association.no_active_members || 0} members
                                          </Badge>
                                        </div>
                                        
                                        <div className="space-y-2 text-xs text-gray-600">
                                          <div className="flex items-start gap-2">
                                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                            <span className="leading-relaxed">{association.location}</span>
                                          </div>
                                          
                                          {association.contact_person && (
                                            <div className="flex items-center gap-2">
                                              <User className="h-3 w-3" />
                                              <span>Contact: {association.contact_person}</span>
                                            </div>
                                          )}
                                          
                                          {association.contact_number && (
                                            <div className="flex items-center gap-2">
                                              <Phone className="h-3 w-3" />
                                              <span>{association.contact_number}</span>
                                            </div>
                                          )}
                                          
                                          {association.email && (
                                            <div className="flex items-center gap-2">
                                              <Mail className="h-3 w-3" />
                                              <span className="truncate">{association.email}</span>
                                            </div>
                                          )}
                                          
                                          <div className="flex items-center gap-2 text-xs">
                                            <Map className="h-3 w-3" />
                                            <span>{association.region || 'N/A'}, {association.province || 'N/A'}</span>
                                          </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                          <ViewMonitoringButton
                                            projectId={project.id}
                                            projectName={project.enterpriseSetup.projectName || 'Unnamed Project'}
                                            associationId={association.id}
                                            associationName={association.name}
                                            size="sm"
                                            showText={true}
                                            className="flex-1 text-xs"
                                          />
                                          <Button 
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              // Navigate to association details
                                              router.push(`/admin/associations/${association.id}`);
                                            }}
                                            className="text-xs"
                                          >
                                            <Eye className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2"><Target className="h-12 w-12 mx-auto" /></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                  {searchTerm || statusFilter !== 'all' || enterpriseTypeFilter !== 'all' || associationFilter !== 'all'
                    ? "No projects match your current filters. Try adjusting your search criteria."
                    : "Get started by creating your first project to manage enterprise initiatives."
                  }
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setEnterpriseTypeFilter('all');
                    setAssociationFilter('all');
                    if (projects.length === 0) handleAddNewProject();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {projects.length === 0 ? 'Create Your First Project' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}