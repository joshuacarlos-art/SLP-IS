'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  Building,
  BarChart3,
  ChevronDown,
  MapPin,
  Users,
  FileText,
  DollarSign,
  Calculator,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Target,
  Edit,
  Archive
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
import { MonitoringRecord } from '@/types/monitoring';
import ViewMonitoringModal from '@/components/monitoring/view-monitoring-modal';
import EditMonitoringModal from '@/components/monitoring/edit-monitoring-modal';
import ArchiveMonitoringModal from '@/components/monitoring/archive-monitoring-modal';
import { 
  logSuccess, 
  logError, 
  logWarning 
} from '@/lib/activity/activity-logger';

// Extended type to include MongoDB _id
interface MonitoringRecordWithMongoId extends MonitoringRecord {
  _id?: string;
}

export default function AllMonitoringRecordsPage() {
  const router = useRouter();
  const [monitoringRecords, setMonitoringRecords] = useState<MonitoringRecordWithMongoId[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssociation, setSelectedAssociation] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Modal states
  const [viewingRecord, setViewingRecord] = useState<MonitoringRecordWithMongoId | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MonitoringRecordWithMongoId | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [archivingRecord, setArchivingRecord] = useState<MonitoringRecordWithMongoId | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Log page access
  useEffect(() => {
    const logPageAccess = async () => {
      try {
        await logSuccess(
          'Monitoring Records',
          'PAGE_ACCESS',
          'Accessed all monitoring records page'
        );
      } catch (error) {
        console.error('Failed to log page access:', error);
      }
    };

    logPageAccess();
  }, []);

  // Helper functions
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "bg-green-50 text-green-700 border-green-200";
      case 'pending': return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case 'draft': return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getMonitoringTypeColor = (type: string) => {
    switch (type) {
      case 'routine': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'spot': return "bg-purple-50 text-purple-700 border-purple-200";
      case 'special': return "bg-orange-50 text-orange-700 border-orange-200";
      case 'validation': return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Get project name
  const getProjectName = (projectId: string) => {
    if (!projectId) return 'Unknown Project';
    
    const project = projects.find(p => 
      p.id === projectId || 
      p._id === projectId ||
      p.id?.toString() === projectId?.toString() ||
      p._id?.toString() === projectId?.toString()
    );

    return project?.enterpriseSetup?.projectName || 
           project?.projectName || 
           project?.name || 
           'Unknown Project';
  };

  // Get association names for a record
  const getAssociationNames = (record: MonitoringRecordWithMongoId) => {
    if (!record.association_ids || record.association_ids.length === 0) {
      return ['No Association'];
    }
    return record.association_ids.map(assocId => {
      const association = associations.find(a => 
        a.id === assocId || 
        a._id === assocId
      );
      return association?.name || 'Unknown Association';
    });
  };

  // Get project for dropdown
  const getProjectsForDropdown = () => {
    const uniqueProjects = projects.filter((project, index, self) => 
      index === self.findIndex(p => 
        (p.id || p._id) === (project.id || project._id)
      )
    );

    return uniqueProjects.map(project => ({
      id: project.id || project._id,
      name: project.enterpriseSetup?.projectName || project.projectName || project.name || 'Unnamed Project'
    }));
  };

  // Helper function to get record ID
  const getRecordId = (record: MonitoringRecordWithMongoId) => {
    return record.id || record._id || `record-${Date.now()}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Log data fetch start
      await logSuccess(
        'Monitoring Records',
        'FETCH_DATA_START',
        'Started fetching all monitoring records'
      );

      // Fetch data in parallel
      const [recordsResponse, associationsResponse, projectsResponse] = await Promise.all([
        fetch('/api/monitoring/records'),
        fetch('/api/monitoring/associations'),
        fetch('/api/monitoring/projects')
      ]);

      let recordsData: MonitoringRecordWithMongoId[] = [];
      let associationsData: any[] = [];
      let projectsData: any[] = [];

      if (recordsResponse.ok) {
        recordsData = await recordsResponse.json();
        setMonitoringRecords(Array.isArray(recordsData) ? recordsData : []);
      } else {
        throw new Error(`Failed to fetch records: ${recordsResponse.status}`);
      }

      if (associationsResponse.ok) {
        associationsData = await associationsResponse.json();
        setAssociations(Array.isArray(associationsData) ? associationsData : []);
      }

      if (projectsResponse.ok) {
        projectsData = await projectsResponse.json();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      }
      
      // Log successful data fetch
      await logSuccess(
        'Monitoring Records',
        'FETCH_DATA_SUCCESS',
        `Successfully loaded ${recordsData.length} monitoring records`,
        undefined,
        { 
          recordCount: recordsData.length,
          associationCount: associationsData.length,
          projectCount: projectsData.length
        }
      );
      
    } catch (error) {
      console.error('Error fetching data:', error);
      
      await logError(
        'Monitoring Records',
        'FETCH_DATA_ERROR',
        `Error fetching monitoring records: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRecord = async (record: MonitoringRecordWithMongoId) => {
    const projectName = getProjectName(record.project_id);
    const associationNames = getAssociationNames(record);
    
    try {
      await logSuccess(
        'Monitoring Records',
        'VIEW_RECORD',
        `Viewed monitoring record for project: ${projectName}`,
        undefined,
        {
          recordId: getRecordId(record),
          projectName,
          associations: associationNames,
          monitoringDate: record.monitoring_date,
          grossSales: record.monthly_gross_sales,
          netIncome: record.monthly_net_income
        }
      );
    } catch (error) {
      console.error('Failed to log view record:', error);
    }

    setViewingRecord(record);
    setIsViewModalOpen(true);
  };

  const handleEditRecord = async (record: MonitoringRecordWithMongoId) => {
    const projectName = getProjectName(record.project_id);
    
    try {
      await logSuccess(
        'Monitoring Records',
        'EDIT_RECORD_START',
        `Started editing monitoring record for project: ${projectName}`,
        undefined,
        {
          recordId: getRecordId(record),
          projectName,
          monitoringDate: record.monitoring_date
        }
      );
    } catch (error) {
      console.error('Failed to log edit start:', error);
    }

    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleArchiveRecord = async (record: MonitoringRecordWithMongoId) => {
    const projectName = getProjectName(record.project_id);
    
    try {
      await logWarning(
        'Monitoring Records',
        'ARCHIVE_RECORD_ATTEMPT',
        `Attempting to archive monitoring record for project: ${projectName}`,
        undefined,
        {
          recordId: getRecordId(record),
          projectName,
          monitoringDate: record.monitoring_date
        }
      );
    } catch (error) {
      console.error('Failed to log archive attempt:', error);
    }

    setArchivingRecord(record);
    setIsArchiveModalOpen(true);
  };

  const handleEditSuccess = async (updatedRecord: MonitoringRecordWithMongoId) => {
    const projectName = getProjectName(updatedRecord.project_id);
    
    setMonitoringRecords(prev => 
      prev.map(record => 
        record.id === updatedRecord.id || record._id === updatedRecord._id ? updatedRecord : record
      )
    );
    setIsEditModalOpen(false);
    setEditingRecord(null);
    
    // Log successful edit
    try {
      await logSuccess(
        'Monitoring Records',
        'EDIT_RECORD_SUCCESS',
        `Successfully updated monitoring record for project: ${projectName}`,
        undefined,
        {
          recordId: getRecordId(updatedRecord),
          projectName,
          monitoringDate: updatedRecord.monitoring_date,
          grossSales: updatedRecord.monthly_gross_sales,
          netIncome: updatedRecord.monthly_net_income
        }
      );
    } catch (error) {
      console.error('Failed to log edit success:', error);
    }
  };

  const handleArchiveSuccess = async () => {
    if (!archivingRecord) return;

    const projectName = getProjectName(archivingRecord.project_id);
    
    setMonitoringRecords(prev => 
      prev.filter(record => 
        record.id !== archivingRecord.id && record._id !== archivingRecord._id
      )
    );
    setIsArchiveModalOpen(false);
    
    // Log successful archive
    try {
      await logSuccess(
        'Monitoring Records',
        'ARCHIVE_RECORD_SUCCESS',
        `Successfully archived monitoring record for project: ${projectName}`,
        undefined,
        {
          recordId: getRecordId(archivingRecord),
          projectName,
          monitoringDate: archivingRecord.monitoring_date
        }
      );
    } catch (error) {
      console.error('Failed to log archive success:', error);
    }
    
    setArchivingRecord(null);
  };

  const handleExport = async () => {
    try {
      await logSuccess(
        'Monitoring Records',
        'EXPORT_DATA',
        'Exported all monitoring records to CSV',
        undefined,
        {
          recordCount: filteredRecords.length,
          totalRecords: monitoringRecords.length,
          filtersApplied: {
            search: searchTerm,
            association: selectedAssociation,
            project: selectedProject,
            status: statusFilter,
            dateRange
          }
        }
      );
      
      // Simple CSV export implementation
      const headers = [
        "Monitoring Date", 
        "Project Name", 
        "Associations", 
        "Field Officer", 
        "Provincial Coordinator",
        "Gross Sales", 
        "Net Income", 
        "Monitoring Type", 
        "Status",
        "Monitoring Year"
      ];
      
      const csvData = filteredRecords.map(record => [
        formatDate(record.monitoring_date),
        getProjectName(record.project_id),
        getAssociationNames(record).join('; '),
        record.field_officer_id || '',
        record.provincial_coordinator || '',
        record.monthly_gross_sales || 0,
        record.monthly_net_income || 0,
        record.monitoring_type,
        record.status,
        record.monitoring_year
      ]);
      
      const csvContent = [headers, ...csvData].map(row => 
        row.map(field => `"${field}"`).join(",")
      ).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `monitoring-records-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      
      await logError(
        'Monitoring Records',
        'EXPORT_ERROR',
        `Failed to export monitoring records: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.trim()) {
      try {
        await logSuccess(
          'Monitoring Records',
          'SEARCH_RECORDS',
          `Searched for monitoring records: "${term}"`,
          undefined,
          { 
            searchTerm: term,
            resultsCount: filteredRecords.length 
          }
        );
      } catch (error) {
        console.error('Failed to log search activity:', error);
      }
    }
  };

  const handleFilterChange = async (filterType: string, value: string) => {
    if (filterType === 'association') {
      setSelectedAssociation(value);
    } else if (filterType === 'project') {
      setSelectedProject(value);
    } else if (filterType === 'status') {
      setStatusFilter(value);
    }

    if (value !== 'all') {
      try {
        await logSuccess(
          'Monitoring Records',
          'FILTER_RECORDS',
          `Applied ${filterType} filter: ${value}`,
          undefined,
          { 
            filterType,
            filterValue: value,
            resultsCount: filteredRecords.length 
          }
        );
      } catch (error) {
        console.error('Failed to log filter activity:', error);
      }
    }
  };

  const handleDateRangeChange = async (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
    
    if (value) {
      try {
        await logSuccess(
          'Monitoring Records',
          'DATE_FILTER_APPLIED',
          `Applied date ${field} filter: ${value}`,
          undefined,
          { 
            dateField: field,
            dateValue: value,
            resultsCount: filteredRecords.length 
          }
        );
      } catch (error) {
        console.error('Failed to log date filter:', error);
      }
    }
  };

  const handleRefreshData = async () => {
    try {
      await logSuccess(
        'Monitoring Records',
        'MANUAL_REFRESH',
        'User manually refreshed monitoring records'
      );
      
      await fetchData();
    } catch (error) {
      console.error('Failed to log refresh:', error);
      await fetchData();
    }
  };

  const handleClearFilters = async () => {
    const hadActiveFilters = 
      searchTerm || 
      selectedAssociation !== 'all' || 
      selectedProject !== 'all' || 
      statusFilter !== 'all' || 
      dateRange.start || 
      dateRange.end;

    setSelectedAssociation('all');
    setSelectedProject('all');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setSearchTerm('');

    if (hadActiveFilters) {
      try {
        await logSuccess(
          'Monitoring Records',
          'CLEAR_FILTERS',
          'Cleared all filters',
          undefined,
          { resultsCount: filteredRecords.length }
        );
      } catch (error) {
        console.error('Failed to log clear filters:', error);
      }
    }
  };

  // Filter records
  const filteredRecords = monitoringRecords.filter(record => {
    const matchesSearch = 
      record.field_officer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.provincial_coordinator && record.provincial_coordinator.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getProjectName(record.project_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAssociation = selectedAssociation === 'all' || 
      (record.association_ids && record.association_ids.includes(selectedAssociation));
    
    const matchesProject = selectedProject === 'all' || record.project_id === selectedProject;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    const recordDate = new Date(record.monitoring_date);
    const matchesDateRange = 
      (!dateRange.start || recordDate >= new Date(dateRange.start)) &&
      (!dateRange.end || recordDate <= new Date(dateRange.end));

    return matchesSearch && matchesAssociation && matchesProject && matchesStatus && matchesDateRange;
  });

  // Calculate statistics
  const totalRecords = filteredRecords.length;
  const totalSales = filteredRecords.reduce((sum, record) => sum + (record.monthly_gross_sales || 0), 0);
  const totalNetIncome = filteredRecords.reduce((sum, record) => sum + (record.monthly_net_income || 0), 0);
  
  const uniqueAssociationIds = new Set(
    filteredRecords.flatMap(record => record.association_ids || [])
  );
  const activeAssociationsCount = uniqueAssociationIds.size;

  const completedRecords = filteredRecords.filter(record => record.status === 'completed').length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Loading monitoring records</p>
            <p className="text-gray-600 text-sm">Please wait while we load your data</p>
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
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">All Monitoring Records</h1>
            </div>
            <p className="text-gray-600">
              View and filter all project monitoring records across associations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button 
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalRecords}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600 font-medium">{completedRecords} completed</span>
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
                Across all records
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalNetIncome)}</div>
              <p className="text-xs text-gray-600 mt-1">
                Combined net income
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Associations</CardTitle>
              <Building className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {activeAssociationsCount}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                With monitoring records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl text-gray-900">Monitoring Records</CardTitle>
                <CardDescription className="text-gray-600">
                  Filter and search through all monitoring records
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects, field officers, coordinators..."
                    className="pl-10 w-full sm:w-64 bg-gray-50 border-gray-200"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Association Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Association</label>
                <Select value={selectedAssociation} onValueChange={(value) => handleFilterChange('association', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Associations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Associations</SelectItem>
                    {associations.map((association) => (
                      <SelectItem key={association.id || association._id} value={association.id || association._id}>
                        {association.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Project</label>
                <Select value={selectedProject} onValueChange={(value) => handleFilterChange('project', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {getProjectsForDropdown().map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredRecords.length} of {monitoringRecords.length} records
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-0">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableHead className="py-4 font-semibold text-gray-700">Monitoring Date</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Project & Association</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Field Officer</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Financials</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords
                      .sort((a, b) => new Date(b.monitoring_date).getTime() - new Date(a.monitoring_date).getTime())
                      .map((record, index) => {
                        const associationNames = getAssociationNames(record);
                        const projectName = getProjectName(record.project_id);
                        
                        return (
                          <TableRow key={getRecordId(record)} className="border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-4">
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900">
                                  {formatDate(record.monitoring_date)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {record.monitoring_year}
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900">
                                  {projectName}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Building className="h-3 w-3" />
                                  {associationNames.join(', ')}
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <div className="space-y-1">
                                <div className="text-sm text-gray-900">{record.field_officer_id}</div>
                                {record.provincial_coordinator && (
                                  <div className="text-xs text-gray-500">
                                    {record.provincial_coordinator}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900 flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(record.monthly_gross_sales || 0)}
                                </div>
                                <div className={`text-sm ${(record.monthly_net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                                  <Calculator className="h-3 w-3" />
                                  {formatCurrency(record.monthly_net_income || 0)} net
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <Badge 
                                variant="outline" 
                                className={`capitalize ${getMonitoringTypeColor(record.monitoring_type)}`}
                              >
                                {record.monitoring_type}
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1 capitalize">
                                {record.monitoring_frequency}
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <Badge 
                                variant="outline" 
                                className={`capitalize ${getStatusColor(record.status)}`}
                              >
                                {record.status}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRecord(record)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  title="Edit Record"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewRecord(record)}
                                  className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchiveRecord(record)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  title="Archive Record"
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center">
                        <div className="text-gray-400 mb-2">
                          <FileText className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No monitoring records found</h3>
                        <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                          {searchTerm || selectedAssociation !== 'all' || selectedProject !== 'all' || statusFilter !== 'all' || dateRange.start || dateRange.end
                            ? "No records match your current filters. Try adjusting your search criteria."
                            : "No monitoring records have been created yet."
                          }
                        </p>
                        {(searchTerm || selectedAssociation !== 'all' || selectedProject !== 'all' || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
                          <Button
                            onClick={handleClearFilters}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Monitoring Modal */}
        {viewingRecord && (
          <ViewMonitoringModal
            record={viewingRecord}
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setViewingRecord(null);
            }}
            projectName={getProjectName(viewingRecord.project_id)}
          />
        )}

        {/* Edit Monitoring Modal */}
        {editingRecord && (
          <EditMonitoringModal
            record={editingRecord}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingRecord(null);
            }}
            onSuccess={handleEditSuccess}
            projectName={getProjectName(editingRecord.project_id)}
          />
        )}

        {/* Archive Monitoring Modal */}
        {archivingRecord && (
          <ArchiveMonitoringModal
            record={archivingRecord}
            isOpen={isArchiveModalOpen}
            onClose={() => {
              setIsArchiveModalOpen(false);
              setArchivingRecord(null);
            }}
            onConfirm={handleArchiveSuccess}
            projectName={getProjectName(archivingRecord.project_id)}
          />
        )}
      </div>
    </div>
  );
}