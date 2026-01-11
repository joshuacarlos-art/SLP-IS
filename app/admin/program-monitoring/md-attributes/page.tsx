'use client';

import { useState, useEffect } from 'react';
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
  Map,
  X,
  UserCheck
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
import IssuesModal from '@/components/issues/issuesmodal';

interface MDAttribute {
  _id?: string;
  id: string;
  project_id: string;
  assessment_date: string;
  market_demand_score: number;
  market_demand_remarks: string;
  market_supply_score: number;
  market_supply_remarks: string;
  enterprise_plan_score: number;
  enterprise_plan_remarks: string;
  financial_stability_score: number;
  financial_stability_remarks: string;
  total_score: number;
  livelihood_status: string;
  assessed_by: string;
  is_archived: boolean;
  created_at?: string;
  updatedAt?: string;
}

interface MDAttributeFormData {
  project_id: string;
  assessment_date: string;
  market_demand_score: number;
  market_demand_remarks: string;
  market_supply_score: number;
  market_supply_remarks: string;
  enterprise_plan_score: number;
  enterprise_plan_remarks: string;
  financial_stability_score: number;
  financial_stability_remarks: string;
  livelihood_status: string;
  assessed_by: string;
  is_archived: boolean;
}

interface Project {
  id: string;
  _id?: string;
  enterpriseSetup: {
    projectName: string;
    enterpriseType: string;
    status: string;
    startDate: string;
    region: string;
    province: string;
    cityMunicipality: string;
    barangay: string;
  };
  associationName?: string;
}

// Activity logging function
const logActivity = async (activityData: {
  user: string;
  action: string;
  module: string;
  details: string;
  status: 'success' | 'error' | 'warning';
  metadata?: Record<string, any>;
}) => {
  try {
    const activity = {
      ...activityData,
      timestamp: new Date(),
      ipAddress: '192.168.1.100',
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Save to your activity logs API
    const response = await fetch('/api/activity-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      console.warn('Failed to save activity to MongoDB');
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        try {
          const existingActivities = JSON.parse(localStorage.getItem('activityLogs') || '[]');
          const updatedActivities = [activity, ...existingActivities].slice(0, 1000);
          localStorage.setItem('activityLogs', JSON.stringify(updatedActivities));
        } catch (error) {
          console.error('Error saving activity to localStorage:', error);
        }
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.groupCollapsed(`%c${activity.module}%c - %c${activity.action}`, 'color: blue; font-weight: bold;', 'color: gray;', 'color: green; font-weight: bold;');
      console.log('User:', activity.user);
      console.log('Details:', activity.details);
      console.log('Timestamp:', activity.timestamp.toLocaleString());
      console.log('IP:', activity.ipAddress);
      if (activity.metadata) {
        console.log('Metadata:', activity.metadata);
      }
      console.groupEnd();
    }

    return activity.id;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

// MD Attributes specific logging functions
const logMDAttributeCreate = async (projectId: string, totalScore: number, user?: string, metadata?: Record<string, any>) => {
  return logActivity({
    user: user || 'System',
    action: 'CREATE_ATTRIBUTE',
    module: 'MD Attributes',
    details: `Created new MD attribute assessment for project ${projectId} with total score ${totalScore}/40`,
    status: 'success',
    metadata: { projectId, totalScore, ...metadata }
  });
};

const logMDAttributeUpdate = async (assessmentId: string, projectId: string, totalScore: number, user?: string, metadata?: Record<string, any>) => {
  return logActivity({
    user: user || 'System',
    action: 'UPDATE_ATTRIBUTE',
    module: 'MD Attributes',
    details: `Updated MD attribute assessment ${assessmentId} for project ${projectId}`,
    status: 'success',
    metadata: { assessmentId, projectId, totalScore, ...metadata }
  });
};

const logMDAttributeDelete = async (assessmentId: string, projectId: string, user?: string, metadata?: Record<string, any>) => {
  return logActivity({
    user: user || 'System',
    action: 'DELETE_ATTRIBUTE',
    module: 'MD Attributes',
    details: `Deleted MD attribute assessment ${assessmentId} for project ${projectId}`,
    status: 'warning',
    metadata: { assessmentId, projectId, ...metadata }
  });
};

const logMDAttributeView = async (assessmentId: string, user?: string, metadata?: Record<string, any>) => {
  return logActivity({
    user: user || 'System',
    action: 'VIEW_ATTRIBUTE',
    module: 'MD Attributes',
    details: `Viewed MD attribute assessment: ${assessmentId}`,
    status: 'success',
    metadata: { assessmentId, ...metadata }
  });
};

const logMDAttributeList = async (user?: string, metadata?: Record<string, any>) => {
  return logActivity({
    user: user || 'System',
    action: 'LIST_ATTRIBUTES',
    module: 'MD Attributes',
    details: 'Listed all MD attribute assessments',
    status: 'success',
    metadata
  });
};

const logMDAttributeError = async (action: string, error: string, assessmentId?: string, user?: string) => {
  return logActivity({
    user: user || 'System',
    action,
    module: 'MD Attributes',
    details: assessmentId ? `Failed to ${action.toLowerCase()} MD attribute assessment ${assessmentId}: ${error}` : `Failed to ${action.toLowerCase()} MD attributes: ${error}`,
    status: 'error',
    metadata: { assessmentId, error }
  });
};

const logMDAttributePageAccess = async (user?: string) => {
  return logActivity({
    user: user || 'System',
    action: 'PAGE_ACCESS',
    module: 'MD Attributes',
    details: 'User accessed MD Attributes page',
    status: 'success'
  });
};

const logMDAttributeRefresh = async (user?: string) => {
  return logActivity({
    user: user || 'System',
    action: 'REFRESH_DATA',
    module: 'MD Attributes',
    details: 'User manually refreshed MD attributes data',
    status: 'success'
  });
};

const logMDAttributeExport = async (recordCount: number, user?: string) => {
  return logActivity({
    user: user || 'System',
    action: 'EXPORT_DATA',
    module: 'MD Attributes',
    details: `Exported ${recordCount} MD attribute records to CSV`,
    status: 'success',
    metadata: { recordCount }
  });
};

const logMDAttributeViewIssues = async (projectId: string, projectName: string, user?: string) => {
  return logActivity({
    user: user || 'System',
    action: 'VIEW_ISSUES',
    module: 'MD Attributes',
    details: `Viewed issues for project: ${projectName}`,
    status: 'success',
    metadata: { projectId, projectName }
  });
};

export default function MDAttributesPage() {
  const [mdAttributes, setMdAttributes] = useState<MDAttribute[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredAttributes, setFilteredAttributes] = useState<MDAttribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showIssuesModal, setShowIssuesModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<MDAttribute | null>(null);
  const [selectedProjectForIssues, setSelectedProjectForIssues] = useState<{id: string, name: string} | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<MDAttribute | null>(null);
  
  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [archiveFilter, setArchiveFilter] = useState('all');

  const [formData, setFormData] = useState<MDAttributeFormData>({
    project_id: '',
    assessment_date: new Date().toISOString().split('T')[0],
    market_demand_score: 0,
    market_demand_remarks: '',
    market_supply_score: 0,
    market_supply_remarks: '',
    enterprise_plan_score: 0,
    enterprise_plan_remarks: '',
    financial_stability_score: 0,
    financial_stability_remarks: '',
    livelihood_status: 'stable',
    assessed_by: '',
    is_archived: false
  });

  // Fetch projects data
  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      
      const response = await fetch('/api/projects');
      
      if (response.ok) {
        let projectsData = await response.json();
        
        let projectsArray: any[] = [];
        
        if (Array.isArray(projectsData)) {
          projectsArray = projectsData;
        } else if (projectsData.projects && Array.isArray(projectsData.projects)) {
          projectsArray = projectsData.projects;
        } else if (projectsData.data && Array.isArray(projectsData.data)) {
          projectsArray = projectsData.data;
        } else {
          projectsArray = [];
        }
        
        const simplifiedProjects: Project[] = projectsArray.map((project: any) => {
          const projectName = project.enterpriseSetup?.projectName || 
                            project.projectName || 
                            'Unknown Project';
          
          const enterpriseType = project.enterpriseSetup?.enterpriseType || 
                               project.enterpriseType || 
                               '';
          
          const projectId = project.id || project._id || 'unknown-id';
          
          return {
            id: projectId,
            _id: project._id,
            enterpriseSetup: {
              projectName,
              enterpriseType,
              status: project.enterpriseSetup?.status || project.status || 'active',
              startDate: project.enterpriseSetup?.startDate || project.startDate || '',
              region: project.enterpriseSetup?.region || project.region || '',
              province: project.enterpriseSetup?.province || project.province || '',
              cityMunicipality: project.enterpriseSetup?.cityMunicipality || project.cityMunicipality || '',
              barangay: project.enterpriseSetup?.barangay || project.barangay || '',
            },
            associationName: project.associationName || 'Unknown Association'
          };
        });
        
        setProjects(simplifiedProjects);
      } else {
        setProjects([]);
      }
    } catch (error: any) {
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  // Fetch MD attributes data from MongoDB
  const fetchMDAttributes = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      
      const response = await fetch('/api/md-attributes');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch MD attributes: ${response.status}`);
      }

      const attributesData = await response.json();
      setMdAttributes(attributesData);
      
    } catch (error: any) {
      await logMDAttributeError('FETCH_ATTRIBUTES', error.message);
      setConnectionError(error.message || 'Cannot connect to database. Please check your connection.');
      setMdAttributes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch both projects and MD attributes
  useEffect(() => {
    const fetchAllData = async () => {
      await logMDAttributePageAccess();
      await Promise.all([fetchProjects(), fetchMDAttributes()]);
    };
    
    fetchAllData();
  }, []);

  // Filter MD attributes
  useEffect(() => {
    const filtered = mdAttributes.filter(attribute => {
      const project = getProjectDetails(attribute.project_id);
      const projectName = project?.enterpriseSetup.projectName.toLowerCase() || '';
      const matchesSearch = !searchTerm || 
        projectName.includes(searchTerm.toLowerCase()) ||
        attribute.assessed_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attribute.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || attribute.livelihood_status === statusFilter;
      const matchesArchive = archiveFilter === 'all' || 
        (archiveFilter === 'active' && !attribute.is_archived) ||
        (archiveFilter === 'archived' && attribute.is_archived);

      return matchesSearch && matchesStatus && matchesArchive;
    });
    
    setFilteredAttributes(filtered);
  }, [mdAttributes, searchTerm, statusFilter, archiveFilter]);

  // Get project details for a given project ID
  const getProjectDetails = (projectId: string) => {
    return projects.find(project => project.id === projectId || project._id === projectId);
  };

  // Handle viewing issues for a project
  const handleViewIssues = (projectId: string, projectName: string) => {
    setSelectedProjectForIssues({ id: projectId, name: projectName });
    setShowIssuesModal(true);
    logMDAttributeViewIssues(projectId, projectName);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const requiredFields = [
        'project_id', 'assessment_date', 'assessed_by'
      ];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        setFormError(errorMsg);
        await logMDAttributeError('VALIDATION_ERROR', errorMsg);
        setFormLoading(false);
        return;
      }

      const url = '/api/md-attributes';
      const method = editingAttribute ? 'PUT' : 'POST';
      const requestUrl = editingAttribute ? `${url}?id=${editingAttribute.id}` : url;

      const response = await fetch(requestUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        const totalScore = calculateTotalScore(formData);
        
        if (editingAttribute) {
          await logMDAttributeUpdate(
            editingAttribute.id,
            formData.project_id,
            totalScore,
            formData.assessed_by,
            {
              assessmentDate: formData.assessment_date,
              livelihoodStatus: formData.livelihood_status
            }
          );
        } else {
          await logMDAttributeCreate(
            formData.project_id,
            totalScore,
            formData.assessed_by,
            {
              assessmentDate: formData.assessment_date,
              livelihoodStatus: formData.livelihood_status
            }
          );
        }

        setShowForm(false);
        resetForm();
        fetchMDAttributes();
      } else {
        const errorMsg = result.error || `Failed to ${editingAttribute ? 'update' : 'add'} MD attribute assessment`;
        setFormError(errorMsg);
        await logMDAttributeError(
          editingAttribute ? 'UPDATE_ATTRIBUTE' : 'CREATE_ATTRIBUTE',
          errorMsg,
          editingAttribute?.id
        );
      }
    } catch (error: any) {
      const errorMsg = `Error ${editingAttribute ? 'updating' : 'adding'} MD attribute assessment: ${error.message}`;
      setFormError(errorMsg);
      await logMDAttributeError(
        editingAttribute ? 'UPDATE_ATTRIBUTE' : 'CREATE_ATTRIBUTE',
        errorMsg,
        editingAttribute?.id
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (attribute: MDAttribute) => {
    setEditingAttribute(attribute);
    setFormData({
      project_id: attribute.project_id,
      assessment_date: attribute.assessment_date.split('T')[0],
      market_demand_score: attribute.market_demand_score,
      market_demand_remarks: attribute.market_demand_remarks,
      market_supply_score: attribute.market_supply_score,
      market_supply_remarks: attribute.market_supply_remarks,
      enterprise_plan_score: attribute.enterprise_plan_score,
      enterprise_plan_remarks: attribute.enterprise_plan_remarks,
      financial_stability_score: attribute.financial_stability_score,
      financial_stability_remarks: attribute.financial_stability_remarks,
      livelihood_status: attribute.livelihood_status,
      assessed_by: attribute.assessed_by,
      is_archived: attribute.is_archived
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this MD attribute assessment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/md-attributes?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const attribute = mdAttributes.find(attr => attr.id === id);
        if (attribute) {
          await logMDAttributeDelete(
            id,
            attribute.project_id,
            'system',
            {
              assessedBy: attribute.assessed_by,
              totalScore: attribute.total_score
            }
          );
        }
        fetchMDAttributes();
      } else {
        const result = await response.json();
        const errorMsg = result.error || 'Failed to delete MD attribute assessment';
        alert(errorMsg);
        await logMDAttributeError('DELETE_ATTRIBUTE', errorMsg, id);
      }
    } catch (error: any) {
      const errorMsg = `Error deleting MD attribute assessment: ${error.message}`;
      alert(errorMsg);
      await logMDAttributeError('DELETE_ATTRIBUTE', errorMsg, id);
    }
  };

  const handleViewDetails = (attribute: MDAttribute) => {
    setSelectedAttribute(attribute);
    setShowDetails(true);
    logMDAttributeView(
      attribute.id,
      'system',
      {
        projectId: attribute.project_id,
        totalScore: attribute.total_score,
        livelihoodStatus: attribute.livelihood_status
      }
    );
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      assessment_date: new Date().toISOString().split('T')[0],
      market_demand_score: 0,
      market_demand_remarks: '',
      market_supply_score: 0,
      market_supply_remarks: '',
      enterprise_plan_score: 0,
      enterprise_plan_remarks: '',
      financial_stability_score: 0,
      financial_stability_remarks: '',
      livelihood_status: 'stable',
      assessed_by: '',
      is_archived: false
    });
    setEditingAttribute(null);
    setFormError('');
  };

  const handleScoreChange = (field: string, value: number) => {
    const newValue = Math.max(0, Math.min(10, value));
    setFormData(prev => ({ ...prev, [field]: newValue }));
  };

  const calculateTotalScore = (data: MDAttributeFormData): number => {
    return data.market_demand_score + data.market_supply_score + 
           data.enterprise_plan_score + data.financial_stability_score;
  };

  const getLivelihoodStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      improved: "bg-green-50 text-green-700 border-green-200",
      stable: "bg-blue-50 text-blue-700 border-blue-200",
      declined: "bg-red-50 text-red-700 border-red-200"
    };
    return colors[status] || colors.stable;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-50 text-green-700 border-green-200";
    if (score >= 6) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (score >= 4) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  const getTotalScoreColor = (attribute: MDAttribute) => {
    const totalScore = attribute.total_score;
    if (totalScore >= 32) return "bg-green-50 text-green-700 border-green-200";
    if (totalScore >= 24) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (totalScore >= 16) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  const getStatusIcon = (status: string) => ({
    improved: <TrendingUp className="h-3 w-3" />,
    stable: <CheckCircle className="h-3 w-3" />,
    declined: <AlertTriangle className="h-3 w-3" />,
  }[status] || <BarChart3 className="h-3 w-3" />);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate stats
  const totalAssessments = mdAttributes.length;
  const activeAssessments = mdAttributes.filter(attr => !attr.is_archived).length;
  const averageTotalScore = mdAttributes.length > 0 
    ? (mdAttributes.reduce((sum, attr) => sum + attr.total_score, 0) / mdAttributes.length).toFixed(1)
    : '0.0';
  const projectsWithAssessments = new Set(mdAttributes.map(attr => attr.project_id)).size;
  const improvedAssessments = mdAttributes.filter(attr => attr.livelihood_status === 'improved').length;

  // Calculate issues count for each project
  const getProjectIssuesCount = (projectId: string) => {
    return Math.floor(Math.random() * 5);
  };

  const handleRefreshData = async () => {
    await logMDAttributeRefresh();
    await Promise.all([fetchProjects(), fetchMDAttributes()]);
  };

  const handleExportData = async () => {
    try {
      await logMDAttributeExport(filteredAttributes.length);
      
      // Export logic
      const headers = ["ID", "Project", "Assessment Date", "Total Score", "Status", "Assessed By"];
      const csvData = filteredAttributes.map(attr => {
        const project = getProjectDetails(attr.project_id);
        return [
          attr.id,
          project?.enterpriseSetup.projectName || 'Unknown',
          formatDate(attr.assessment_date),
          attr.total_score,
          attr.livelihood_status,
          attr.assessed_by
        ];
      });
      
      const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `md-attributes-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error: any) {
      await logMDAttributeError('EXPORT_DATA', error.message);
    }
  };

  if (isLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Loading MD Attributes data</p>
            <p className="text-gray-600 text-sm">Please wait while we load your assessments</p>
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">MD Attributes</h1>
            <p className="text-gray-600">Manage Market Development attribute assessments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button 
              variant="outline"
              onClick={handleRefreshData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={handleExportData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Assessment
            </Button>
          </div>
        </div>

        {/* Connection Error Alert */}
        {connectionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-red-600 font-medium">Database Connection Error</p>
                <p className="text-red-600 text-sm">{connectionError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Assessments</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalAssessments}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600 font-medium">{activeAssessments} active</span>
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{averageTotalScore}/40</div>
              <p className="text-xs text-gray-600 mt-1">Overall performance</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Projects Assessed</CardTitle>
              <Building className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{projectsWithAssessments}</div>
              <p className="text-xs text-gray-600 mt-1">of {projects.length} total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Improved Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{improvedAssessments}</div>
              <p className="text-xs text-gray-600 mt-1">Showing improvement</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Records</CardTitle>
              <FileText className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activeAssessments}</div>
              <p className="text-xs text-gray-600 mt-1">Current assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl text-gray-900">MD Attributes Dashboard</CardTitle>
                <CardDescription className="text-gray-600">
                  Monitoring {filteredAttributes.length} assessments across {projectsWithAssessments} projects
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects, assessors, or IDs..."
                    className="pl-10 w-full sm:w-64 bg-gray-50 border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("improved")}>Improved</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("stable")}>Stable</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("declined")}>Declined</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
                        <Filter className="h-4 w-4" />
                        Archive
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuLabel>Filter by Archive</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setArchiveFilter("all")}>All Records</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setArchiveFilter("active")}>Active Only</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setArchiveFilter("archived")}>Archived Only</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableHead className="py-4 font-semibold text-gray-700">Project Details</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Assessment Date</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Scores</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Total Score</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Livelihood Status</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Assessed By</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Archive Status</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttributes.map((attribute) => {
                    const project = getProjectDetails(attribute.project_id);
                    const issuesCount = getProjectIssuesCount(attribute.project_id);
                    
                    return (
                      <TableRow key={attribute._id || attribute.id} className="border-gray-200 hover:bg-gray-50 group">
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                              {project?.enterpriseSetup.projectName || 'Unknown Project'}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Building className="h-3 w-3" />
                              {project?.enterpriseSetup.enterpriseType || 'Unknown Type'}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {attribute.project_id}
                            </div>
                            {issuesCount > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewIssues(
                                  attribute.project_id, 
                                  project?.enterpriseSetup.projectName || 'Unknown Project'
                                )}
                                className="mt-1 flex items-center gap-1 px-2 py-1 h-6 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              >
                                <AlertTriangle size={12} />
                                <span>{issuesCount} issues</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(attribute.assessment_date)}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            <Badge variant="outline" className={getScoreColor(attribute.market_demand_score)}>
                              MD: {attribute.market_demand_score}
                            </Badge>
                            <Badge variant="outline" className={getScoreColor(attribute.market_supply_score)}>
                              MS: {attribute.market_supply_score}
                            </Badge>
                            <Badge variant="outline" className={getScoreColor(attribute.enterprise_plan_score)}>
                              EP: {attribute.enterprise_plan_score}
                            </Badge>
                            <Badge variant="outline" className={getScoreColor(attribute.financial_stability_score)}>
                              FS: {attribute.financial_stability_score}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <Badge variant="outline" className={getTotalScoreColor(attribute)}>
                            {attribute.total_score}/40
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1.5 font-medium ${getLivelihoodStatusColor(attribute.livelihood_status)}`}
                          >
                            {getStatusIcon(attribute.livelihood_status)}
                            {attribute.livelihood_status.charAt(0).toUpperCase() + attribute.livelihood_status.slice(1)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <User className="h-3 w-3" />
                            {attribute.assessed_by}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <Badge 
                            variant="outline" 
                            className={attribute.is_archived ? 
                              "bg-gray-50 text-gray-700 border-gray-200" : 
                              "bg-green-50 text-green-700 border-green-200"
                            }
                          >
                            {attribute.is_archived ? 'Archived' : 'Active'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDetails(attribute)}
                              className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(attribute)}
                              className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50"
                              title="Edit Assessment"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(attribute.id)}
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete Assessment"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredAttributes.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2"><UserCheck className="h-12 w-12 mx-auto" /></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
                  <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                    {searchTerm || statusFilter !== 'all' || archiveFilter !== 'all' 
                      ? "No assessments match your current filters. Try adjusting your search criteria."
                      : "Get started by adding your first MD attribute assessment."
                    }
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setArchiveFilter('all');
                      if (mdAttributes.length === 0) setShowForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {mdAttributes.length === 0 ? 'Add First Assessment' : 'Clear Filters'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit MD Attribute Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingAttribute ? 'Edit MD Attribute Assessment' : 'New MD Attribute Assessment'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      {formError}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project *
                    </label>
                    <select
                      required
                      value={formData.project_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.enterpriseSetup.projectName} ({project.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assessment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.assessment_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, assessment_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assessed By *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.assessed_by}
                      onChange={(e) => setFormData(prev => ({ ...prev, assessed_by: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter assessor name"
                    />
                  </div>
                </div>

                {/* Scoring Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Market Demand */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Market Demand</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Score (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.market_demand_score}
                        onChange={(e) => handleScoreChange('market_demand_score', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        value={formData.market_demand_remarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, market_demand_remarks: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Enter market demand remarks"
                      />
                    </div>
                  </div>

                  {/* Market Supply */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Market Supply</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Score (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.market_supply_score}
                        onChange={(e) => handleScoreChange('market_supply_score', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        value={formData.market_supply_remarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, market_supply_remarks: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Enter market supply remarks"
                      />
                    </div>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Enterprise Plan</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Score (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.enterprise_plan_score}
                        onChange={(e) => handleScoreChange('enterprise_plan_score', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        value={formData.enterprise_plan_remarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, enterprise_plan_remarks: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Enter enterprise plan remarks"
                      />
                    </div>
                  </div>

                  {/* Financial Stability */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Financial Stability</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Score (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.financial_stability_score}
                        onChange={(e) => handleScoreChange('financial_stability_score', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        value={formData.financial_stability_remarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, financial_stability_remarks: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Enter financial stability remarks"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Livelihood Status
                    </label>
                    <select
                      value={formData.livelihood_status}
                      onChange={(e) => setFormData(prev => ({ ...prev, livelihood_status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="improved">Improved</option>
                      <option value="stable">Stable</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_archived"
                      checked={formData.is_archived}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_archived: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_archived" className="text-sm font-medium text-gray-700">
                      Archive this assessment
                    </label>
                  </div>
                </div>

                {/* Total Score Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Score Preview:</span>
                    <Badge variant="outline" className={getScoreColor(calculateTotalScore(formData))}>
                      {calculateTotalScore(formData)}/40
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {formLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingAttribute ? 'Updating...' : 'Adding...'}
                      </div>
                    ) : (
                      editingAttribute ? 'Update Assessment' : 'Add Assessment'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetails && selectedAttribute && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">MD Attribute Assessment Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Assessment ID</p>
                    <p className="font-medium">{selectedAttribute.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Project ID</p>
                    <p className="font-medium">{selectedAttribute.project_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assessment Date</p>
                    <p className="font-medium">{formatDate(selectedAttribute.assessment_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assessed By</p>
                    <p className="font-medium">{selectedAttribute.assessed_by}</p>
                  </div>
                </div>

                {/* Project Information */}
                {(() => {
                  const project = getProjectDetails(selectedAttribute.project_id);
                  return project ? (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-900 mb-2">Project Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-blue-700">Name:</span> {project.enterpriseSetup.projectName}
                        </div>
                        <div>
                          <span className="text-blue-700">Type:</span> {project.enterpriseSetup.enterpriseType}
                        </div>
                        <div>
                          <span className="text-blue-700">Association:</span> {project.associationName}
                        </div>
                        <div>
                          <span className="text-blue-700">Location:</span> {project.enterpriseSetup.cityMunicipality}, {project.enterpriseSetup.province}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Scores */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Scores</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Market Demand</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getScoreColor(selectedAttribute.market_demand_score)}>
                          {selectedAttribute.market_demand_score}/10
                        </Badge>
                        <p className="text-sm text-gray-900">{selectedAttribute.market_demand_remarks}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Market Supply</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getScoreColor(selectedAttribute.market_supply_score)}>
                          {selectedAttribute.market_supply_score}/10
                        </Badge>
                        <p className="text-sm text-gray-900">{selectedAttribute.market_supply_remarks}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Enterprise Plan</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getScoreColor(selectedAttribute.enterprise_plan_score)}>
                          {selectedAttribute.enterprise_plan_score}/10
                        </Badge>
                        <p className="text-sm text-gray-900">{selectedAttribute.enterprise_plan_remarks}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Financial Stability</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getScoreColor(selectedAttribute.financial_stability_score)}>
                          {selectedAttribute.financial_stability_score}/10
                        </Badge>
                        <p className="text-sm text-gray-900">{selectedAttribute.financial_stability_remarks}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Score</p>
                      <Badge variant="outline" className={getTotalScoreColor(selectedAttribute)}>
                        {selectedAttribute.total_score}/40
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Livelihood Status</p>
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1.5 font-medium ${getLivelihoodStatusColor(selectedAttribute.livelihood_status)}`}
                      >
                        {getStatusIcon(selectedAttribute.livelihood_status)}
                        {selectedAttribute.livelihood_status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Issues Modal */}
        <IssuesModal
          isOpen={showIssuesModal}
          onClose={() => setShowIssuesModal(false)}
          projectId={selectedProjectForIssues?.id}
          projectName={selectedProjectForIssues?.name}
        />
      </div>
    </div>
  );
}