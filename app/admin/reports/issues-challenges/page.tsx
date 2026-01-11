"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  Search, 
  Plus,
  Download,
  Eye,
  Archive,
  Calendar,
  Building,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  X,
  FileText,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { activityLogger, logSuccess, logError, logWarning } from "@/lib/activity/activity-logger";

// Interfaces that match your existing project structure
interface Project {
  id: string;
  participant: {
    firstName: string;
    lastName: string;
  };
  enterpriseSetup: {
    projectName: string;
    status: string;
    enterpriseType: string;
    cityMunicipality: string;
    region: string;
    province: string;
  };
  associationId: string;
  associationName: string;
  associationNames?: string[];
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
  operationalInformation?: {
    multipleAssociations?: Array<{
      id: string;
      name: string;
      location: string;
      no_active_members: number;
      region?: string;
      province?: string;
    }>;
  };
}

interface Association {
  _id: string;
  id: string;
  name: string;
  location: string;
  status: string;
  no_active_members: number;
  contact_person: string;
  contact_number: string;
  email: string;
  date_formulated: string;
  archived: boolean;
}

interface Issue {
  id: string;
  project_id: string;
  project_name: string;
  issue_code: string;
  major_issue_challenge: string;
  actions_taken: string;
  status: 'open' | 'in_progress' | 'resolved';
  date_reported: string;
  date_resolved: string | null;
  reported_by: string;
  reported_by_name: string;
  association_name: string;
}

// Issues & Challenges specific logging functions
const logIssuesActivity = {
  // Page access and navigation
  async logPageAccess() {
    return activityLogger.logSuccess(
      'Issues & Challenges',
      'PAGE_ACCESS',
      'User accessed issues and challenges page'
    );
  },

  async logIssueView(issueCode: string, issueId: string) {
    return activityLogger.logSuccess(
      'Issues & Challenges',
      'VIEW_ISSUE',
      `Viewed issue details: ${issueCode}`,
      undefined,
      { issueCode, issueId }
    );
  },

  async logIssueCreate(issueCode: string, projectName: string, associationName: string) {
    return activityLogger.logSuccess(
      'Issues & Challenges',
      'CREATE_ISSUE',
      `Created new issue: ${issueCode} for ${projectName}`,
      undefined,
      { issueCode, projectName, associationName }
    );
  },

  async logIssueArchive(issueCode: string, issueId: string) {
    return activityLogger.logWarning(
      'Issues & Challenges',
      'ARCHIVE_ISSUE',
      `Archived issue: ${issueCode}`,
      undefined,
      { issueCode, issueId }
    );
  },

  async logDataLoad(issueCount: number, projectCount: number, associationCount: number) {
    return activityLogger.logSuccess(
      'Issues & Challenges',
      'LOAD_DATA',
      `Loaded ${issueCount} issues, ${projectCount} projects, and ${associationCount} associations`,
      undefined,
      { issueCount, projectCount, associationCount }
    );
  },

  async logDataLoadError(error: string) {
    return activityLogger.logError(
      'Issues & Challenges',
      'LOAD_DATA',
      `Failed to load issues data: ${error}`,
      undefined,
      { error }
    );
  },

  async logSearch(searchTerm: string, resultCount: number) {
    return activityLogger.logSuccess(
      'Issues & Challenges',
      'SEARCH_ISSUES',
      `Searched issues for "${searchTerm}" - found ${resultCount} results`,
      undefined,
      { searchTerm, resultCount }
    );
  },

  async logFilterApply(filterType: string, filterValue: string, resultCount: number) {
    return activityLogger.logSuccess(
      'Issues & Challenges',
      'APPLY_FILTER',
      `Applied ${filterType} filter: ${filterValue} - showing ${resultCount} issues`,
      undefined,
      { filterType, filterValue, resultCount }
    );
  },

  async logFilterClear() {
    return activityLogger.logSuccess(
      'Issues & Challenges',
      'CLEAR_FILTERS',
      'Cleared all issue filters'
    );
  },

  async logExportAttempt() {
    return activityLogger.logSuccess(
      'Issues & Challenges',
      'EXPORT_ATTEMPT',
      'User attempted to export issues data'
    );
  },

  async logCreateFormOpen() {
    return activityLogger.logSuccess(
      'Issues & Challenges',
      'OPEN_CREATE_FORM',
      'Opened new issue creation form'
    );
  },

  async logCreateFormClose() {
    return activityLogger.logSuccess(
      'Issues & Challenges',
      'CLOSE_CREATE_FORM',
      'Closed new issue creation form'
    );
  }
};

// Enhanced fetch function with better error handling
async function apiFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Invalid response format from ${url}. Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`);
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export default function IssuesChallengesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    project_id: "",
    association_id: "",
    status: ""
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    logIssuesActivity.logPageAccess();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [issues, searchTerm, filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query string for filters
      const queryParams = new URLSearchParams();
      if (filters.project_id) queryParams.append('project_id', filters.project_id);
      if (filters.association_id) queryParams.append('association_id', filters.association_id);
      if (filters.status) queryParams.append('status', filters.status);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/api/issues-challenges?${queryString}` : '/api/issues-challenges';
      
      // Fetch issues, projects, and associations in parallel
      const [issuesData, projectsData, associationsData] = await Promise.all([
        apiFetch(url),
        apiFetch('/api/projects'), // Your existing projects API
        apiFetch('/api/associations') // Fetch associations from your associations API
      ]);
      
      setIssues(issuesData);
      
      // Transform projects data to match our interface
      const transformedProjects: Project[] = projectsData.map((project: any) => ({
        id: project.id || project._id,
        participant: {
          firstName: project.participant?.firstName || '',
          lastName: project.participant?.lastName || ''
        },
        enterpriseSetup: {
          projectName: project.enterpriseSetup?.projectName || 'Unnamed Project',
          status: project.enterpriseSetup?.status || 'active',
          enterpriseType: project.enterpriseSetup?.enterpriseType || '',
          cityMunicipality: project.enterpriseSetup?.cityMunicipality || '',
          region: project.enterpriseSetup?.region || '',
          province: project.enterpriseSetup?.province || ''
        },
        associationId: project.associationId || '',
        associationName: project.associationName || '',
        associationNames: project.associationNames || [],
        multipleAssociations: project.multipleAssociations || [],
        associationLocation: project.associationLocation || '',
        associationRegion: project.associationRegion || '',
        associationProvince: project.associationProvince || '',
        operationalInformation: project.operationalInformation || {}
      }));
      
      setProjects(transformedProjects);

      // Transform associations data
      const transformedAssociations: Association[] = associationsData
        .filter((assoc: any) => !assoc.archived) // Only show non-archived associations
        .map((association: any) => ({
          _id: association._id,
          id: association._id || association.id,
          name: association.name || '',
          location: association.location || '',
          status: association.status || 'inactive',
          no_active_members: association.no_active_members || 0,
          contact_person: association.contact_person || '',
          contact_number: association.contact_number || '',
          email: association.email || '',
          date_formulated: association.date_formulated || '',
          archived: association.archived || false
        }));
      
      setAssociations(transformedAssociations);

      // Log successful data load
      await logIssuesActivity.logDataLoad(
        issuesData.length,
        transformedProjects.length,
        transformedAssociations.length
      );

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      
      // Log data load error
      await logIssuesActivity.logDataLoadError(
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = issues;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.major_issue_challenge.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.issue_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.association_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredIssues(filtered);
  };

  const handleArchiveIssue = async (issueId: string) => {
    if (!confirm('Are you sure you want to archive this issue?')) return;
    
    try {
      const issueToArchive = issues.find(issue => issue.id === issueId);
      
      await apiFetch(`/api/issues-challenges/id?id=${issueId}`, {
        method: 'DELETE'
      });
      
      // Log archive action
      if (issueToArchive) {
        await logIssuesActivity.logIssueArchive(issueToArchive.issue_code, issueId);
      }
      
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error archiving issue:', error);
      alert('Failed to archive issue. Please try again.');
    }
  };

  const handleViewIssue = async (issue: Issue) => {
    setSelectedIssue(issue);
    setShowViewModal(true);
    
    // Log issue view
    await logIssuesActivity.logIssueView(issue.issue_code, issue.id);
  };

  const handleSearchChange = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      // Log search activity with a slight delay to avoid too many logs
      setTimeout(async () => {
        await logIssuesActivity.logSearch(term, filteredIssues.length);
      }, 500);
    }
  };

  const handleFilterChange = async (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    if (value) {
      await logIssuesActivity.logFilterApply(filterType, value, filteredIssues.length);
    }
  };

  const handleClearFilters = async () => {
    setSearchTerm("");
    setFilters({ 
      project_id: "", 
      association_id: "", 
      status: "" 
    });
    
    // Log filter clearing
    await logIssuesActivity.logFilterClear();
  };

  const handleExportClick = async () => {
    // Log export attempt
    await logIssuesActivity.logExportAttempt();
    
    // Simulate export functionality
    alert("Export functionality would be implemented here");
  };

  const handleAddFormOpen = async () => {
    setShowAddForm(true);
    await logIssuesActivity.logCreateFormOpen();
  };

  const handleAddFormClose = async () => {
    setShowAddForm(false);
    await logIssuesActivity.logCreateFormClose();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: "bg-red-100 text-red-800", icon: AlertTriangle, label: "Open" },
      in_progress: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "In Progress" },
      resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Resolved" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const calculateStats = () => {
    const total = issues.length;
    const open = issues.filter(i => i.status === 'open').length;
    const inProgress = issues.filter(i => i.status === 'in_progress').length;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading issues and challenges...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Issues & Challenges</h1>
            <p className="text-muted-foreground">
              Track and manage project issues, challenges, and resolutions
            </p>
          </div>
          <Button 
            onClick={handleAddFormOpen}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Report New Issue
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Failed to load data</p>
                  <p className="text-sm">{error}</p>
                  <Button 
                    onClick={fetchData} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Total Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Open
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter issues by project, association, or status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <Label htmlFor="search">Search Issues</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by issue, project, or association..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Project Filter */}
              <div>
                <Label htmlFor="project">Project</Label>
                <select
                  id="project"
                  value={filters.project_id}
                  onChange={(e) => handleFilterChange('project_id', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Projects</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.enterpriseSetup.projectName} - {project.participant.firstName} {project.participant.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Association Filter */}
              <div>
                <Label htmlFor="association">Association</Label>
                <select
                  id="association"
                  value={filters.association_id}
                  onChange={(e) => handleFilterChange('association_id', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Associations</option>
                  {associations.map((association: Association) => (
                    <option key={association.id} value={association.id}>
                      {association.name} ({association.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredIssues.length} of {issues.length} issues
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={fetchData}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Reported Issues & Challenges</CardTitle>
                <CardDescription>
                  {filteredIssues.length} of {issues.length} issues found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportClick}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {issues.length === 0 ? 'No Issues Reported' : 'No Matching Issues'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {issues.length === 0 
                      ? 'Get started by reporting the first issue or challenge.' 
                      : 'Try adjusting your search terms or filters.'
                    }
                  </p>
                  {issues.length === 0 && (
                    <Button onClick={handleAddFormOpen} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Report First Issue
                    </Button>
                  )}
                </div>
              ) : (
                filteredIssues.map((issue) => (
                  <Card key={issue.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{issue.issue_code}</h3>
                          {getStatusBadge(issue.status)}
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="font-medium mb-1">Issue Description</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {issue.major_issue_challenge}
                          </p>
                        </div>

                        {issue.actions_taken && (
                          <div className="mb-3">
                            <h4 className="font-medium mb-1">Actions Taken</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {issue.actions_taken}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            <span>{issue.project_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-blue-600" />
                            <span>Association: {issue.association_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Reported by: {issue.reported_by_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Reported: {new Date(issue.date_reported).toLocaleDateString()}</span>
                          </div>
                          {issue.date_resolved && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>Resolved: {new Date(issue.date_resolved).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions - Removed Edit button */}
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewIssue(issue)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchiveIssue(issue.id)}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          title="Archive Issue"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Issue Modal */}
        {showAddForm && (
          <AddIssueForm
            isOpen={showAddForm}
            onClose={handleAddFormClose}
            onSuccess={() => {
              setShowAddForm(false);
              fetchData();
            }}
            projects={projects}
            associations={associations}
          />
        )}

        {/* View Issue Modal */}
        {showViewModal && selectedIssue && (
          <ViewIssueModal
            issue={selectedIssue}
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedIssue(null);
            }}
            onArchive={() => {
              handleArchiveIssue(selectedIssue.id);
              setShowViewModal(false);
              setSelectedIssue(null);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

// Add Issue Form Component (Without Category)
function AddIssueForm({ isOpen, onClose, onSuccess, projects, associations }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  projects: Project[]; 
  associations: Association[];
}) {
  const [formData, setFormData] = useState({
    project_id: "",
    association_id: "",
    major_issue_challenge: "",
    actions_taken: "",
    status: "open",
    date_reported: new Date().toISOString().split('T')[0],
    date_resolved: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Add default category temporarily to avoid API error
      const submitData = {
        ...formData,
        issue_category: "general" // Temporary fix until API is updated
      };

      const response = await apiFetch('/api/issues-challenges', {
        method: 'POST',
        body: JSON.stringify(submitData),
      });

      // Log successful issue creation
      const project = projects.find(p => p.id === formData.project_id);
      const association = associations.find(a => a.id === formData.association_id);
      
      await logIssuesActivity.logIssueCreate(
        `Issue-${Date.now()}`,
        project?.enterpriseSetup.projectName || 'Unknown Project',
        association?.name || 'Unknown Association'
      );

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <CardTitle>Report New Issue</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <select
                  id="project_id"
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Project</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.enterpriseSetup.projectName} - {project.participant.firstName} {project.participant.lastName}
                      {project.associationName && ` (${project.associationName})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="association_id">Association *</Label>
                <select
                  id="association_id"
                  name="association_id"
                  value={formData.association_id}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Association</option>
                  {associations.map((association: Association) => (
                    <option key={association.id} value={association.id}>
                      {association.name} - {association.location}
                      {association.contact_person && ` (${association.contact_person})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="major_issue_challenge">Issue Description *</Label>
              <textarea
                id="major_issue_challenge"
                name="major_issue_challenge"
                value={formData.major_issue_challenge}
                onChange={handleChange}
                required
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Describe the issue or challenge..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actions_taken">Actions Taken / Recommendations</Label>
              <textarea
                id="actions_taken"
                name="actions_taken"
                value={formData.actions_taken}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Describe any actions taken or recommendations..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_reported">Date Reported *</Label>
                <Input
                  type="date"
                  id="date_reported"
                  name="date_reported"
                  value={formData.date_reported}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_resolved">Date Resolved</Label>
                <Input
                  type="date"
                  id="date_resolved"
                  name="date_resolved"
                  value={formData.date_resolved}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Issue'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// View Issue Modal Component
function ViewIssueModal({ issue, isOpen, onClose, onArchive }: { 
  issue: Issue; 
  isOpen: boolean; 
  onClose: () => void; 
  onArchive: () => void;
}) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: "bg-red-100 text-red-800", icon: AlertTriangle, label: "Open" },
      in_progress: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "In Progress" },
      resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Resolved" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1 px-3 py-1`}>
        <IconComponent className="h-4 w-4" />
        {config.label}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b sticky top-0 bg-white z-10">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Issue Details
            </CardTitle>
            <CardDescription>
              Complete information for {issue.issue_code}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{issue.issue_code}</h2>
              <p className="text-muted-foreground mt-1">
                Reported on {new Date(issue.date_reported).toLocaleDateString()}
              </p>
            </div>
            {getStatusBadge(issue.status)}
          </div>

          {/* Project & Association Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-muted-foreground text-xs">Project Name</Label>
                    <p className="font-medium">{issue.project_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Association Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-muted-foreground text-xs">Association</Label>
                    <p className="font-medium">{issue.association_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issue Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Issue Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{issue.major_issue_challenge}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions Taken */}
          {issue.actions_taken && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Actions Taken / Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{issue.actions_taken}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Date Reported</Label>
                  <p className="font-medium">{new Date(issue.date_reported).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    {issue.date_resolved ? 'Date Resolved' : 'Resolution Status'}
                  </Label>
                  <p className="font-medium">
                    {issue.date_resolved 
                      ? new Date(issue.date_resolved).toLocaleDateString()
                      : 'Pending Resolution'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reported By */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Reported By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{issue.reported_by_name}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (confirm('Are you sure you want to archive this issue?')) {
                  onArchive();
                }
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}