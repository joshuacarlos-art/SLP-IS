'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, CheckCircle, Search, Filter, Edit, Trash2 } from 'lucide-react';

interface Issue {
  id: string;
  project_id: string;
  project_name: string;
  issue_category: string;
  issue_code: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  date_reported: string;
  date_resolved?: string;
  reported_by: string;
  assigned_to?: string;
  resolution_notes?: string;
  is_archived: boolean;
}

interface Project {
  id: string;
  enterpriseSetup: {
    projectName: string;
    enterpriseType: string;
  };
}

interface IssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectName?: string;
}

interface IssueFormData {
  project_id: string;
  project_name: string;
  issue_category: string;
  issue_code: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  date_reported: string;
  date_resolved?: string;
  reported_by: string;
  assigned_to?: string;
  resolution_notes?: string;
  is_archived: boolean;
}

const ISSUE_CATEGORIES = [
  'Technical',
  'Financial',
  'Logistical',
  'Environmental',
  'Social',
  'Operational',
  'Regulatory'
];

const ISSUE_CODES: { [key: string]: string[] } = {
  'Technical': ['TECH-001', 'TECH-002', 'TECH-003'],
  'Financial': ['FIN-001', 'FIN-002', 'FIN-003'],
  'Logistical': ['LOG-001', 'LOG-002', 'LOG-003'],
  'Environmental': ['ENV-001', 'ENV-002', 'ENV-003'],
  'Social': ['SOC-001', 'SOC-002', 'SOC-003'],
  'Operational': ['OPS-001', 'OPS-002', 'OPS-003'],
  'Regulatory': ['REG-001', 'REG-002', 'REG-003']
};

export default function IssuesModal({ isOpen, onClose, projectId, projectName }: IssuesModalProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [filters, setFilters] = useState({
    issue_category: '',
    status: '',
    priority: '',
    search: ''
  });

  const [formData, setFormData] = useState<IssueFormData>({
    project_id: projectId || '',
    project_name: projectName || '',
    issue_category: '',
    issue_code: '',
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    date_reported: new Date().toISOString().split('T')[0],
    date_resolved: undefined,
    reported_by: '',
    assigned_to: '',
    resolution_notes: '',
    is_archived: false
  });

  // Fetch issues data
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const url = projectId 
        ? `/api/issues/project?project_id=${projectId}` 
        : '/api/issues';
      const response = await fetch(url);
      
      if (response.ok) {
        const issuesData = await response.json();
        setIssues(issuesData);
      } else {
        console.error('Failed to fetch issues');
        setIssues([]);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects data
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      
      if (response.ok) {
        const projectsData = await response.json();
        
        const simplifiedProjects: Project[] = projectsData.map((project: any) => ({
          id: project.id || project._id || 'unknown-id',
          enterpriseSetup: {
            projectName: project.enterpriseSetup?.projectName || project.projectName || 'Unknown Project',
            enterpriseType: project.enterpriseSetup?.enterpriseType || project.enterpriseType || '',
          }
        }));
        
        setProjects(simplifiedProjects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchIssues();
      if (!projectId) {
        fetchProjects();
      }
    }
  }, [isOpen, projectId]);

  // Filter issues
  useEffect(() => {
    let filtered = issues;

    if (filters.issue_category) {
      filtered = filtered.filter(issue => issue.issue_category === filters.issue_category);
    }
    if (filters.status) {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(issue => issue.priority === filters.priority);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower) ||
        issue.issue_code.toLowerCase().includes(searchLower) ||
        issue.project_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredIssues(filtered);
  }, [issues, filters]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const requiredFields = ['project_id', 'issue_category', 'issue_code', 'title', 'description', 'reported_by'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        setFormError(`Missing required fields: ${missingFields.join(', ')}`);
        setFormLoading(false);
        return;
      }

      const url = '/api/issues';
      const method = editingIssue ? 'PUT' : 'POST';
      
      // For PUT requests, include the ID in the URL
      const requestUrl = editingIssue ? `${url}?id=${editingIssue.id}` : url;

      const response = await fetch(requestUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        resetForm();
        fetchIssues();
        setActiveTab('list');
        alert(editingIssue ? 'Issue updated successfully!' : 'Issue reported successfully!');
      } else {
        setFormError(result.error || `Failed to ${editingIssue ? 'update' : 'report'} issue`);
      }
    } catch (error: any) {
      console.error('Error saving issue:', error);
      setFormError(`Error ${editingIssue ? 'updating' : 'reporting'} issue. Please check your connection.`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setFormData({
      project_id: issue.project_id,
      project_name: issue.project_name,
      issue_category: issue.issue_category,
      issue_code: issue.issue_code,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      date_reported: issue.date_reported,
      date_resolved: issue.date_resolved,
      reported_by: issue.reported_by,
      assigned_to: issue.assigned_to || '',
      resolution_notes: issue.resolution_notes || '',
      is_archived: issue.is_archived
    });
    setActiveTab('create');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    try {
      const response = await fetch(`/api/issues?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        fetchIssues();
        alert('Issue deleted successfully!');
      } else {
        alert(result.error || 'Failed to delete issue');
      }
    } catch (error: any) {
      console.error('Error deleting issue:', error);
      alert('Error deleting issue. Please check your connection.');
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: projectId || '',
      project_name: projectName || '',
      issue_category: '',
      issue_code: '',
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      date_reported: new Date().toISOString().split('T')[0],
      date_resolved: undefined,
      reported_by: '',
      assigned_to: '',
      resolution_notes: '',
      is_archived: false
    });
    setEditingIssue(null);
    setFormError('');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      issue_category: '',
      status: '',
      priority: '',
      search: ''
    });
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ 
      ...prev, 
      issue_category: category,
      issue_code: ISSUE_CODES[category]?.[0] || ''
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle size={16} className="text-red-500" />;
      case 'in_progress': return <Clock size={16} className="text-yellow-500" />;
      case 'resolved': return <CheckCircle size={16} className="text-green-500" />;
      case 'closed': return <CheckCircle size={16} className="text-blue-500" />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Issues & Challenges
              </h2>
              <p className="text-gray-600 mt-1">
                {projectId ? `Project: ${projectName}` : 'All Projects'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              View Issues ({issues.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('create');
                resetForm();
              }}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {editingIssue ? 'Edit Issue' : 'Report New Issue'}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Issues List Tab */}
          {activeTab === 'list' && (
            <div className="p-6">
              {/* Filters */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={filters.issue_category}
                      onChange={(e) => handleFilterChange('issue_category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Categories</option>
                      {ISSUE_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                      <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Search issues..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {filteredIssues.length} of {issues.length} issues
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Issues Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading issues...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Project Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue Category
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue Code
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Reported
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Resolved
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reported By
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredIssues.map((issue) => (
                          <tr key={`issue-${issue.id}`} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{issue.project_name}</div>
                                <div className="text-xs text-gray-500">ID: {issue.project_id}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {issue.issue_category}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {issue.issue_code}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(issue.status)}
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                                  {issue.status.replace('_', ' ')}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(issue.date_reported)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {issue.date_resolved ? formatDate(issue.date_resolved) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {issue.reported_by}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(issue)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                                  title="Edit Issue"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(issue.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors p-1"
                                  title="Delete Issue"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredIssues.length === 0 && (
                      <div className="text-center py-12">
                        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                        <p className="text-gray-500 mb-4">
                          {issues.length === 0 
                            ? "No issues have been reported yet."
                            : "No issues match your current filters."
                          }
                        </p>
                        {issues.length === 0 && (
                          <button
                            onClick={() => setActiveTab('create')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Report First Issue
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create/Edit Issue Tab */}
          {activeTab === 'create' && (
            <div className="p-6">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {formError}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Selection (only show if no projectId provided) */}
                  {!projectId && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project *
                      </label>
                      <select
                        required
                        value={formData.project_id}
                        onChange={(e) => {
                          const selectedProject = projects.find(p => p.id === e.target.value);
                          setFormData(prev => ({ 
                            ...prev, 
                            project_id: e.target.value,
                            project_name: selectedProject?.enterpriseSetup.projectName || ''
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a Project</option>
                        {projects.map((project) => (
                          <option key={`project-${project.id}`} value={project.id}>
                            {project.enterpriseSetup.projectName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Category *
                    </label>
                    <select
                      required
                      value={formData.issue_category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {ISSUE_CATEGORIES.map(category => (
                        <option key={`category-${category}`} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Code *
                    </label>
                    <select
                      required
                      value={formData.issue_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, issue_code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.issue_category}
                    >
                      <option value="">Select Code</option>
                      {formData.issue_category && ISSUE_CODES[formData.issue_category]?.map(code => (
                        <option key={`code-${code}`} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter issue title"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Describe the issue in detail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Reported *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_reported}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_reported: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reported By *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.reported_by}
                      onChange={(e) => setFormData(prev => ({ ...prev, reported_by: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Assign to team/person"
                    />
                  </div>

                  {(formData.status === 'resolved' || formData.status === 'closed') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Resolved
                      </label>
                      <input
                        type="date"
                        value={formData.date_resolved || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_resolved: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {(formData.status === 'resolved' || formData.status === 'closed') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Notes
                    </label>
                    <textarea
                      value={formData.resolution_notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, resolution_notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Describe how the issue was resolved..."
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {formLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingIssue ? 'Updating...' : 'Reporting...'}
                      </div>
                    ) : (
                      editingIssue ? 'Update Issue' : 'Report Issue'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('list');
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}