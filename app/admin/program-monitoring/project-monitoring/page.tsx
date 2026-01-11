'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Map
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Project, MonitoringRecord } from '@/types/monitoring';
import ProjectMonitoringForm from '@/components/monitoring/project-monitoring-form';
import ViewMonitoringModal from '@/components/monitoring/view-monitoring-modal';
import ArchiveMonitoringModal from '@/components/monitoring/archive-monitoring-modal';
import { 
  logSuccess, 
  logError, 
  logWarning 
} from '@/lib/activity/activity-logger';

const normalizeProjectStructure = (project: any): Project => {
  if (project.enterpriseSetup) return project;
  return {
    ...project,
    enterpriseSetup: {
      projectName: project.projectName || 'Swine Farming',
      enterpriseType: project.enterpriseType || 'Agriculture',
      status: project.status || 'active',
      startDate: project.startDate || '2025-10-18',
      cityMunicipality: project.cityMunicipality || 'Himamaylan',
      province: project.province || 'Negros Occidental',
    },
    financialInformation: project.financialInformation || {
      totalSales: 0,
      netIncomeLoss: 0,
      totalSavingsGenerated: 0,
      cashOnHand: 0,
      cashOnBank: 0,
    },
    operationalInformation: project.operationalInformation || {
      multipleAssociations: [
        { 
          id: '1', 
          name: 'Farmers Association 1', 
          location: 'sitio tabugon brgy caradio-an himamaylan city, Negros Occidental', 
          no_active_members: 25, 
          region: 'Region VI', 
          province: 'Negros Occidental',
          contact_person: 'Juan Dela Cruz',
          contact_number: '+639123456789',
          email: 'fa1@example.com'
        },
        { 
          id: '2', 
          name: 'Farmers Association 3', 
          location: 'sitio garangan Brgy. tooy Him, Negros Occidental', 
          no_active_members: 18, 
          region: 'Region VI', 
          province: 'Negros Occidental',
          contact_person: 'Maria Santos',
          contact_number: '+639987654321',
          email: 'fa3@example.com'
        },
        { 
          id: '3', 
          name: 'Farmers Association 2', 
          location: 'brgy manggabat him, neg, occ', 
          no_active_members: 32, 
          region: 'Region VI', 
          province: 'Negros Occidental',
          contact_person: 'Pedro Reyes',
          contact_number: '+639456123789',
          email: 'fa2@example.com'
        },
      ],
      microfinancingInstitutions: false,
      microfinancingServices: false,
      enterprisePlanExists: false,
      beingDelivered: false,
      availedServices: [],
      assets: [],
      institutionalBuyers: [],
    },
    progress: project.progress || 75,
  };
};

export default function ProjectMonitoringPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [enterpriseTypeFilter, setEnterpriseTypeFilter] = useState('all');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showMonitoringForm, setShowMonitoringForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MonitoringRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [archiveRecord, setArchiveRecord] = useState<MonitoringRecord | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Log page access
  useEffect(() => {
    const logPageAccess = async () => {
      try {
        await logSuccess(
          'Project Monitoring',
          'PAGE_ACCESS',
          'Accessed project monitoring dashboard'
        );
      } catch (error) {
        console.error('Failed to log page access:', error);
      }
    };

    logPageAccess();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Log data fetch start
      await logSuccess(
        'Project Monitoring',
        'FETCH_DATA_START',
        'Started fetching monitoring data'
      );

      // Fetch associations
      let associationsArray: any[] = [];
      try {
        const associationsResponse = await fetch('/api/monitoring/associations');
        if (associationsResponse.ok) {
          associationsArray = await associationsResponse.json();
          
          await logSuccess(
            'Project Monitoring',
            'FETCH_ASSOCIATIONS_SUCCESS',
            `Successfully loaded ${associationsArray.length} associations`,
            undefined,
            { associationCount: associationsArray.length }
          );
        }
      } catch (error) {
        console.error('Error fetching associations:', error);
        
        await logError(
          'Project Monitoring',
          'FETCH_ASSOCIATIONS_ERROR',
          `Failed to fetch associations: ${error instanceof Error ? error.message : 'Unknown error'}`,
          undefined,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
      setAssociations(associationsArray);

      // Fetch projects
      let projectsArray: any[] = [];
      try {
        const projectsResponse = await fetch('/api/monitoring/projects');
        if (projectsResponse.ok) {
          projectsArray = await projectsResponse.json();
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        
        await logError(
          'Project Monitoring',
          'FETCH_PROJECTS_ERROR',
          `Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
          undefined,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
      
      // Fetch monitoring data for each project
      const projectsWithMonitoring = await Promise.all(
        projectsArray.map(async (project: any) => {
          const projectId = project.id || project._id;
          const normalizedProject = normalizeProjectStructure(project);
          
          // Fetch monitoring records for this project
          let monitoringRecords: MonitoringRecord[] = [];
          try {
            const monitoringResponse = await fetch(`/api/monitoring?project_id=${projectId}`);
            if (monitoringResponse.ok) {
              monitoringRecords = await monitoringResponse.json();
            }
          } catch (error) {
            console.error(`Error fetching monitoring for ${projectId}:`, error);
          }
          
          // Get the latest monitoring record
          const latestMonitoring = monitoringRecords
            .filter(record => !record.is_archived)
            .sort((a, b) => new Date(b.monitoring_date).getTime() - new Date(a.monitoring_date).getTime())[0];

          const multipleAssociations = normalizedProject.operationalInformation?.multipleAssociations || [];
          const allAssociationNames = multipleAssociations.map((assoc: any) => assoc.name);
          const displayAssociation = multipleAssociations[0];
          const associationRegion = displayAssociation?.region || normalizedProject.enterpriseSetup.region || '';
          const associationProvince = displayAssociation?.province || normalizedProject.enterpriseSetup.province || '';
          const allAssociationIds = multipleAssociations.map((assoc: any) => assoc.id);

          return {
            ...normalizedProject,
            id: projectId,
            associationNames: allAssociationNames,
            associationIds: allAssociationIds,
            associationName: allAssociationNames.join(', '),
            associationLocation: displayAssociation?.location || '',
            associationRegion,
            associationProvince,
            progress: normalizedProject.progress,
            monitoringRecords: monitoringRecords.filter(record => !record.is_archived),
            latestMonitoring
          };
        })
      );
      
      setProjects(projectsWithMonitoring);
      
      // Log successful data fetch
      await logSuccess(
        'Project Monitoring',
        'FETCH_DATA_SUCCESS',
        `Successfully loaded ${projectsWithMonitoring.length} projects with monitoring data`,
        undefined,
        { 
          projectCount: projectsWithMonitoring.length,
          totalMonitoringRecords: projectsWithMonitoring.reduce((sum, p) => sum + (p.monitoringRecords?.length || 0), 0)
        }
      );
      
    } catch (error) {
      console.error('Error fetching data for monitoring:', error);
      
      await logError(
        'Project Monitoring',
        'FETCH_DATA_ERROR',
        `Error fetching monitoring data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
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

    // Log expansion activity
    if (project) {
      try {
        await logSuccess(
          'Project Monitoring',
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

  const handleAddMonitoring = async (projectId: string, associationId?: string) => {
    const project = projects.find(p => p.id === projectId);
    const association = associationId 
      ? project?.operationalInformation?.multipleAssociations?.find(a => a.id === associationId)
      : null;

    try {
      await logSuccess(
        'Project Monitoring',
        'ADD_MONITORING_START',
        `Started adding monitoring record for project: ${project?.enterpriseSetup.projectName || 'Unknown Project'}`,
        undefined,
        {
          projectId,
          projectName: project?.enterpriseSetup.projectName,
          associationId,
          associationName: association?.name || 'All Associations'
        }
      );
    } catch (error) {
      console.error('Failed to log monitoring start:', error);
    }

    setSelectedProjectId(projectId);
    setSelectedAssociationId(associationId || null);
    setShowMonitoringForm(true);
  };

  const handleMonitoringSuccess = async (newRecord: MonitoringRecord) => {
    const project = projects.find(p => p.id === newRecord.project_id);
    
    setProjects(prevProjects => 
      prevProjects.map(project => {
        if (project.id === newRecord.project_id) {
          const updatedRecords = [newRecord, ...(project.monitoringRecords || [])];
          return {
            ...project,
            monitoringRecords: updatedRecords,
            latestMonitoring: newRecord
          };
        }
        return project;
      })
    );
    
    setShowMonitoringForm(false);
    setSelectedProjectId(null);
    setSelectedAssociationId(null);
    
    // Log successful monitoring creation
    try {
      await logSuccess(
        'Project Monitoring',
        'ADD_MONITORING_SUCCESS',
        `Successfully added monitoring record for project: ${project?.enterpriseSetup.projectName || 'Unknown Project'}`,
        undefined,
        {
          projectId: newRecord.project_id,
          projectName: project?.enterpriseSetup.projectName,
          monitoringId: newRecord.id,
          grossSales: newRecord.monthly_gross_sales,
          netIncome: newRecord.monthly_net_income,
          monitoringDate: newRecord.monitoring_date
        }
      );
    } catch (error) {
      console.error('Failed to log monitoring success:', error);
    }
    
    fetchData(); // Refresh data to get latest records
  };

  const handleViewRecord = async (record: MonitoringRecord) => {
    const project = projects.find(p => p.id === record.project_id);
    
    try {
      await logSuccess(
        'Project Monitoring',
        'VIEW_MONITORING_RECORD',
        `Viewed monitoring record for project: ${project?.enterpriseSetup.projectName || 'Unknown Project'}`,
        undefined,
        {
          projectId: record.project_id,
          projectName: project?.enterpriseSetup.projectName,
          monitoringId: record.id,
          monitoringDate: record.monitoring_date
        }
      );
    } catch (error) {
      console.error('Failed to log view record:', error);
    }

    setViewingRecord(record);
    setIsViewModalOpen(true);
  };

  const handleArchiveRecord = async (record: MonitoringRecord) => {
    const project = projects.find(p => p.id === record.project_id);
    
    try {
      await logWarning(
        'Project Monitoring',
        'ARCHIVE_MONITORING_ATTEMPT',
        `Attempting to archive monitoring record for project: ${project?.enterpriseSetup.projectName || 'Unknown Project'}`,
        undefined,
        {
          projectId: record.project_id,
          projectName: project?.enterpriseSetup.projectName,
          monitoringId: record.id,
          monitoringDate: record.monitoring_date
        }
      );
    } catch (error) {
      console.error('Failed to log archive attempt:', error);
    }

    setArchiveRecord(record);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveSuccess = async () => {
    if (!archiveRecord) return;

    const project = projects.find(p => p.id === archiveRecord.project_id);
    
    setProjects(prevProjects => 
      prevProjects.map(project => ({
        ...project,
        monitoringRecords: project.monitoringRecords?.filter(record => record.id !== archiveRecord?.id) || [],
        latestMonitoring: project.latestMonitoring?.id === archiveRecord?.id ? 
          project.monitoringRecords?.filter(record => record.id !== archiveRecord?.id)[0] : project.latestMonitoring
      }))
    );
    
    setIsArchiveModalOpen(false);
    
    // Log successful archive
    try {
      await logSuccess(
        'Project Monitoring',
        'ARCHIVE_MONITORING_SUCCESS',
        `Successfully archived monitoring record for project: ${project?.enterpriseSetup.projectName || 'Unknown Project'}`,
        undefined,
        {
          projectId: archiveRecord.project_id,
          projectName: project?.enterpriseSetup.projectName,
          monitoringId: archiveRecord.id,
          monitoringDate: archiveRecord.monitoring_date
        }
      );
    } catch (error) {
      console.error('Failed to log archive success:', error);
    }
    
    setArchiveRecord(null);
    fetchData(); // Refresh data
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.trim()) {
      try {
        await logSuccess(
          'Project Monitoring',
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
    }

    if (value !== 'all') {
      try {
        await logSuccess(
          'Project Monitoring',
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
        'Project Monitoring',
        'MANUAL_REFRESH',
        'User manually refreshed monitoring data'
      );
      
      await fetchData();
    } catch (error) {
      console.error('Failed to log refresh:', error);
      await fetchData();
    }
  };

  const handleExportData = async () => {
    try {
      await logSuccess(
        'Project Monitoring',
        'EXPORT_DATA',
        'Exported monitoring data',
        undefined,
        {
          projectCount: projects.length,
          monitoringRecordCount: projects.reduce((sum, p) => sum + (p.monitoringRecords?.length || 0), 0)
        }
      );
      
      // Simple CSV export implementation
      const headers = ["Project Name", "Association", "Status", "Progress", "Latest Sales", "Latest Net Income", "Last Monitoring Date"];
      const csvData = projects.map(project => [
        project.enterpriseSetup.projectName,
        project.associationName,
        project.enterpriseSetup.status,
        `${project.progress}%`,
        project.latestMonitoring?.monthly_gross_sales || 0,
        project.latestMonitoring?.monthly_net_income || 0,
        project.latestMonitoring?.monitoring_date || 'No data'
      ]);
      
      const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-monitoring-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      
      await logError(
        'Project Monitoring',
        'EXPORT_ERROR',
        `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  const filteredProjects = projects.filter(project => {
    const projectName = project.enterpriseSetup.projectName.toLowerCase();
    const associationNames = project.associationNames || [project.associationName || ''];
    const cityMunicipality = project.enterpriseSetup.cityMunicipality.toLowerCase();
    
    const matchesSearch = 
      projectName.includes(searchTerm.toLowerCase()) ||
      associationNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cityMunicipality.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.enterpriseSetup.status === statusFilter;
    const matchesType = enterpriseTypeFilter === 'all' || project.enterpriseSetup.enterpriseType === enterpriseTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => ({
    active: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    inactive: "bg-red-50 text-red-700 border-red-200",
  }[status] || "bg-gray-50 text-gray-700 border-gray-200");

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

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
  }[type] || <Building className="h-3 w-3" />);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) =>
    dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set';

  // Calculate statistics
  const totalSales = projects.reduce((sum, p) => {
    const latestSales = p.latestMonitoring?.monthly_gross_sales || p.financialInformation?.totalSales || 0;
    return sum + latestSales;
  }, 0);
  
  const totalNetIncome = projects.reduce((sum, p) => {
    const latestNetIncome = p.latestMonitoring?.monthly_net_income || p.financialInformation?.netIncomeLoss || 0;
    return sum + latestNetIncome;
  }, 0);
  
  const activeProjects = projects.filter(p => p.enterpriseSetup.status === 'active').length;
  const averageProgress = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0;
  const totalUniqueAssociations = new Set(projects.flatMap(project => {
    const multipleAssociations = project.operationalInformation?.multipleAssociations || [];
    return multipleAssociations.length > 0 ? multipleAssociations.map(assoc => assoc.id) : project.associationIds || [];
  })).size;

  const totalMonitoringRecords = projects.reduce((sum, p) => sum + (p.monitoringRecords?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Loading project monitoring data</p>
            <p className="text-gray-600 text-sm">Please wait while we load your projects</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Project Monitoring</h1>
            <p className="text-gray-600">Track and monitor all project metrics and progress</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* SITE VISITS BUTTON - ADDED HERE */}
            <Button 
              variant="outline"
              onClick={() => router.push('/admin/program-monitoring/project-monitoring/site-visits')}
              className="flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              Site Visits
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/admin/program-monitoring/project-monitoring/all-monitoring-records')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View All Records
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/admin/projects')}
              className="flex items-center gap-2"
            >
              <Building className="h-4 w-4" />
              Manage Projects
            </Button>
            <Button 
              variant="outline"
              onClick={handleRefreshData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600 font-medium">{activeProjects} active</span>
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-gray-600 mt-1">
                Net: <span className={totalNetIncome >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {formatCurrency(totalNetIncome)}
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Associations</CardTitle>
              <Building className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalUniqueAssociations}</div>
              <p className="text-xs text-gray-600 mt-1">Across all projects</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{averageProgress}%</div>
              <p className="text-xs text-gray-600 mt-1">Overall project completion</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Monitoring Records</CardTitle>
              <FileText className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalMonitoringRecords}</div>
              <p className="text-xs text-gray-600 mt-1">Total assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* Monitoring Form Modal */}
        {showMonitoringForm && (
          <ProjectMonitoringForm
            projectId={selectedProjectId!}
            associationId={selectedAssociationId}
            onSuccess={handleMonitoringSuccess}
            onCancel={() => {
              setShowMonitoringForm(false);
              setSelectedProjectId(null);
              setSelectedAssociationId(null);
            }}
          />
        )}

        {/* View Monitoring Modal */}
        {viewingRecord && (
          <ViewMonitoringModal
            record={viewingRecord}
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setViewingRecord(null);
            }}
            projectName={
              projects.find(p => p.id === viewingRecord.project_id)?.enterpriseSetup?.projectName || 'Unknown Project'
            }
          />
        )}

        {/* Archive Monitoring Modal */}
        {archiveRecord && (
          <ArchiveMonitoringModal
            record={archiveRecord}
            isOpen={isArchiveModalOpen}
            onClose={() => {
              setIsArchiveModalOpen(false);
              setArchiveRecord(null);
            }}
            onConfirm={handleArchiveSuccess}
            projectName={
              projects.find(p => p.id === archiveRecord.project_id)?.enterpriseSetup?.projectName || 'Unknown Project'
            }
          />
        )}

        {/* Main Monitoring Table */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl text-gray-900">Project Monitoring Dashboard</CardTitle>
                <CardDescription className="text-gray-600">
                  Monitoring {filteredProjects.length} projects across {totalUniqueAssociations} associations
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
                        <Filter className="h-4 w-4" />
                        Type
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleFilterChange('type', "all")}>All Types</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('type', "Individual")}>Individual</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('type', "Group")}>Group</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('type', "Association")}>Association</DropdownMenuItem>
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
                    <TableHead className="py-4 font-semibold text-gray-700">Progress</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Latest Financials</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project, index) => {
                    const isExpanded = expandedProjects.has(project.id);
                    const projectAssociations = project.operationalInformation?.multipleAssociations || [];
                    const hasMultipleAssociations = projectAssociations.length > 1;
                    const latestMonitoring = project.latestMonitoring;
                    const monitoringRecords = project.monitoringRecords || [];
                    
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
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="h-3 w-3" />
                                Started {formatDate(project.enterpriseSetup.startDate)}
                              </div>
                              {latestMonitoring && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <FileText className="h-3 w-3" />
                                  Last monitored: {formatDate(latestMonitoring.monitoring_date)}
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
                              <div className="text-xs text-gray-500">
                                {projectAssociations.reduce((total, assoc) => total + (assoc.no_active_members || 0), 0)} total members
                              </div>
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
                            <div className="space-y-2 min-w-32">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700">{project.progress || 0}%</span>
                                <span className="text-gray-500">Complete</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress || 0)}`}
                                  style={{ width: `${project.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            {latestMonitoring ? (
                              <div className="space-y-1 text-sm">
                                <div className="font-medium text-gray-900 flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(latestMonitoring.monthly_gross_sales)}
                                </div>
                                <div className={latestMonitoring.monthly_net_income >= 0 ? "text-green-600 flex items-center gap-1" : "text-red-600 flex items-center gap-1"}>
                                  <Calculator className="h-3 w-3" />
                                  {formatCurrency(latestMonitoring.monthly_net_income)} net
                                </div>
                                <div className="text-xs text-gray-500">
                                  {monitoringRecords.length} records
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No monitoring data</div>
                            )}
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Add Monitoring For</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleAddMonitoring(project.id)}
                                  >
                                    All Associations
                                  </DropdownMenuItem>
                                  {projectAssociations.map((association) => (
                                    <DropdownMenuItem 
                                      key={association.id}
                                      onClick={() => handleAddMonitoring(project.id, association.id)}
                                    >
                                      {association.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
                              {project.latestMonitoring && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleViewRecord(project.latestMonitoring!)}
                                  className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                  title="View Latest Record"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
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
                                          <Button 
                                            size="sm"
                                            onClick={() => handleAddMonitoring(project.id, association.id)}
                                            className="flex-1 text-xs"
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Monitoring
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

              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2"><Target className="h-12 w-12 mx-auto" /></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                  <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                    {searchTerm || statusFilter !== 'all' || enterpriseTypeFilter !== 'all' 
                      ? "No projects match your current filters. Try adjusting your search criteria."
                      : "Get started by creating your first project to monitor its progress and performance."
                    }
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setEnterpriseTypeFilter('all');
                      if (projects.length === 0) router.push('/admin/projects/new');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {projects.length === 0 ? 'Create Your First Project' : 'Clear Filters'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}