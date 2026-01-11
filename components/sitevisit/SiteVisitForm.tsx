'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarIcon,
  MapPin,
  Users,
  Building,
  UserPlus,
  UserMinus,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  Save,
  X,
  Mail,
  Phone,
  Shield,
  Filter,
  Search,
  Loader2,
  Check,
  AlertTriangle,
  Bug,
  Info,
  Database,
  Eye,
  EyeOff,
  UserCog,
  UserCheck,
  Building2,
  Briefcase  // ← Added Briefcase here
} from 'lucide-react';

// Debug interface
interface DebugInfo {
  timestamp: string;
  action: string;
  details: any;
}

// Caretaker interface matching the main page
interface Caretaker {
  id: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  contact_number: string;
  email: string;
  notes: string;
  status?: string;
  slpAssociation?: string; // This is the ASSOCIATION NAME
  associationId?: string;
  associationName?: string;
}

interface Project {
  id: string;
  _id?: string;
  enterpriseSetup?: {
    projectName: string;
    enterpriseType: string;
    cityMunicipality: string;
    province: string;
    status: string;
    startDate: string;
  };
  operationalInformation?: {
    multipleAssociations?: Array<{
      id: string;
      _id?: string;
      name: string; // ASSOCIATION NAME
      location: string;
      no_active_members: number;
      region: string;
      province: string;
      contact_person: string;
      contact_number: string;
      email: string;
    }>;
  };
  projectName?: string;
}

interface SiteVisitFormData {
  project_id: string;
  project_name: string;
  association_name: string; // Changed from association_id to association_name
  visit_number: number;
  visit_date: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  visit_purpose: string;
  participants: string[];
  location: string;
  findings: string;
  recommendations: string;
  next_steps: string;
  caretakers: Caretaker[];
  assigned_caretaker_id?: string;
  created_by: string;
}

interface SiteVisitFormProps {
  initialData?: Partial<SiteVisitFormData> | null;
  projectId?: string;
  visitNumber?: number;
  isEditing?: boolean;
  onSubmit?: (data: SiteVisitFormData) => Promise<void> | void;
  onCancel?: () => void;
}

// Helper function to normalize project data (same as main page)
const normalizeProject = (project: any): Project => {
  if (!project) {
    return {
      id: 'unknown',
      enterpriseSetup: {
        projectName: 'Unknown Project',
        enterpriseType: 'Unknown',
        status: 'unknown',
        startDate: new Date().toISOString().split('T')[0],
        cityMunicipality: 'Unknown',
        province: 'Unknown'
      }
    };
  }

  if (project.enterpriseSetup) {
    return {
      ...project,
      id: project.id || project._id || 'unknown'
    };
  }

  return {
    ...project,
    id: project.id || project._id || 'unknown',
    enterpriseSetup: {
      projectName: project.projectName || project.enterpriseSetup?.projectName || 'Unnamed Project',
      enterpriseType: project.enterpriseType || project.enterpriseSetup?.enterpriseType || 'Unknown',
      status: project.status || project.enterpriseSetup?.status || 'active',
      startDate: project.startDate || project.enterpriseSetup?.startDate || new Date().toISOString().split('T')[0],
      cityMunicipality: project.cityMunicipality || project.enterpriseSetup?.cityMunicipality || 'Unknown',
      province: project.province || project.enterpriseSetup?.province || 'Unknown'
    },
    operationalInformation: project.operationalInformation || {
      multipleAssociations: []
    }
  };
};

// Helper function to get project name (same as main page)
const getProjectName = (project: Project): string => {
  return project.enterpriseSetup?.projectName || project.projectName || 'Unnamed Project';
};

// Helper function to get association name from caretaker
const getCaretakerAssociationName = (caretaker: Caretaker): string => {
  // Return the association name in order of priority
  if (caretaker.slpAssociation && caretaker.slpAssociation !== 'No Association') {
    return caretaker.slpAssociation;
  }
  if (caretaker.associationName && caretaker.associationName !== 'No Association') {
    return caretaker.associationName;
  }
  return 'Unassigned';
};

export function SiteVisitForm({ 
  initialData, 
  projectId, 
  visitNumber,
  isEditing = false,
  onSubmit,
  onCancel
}: SiteVisitFormProps) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allCaretakers, setAllCaretakers] = useState<Caretaker[]>([]);
  
  // Filtered data
  const [filteredCaretakers, setFilteredCaretakers] = useState<Caretaker[]>([]);
  const [selectedCaretakers, setSelectedCaretakers] = useState<Caretaker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Associations for current project
  const [associations, setAssociations] = useState<any[]>([]);
  
  // Debug mode
  const [debugMode, setDebugMode] = useState(false);
  const [debugLog, setDebugLog] = useState<DebugInfo[]>([]);
  
  // Loading states
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingCaretakers, setLoadingCaretakers] = useState(true);

  // Show all caretakers regardless of association
  const [showAllCaretakers, setShowAllCaretakers] = useState(false);
  
  // Form Data - UPDATED: removed association_id field
  const [formData, setFormData] = useState<SiteVisitFormData>({
    project_id: projectId || '',
    project_name: '',
    association_name: '', // Changed from association_id
    visit_number: visitNumber || 1,
    visit_date: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    visit_purpose: '',
    participants: [],
    location: '',
    findings: '',
    recommendations: '',
    next_steps: '',
    caretakers: [],
    assigned_caretaker_id: '',
    created_by: 'Admin User'
  });

  // Add debug log
  const addDebugLog = (action: string, details: any) => {
    if (!debugMode) return;
    
    const logEntry: DebugInfo = {
      timestamp: new Date().toISOString(),
      action,
      details
    };
    
    setDebugLog(prev => [logEntry, ...prev.slice(0, 19)]);
    console.log(`🔍 DEBUG [${action}]:`, details);
  };

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      addDebugLog('SET_INITIAL_DATA', { initialData });
      
      // Handle both old format (with association_id) and new format
      const initialDataToUse = { ...initialData };
      
      setFormData(prev => ({
        ...prev,
        ...initialDataToUse,
        visit_date: initialDataToUse.visit_date 
          ? initialDataToUse.visit_date.split('T')[0]
          : prev.visit_date,
        association_name: initialDataToUse.association_name || '' // Ensure we use association_name
      }));
      
      if (initialDataToUse.caretakers) {
        setSelectedCaretakers(initialDataToUse.caretakers);
      }
    }
  }, [initialData]);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchProjects(),
          fetchCaretakers(),
        ]);
      } catch (error) {
        console.error('Error fetching all data:', error);
        addDebugLog('FETCH_ALL_DATA_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    };

    fetchAllData();
  }, []);

  // Group caretakers by association NAME (not ID)
  const getCaretakersByAssociation = () => {
    if (allCaretakers.length === 0) return {};
    
    // Group caretakers by their association NAME
    const grouped: Record<string, Caretaker[]> = {};
    
    allCaretakers.forEach(caretaker => {
      const associationName = getCaretakerAssociationName(caretaker);
      
      if (!grouped[associationName]) {
        grouped[associationName] = [];
      }
      
      grouped[associationName].push(caretaker);
    });
    
    // Sort associations alphabetically
    const sortedGrouped: Record<string, Caretaker[]> = {};
    Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .forEach(key => {
        sortedGrouped[key] = grouped[key];
      });
    
    return sortedGrouped;
  };

  // Filter caretakers when association changes
  useEffect(() => {
    if (formData.association_name && allCaretakers.length > 0 && !showAllCaretakers) {
      addDebugLog('START_FILTERING', {
        associationName: formData.association_name,
        totalCaretakers: allCaretakers.length
      });

      // Filter caretakers by association NAME - CASE INSENSITIVE matching
      const filtered = allCaretakers.filter(caretaker => {
        const caretakerAssociationName = getCaretakerAssociationName(caretaker);
        const targetAssociationName = formData.association_name.trim();
        
        if (!caretakerAssociationName || caretakerAssociationName === 'Unassigned') {
          return false;
        }

        // Try different matching strategies
        const exactMatch = caretakerAssociationName.toLowerCase() === targetAssociationName.toLowerCase();
        
        // Try partial match
        const partialMatch = caretakerAssociationName.toLowerCase().includes(targetAssociationName.toLowerCase()) ||
                           targetAssociationName.toLowerCase().includes(caretakerAssociationName.toLowerCase());
        
        // Try removing common prefixes/suffixes
        const cleanCaretaker = caretakerAssociationName.toLowerCase()
          .replace(/^association\s*/i, '')
          .replace(/\s*association$/i, '')
          .trim();
        
        const cleanTarget = targetAssociationName.toLowerCase()
          .replace(/^association\s*/i, '')
          .replace(/\s*association$/i, '')
          .trim();
        
        const cleanMatch = cleanCaretaker === cleanTarget || 
                          cleanCaretaker.includes(cleanTarget) || 
                          cleanTarget.includes(cleanCaretaker);
        
        const matches = exactMatch || partialMatch || cleanMatch;
        
        if (matches) {
          addDebugLog('CARETAKER_MATCH_FOUND', {
            caretaker: getCaretakerFullName(caretaker),
            caretakerAssociationName,
            targetAssociationName,
            exactMatch,
            partialMatch,
            cleanMatch
          });
        }
        
        return matches;
      });

      addDebugLog('FILTERING_RESULTS', {
        associationName: formData.association_name,
        filteredCount: filtered.length,
        filteredCaretakers: filtered.map(c => ({
          name: getCaretakerFullName(c),
          associationName: getCaretakerAssociationName(c),
          id: c.id || c._id
        }))
      });

      setFilteredCaretakers(filtered);
    } else {
      // Show all caretakers
      setFilteredCaretakers(allCaretakers);
      addDebugLog('SHOWING_ALL_CARETAKERS', {
        showAllCaretakers,
        reason: !formData.association_name ? 'No association name' : 'Show all mode enabled',
        associationName: formData.association_name,
        caretakersCount: allCaretakers.length
      });
    }
  }, [formData.association_name, allCaretakers, showAllCaretakers]);

  // Helper functions
  const getCaretakerFullName = (caretaker: Caretaker): string => {
    if (caretaker.name) return caretaker.name;
    if (caretaker.firstName || caretaker.lastName) {
      return `${caretaker.firstName || ''} ${caretaker.lastName || ''}`.trim();
    }
    return 'Unnamed Caretaker';
  };

  const getCaretakerDisplayInfo = (caretaker: Caretaker) => {
    const associationName = getCaretakerAssociationName(caretaker);
    
    return {
      name: getCaretakerFullName(caretaker),
      role: caretaker.role || 'Caretaker',
      email: caretaker.email || 'No email',
      phone: caretaker.contact_number || 'No phone',
      association: associationName,
      status: caretaker.status || 'active',
      notes: caretaker.notes
    };
  };

  const getStatusColor = (status: string = 'active') => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string = 'active') => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'on-leave': return <Clock className="h-3 w-3" />;
      case 'on_leave': return <Clock className="h-3 w-3" />;
      case 'inactive': return <AlertCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  // API Calls - MATCHING MAIN PAGE ENDPOINTS
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      addDebugLog('FETCH_PROJECTS_START', {});
      
      const response = await fetch('/api/monitoring/projects');
      
      if (response.ok) {
        const data = await response.json();
        const projectsArray = Array.isArray(data) ? data : [];
        
        const normalizedProjects = projectsArray.map(normalizeProject);
        
        addDebugLog('FETCH_PROJECTS_SUCCESS', {
          count: normalizedProjects.length,
          sample: normalizedProjects.slice(0, 2)
        });
        
        setProjects(normalizedProjects);
        
        // If projectId is provided, auto-select it
        if (projectId) {
          const project = normalizedProjects.find((p: Project) => 
            p.id === projectId || p._id === projectId
          );
          
          if (project) {
            handleProjectSelect(project);
          }
        }
      } else {
        addDebugLog('FETCH_PROJECTS_FAILED', { status: response.status });
        console.error('❌ Failed to fetch projects:', response.status);
      }
    } catch (error) {
      addDebugLog('FETCH_PROJECTS_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
      console.error('❌ Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchCaretakers = async () => {
    try {
      setLoadingCaretakers(true);
      addDebugLog('FETCH_CARETAKERS_START', {});
      
      const response = await fetch('/api/caretakers?limit=500');
      
      if (response.ok) {
        const data = await response.json();
        const caretakersArray = Array.isArray(data) ? data : [];
        
        // Transform API caretakers to match our Caretaker interface
        const transformedCaretakers: Caretaker[] = caretakersArray.map((c: any) => ({
          id: c.id || c._id || '',
          _id: c._id,
          firstName: c.firstName,
          lastName: c.lastName,
          name: c.name,
          role: c.role || 'Caretaker',
          contact_number: c.phone || c.contactNumber || '',
          email: c.email || '',
          notes: c.notes || '',
          status: c.status || 'active',
          slpAssociation: c.slpAssociation, // This is the ASSOCIATION NAME
          associationId: c.associationId,
          associationName: c.associationName
        }));
        
        // Log all unique association names
        const allAssociationNames = [...new Set(transformedCaretakers
          .map(c => getCaretakerAssociationName(c))
          .filter(Boolean))];
        
        addDebugLog('FETCH_CARETAKERS_SUCCESS', {
          count: transformedCaretakers.length,
          associationNames: allAssociationNames,
          associationCount: allAssociationNames.length,
          sample: transformedCaretakers.slice(0, 3).map((c: Caretaker) => ({
            name: getCaretakerFullName(c),
            associationName: getCaretakerAssociationName(c),
            id: c.id
          }))
        });
        
        console.log('👥 Caretakers loaded:', transformedCaretakers.length);
        console.log('👥 Association NAMES found:', allAssociationNames);
        
        setAllCaretakers(transformedCaretakers);
      } else {
        addDebugLog('FETCH_CARETAKERS_FAILED', { status: response.status });
        console.error('❌ Failed to fetch caretakers:', response.status);
      }
    } catch (error) {
      addDebugLog('FETCH_CARETAKERS_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
      console.error('❌ Error fetching caretakers:', error);
    } finally {
      setLoadingCaretakers(false);
    }
  };

  // Event Handlers - UPDATED: Removed association_id logic
  const handleProjectSelect = (project: Project) => {
    const projectId = project.id || project._id || '';
    const projectName = getProjectName(project);
    
    // Get associations from the project
    const projectAssociations = project.operationalInformation?.multipleAssociations || [];
    setAssociations(projectAssociations);
    
    // If there's only one association, auto-select it by NAME
    if (projectAssociations.length === 1) {
      const association = projectAssociations[0];
      const associationName = association?.name || 'No Association';
      const location = association?.location || 
                      `${project.enterpriseSetup?.cityMunicipality || ''}, ${project.enterpriseSetup?.province || ''}`;
      
      addDebugLog('PROJECT_SELECTED_WITH_ASSOCIATION', {
        projectName,
        associationName,
        location
      });
      
      setFormData(prev => ({
        ...prev,
        project_id: projectId,
        project_name: projectName,
        association_name: associationName, // Store NAME only
        location: location.trim() || 'Location not specified'
      }));
    } else {
      // Multiple associations - just set project info
      setFormData(prev => ({
        ...prev,
        project_id: projectId,
        project_name: projectName,
        association_name: '', // Clear association name
        location: ''
      }));
    }
    
    // Clear selected caretakers when project changes
    setSelectedCaretakers([]);
    setFormData(prev => ({ 
      ...prev, 
      caretakers: [], 
      assigned_caretaker_id: '' 
    }));
  };

  const handleAssociationSelect = (associationName: string) => {
    // Find the association object to get location
    const association = associations.find(a => a.name === associationName);
    
    if (association) {
      const location = association?.location || 
                      `${projects.find(p => p.id === formData.project_id)?.enterpriseSetup?.cityMunicipality || ''}, ${
                       projects.find(p => p.id === formData.project_id)?.enterpriseSetup?.province || ''}`;
      
      addDebugLog('ASSOCIATION_SELECTED', {
        associationName,
        location
      });
      
      setFormData(prev => ({
        ...prev,
        association_name: associationName,
        location: location.trim() || 'Location not specified'
      }));
      
      // Clear selected caretakers when association changes
      setSelectedCaretakers([]);
      setFormData(prev => ({ 
        ...prev, 
        caretakers: [], 
        assigned_caretaker_id: '' 
      }));
    }
  };

  const handleInputChange = (field: keyof SiteVisitFormData, value: any) => {
    addDebugLog('FORM_FIELD_CHANGE', { field, value });
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCaretakerSelection = (caretaker: Caretaker) => {
    const caretakerId = caretaker.id || caretaker._id;
    if (!caretakerId) return;
    
    const isSelected = selectedCaretakers.some(c => 
      (c.id === caretakerId) || (c._id === caretakerId)
    );
    
    addDebugLog('TOGGLE_CARETAKER_SELECTION', {
      caretaker: getCaretakerFullName(caretaker),
      caretakerId,
      isSelected,
      currentSelectedCount: selectedCaretakers.length
    });
    
    if (isSelected) {
      // Remove caretaker
      const updated = selectedCaretakers.filter(c => 
        (c.id !== caretakerId) && (c._id !== caretakerId)
      );
      setSelectedCaretakers(updated);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        caretakers: updated,
        assigned_caretaker_id: prev.assigned_caretaker_id === caretakerId ? '' : prev.assigned_caretaker_id
      }));
    } else {
      // Add caretaker
      const updated = [...selectedCaretakers, caretaker];
      setSelectedCaretakers(updated);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        caretakers: updated,
        assigned_caretaker_id: !prev.assigned_caretaker_id ? caretakerId : prev.assigned_caretaker_id
      }));
    }
  };

  const removeCaretaker = (caretakerId: string) => {
    addDebugLog('REMOVE_CARETAKER', { caretakerId });
    
    const updated = selectedCaretakers.filter(c => c.id !== caretakerId && c._id !== caretakerId);
    setSelectedCaretakers(updated);
    
    setFormData(prev => ({
      ...prev,
      caretakers: updated,
      assigned_caretaker_id: prev.assigned_caretaker_id === caretakerId ? '' : prev.assigned_caretaker_id
    }));
  };

  const setPrimaryCaretaker = (caretakerId: string) => {
    addDebugLog('SET_PRIMARY_CARETAKER', { caretakerId });
    setFormData(prev => ({ ...prev, assigned_caretaker_id: caretakerId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    addDebugLog('FORM_SUBMIT_ATTEMPT', {
      formData: {
        ...formData,
        caretakers: selectedCaretakers.map(c => getCaretakerFullName(c))
      }
    });
    
    // Validation - UPDATED: check association_name instead of association_id
    const missingFields = [];
    if (!formData.project_id) missingFields.push('Project');
    if (!formData.association_name) missingFields.push('Association'); // Changed to association_name
    if (!formData.visit_purpose) missingFields.push('Visit Purpose');
    if (!formData.location) missingFields.push('Location');
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      addDebugLog('FORM_VALIDATION_FAILED', { missingFields });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (onSubmit) {
        const submitData: SiteVisitFormData = {
          ...formData,
          // Ensure all caretakers have the correct format
          caretakers: selectedCaretakers.map(c => ({
            id: c.id || c._id || '',
            name: getCaretakerFullName(c),
            role: c.role || 'Caretaker',
            contact_number: c.contact_number || '',
            email: c.email || '',
            notes: c.notes || ''
          }))
        };
        
        addDebugLog('FORM_SUBMIT_SUCCESS', {
          selectedCaretakers: selectedCaretakers.map(c => getCaretakerFullName(c)),
          totalCaretakers: selectedCaretakers.length,
          association: formData.association_name
        });
        
        await onSubmit(submitData);
      }
    } catch (error) {
      addDebugLog('FORM_SUBMIT_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
      console.error('❌ Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render helpers
  const renderStatusBadge = (status: string) => {
    const displayText = status.replace('-', ' ').charAt(0).toUpperCase() + 
                       status.replace('-', ' ').slice(1);
    
    const colorMap = {
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      'in-progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    
    const iconMap = {
      scheduled: <Clock className="h-3 w-3" />,
      completed: <CheckCircle className="h-3 w-3" />,
      'in-progress': <AlertCircle className="h-3 w-3" />,
      cancelled: <AlertCircle className="h-3 w-3" />,
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 ${colorMap[status as keyof typeof colorMap] || 'bg-gray-50'}`}
      >
        {iconMap[status as keyof typeof iconMap] || <AlertCircle className="h-3 w-3" />}
        {displayText}
      </Badge>
    );
  };

  const renderVisitNumberBadge = (number: number) => {
    const suffix = number === 1 ? 'st' : number === 2 ? 'nd' : number === 3 ? 'rd' : 'th';
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        {number}{suffix} Visit
      </Badge>
    );
  };

  // Debug panel component
  const DebugPanel = () => {
    if (!debugMode) return null;
    
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <Bug className="h-5 w-5" />
              Debug Mode
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDebugLog([])}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Clear Logs
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDebugMode(false)}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Hide
              </Button>
            </div>
          </div>
          <CardDescription className="text-red-600">
            Debugging caretaker filtering by association name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded border border-red-200">
              <div className="text-sm font-medium text-red-700">Current Association</div>
              <div className="text-lg font-bold mt-1">{formData.association_name || 'None'}</div>
              <div className="text-xs text-gray-600 mt-1">From selected project</div>
            </div>
            <div className="bg-white p-3 rounded border border-red-200">
              <div className="text-sm font-medium text-red-700">Total Caretakers</div>
              <div className="text-lg font-bold mt-1">{allCaretakers.length}</div>
              <div className="text-xs text-gray-600 mt-1">Loaded from API</div>
            </div>
            <div className="bg-white p-3 rounded border border-red-200">
              <div className="text-sm font-medium text-red-700">Filtered Caretakers</div>
              <div className="text-lg font-bold mt-1">{filteredCaretakers.length}</div>
              <div className="text-xs text-gray-600 mt-1">Matching association name</div>
            </div>
          </div>
          
          {/* Associations in Caretakers */}
          {allCaretakers.length > 0 && (
            <div className="bg-white p-4 rounded border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-red-600" />
                <div className="text-sm font-medium text-red-700">All Association Names in Caretakers</div>
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                  {[...new Set(allCaretakers.map(c => getCaretakerAssociationName(c)).filter(Boolean))].length} unique
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                {[...new Set(allCaretakers
                  .map(c => getCaretakerAssociationName(c))
                  .filter(name => name !== 'Unassigned')
                  .sort())].map((associationName, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className={`${
                      associationName?.toLowerCase() === formData.association_name?.toLowerCase()
                        ? 'bg-green-100 text-green-700 border-green-200 ring-1 ring-green-300'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {associationName}
                    {associationName?.toLowerCase() === formData.association_name?.toLowerCase() && (
                      <Check className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Debug Log */}
          <div className="bg-white p-4 rounded border border-red-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-red-600" />
                <div className="text-sm font-medium text-red-700">Debug Log</div>
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                  {debugLog.length} entries
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(debugLog, null, 2))}
                className="text-red-700 hover:text-red-800 hover:bg-red-100"
              >
                Copy Logs
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {debugLog.map((log, index) => (
                <div key={index} className="p-2 border border-gray-200 rounded bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-medium text-gray-700">{log.action}</div>
                    <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                  <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-10 w-10 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Site Visit' : `Add ${renderVisitNumberBadge(formData.visit_number)}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update site visit details' : 'Record new site visit information'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDebugMode(!debugMode)}
            className="flex items-center gap-2"
          >
            {debugMode ? <EyeOff className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
            {debugMode ? 'Hide Debug' : 'Debug'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isLoading ? 'Saving...' : isEditing ? 'Update Visit' : 'Save Visit'}
          </Button>
        </div>
      </div>

      {/* Debug Panel */}
      <DebugPanel />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Visit Information
              </CardTitle>
              <CardDescription>
                Basic details about the site visit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Selection */}
              <div className="space-y-3">
                <Label htmlFor="project">Project *</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) => {
                    const project = projects.find(p => 
                      p.id === value || p._id === value
                    );
                    if (project) {
                      handleProjectSelect(project);
                    }
                  }}
                  disabled={!!projectId || loadingProjects}
                >
                  <SelectTrigger id="project" className="w-full">
                    {loadingProjects ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading projects...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Select a project" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => {
                      const projectName = getProjectName(project);
                      
                      return (
                        <SelectItem 
                          key={project.id || project._id}
                          value={project.id || project._id || ''}
                        >
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">
                                {projectName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {project.enterpriseSetup?.enterpriseType || 'Unknown type'}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                {/* Association Selection (if project has multiple associations) */}
                {associations.length > 1 && (
                  <div className="space-y-3">
                    <Label htmlFor="association">Select Association *</Label>
                    <Select
                      value={formData.association_name}
                      onValueChange={handleAssociationSelect}
                    >
                      <SelectTrigger id="association" className="w-full">
                        <SelectValue placeholder="Select an association" />
                      </SelectTrigger>
                      <SelectContent>
                        {associations.map((association) => (
                          <SelectItem 
                            key={association.name}
                            value={association.name || ''}
                          >
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <div>
                                <div className="font-medium">
                                  {association.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {association.location}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Project & Association Info Display */}
                {formData.project_name && (
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">{formData.project_name}</span>
                    </div>
                    
                    {formData.association_name && (
                      <div className="flex items-center gap-2 text-green-700 text-sm">
                        <Shield className="h-3 w-3" />
                        <span>Association: <strong>{formData.association_name}</strong></span>
                      </div>
                    )}
                    
                    {formData.location && formData.location !== 'Location not specified' && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <div className="flex items-center gap-2 text-xs">
                        <Filter className="h-3 w-3 text-blue-600" />
                        <span className="text-blue-600">Caretakers will be filtered by association name: </span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {formData.association_name || 'No association selected'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Showing caretakers assigned to this specific association only
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visit Date */}
                <div className="space-y-3">
                  <Label htmlFor="visit_date">Visit Date *</Label>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <Input
                      id="visit_date"
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) => handleInputChange('visit_date', e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => handleInputChange('status', value)}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Scheduled
                        </div>
                      </SelectItem>
                      <SelectItem value="in-progress">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Cancelled
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visit Number */}
                <div className="space-y-3">
                  <Label htmlFor="visit_number">Visit Number</Label>
                  <Select
                    value={formData.visit_number.toString()}
                    onValueChange={(value) => handleInputChange('visit_number', parseInt(value))}
                    disabled={!!visitNumber}
                  >
                    <SelectTrigger id="visit_number" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}{num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'} Visit
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <Label htmlFor="location">Location *</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter site location"
                      className="flex-1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Visit Purpose */}
              <div className="space-y-3">
                <Label htmlFor="visit_purpose">Visit Purpose *</Label>
                <Textarea
                  id="visit_purpose"
                  value={formData.visit_purpose}
                  onChange={(e) => handleInputChange('visit_purpose', e.target.value)}
                  placeholder="Describe the purpose of this site visit..."
                  className="min-h-[100px]"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Caretakers Selection */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Caretakers
                <Badge variant="secondary" className="ml-2">
                  {allCaretakers.length} total caretakers
                </Badge>
              </CardTitle>
              <CardDescription>
                {!showAllCaretakers && formData.association_name && formData.association_name !== 'No Association' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-blue-600" />
                      <span>Filtering caretakers by association: <strong>{formData.association_name}</strong></span>
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                        <Check className="h-3 w-3 mr-1" />
                        Association Filter Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllCaretakers(true)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Show All Caretakers from All Associations
                      </Button>
                    </div>
                  </div>
                ) : showAllCaretakers ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>Showing <strong>ALL caretakers</strong> grouped by association name</span>
                      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                        <Building2 className="h-3 w-3 mr-1" />
                        All Associations View
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.association_name && formData.association_name !== 'No Association' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllCaretakers(false)}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Filter className="h-3 w-3 mr-1" />
                          Filter by {formData.association_name}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-600" />
                      <span>Select a project and association to filter caretakers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllCaretakers(true)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Show All Caretakers
                      </Button>
                    </div>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Caretakers */}
              {selectedCaretakers.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Selected Caretakers ({selectedCaretakers.length})</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCaretakers([]);
                        setFormData(prev => ({ 
                          ...prev, 
                          caretakers: [], 
                          assigned_caretaker_id: '' 
                        }));
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {selectedCaretakers.map((caretaker) => {
                      const info = getCaretakerDisplayInfo(caretaker);
                      const caretakerId = caretaker.id || caretaker._id;
                      const isPrimary = formData.assigned_caretaker_id === caretakerId;
                      
                      return (
                        <div 
                          key={caretakerId}
                          className={`p-4 border rounded-lg space-y-3 ${
                            isPrimary ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                isPrimary ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                <Users className={`h-4 w-4 ${isPrimary ? 'text-blue-600' : 'text-gray-500'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">{info.name}</h4>
                                  {isPrimary && (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      Primary
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className={`${getStatusColor(info.status)}`}>
                                    {getStatusIcon(info.status)}
                                    {info.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{info.role}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Shield className="h-3 w-3 text-green-600" />
                                  <span className="text-xs text-green-700">
                                    Association: <strong>{info.association}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant={isPrimary ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPrimaryCaretaker(caretakerId || '')}
                                className={isPrimary ? "bg-blue-600 hover:bg-blue-700" : ""}
                              >
                                {isPrimary ? 'Primary' : 'Set as Primary'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCaretaker(caretakerId || '')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-3 w-3" />
                                <span>{info.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-3 w-3" />
                                <span>{info.phone}</span>
                              </div>
                              {info.notes && (
                                <div className="flex items-start gap-2 text-gray-600">
                                  <FileText className="h-3 w-3 mt-0.5" />
                                  <span className="text-xs">{info.notes}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Shield className="h-3 w-3" />
                                <span className="font-medium">Association:</span>
                                <span className="text-green-700">{info.association}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Briefcase className="h-3 w-3" />
                                <span>ID: {caretakerId}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Caretakers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>
                    {showAllCaretakers 
                      ? "Available Caretakers (Grouped by Association Name)"
                      : formData.association_name && formData.association_name !== 'No Association'
                      ? `Available Caretakers from "${formData.association_name}"`
                      : 'Select a project and association to see caretakers'
                    }
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search caretakers or associations..."
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {allCaretakers.length} total
                    </Badge>
                  </div>
                </div>
                
                {loadingCaretakers ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Loading caretakers from database...</p>
                  </div>
                ) : !formData.association_name || formData.association_name === 'No Association' ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a project with an association</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Or click "Show All Caretakers" to view all available caretakers grouped by association
                    </p>
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAllCaretakers(true)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Show All Caretakers (Grouped by Association)
                      </Button>
                    </div>
                  </div>
                ) : filteredCaretakers.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                    <p className="text-gray-500">No caretakers found in this association</p>
                    <p className="text-sm text-gray-400 mt-1">
                      No caretakers are assigned to <strong>"{formData.association_name}"</strong>
                    </p>
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAllCaretakers(true)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View All Caretakers from Other Associations
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto p-1">
                    {filteredCaretakers.filter(caretaker => {
                      // Additional search filter
                      if (!searchTerm) return true;
                      
                      const searchLower = searchTerm.toLowerCase();
                      const fullName = getCaretakerFullName(caretaker).toLowerCase();
                      const email = caretaker.email?.toLowerCase() || '';
                      const role = caretaker.role?.toLowerCase() || '';
                      const phone = caretaker.contact_number?.toLowerCase() || '';
                      const associationName = getCaretakerAssociationName(caretaker).toLowerCase();
                      
                      return (
                        fullName.includes(searchLower) ||
                        email.includes(searchLower) ||
                        role.includes(searchLower) ||
                        phone.includes(searchLower) ||
                        associationName.includes(searchLower)
                      );
                    }).map((caretaker) => {
                      const info = getCaretakerDisplayInfo(caretaker);
                      const caretakerId = caretaker.id || caretaker._id;
                      const isSelected = selectedCaretakers.some(c => 
                        (c.id === caretakerId) || (c._id === caretakerId)
                      );
                      
                      return (
                        <div
                          key={caretakerId}
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => toggleCaretakerSelection(caretaker)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-full ${
                                isSelected ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                <Users className={`h-3 w-3 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{info.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {info.role}
                                  </Badge>
                                  <Badge variant="outline" className={`text-xs ${getStatusColor(info.status)}`}>
                                    {getStatusIcon(info.status)}
                                    {info.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                  {info.email && info.email !== 'No email' && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-2.5 w-2.5" />
                                      <span className="truncate">{info.email}</span>
                                    </div>
                                  )}
                                  {info.phone && info.phone !== 'No phone' && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-2.5 w-2.5" />
                                      <span>{info.phone}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Shield className="h-2.5 w-2.5 text-green-600" />
                                  <span className="text-xs text-green-700 truncate">
                                    Association: <strong>{info.association}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <Check className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                  Select
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Findings & Recommendations */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Findings & Recommendations</CardTitle>
              <CardDescription>
                Record observations, findings, and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="findings">Findings & Observations</Label>
                <Textarea
                  id="findings"
                  value={formData.findings}
                  onChange={(e) => handleInputChange('findings', e.target.value)}
                  placeholder="Describe your findings and observations during the visit..."
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => handleInputChange('recommendations', e.target.value)}
                  placeholder="Provide recommendations based on your findings..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="next_steps">Next Steps</Label>
                <Textarea
                  id="next_steps"
                  value={formData.next_steps}
                  onChange={(e) => handleInputChange('next_steps', e.target.value)}
                  placeholder="Outline the next steps or action items..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Visit Summary */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Visit Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  {renderStatusBadge(formData.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Visit Number:</span>
                  {renderVisitNumberBadge(formData.visit_number)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(formData.visit_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Caretakers:</span>
                  <span className="font-medium">{selectedCaretakers.length} selected</span>
                </div>
              </div>
              
              {formData.association_name && formData.association_name !== 'No Association' && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Selected Association</span>
                  </div>
                  <div className="p-2 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <Shield className="h-3 w-3" />
                      <span className="font-medium">{formData.association_name}</span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {filteredCaretakers.length} caretakers in this association
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {showAllCaretakers ? 'Currently showing ALL caretakers' : 'Only showing caretakers from this association'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Stats */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Association Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Caretakers:</span>
                  <span className="font-medium">{allCaretakers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Associations:</span>
                  <span className="font-medium">{Object.keys(getCaretakersByAssociation()).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected:</span>
                  <span className="font-medium">{selectedCaretakers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">View Mode:</span>
                  <Badge variant="outline" className={
                    showAllCaretakers 
                      ? "bg-blue-50 text-blue-700 border-blue-200" 
                      : "bg-green-50 text-green-700 border-green-200"
                  }>
                    {showAllCaretakers ? 'All Associations' : 'Filtered'}
                  </Badge>
                </div>
              </div>
              
              {allCaretakers.length > 0 && (
                <div className="pt-3 border-t">
                  <div className="text-sm text-gray-500 mb-2">Top Associations:</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(getCaretakersByAssociation())
                      .filter(([name]) => name !== 'Unassigned')
                      .slice(0, 6)
                      .map(([associationName, caretakersList]) => {
                        const count = caretakersList.length;
                        return (
                          <div key={associationName} className="flex justify-between text-xs">
                            <span className={`truncate ${
                              associationName === formData.association_name 
                                ? 'text-green-700 font-medium' 
                                : 'text-gray-600'
                            }`}>
                              {associationName}
                            </span>
                            <span className="text-gray-500">{count}</span>
                          </div>
                        );
                      })}
                    {Object.keys(getCaretakersByAssociation()).filter(name => name !== 'Unassigned').length > 6 && (
                      <div className="text-xs text-gray-400 italic">
                        ...and {Object.keys(getCaretakersByAssociation()).filter(name => name !== 'Unassigned').length - 6} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Add all available caretakers
                  const allAvailable = (showAllCaretakers ? allCaretakers : filteredCaretakers).filter(c => 
                    !selectedCaretakers.some(sc => 
                      (sc.id === c.id) || (sc._id === c._id)
                    )
                  );
                  const updated = [...selectedCaretakers, ...allAvailable];
                  setSelectedCaretakers(updated);
                  setFormData(prev => ({ ...prev, caretakers: updated }));
                }}
                disabled={(showAllCaretakers ? allCaretakers : filteredCaretakers).length === 0}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Select All Caretakers
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => {
                  setSelectedCaretakers([]);
                  setFormData(prev => ({ 
                    ...prev, 
                    caretakers: [], 
                    assigned_caretaker_id: '' 
                  }));
                }}
                disabled={selectedCaretakers.length === 0}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Clear All Caretakers
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowAllCaretakers(!showAllCaretakers)}
              >
                {showAllCaretakers ? (
                  <>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter by Selected Association
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show All Caretakers (Grouped by Association)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}