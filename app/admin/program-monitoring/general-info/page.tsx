'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, BarChart3, MapPin, Users, Calendar, ChevronDown, AlertCircle, RefreshCw, Package } from 'lucide-react';
import AssetComponentModal from '@/components/asset/AssetComponentModal';

// Inline Activity Logger - Copy of your activity logger functionality
const createActivityLogger = () => {
  const getCurrentUser = () => {
    if (typeof window === 'undefined') return 'System';
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        return user.name || user.username || user.email || 'Authenticated User';
      }
      return 'System';
    } catch {
      return 'System';
    }
  };

  const logToConsole = (module: string, action: string, details: string, status: 'success' | 'error' | 'warning', user?: string, metadata?: any) => {
    const styles = {
      success: 'color: green; font-weight: bold;',
      error: 'color: red; font-weight: bold;',
      warning: 'color: orange; font-weight: bold;',
    };

    console.groupCollapsed(
      `%c${module}%c - %c${action}`,
      'color: blue; font-weight: bold;',
      'color: gray;',
      styles[status]
    );
    console.log('User:', user || getCurrentUser());
    console.log('Details:', details);
    console.log('Timestamp:', new Date().toLocaleString());
    console.log('Status:', status);
    if (metadata) {
      console.log('Metadata:', metadata);
    }
    console.groupEnd();
  };

  const logActivity = async (module: string, action: string, details: string, status: 'success' | 'error' | 'warning', user?: string, metadata?: any) => {
    const activityData = {
      user: user || getCurrentUser(),
      action,
      module,
      details,
      status,
      metadata,
      timestamp: new Date(),
      ipAddress: '192.168.1.100' // Placeholder
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      logToConsole(module, action, details, status, user, metadata);
    }

    // Save to localStorage as fallback
    try {
      if (typeof window !== 'undefined') {
        const existingActivities = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        const updatedActivities = [activityData, ...existingActivities].slice(0, 1000);
        localStorage.setItem('activityLogs', JSON.stringify(updatedActivities));
      }
    } catch (error) {
      console.error('Error saving activity to localStorage:', error);
    }

    // Try to send to API
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      });
    } catch (error) {
      console.warn('Failed to send activity to API, using localStorage only');
    }
  };

  return {
    logSuccess: (module: string, action: string, details: string, user?: string, metadata?: any) => 
      logActivity(module, action, details, 'success', user, metadata),
    
    logError: (module: string, action: string, details: string, user?: string, metadata?: any) => 
      logActivity(module, action, details, 'error', user, metadata),
    
    logWarning: (module: string, action: string, details: string, user?: string, metadata?: any) => 
      logActivity(module, action, details, 'warning', user, metadata),
    
    logDashboardAccess: (user?: string) => 
      logActivity('Dashboard', 'ACCESS_DASHBOARD', 'User accessed the main dashboard overview', 'success', user),
    
    logProjectCreate: (projectName: string, user?: string, metadata?: any) =>
      logActivity('General Projects', 'CREATE_PROJECT', `Created new project: ${projectName}`, 'success', user, metadata),
    
    logProjectSearch: (searchTerm: string, user?: string, metadata?: any) =>
      logActivity('General Projects', 'SEARCH_PROJECTS', `Searched projects with term: ${searchTerm}`, 'success', user, metadata),
    
    logProjectFilter: (filterType: string, filterValue: string, user?: string, metadata?: any) =>
      logActivity('General Projects', 'FILTER_PROJECTS', `Filtered projects by ${filterType}: ${filterValue}`, 'success', user, metadata)
  };
};

// Create logger instance
const activityLogger = createActivityLogger();
const { logSuccess, logError, logWarning, logDashboardAccess } = activityLogger;

interface GeneralProject {
  _id?: string;
  project_id: string;
  project_name: string;
  participant_name: string;
  barangay: string;
  city_municipality: string;
  province: string;
  enterprise_type: string;
  association_name: string;
  monitoring_date: string;
  project_status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  budget_allocation?: number;
  start_date?: string;
  estimated_completion?: string;
  project_description?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GeneralInfoStats {
  totalProjects: number;
  totalAssociations: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  projectsThisMonth: number;
  projectsByStatus: {
    planning: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
  projectsByBarangay: { barangay: string; count: number }[];
}

interface Association {
  _id: string;
  name: string;
  location: string;
}

interface Caretaker {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  extension?: string;
  slpAssociation: string;
}

export default function GeneralInfoPage() {
  const [projects, setProjects] = useState<GeneralProject[]>([]);
  const [stats, setStats] = useState<GeneralInfoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Asset management states
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [selectedProjectForAssets, setSelectedProjectForAssets] = useState<GeneralProject | null>(null);

  // Dropdown data
  const [dropdownData, setDropdownData] = useState({
    projects: [] as string[],
    associations: [] as Association[],
    participants: [] as Caretaker[]
  });

  const [showDropdown, setShowDropdown] = useState({
    project: false,
    participant: false,
    association: false
  });

  const [filters, setFilters] = useState({
    barangay: '',
    status: '',
    participant_name: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    project_name: '',
    participant_name: '',
    barangay: '',
    city_municipality: '',
    province: '',
    enterprise_type: '',
    association_name: '',
    monitoring_date: new Date().toISOString().split('T')[0],
    project_status: 'planning' as const,
    budget_allocation: 0,
    start_date: '',
    estimated_completion: '',
    project_description: '',
    contact_person: '',
    contact_number: '',
    email: ''
  });

  // Get current user for activity logging
  const getCurrentUser = () => {
    if (typeof window === 'undefined') return 'System';
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        return user.name || user.username || user.email || 'Authenticated User';
      }
      return 'System';
    } catch {
      return 'System';
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    // Log page access
    logDashboardAccess(getCurrentUser());
  }, []);

  // Fetch dropdown data when form opens
  useEffect(() => {
    if (showForm) {
      fetchDropdownData();
    }
  }, [showForm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🔄 Fetching general projects data...');
      
      const [projectsRes, statsRes] = await Promise.all([
        fetch('/api/general-projects'),
        fetch('/api/general-projects?stats=true')
      ]);

      if (!projectsRes.ok) {
        throw new Error(`Failed to fetch projects: ${projectsRes.status}`);
      }
      if (!statsRes.ok) {
        throw new Error(`Failed to fetch stats: ${statsRes.status}`);
      }

      const projectsData = await projectsRes.json();
      const statsData = await statsRes.json();

      console.log('✅ Data fetched successfully:', {
        projects: projectsData.length,
        stats: statsData
      });

      setProjects(projectsData);
      setStats(statsData);
      
      // Log successful data fetch
      logSuccess(
        'General Projects',
        'FETCH_DATA',
        `Successfully loaded ${projectsData.length} projects and statistics`,
        getCurrentUser(),
        { projectCount: projectsData.length, stats: statsData }
      );
      
    } catch (error: any) {
      console.error('❌ Error fetching data:', error);
      setConnectionError(error.message || 'Cannot connect to database. Please check your connection.');
      
      // Set empty data for UI
      setProjects([]);
      setStats({
        totalProjects: 0,
        totalAssociations: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        projectsThisMonth: 0,
        projectsByStatus: { planning: 0, ongoing: 0, completed: 0, cancelled: 0 },
        projectsByBarangay: []
      });

      // Log error
      logError(
        'General Projects',
        'FETCH_DATA',
        `Failed to load projects data: ${error.message}`,
        getCurrentUser(),
        { error: error.message }
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      console.log('🔄 Fetching dropdown data...');
      
      const [projectsRes, associationsRes, caretakersRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/associations'),
        fetch('/api/caretakers')
      ]);

      const projectsData = projectsRes.ok ? await projectsRes.json() : [];
      const associationsData = associationsRes.ok ? await associationsRes.json() : [];
      const caretakersData = caretakersRes.ok ? await caretakersRes.json() : [];

      setDropdownData({
        projects: extractProjectNames(projectsData),
        associations: extractAssociations(associationsData),
        participants: extractCaretakers(caretakersData)
      });

      console.log('✅ Dropdown data loaded:', {
        projects: dropdownData.projects.length,
        associations: dropdownData.associations.length,
        participants: dropdownData.participants.length
      });

    } catch (error) {
      console.error('❌ Error fetching dropdown data:', error);
      logError(
        'General Projects',
        'FETCH_DROPDOWN_DATA',
        'Failed to load dropdown data for project form',
        getCurrentUser(),
        { error }
      );
    }
  };

  // Helper functions to extract data
  const extractProjectNames = (data: any): string[] => {
    if (!Array.isArray(data)) return [];
    return data
      .map(item => item.projectName || item.project_name || item.enterpriseSetup?.projectName)
      .filter(Boolean)
      .filter((name, index, arr) => arr.indexOf(name) === index);
  };

  const extractAssociations = (data: any): Association[] => {
    if (!Array.isArray(data)) return [];
    return data.filter(assoc => assoc.name && assoc.location);
  };

  const extractCaretakers = (data: any): Caretaker[] => {
    if (!Array.isArray(data)) return [];
    return data.filter(caretaker => caretaker.firstName && caretaker.lastName);
  };

  const handleAssociationSelect = (associationName: string) => {
    const selectedAssociation = dropdownData.associations.find(assoc => assoc.name === associationName);
    
    if (selectedAssociation) {
      const locationParts = selectedAssociation.location.split(', ').map(part => part.trim());
      
      let barangay = '';
      let city_municipality = '';
      let province = '';

      if (locationParts.length >= 3) {
        barangay = locationParts[0];
        city_municipality = locationParts[1];
        province = locationParts[2];
      } else if (locationParts.length === 2) {
        barangay = locationParts[0];
        city_municipality = locationParts[1];
      } else if (locationParts.length === 1) {
        barangay = locationParts[0];
      }

      let enterprise_type = '';
      const associationNameLower = associationName.toLowerCase();
      
      if (associationNameLower.includes('farm') || associationNameLower.includes('agricultur')) {
        enterprise_type = 'Agriculture';
      } else if (associationNameLower.includes('fish') || associationNameLower.includes('aqua')) {
        enterprise_type = 'Fishery';
      } else if (associationNameLower.includes('live') || associationNameLower.includes('animal')) {
        enterprise_type = 'Livestock';
      } else if (associationNameLower.includes('craft') || associationNameLower.includes('handicraft')) {
        enterprise_type = 'Handicraft';
      } else if (associationNameLower.includes('retail') || associationNameLower.includes('store')) {
        enterprise_type = 'Retail';
      } else if (associationNameLower.includes('service')) {
        enterprise_type = 'Service';
      } else {
        enterprise_type = 'General Enterprise';
      }

      setFormData(prev => ({
        ...prev,
        association_name: associationName,
        barangay,
        city_municipality,
        province,
        enterprise_type
      }));
    }
    
    setShowDropdown(prev => ({ ...prev, association: false }));
  };

  const handleParticipantSelect = (participantName: string) => {
    const selectedCaretaker = dropdownData.participants.find(caretaker => 
      `${caretaker.firstName} ${caretaker.middleName || ''} ${caretaker.lastName}`.trim().replace(/\s+/g, ' ') === participantName
    );

    if (selectedCaretaker && selectedCaretaker.slpAssociation) {
      const participantAssociation = dropdownData.associations.find(assoc => 
        assoc._id === selectedCaretaker.slpAssociation
      );

      if (participantAssociation) {
        handleAssociationSelect(participantAssociation.name);
      }
    }

    setFormData(prev => ({ ...prev, participant_name: participantName }));
    setShowDropdown(prev => ({ ...prev, participant: false }));
  };

  // Handle viewing assets for a project
  const handleViewAssets = (project: GeneralProject) => {
    setSelectedProjectForAssets(project);
    setShowAssetModal(true);
    
    // Log asset view
    logSuccess(
      'General Projects',
      'VIEW_ASSETS',
      `Viewed assets for project: ${project.project_name}`,
      getCurrentUser(),
      { projectId: project.project_id, projectName: project.project_name }
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const requiredFields = [
        'project_name', 'participant_name', 'barangay', 
        'city_municipality', 'province', 'enterprise_type', 'association_name'
      ];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        setFormError(errorMsg);
        
        // Log validation error
        logError(
          'General Projects',
          'CREATE_PROJECT_VALIDATION',
          errorMsg,
          getCurrentUser(),
          { missingFields, formData }
        );
        
        setFormLoading(false);
        return;
      }

      const response = await fetch('/api/general-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setShowForm(false);
        resetForm();
        fetchData();
        
        // Log successful project creation using the specific method
        activityLogger.logProjectCreate(
          formData.project_name,
          getCurrentUser(),
          { 
            participant: formData.participant_name,
            association: formData.association_name,
            status: formData.project_status,
            budget: formData.budget_allocation
          }
        );
        
        alert('Project added successfully!');
      } else {
        const errorMsg = result.error || 'Failed to add project';
        setFormError(errorMsg);
        
        // Log creation error
        logError(
          'General Projects',
          'CREATE_PROJECT',
          errorMsg,
          getCurrentUser(),
          { formData, apiError: result.error }
        );
      }
    } catch (error: any) {
      console.error('Error adding project:', error);
      const errorMsg = 'Error adding project. Please check your connection.';
      setFormError(errorMsg);
      
      // Log network error
      logError(
        'General Projects',
        'CREATE_PROJECT',
        `Network error: ${error.message}`,
        getCurrentUser(),
        { formData, error: error.message }
      );
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      project_name: '',
      participant_name: '',
      barangay: '',
      city_municipality: '',
      province: '',
      enterprise_type: '',
      association_name: '',
      monitoring_date: new Date().toISOString().split('T')[0],
      project_status: 'planning',
      budget_allocation: 0,
      start_date: '',
      estimated_completion: '',
      project_description: '',
      contact_person: '',
      contact_number: '',
      email: ''
    });
    setShowDropdown({ project: false, participant: false, association: false });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Log filter activity if search term is used
    if (key === 'search' && value.trim()) {
      activityLogger.logProjectSearch(
        value,
        getCurrentUser(),
        { filters }
      );
    } else if (key === 'status' && value) {
      activityLogger.logProjectFilter(
        'status',
        value,
        getCurrentUser(),
        { filters }
      );
    } else if (key === 'barangay' && value) {
      activityLogger.logProjectFilter(
        'barangay',
        value,
        getCurrentUser(),
        { filters }
      );
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search with filters:', filters);
    
    // Log search execution
    logSuccess(
      'General Projects',
      'EXECUTE_SEARCH',
      'Executed project search with applied filters',
      getCurrentUser(),
      { filters }
    );
  };

  const handleClearFilters = () => {
    setFilters({
      barangay: '',
      status: '',
      participant_name: '',
      search: ''
    });
    
    // Log filter clearance
    logSuccess(
      'General Projects',
      'CLEAR_FILTERS',
      'Cleared all project filters',
      getCurrentUser()
    );
  };

  const handleRefresh = () => {
    // Log manual refresh
    logSuccess(
      'General Projects',
      'MANUAL_REFRESH',
      'Manually refreshed projects data',
      getCurrentUser()
    );
    fetchData();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading General Information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">General Projects Information</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive overview and management of all community projects
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw size={20} />
                Refresh
              </button>
              <button
                onClick={() => {
                  setShowForm(true);
                  // Log form opening
                  logSuccess(
                    'General Projects',
                    'OPEN_CREATE_FORM',
                    'Opened create project form',
                    getCurrentUser()
                  );
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add New Project
              </button>
            </div>
          </div>
        </div>

        {/* Connection Error Alert */}
        {connectionError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-red-600 font-medium">Database Connection Error</p>
                <p className="text-red-600 text-sm">{connectionError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Associations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAssociations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalBudget)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Distribution */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(stats.projectsByStatus).map(([status, count]) => (
              <div key={status} className="bg-white p-4 rounded-lg border">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
          </div>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
              <select
                value={filters.barangay}
                onChange={(e) => handleFilterChange('barangay', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Barangays</option>
                {stats?.projectsByBarangay.map((item) => (
                  <option key={item.barangay} value={item.barangay}>
                    {item.barangay} ({item.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="planning">Planning</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Participant</label>
              <input
                type="text"
                value={filters.participant_name}
                onChange={(e) => handleFilterChange('participant_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Participant name"
              />
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

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.project_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {project.project_name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.project_status)}`}>
                    {project.project_status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.project_description || 'No description available'}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Participant:</span>
                    <span className="font-medium">{project.participant_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Barangay:</span>
                    <span className="font-medium">{project.barangay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Association:</span>
                    <span className="font-medium">{project.association_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Enterprise:</span>
                    <span className="font-medium">{project.enterprise_type}</span>
                  </div>
                  {project.budget_allocation && project.budget_allocation > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Budget:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(project.budget_allocation)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Monitoring: {formatDate(project.monitoring_date)}</span>
                    <span>ID: {project.project_id}</span>
                  </div>
                </div>
              </div>
              
              {/* Add View Assets button in the card footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => {
                    // Log project details view
                    logSuccess(
                      'General Projects',
                      'VIEW_PROJECT_DETAILS',
                      `Viewed details for project: ${project.project_name}`,
                      getCurrentUser(),
                      { projectId: project.project_id, projectName: project.project_name }
                    );
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleViewAssets(project)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                >
                  <Package size={16} />
                  View Assets
                </button>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && !connectionError && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BarChart3 size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first project</p>
            <button
              onClick={() => {
                setShowForm(true);
                logSuccess(
                  'General Projects',
                  'OPEN_CREATE_FORM_FROM_EMPTY',
                  'Opened create project form from empty state',
                  getCurrentUser()
                );
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Project
            </button>
          </div>
        )}

        {/* Asset Management Modal */}
        <AssetComponentModal
          isOpen={showAssetModal}
          onClose={() => {
            setShowAssetModal(false);
            setSelectedProjectForAssets(null);
            // Log modal closure
            logSuccess(
              'General Projects',
              'CLOSE_ASSET_MODAL',
              'Closed asset management modal',
              getCurrentUser()
            );
          }}
          project={selectedProjectForAssets}
        />

        {/* Add Project Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Add New Project</h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                      // Log form cancellation
                      logWarning(
                        'General Projects',
                        'CANCEL_CREATE_FORM',
                        'Cancelled project creation form',
                        getCurrentUser()
                      );
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-pulse">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      {formError}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project Name with Dropdown */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.project_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                        onFocus={() => setShowDropdown(prev => ({ ...prev, project: true }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Select or type project name"
                      />
                      <ChevronDown 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                        size={20}
                        onClick={() => setShowDropdown(prev => ({ ...prev, project: !prev.project }))}
                      />
                    </div>
                    {showDropdown.project && dropdownData.projects.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                        {dropdownData.projects.map((name) => (
                          <div
                            key={name}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 hover:translate-x-1 transform"
                            onClick={() => setFormData(prev => ({ ...prev, project_name: name }))}
                          >
                            <span className="text-gray-700">{name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Participant Name with Dropdown */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participant Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.participant_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, participant_name: e.target.value }))}
                        onFocus={() => setShowDropdown(prev => ({ ...prev, participant: true }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Select participant name"
                      />
                      <ChevronDown 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                        size={20}
                        onClick={() => setShowDropdown(prev => ({ ...prev, participant: !prev.participant }))}
                      />
                    </div>
                    {showDropdown.participant && dropdownData.participants.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                        {dropdownData.participants.map((caretaker) => {
                          const fullName = `${caretaker.firstName} ${caretaker.middleName || ''} ${caretaker.lastName}`.trim().replace(/\s+/g, ' ');
                          return (
                            <div
                              key={caretaker._id}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 hover:translate-x-1 transform"
                              onClick={() => handleParticipantSelect(fullName)}
                            >
                              <span className="text-gray-700">{fullName}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Association Name with Dropdown */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Association Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.association_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, association_name: e.target.value }))}
                        onFocus={() => setShowDropdown(prev => ({ ...prev, association: true }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Select association name"
                      />
                      <ChevronDown 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                        size={20}
                        onClick={() => setShowDropdown(prev => ({ ...prev, association: !prev.association }))}
                      />
                    </div>
                    {showDropdown.association && dropdownData.associations.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                        {dropdownData.associations.map((association) => (
                          <div
                            key={association._id}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 hover:translate-x-1 transform"
                            onClick={() => handleAssociationSelect(association.name)}
                          >
                            <div>
                              <span className="text-gray-700 font-medium">{association.name}</span>
                              <p className="text-xs text-gray-500 mt-1">{association.location}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barangay *
                    </label>
                    <input
                      type="text"
                      required
                      readOnly
                      value={formData.barangay}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                      placeholder="Auto-filled from association"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City/Municipality *
                    </label>
                    <input
                      type="text"
                      required
                      readOnly
                      value={formData.city_municipality}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                      placeholder="Auto-filled from association"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <input
                      type="text"
                      required
                      readOnly
                      value={formData.province}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                      placeholder="Auto-filled from association"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enterprise Type *
                    </label>
                    <input
                      type="text"
                      required
                      readOnly
                      value={formData.enterprise_type}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                      placeholder="Auto-filled from association"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Status *
                    </label>
                    <select
                      required
                      value={formData.project_status}
                      onChange={(e) => setFormData(prev => ({ ...prev, project_status: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="planning">Planning</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monitoring Date
                    </label>
                    <input
                      type="date"
                      value={formData.monitoring_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, monitoring_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Allocation
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.budget_allocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_allocation: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description
                  </label>
                  <textarea
                    value={formData.project_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Enter project description..."
                  />
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 font-medium shadow-lg hover:shadow-xl"
                  >
                    {formLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Adding Project...
                      </div>
                    ) : (
                      'Add Project'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                      logWarning(
                        'General Projects',
                        'CANCEL_CREATE_FORM',
                        'Cancelled project creation form',
                        getCurrentUser()
                      );
                    }}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}