'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Search, Edit, Trash2, Plus, X, Download, Filter, Award, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface GoodPractice {
  id: string;
  project_id: string;
  project_name: string;
  practice_code: string;
  category: string;
  description: string;
  date_implemented: string;
  documented_by: string;
  impact_rating: number; // 1-5 scale
  evidence: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  assessment_id?: string; // Link to related assessment
}

interface Project {
  id: string;
  enterpriseSetup?: {
    projectName?: string;
    enterpriseType?: string;
  };
  projectName?: string;
}

interface FinalAssessment {
  id: string;
  project_name: string;
  total_rating: number;
}

// ==================== ACTIVITY LOGGING FUNCTIONS ====================
const logGoodPracticeActivity = {
  // View actions
  viewList: async () => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'VIEW_GOOD_PRACTICES_LIST',
          module: 'Good Practices',
          details: 'User viewed the good practices list',
          status: 'success'
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Create actions
  createSuccess: async (practiceCode: string, projectName: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'CREATE_GOOD_PRACTICE',
          module: 'Good Practices',
          details: `Created good practice: ${practiceCode} for project: ${projectName}`,
          status: 'success',
          metadata: { practiceCode, projectName }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  createError: async (practiceCode: string, error: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'CREATE_GOOD_PRACTICE',
          module: 'Good Practices',
          details: `Failed to create good practice: ${practiceCode}`,
          status: 'error',
          metadata: { practiceCode, error }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Update actions
  updateSuccess: async (practiceCode: string, projectName: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'UPDATE_GOOD_PRACTICE',
          module: 'Good Practices',
          details: `Updated good practice: ${practiceCode} for project: ${projectName}`,
          status: 'success',
          metadata: { practiceCode, projectName }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  updateError: async (practiceCode: string, error: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'UPDATE_GOOD_PRACTICE',
          module: 'Good Practices',
          details: `Failed to update good practice: ${practiceCode}`,
          status: 'error',
          metadata: { practiceCode, error }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Delete actions
  deleteSuccess: async (practiceCode: string, projectName: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'DELETE_GOOD_PRACTICE',
          module: 'Good Practices',
          details: `Deleted good practice: ${practiceCode} for project: ${projectName}`,
          status: 'warning',
          metadata: { practiceCode, projectName }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  deleteError: async (practiceCode: string, error: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'DELETE_GOOD_PRACTICE',
          module: 'Good Practices',
          details: `Failed to delete good practice: ${practiceCode}`,
          status: 'error',
          metadata: { practiceCode, error }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Search and filter actions
  search: async (searchTerm: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'SEARCH_GOOD_PRACTICES',
          module: 'Good Practices',
          details: `User searched good practices with term: ${searchTerm}`,
          status: 'success',
          metadata: { searchTerm }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  filter: async (filterType: string, filterValue: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'FILTER_GOOD_PRACTICES',
          module: 'Good Practices',
          details: `User filtered good practices by ${filterType}: ${filterValue}`,
          status: 'success',
          metadata: { filterType, filterValue }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Export actions
  exportData: async (format: string, count: number) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'EXPORT_GOOD_PRACTICES',
          module: 'Good Practices',
          details: `User exported ${count} good practices as ${format}`,
          status: 'success',
          metadata: { format, count }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Status change actions
  statusChange: async (practiceCode: string, oldStatus: string, newStatus: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'UPDATE_PRACTICE_STATUS',
          module: 'Good Practices',
          details: `Changed practice ${practiceCode} status from ${oldStatus} to ${newStatus}`,
          status: 'success',
          metadata: { practiceCode, oldStatus, newStatus }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Error logging
  loadError: async (error: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'LOAD_GOOD_PRACTICES',
          module: 'Good Practices',
          details: `Failed to load good practices: ${error}`,
          status: 'error',
          metadata: { error }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Generic error logger
  logError: async (action: string, details: string, error: string, metadata?: Record<string, any>) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          module: 'Good Practices',
          details: `${details}: ${error}`,
          status: 'error',
          metadata: { ...metadata, error }
        }),
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }
  }
};

export default function GoodPracticesPage() {
  const [practices, setPractices] = useState<GoodPractice[]>([]);
  const [filteredPractices, setFilteredPractices] = useState<GoodPractice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assessments, setAssessments] = useState<FinalAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPractice, setEditingPractice] = useState<GoodPractice | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [filters, setFilters] = useState({
    project_id: '',
    category: '',
    status: '',
    search: '',
    impact_rating: ''
  });

  const [formData, setFormData] = useState({
    project_id: '',
    practice_code: '',
    category: '',
    description: '',
    date_implemented: new Date().toISOString().split('T')[0],
    documented_by: '',
    impact_rating: 3,
    evidence: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    assessment_id: ''
  });

  const categories = [
    'Process Improvement',
    'Quality Assurance',
    'Team Collaboration',
    'Resource Management',
    'Risk Management',
    'Innovation',
    'Sustainability',
    'Customer Service'
  ];

  const impactRatings = [
    { value: 1, label: 'Low', color: 'text-gray-500' },
    { value: 2, label: 'Moderate', color: 'text-blue-500' },
    { value: 3, label: 'Significant', color: 'text-green-500' },
    { value: 4, label: 'High', color: 'text-orange-500' },
    { value: 5, label: 'Exceptional', color: 'text-red-500' }
  ];

  const getProjectName = (project: Project): string => {
    return project?.enterpriseSetup?.projectName || project?.projectName || 'Unknown Project';
  };

  const fetchPractices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/good-practices');
      if (res.ok) {
        const data = await res.json();
        setPractices(data);
        await logGoodPracticeActivity.viewList();
      } else {
        throw new Error('Failed to fetch practices');
      }
    } catch (err) {
      console.error('Error fetching practices:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      await logGoodPracticeActivity.loadError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        const safe = data.map((p: any) => ({
          id: p.id || p._id,
          enterpriseSetup: {
            projectName: p.enterpriseSetup?.projectName || p.projectName,
            enterpriseType: p.enterpriseSetup?.enterpriseType || p.enterpriseType
          },
          projectName: p.enterpriseSetup?.projectName || p.projectName
        }));
        setProjects(safe);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await fetch('/api/final-assessments');
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (err) {
      console.error('Error fetching assessments:', err);
    }
  };

  useEffect(() => {
    fetchPractices();
    fetchProjects();
    fetchAssessments();
  }, []);

  useEffect(() => {
    let filtered = practices;

    if (filters.project_id) {
      filtered = filtered.filter(p => p.project_id === filters.project_id);
    }
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.impact_rating) {
      filtered = filtered.filter(p => p.impact_rating === parseInt(filters.impact_rating));
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.practice_code.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.documented_by.toLowerCase().includes(s) ||
        p.project_name.toLowerCase().includes(s)
      );
    }

    setFilteredPractices(filtered);
  }, [practices, filters]);

  // Log filter changes
  useEffect(() => {
    if (filters.search) {
      logGoodPracticeActivity.search(filters.search);
    }
  }, [filters.search]);

  useEffect(() => {
    if (filters.project_id) {
      const projectName = projects.find(p => p.id === filters.project_id)?.projectName || filters.project_id;
      logGoodPracticeActivity.filter('project', projectName);
    }
  }, [filters.project_id, projects]);

  useEffect(() => {
    if (filters.category) {
      logGoodPracticeActivity.filter('category', filters.category);
    }
  }, [filters.category]);

  useEffect(() => {
    if (filters.status) {
      logGoodPracticeActivity.filter('status', filters.status);
    }
  }, [filters.status]);

  useEffect(() => {
    if (filters.impact_rating) {
      const ratingLabel = impactRatings.find(r => r.value === parseInt(filters.impact_rating))?.label || filters.impact_rating;
      logGoodPracticeActivity.filter('impact_rating', ratingLabel);
    }
  }, [filters.impact_rating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPractice ? `/api/good-practices?id=${editingPractice.id}` : '/api/good-practices';
      const method = editingPractice ? 'PUT' : 'POST';

      // Get project name for the selected project
      const selectedProject = projects.find(p => p.id === formData.project_id);
      const project_name = selectedProject ? getProjectName(selectedProject) : '';

      const payload = {
        ...formData,
        project_name
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (editingPractice) {
          await logGoodPracticeActivity.updateSuccess(formData.practice_code, project_name);
        } else {
          await logGoodPracticeActivity.createSuccess(formData.practice_code, project_name);
        }
        
        fetchPractices();
        resetForm();
        alert(editingPractice ? 'Practice updated!' : 'Practice added!');
      } else {
        throw new Error('Failed to save practice');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      if (editingPractice) {
        await logGoodPracticeActivity.updateError(formData.practice_code, errorMessage);
      } else {
        await logGoodPracticeActivity.createError(formData.practice_code, errorMessage);
      }
      alert('Error saving practice');
    }
  };

  const handleDelete = async (practice: GoodPractice) => {
    if (!confirm('Are you sure you want to delete this practice?')) return;
    try {
      const res = await fetch(`/api/good-practices?id=${practice.id}`, { method: 'DELETE' });
      if (res.ok) {
        await logGoodPracticeActivity.deleteSuccess(practice.practice_code, practice.project_name);
        fetchPractices();
        alert('Practice deleted!');
      } else {
        throw new Error('Failed to delete practice');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      await logGoodPracticeActivity.deleteError(practice.practice_code, errorMessage);
      alert('Error deleting practice');
    }
  };

  const handleEdit = (practice: GoodPractice) => {
    setEditingPractice(practice);
    setFormData({
      project_id: practice.project_id,
      practice_code: practice.practice_code,
      category: practice.category,
      description: practice.description,
      date_implemented: practice.date_implemented,
      documented_by: practice.documented_by,
      impact_rating: practice.impact_rating,
      evidence: practice.evidence,
      status: practice.status,
      assessment_id: practice.assessment_id || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      practice_code: '',
      category: '',
      description: '',
      date_implemented: new Date().toISOString().split('T')[0],
      documented_by: '',
      impact_rating: 3,
      evidence: '',
      status: 'draft',
      assessment_id: ''
    });
    setEditingPractice(null);
    setShowForm(false);
  };

  const generatePracticeCode = () => {
    const timestamp = new Date().getTime().toString().slice(-4);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `GP-${timestamp}-${random}`;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.draft;
  };

  const getImpactStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleStatusChange = async (practice: GoodPractice, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const res = await fetch(`/api/good-practices?id=${practice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...practice, status: newStatus })
      });

      if (res.ok) {
        await logGoodPracticeActivity.statusChange(practice.practice_code, practice.status, newStatus);
        fetchPractices();
        alert('Practice status updated!');
      } else {
        throw new Error('Failed to update practice status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      await logGoodPracticeActivity.logError(
        'UPDATE_PRACTICE_STATUS',
        `Failed to update practice ${practice.practice_code} status`,
        errorMessage,
        { practiceCode: practice.practice_code, oldStatus: practice.status, newStatus }
      );
      alert('Error updating practice status');
    }
  };

  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      
      const headers = ['Practice Code', 'Project', 'Category', 'Description', 'Date Implemented', 'Documented By', 'Impact Rating', 'Status'];
      const csvData = filteredPractices.map(p => [
        p.practice_code,
        p.project_name,
        p.category,
        p.description,
        p.date_implemented,
        p.documented_by,
        p.impact_rating,
        p.status
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `good-practices-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      await logGoodPracticeActivity.exportData('CSV', filteredPractices.length);
    } catch (error) {
      console.error('Error exporting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await logGoodPracticeActivity.logError(
        'EXPORT_GOOD_PRACTICES',
        'Failed to export good practices data',
        errorMessage
      );
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Good Practices</h1>
              <p className="text-gray-600 text-sm">Document and share successful practices</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              disabled={exportLoading || filteredPractices.length === 0}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
            <Button
  onClick={() => {
    setFormData(prev => ({ ...prev, practice_code: generatePracticeCode() }));
    setShowForm(true);
  }}
  size="sm"
  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
>
  <Plus className="h-4 w-4" />
  Add Practice
</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lightbulb className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{practices.length}</p>
                <p className="text-sm text-gray-600">Total Practices</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {practices.filter(p => p.status === 'published').length}
                </p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {practices.filter(p => p.impact_rating >= 4).length}
                </p>
                <p className="text-sm text-gray-600">High Impact</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Filter className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(practices.map(p => p.category)).size}
                </p>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filters.project_id}
                onChange={e => setFilters({ ...filters, project_id: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{getProjectName(p)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={e => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Impact Rating</label>
              <select
                value={filters.impact_rating}
                onChange={e => setFilters({ ...filters, impact_rating: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Ratings</option>
                {impactRatings.map(rating => (
                  <option key={rating.value} value={rating.value}>
                    {rating.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search practices..."
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setFilters({ project_id: '', category: '', status: '', search: '', impact_rating: '' })}
              className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Practices Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 text-sm mt-2">Loading practices...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Practice Code</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Impact</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPractices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                        <Lightbulb className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">No good practices found</p>
                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, practice_code: generatePracticeCode() }));
                            setShowForm(true);
                          }}
                          className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Add your first practice
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredPractices.map(practice => (
                      <tr key={practice.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-900 text-xs">{practice.practice_code}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium text-gray-900">{practice.project_name}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            {practice.category}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={practice.description}>
                            {practice.description}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-semibold ${impactRatings.find(r => r.value === practice.impact_rating)?.color}`}>
                              {getImpactStars(practice.impact_rating)}
                            </span>
                            <span className="text-xs text-gray-500">({practice.impact_rating}/5)</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={practice.status}
                            onChange={(e) => handleStatusChange(practice, e.target.value as any)}
                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-green-500 ${getStatusColor(practice.status)}`}
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {new Date(practice.date_implemented).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(practice)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit practice"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(practice)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete practice"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingPractice ? 'Edit Good Practice' : 'Add New Good Practice'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-2">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                    <select
                      required
                      value={formData.project_id}
                      onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {getProjectName(project)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Practice Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.practice_code}
                      onChange={e => setFormData({ ...formData, practice_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., GP-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Impact Rating</label>
                    <select
                      value={formData.impact_rating}
                      onChange={e => setFormData({ ...formData, impact_rating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {impactRatings.map(rating => (
                        <option key={rating.value} value={rating.value}>
                          {rating.label} ({rating.value}/5)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Implemented *</label>
                    <input
                      type="date"
                      required
                      value={formData.date_implemented}
                      onChange={e => setFormData({ ...formData, date_implemented: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Documented By *</label>
                    <input
                      type="text"
                      required
                      value={formData.documented_by}
                      onChange={e => setFormData({ ...formData, documented_by: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Related Assessment</label>
                    <select
                      value={formData.assessment_id}
                      onChange={e => setFormData({ ...formData, assessment_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">No Assessment Link</option>
                      {assessments.map(assessment => (
                        <option key={assessment.id} value={assessment.id}>
                          {assessment.project_name} ({assessment.total_rating}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe the good practice, its implementation, and outcomes..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evidence/Supporting Details</label>
                  <textarea
                    value={formData.evidence}
                    onChange={e => setFormData({ ...formData, evidence: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Any supporting evidence, metrics, or additional context..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                <Button
  type="submit"
  size="sm"
  className="bg-green-600 hover:bg-green-700"
>
  {editingPractice ? 'Update Practice' : 'Add Practice'}
</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}