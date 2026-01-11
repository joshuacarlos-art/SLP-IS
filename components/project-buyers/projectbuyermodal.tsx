'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Building, Calendar, Eye, Edit, Trash2, CheckCircle, XCircle, Store, X, RefreshCw, Plus } from 'lucide-react';

interface ProjectBuyer {
  _id?: string;
  project_id: string;
  project_name: string;
  buyer_name: string;
  type: string;
  engagement_start_date: string;
  verification_method: 'document' | 'site_visit' | 'third_party' | 'self_certified';
  active: boolean;
  contact_person?: string;
  contact_email?: string;
  contact_number?: string;
  contract_value?: number;
  project_status: 'planning' | 'active' | 'completed' | 'on_hold';
  address?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectBuyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: (project: ProjectBuyer) => void;
  onEditProject: (project: ProjectBuyer) => void;
  onDeleteProject: (projectId: string) => void;
  onAddProject: () => void;
}

export default function ProjectBuyerModal({
  isOpen,
  onClose,
  onViewDetails,
  onEditProject,
  onDeleteProject,
  onAddProject
}: ProjectBuyerModalProps) {
  const [projectBuyers, setProjectBuyers] = useState<ProjectBuyer[]>([]);
  const [filteredProjectBuyers, setFilteredProjectBuyers] = useState<ProjectBuyer[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    verification_method: '',
    active: '',
    search: ''
  });

  // Fetch project buyers data
  const fetchProjectBuyers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching project buyers data...');
      
      const response = await fetch('/api/project-buyers');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch project buyers: ${response.status}`);
      }

      const projectBuyersData = await response.json();
      
      console.log('✅ Project buyers fetched successfully:', projectBuyersData.length);
      setProjectBuyers(projectBuyersData);
      
    } catch (error: any) {
      console.error('❌ Error fetching project buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjectBuyers();
    }
  }, [isOpen]);

  // Filter project buyers
  useEffect(() => {
    const filtered = projectBuyers.filter(project => {
      const matchesType = !filters.type || project.type.toLowerCase().includes(filters.type.toLowerCase());
      const matchesStatus = !filters.status || project.project_status === filters.status;
      const matchesVerification = !filters.verification_method || project.verification_method === filters.verification_method;
      const matchesActive = filters.active === '' || 
        (filters.active === 'true' && project.active) || 
        (filters.active === 'false' && !project.active);
      const matchesSearch = !filters.search || 
        project.project_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.buyer_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (project.contact_person && project.contact_person.toLowerCase().includes(filters.search.toLowerCase()));
      
      return matchesType && matchesStatus && matchesVerification && matchesActive && matchesSearch;
    });
    
    setFilteredProjectBuyers(filtered);
  }, [projectBuyers, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      status: '',
      verification_method: '',
      active: '',
      search: ''
    });
  };

  const getProjectStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      planning: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      on_hold: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.planning;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      corporate: 'bg-blue-100 text-blue-800',
      government: 'bg-purple-100 text-purple-800',
      educational: 'bg-orange-100 text-orange-800',
      healthcare: 'bg-pink-100 text-pink-800',
      retail: 'bg-teal-100 text-teal-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type.toLowerCase()] || colors.other;
  };

  const getVerificationMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      document: 'bg-blue-100 text-blue-800',
      site_visit: 'bg-green-100 text-green-800',
      third_party: 'bg-purple-100 text-purple-800',
      self_certified: 'bg-yellow-100 text-yellow-800'
    };
    return colors[method] || colors.document;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Buyers Management</h2>
              <p className="text-gray-600 text-sm mt-1">
                Manage and view all project-based buyer engagements
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onAddProject}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add Project
              </button>
              <button
                onClick={fetchProjectBuyers}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw size={20} />
                Refresh
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Summary */}
          {!loading && projectBuyers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Store className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Projects</p>
                    <p className="text-2xl font-bold text-blue-900">{projectBuyers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-green-600">Active Projects</p>
                    <p className="text-2xl font-bold text-green-900">
                      {projectBuyers.filter(p => p.active).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <Building className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-purple-600">Project Types</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {new Set(projectBuyers.map(p => p.type)).size}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <div className="text-orange-600 font-bold">$</div>
                  <div>
                    <p className="text-sm font-medium text-orange-600">Total Contract Value</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {formatCurrency(projectBuyers.reduce((total, p) => total + (p.contract_value || 0), 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Project Filters & Search</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="corporate">Corporate</option>
                  <option value="government">Government</option>
                  <option value="educational">Educational</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
                <select
                  value={filters.verification_method}
                  onChange={(e) => handleFilterChange('verification_method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Methods</option>
                  <option value="document">Document</option>
                  <option value="site_visit">Site Visit</option>
                  <option value="third_party">Third Party</option>
                  <option value="self_certified">Self Certified</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
                <select
                  value={filters.active}
                  onChange={(e) => handleFilterChange('active', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search projects..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Showing {filteredProjectBuyers.length} of {projectBuyers.length} projects
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Project Buyers Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Project Buyers...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buyer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engagement Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verification Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProjectBuyers.map((project) => (
                      <tr key={project.project_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.project_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{project.project_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{project.buyer_name}</div>
                          {project.contact_person && (
                            <div className="text-xs text-gray-500">{project.contact_person}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(project.type)}`}>
                            {project.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(project.engagement_start_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationMethodColor(project.verification_method)}`}>
                            {project.verification_method.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {project.active ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${project.active ? 'text-green-800' : 'text-red-800'}`}>
                              {project.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => onViewDetails(project)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => onEditProject(project)}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                              title="Edit Project"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => onDeleteProject(project.project_id)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              title="Delete Project"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {filteredProjectBuyers.map((project) => (
                  <div key={project.project_id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.project_name}</h3>
                        <p className="text-xs text-gray-500">ID: {project.project_id}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProjectStatusColor(project.project_status)}`}>
                        {project.project_status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Buyer:</span>
                        <span className="font-medium">{project.buyer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(project.type)}`}>
                          {project.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span>{formatDate(project.engagement_start_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verification:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationMethodColor(project.verification_method)}`}>
                          {project.verification_method.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <div className="flex items-center gap-1">
                          {project.active ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-xs">{project.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => onViewDetails(project)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => onEditProject(project)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.project_id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProjectBuyers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Store size={64} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No project buyers found</h3>
                  <p className="text-gray-500 mb-4">
                    {projectBuyers.length === 0 
                      ? "Get started by adding your first project buyer"
                      : "No projects match your current filters"
                    }
                  </p>
                  {projectBuyers.length === 0 && (
                    <button
                      onClick={onAddProject}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add First Project
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}