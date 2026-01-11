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
  Eye, 
  MapPin,
  Users,
  Building,
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Map,
  ChevronDown,
  RefreshCw,
  Calendar,
  X,
  FileCheck,
  TrendingUp,
  BarChart3,
  Loader2,
  Award,
  Shield,
  PiggyBank,
  UserCheck,
  Crown,
  Star,
  Target,
  Trophy,
  Zap
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// ✅ FIXED: Using named imports for both components
import { SiteVisitForm } from '@/components/sitevisit/SiteVisitForm';
import { SiteVisitView } from '@/components/sitevisit/SiteVisitView';

// Helper function to get full name from caretaker
const getFullName = (caretaker: any): string => {
  if (!caretaker) return 'Unknown';
  if (caretaker.name) return caretaker.name;
  if (caretaker.firstName && caretaker.lastName) {
    return `${caretaker.firstName} ${caretaker.lastName}`;
  }
  return caretaker.id || 'Unknown';
};

interface Caretaker {
  id: string;
  name: string;
  role: string;
  contact_number: string;
  email: string;
  notes: string;
}

interface SiteVisit {
  id: string;
  project_id: string;
  project_name: string;
  association_name: string;
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
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  enterpriseSetup?: {
    projectName: string;
    enterpriseType: string;
    status: string;
    startDate: string;
    cityMunicipality: string;
    province: string;
  };
  operationalInformation?: {
    multipleAssociations: Array<{
      id: string;
      name: string;
      location: string;
      no_active_members: number;
      region: string;
      province: string;
      contact_person: string;
      contact_number: string;
      email: string;
    }>;
  };
  associationName?: string;
}

interface ApiCaretaker {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  contactNumber?: string;
  role?: string;
  notes?: string;
  slpAssociation?: string;
  participantType?: string;
  sex?: string;
  barangay?: string;
  cityMunicipality?: string;
  status?: string;
}

interface ProjectRanking {
  id: string;
  project_id: string;
  project_name: string;
  association_name: string;
  association_id?: string;
  location: string;
  visit_count: number;
  completed_visits: number;
  last_visit_date: string;
  last_visit_status: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  renewal_eligibility: boolean;
  pig_addition_eligibility: boolean;
  score: number;
  last_visit_purpose: string;
  findings_summary: string;
  progress_percentage: number;
  enterprise_type: string;
  member_count: number;
  months_active: number;
}

interface EligibilityCriteria {
  renewal: {
    minVisits: number;
    maxDaysSinceLastVisit: number;
    minCompletionRate: number;
    requiredStatuses: string[];
  };
  pigAddition: {
    minScore: number;
    requiredVisitCount: number;
    recentCompletionRequired: boolean;
  };
}

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
    },
    associationName: project.associationName || 'No Association'
  };
};

const getProjectName = (project: Project): string => {
  return project.enterpriseSetup?.projectName || 'Unnamed Project';
};

const getAssociationName = (project: Project): string => {
  if (project.associationName) return project.associationName;
  
  const associations = project.operationalInformation?.multipleAssociations;
  if (associations && associations.length > 0) {
    return associations[0]?.name || 'No Association';
  }
  
  return 'No Association';
};

const calculateProjectRankings = (siteVisits: SiteVisit[], projects: Project[]): ProjectRanking[] => {
  const rankings: ProjectRanking[] = [];
  const now = new Date();

  // Group site visits by project and association
  const visitsByProject = siteVisits.reduce((acc, visit) => {
    const key = `${visit.project_id}_${visit.association_name}`;
    if (!acc[key]) {
      acc[key] = {
        project_id: visit.project_id,
        association_name: visit.association_name,
        visits: [],
        project_name: visit.project_name,
        location: visit.location
      };
    }
    acc[key].visits.push(visit);
    return acc;
  }, {} as Record<string, any>);

  // Calculate ranking for each project-association
  Object.values(visitsByProject).forEach((item: any) => {
    const project = projects.find(p => p.id === item.project_id);
    const visits = item.visits.sort((a: SiteVisit, b: SiteVisit) => 
      new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
    );

    const totalVisits = visits.length;
    const completedVisits = visits.filter((v: SiteVisit) => v.status === 'completed').length;
    const lastVisit = visits[0];
    const lastVisitDate = lastVisit ? new Date(lastVisit.visit_date) : null;
    
    // Calculate days since last visit
    const daysSinceLastVisit = lastVisitDate ? 
      Math.floor((now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)) : 
      365; // Large number if no visits

    // Calculate completion rate
    const completionRate = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;

    // Find association details
    const association = project?.operationalInformation?.multipleAssociations?.find(
      a => a.name === item.association_name
    );

    // Calculate months active
    const projectStartDate = project?.enterpriseSetup?.startDate ? new Date(project.enterpriseSetup.startDate) : now;
    const monthsActive = Math.max(1, Math.floor((now.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

    // Calculate score (0-100)
    let score = 0;
    
    // Base score from completion rate (40%)
    score += completionRate * 0.4;
    
    // Score from recency of last visit (30%)
    const recencyScore = Math.max(0, 100 - (daysSinceLastVisit * 2));
    score += recencyScore * 0.3;
    
    // Score from total visits (20%)
    const visitCountScore = Math.min(100, totalVisits * 25);
    score += visitCountScore * 0.2;
    
    // Score from findings quality (10%)
    const hasFindings = lastVisit?.findings && lastVisit.findings.length > 50 ? 100 : 0;
    score += hasFindings * 0.1;

    // Determine status based on score
    let status: ProjectRanking['status'] = 'poor';
    if (score >= 80) status = 'excellent';
    else if (score >= 60) status = 'good';
    else if (score >= 40) status = 'fair';

    // Determine eligibility
    const renewalEligibility = 
      completedVisits >= 2 && 
      daysSinceLastVisit <= 90 && 
      completionRate >= 70 &&
      lastVisit?.status === 'completed';

    const pigAdditionEligibility = 
      score >= 65 && 
      completedVisits >= 1 && 
      lastVisit?.status === 'completed' &&
      daysSinceLastVisit <= 60;

    rankings.push({
      id: `${item.project_id}-${item.association_name}`,
      project_id: item.project_id,
      project_name: item.project_name,
      association_name: item.association_name,
      association_id: association?.id,
      location: item.location,
      visit_count: totalVisits,
      completed_visits: completedVisits,
      last_visit_date: lastVisit?.visit_date || 'Never',
      last_visit_status: lastVisit?.status || 'none',
      status,
      renewal_eligibility: renewalEligibility,
      pig_addition_eligibility: pigAdditionEligibility,
      score: Math.round(score),
      last_visit_purpose: lastVisit?.visit_purpose?.slice(0, 100) || 'No visits yet',
      findings_summary: lastVisit?.findings?.slice(0, 150) || 'No findings recorded',
      progress_percentage: Math.round((completedVisits / Math.max(totalVisits, 4)) * 100),
      enterprise_type: project?.enterpriseSetup?.enterpriseType || 'Unknown',
      member_count: association?.no_active_members || 0,
      months_active: monthsActive
    });
  });

  // Sort by score (highest first)
  return rankings.sort((a, b) => b.score - a.score);
};

type PageMode = 'list' | 'add' | 'edit' | 'view' | 'ranking';

export default function SiteVisitsPage() {
  const router = useRouter();
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [caretakers, setCaretakers] = useState<ApiCaretaker[]>([]);
  const [projectRankings, setProjectRankings] = useState<ProjectRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visitNumberFilter, setVisitNumberFilter] = useState('all');
  const [mode, setMode] = useState<PageMode>('list');
  const [rankingFilter, setRankingFilter] = useState<'all' | 'renewal' | 'pig_addition'>('all');
  const [selectedSiteVisitId, setSelectedSiteVisitId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedVisitNumber, setSelectedVisitNumber] = useState<number | null>(null);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | null>(null);
  const [selectedAssociationName, setSelectedAssociationName] = useState<string | null>(null);
  const [showProjectSelection, setShowProjectSelection] = useState<boolean>(false);
  const [selectedVisitForProject, setSelectedVisitForProject] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('visits'); // 'visits' or 'ranking'

  useEffect(() => {
    if (mode === 'list') {
      fetchData();
    }
  }, [mode]);

  useEffect(() => {
    if (siteVisits.length > 0 && projects.length > 0) {
      const rankings = calculateProjectRankings(siteVisits, projects);
      setProjectRankings(rankings);
    }
  }, [siteVisits, projects]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch projects
      let projectsArray: any[] = [];
      try {
        const projectsResponse = await fetch('/api/monitoring/projects');
        if (projectsResponse.ok) {
          const rawProjects = await projectsResponse.json();
          projectsArray = rawProjects.map((project: any) => normalizeProject(project));
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Fallback mock data
        projectsArray = [
          {
            id: '1',
            enterpriseSetup: {
              projectName: 'Swine Farming Project',
              enterpriseType: 'Swine Production',
              status: 'active',
              startDate: '2024-01-01',
              cityMunicipality: 'Himamaylan',
              province: 'Negros Occidental'
            },
            operationalInformation: {
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
                  email: 'juan.delacruz@example.com'
                }
              ]
            }
          },
          {
            id: '2',
            enterpriseSetup: {
              projectName: 'Organic Vegetable Farming',
              enterpriseType: 'Vegetable Production',
              status: 'active',
              startDate: '2024-01-15',
              cityMunicipality: 'Himamaylan',
              province: 'Negros Occidental'
            },
            operationalInformation: {
              multipleAssociations: [
                {
                  id: '2',
                  name: 'Farmers Association 3',
                  location: 'sitio garangan Brgy. tooy Him, Negros Occidental',
                  no_active_members: 18,
                  region: 'Region VI',
                  province: 'Negros Occidental',
                  contact_person: 'Maria Santos',
                  contact_number: '+639987654321',
                  email: 'maria.santos@example.com'
                }
              ]
            }
          },
          {
            id: '3',
            enterpriseSetup: {
              projectName: 'Poultry Production',
              enterpriseType: 'Poultry',
              status: 'active',
              startDate: '2024-02-01',
              cityMunicipality: 'Bacolod',
              province: 'Negros Occidental'
            },
            operationalInformation: {
              multipleAssociations: [
                {
                  id: '3',
                  name: 'Poultry Farmers Association',
                  location: 'Brgy. Bata, Bacolod City',
                  no_active_members: 32,
                  region: 'Region VI',
                  province: 'Negros Occidental',
                  contact_person: 'Pedro Reyes',
                  contact_number: '+639112233445',
                  email: 'pedro.reyes@example.com'
                }
              ]
            }
          }
        ];
      }
      
      setProjects(projectsArray);

      // Fetch caretakers
      try {
        const caretakersResponse = await fetch('/api/caretakers');
        if (caretakersResponse.ok) {
          const caretakersData = await caretakersResponse.json();
          setCaretakers(caretakersData);
        }
      } catch (error) {
        console.error('Error fetching caretakers:', error);
      }

      // Fetch site visits
      try {
        const siteVisitsResponse = await fetch('/api/monitoring/site-visits');
        if (siteVisitsResponse.ok) {
          const data = await siteVisitsResponse.json();
          // Ensure all visits have valid IDs
          const validatedData = data.map((visit: any, index: number) => ({
            ...visit,
            id: visit.id || `visit-${Date.now()}-${index}`
          }));
          setSiteVisits(validatedData);
        } else {
          throw new Error('Failed to fetch site visits');
        }
      } catch (error) {
        console.error('Error fetching site visits:', error);
        // Fallback to mock data
        const mockSiteVisits: SiteVisit[] = [
          {
            id: '1',
            project_id: '1',
            project_name: 'Swine Farming Project',
            association_name: 'Farmers Association 1',
            visit_number: 1,
            visit_date: '2024-01-15',
            status: 'completed',
            visit_purpose: 'Initial assessment and baseline data collection',
            participants: ['John Doe', 'Maria Santos', 'Robert Cruz'],
            location: 'sitio tabugon brgy caradio-an himamaylan city, Negros Occidental',
            findings: 'Good progress on initial setup. Pigs are healthy and well-maintained. Facilities are clean and properly maintained. Feed supply is consistent.',
            recommendations: 'Establish reliable feed supplier partnerships. Consider expanding pig population by 10-15% next quarter.',
            next_steps: 'Follow-up visit in 30 days to check on feed supply resolution',
            caretakers: [
              {
                id: 'CT001',
                name: 'Juan Dela Cruz',
                role: 'Project Manager',
                contact_number: '+639123456789',
                email: 'juan.delacruz@example.com',
                notes: 'Main point of contact for project updates'
              }
            ],
            created_by: 'Admin User',
            created_at: '2024-01-10',
            updated_at: '2024-01-16'
          },
          {
            id: '2',
            project_id: '1',
            project_name: 'Swine Farming Project',
            association_name: 'Farmers Association 1',
            visit_number: 2,
            visit_date: '2024-02-20',
            status: 'completed',
            visit_purpose: 'Follow-up on feed supply issues and progress monitoring',
            participants: ['Maria Santos', 'Juan Dela Cruz'],
            location: 'sitio tabugon brgy caradio-an himamaylan city, Negros Occidental',
            findings: 'Feed supply issues resolved. New supplier contracted. Pig growth rates exceeding expectations. Biosecurity measures properly implemented.',
            recommendations: 'Increase herd size by adding 5 new sows next month. Consider vaccination program expansion.',
            next_steps: 'Schedule vaccination training',
            caretakers: [
              {
                id: 'CT002',
                name: 'Maria Santos',
                role: 'Field Officer',
                contact_number: '+639987654321',
                email: 'maria.santos@example.com',
                notes: 'Responsible for daily monitoring'
              }
            ],
            created_by: 'Admin User',
            created_at: '2024-02-01',
            updated_at: '2024-02-21'
          },
          {
            id: '3',
            project_id: '2',
            project_name: 'Organic Vegetable Farming',
            association_name: 'Farmers Association 3',
            visit_number: 1,
            visit_date: '2024-01-20',
            status: 'completed',
            visit_purpose: 'Site validation and soil testing',
            participants: ['Robert Cruz', 'Anna Reyes'],
            location: 'sitio garangan Brgy. tooy Him, Negros Occidental',
            findings: 'Soil quality is excellent for organic farming. Good water source available. Initial planting successful with 85% germination rate.',
            recommendations: 'Proceed with planting schedule as planned. Consider adding compost production facility.',
            next_steps: 'Second visit after first harvest',
            caretakers: [
              {
                id: 'CT003',
                name: 'Robert Cruz',
                role: 'Technical Expert',
                contact_number: '+639876543210',
                email: 'robert.cruz@example.com',
                notes: 'Soil testing specialist'
              }
            ],
            created_by: 'Admin User',
            created_at: '2024-01-15',
            updated_at: '2024-01-21'
          },
          {
            id: '4',
            project_id: '3',
            project_name: 'Poultry Production',
            association_name: 'Poultry Farmers Association',
            visit_number: 1,
            visit_date: '2024-02-15',
            status: 'completed',
            visit_purpose: 'Initial facility inspection and biosecurity assessment',
            participants: ['Anna Reyes', 'Michael Tan'],
            location: 'Brgy. Bata, Bacolod City',
            findings: 'Poultry houses well-constructed. Biosecurity measures adequate but can be improved. Feed conversion ratio good at 1.8.',
            recommendations: 'Implement stricter biosecurity protocols. Consider expanding capacity by 20%.',
            next_steps: 'Follow-up visit in 45 days',
            caretakers: [
              {
                id: 'CT004',
                name: 'Pedro Reyes',
                role: 'Farm Manager',
                contact_number: '+639112233445',
                email: 'pedro.reyes@example.com',
                notes: 'Experienced poultry farmer'
              }
            ],
            created_by: 'Admin User',
            created_at: '2024-02-10',
            updated_at: '2024-02-16'
          }
        ];
        setSiteVisits(mockSiteVisits);
      }
    } catch (error) {
      console.error('Error fetching site visits data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSiteVisit = (
    visitNumber: number, 
    projectId?: string, 
    associationId?: string, 
    associationName?: string
  ) => {
    setSelectedVisitNumber(visitNumber);
    setSelectedProjectId(projectId || null);
    setSelectedAssociationId(associationId || null);
    setSelectedAssociationName(associationName || null);
    setMode('add');
    setShowProjectSelection(false);
  };

  const handleViewSiteVisit = (siteVisitId: string) => {
    setSelectedSiteVisitId(siteVisitId);
    setMode('view');
  };

  const handleEditSiteVisit = (siteVisitId: string) => {
    setSelectedSiteVisitId(siteVisitId);
    setMode('edit');
  };

  const handleBackToList = () => {
    setMode('list');
    setSelectedSiteVisitId(null);
    setSelectedProjectId(null);
    setSelectedVisitNumber(null);
    setSelectedAssociationId(null);
    setSelectedAssociationName(null);
    setShowProjectSelection(false);
    setSelectedVisitForProject(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      
      // Transform API caretakers to form caretakers
      if (formData.selectedCaretakers && Array.isArray(formData.selectedCaretakers)) {
        formData.caretakers = formData.selectedCaretakers.map((caretakerId: string) => {
          const apiCaretaker = caretakers.find(c => c.id === caretakerId);
          if (!apiCaretaker) {
            return {
              id: caretakerId,
              name: 'Unknown Caretaker',
              role: '',
              contact_number: '',
              email: '',
              notes: ''
            };
          }
          
          return {
            id: apiCaretaker.id,
            name: getFullName(apiCaretaker),
            role: apiCaretaker.role || 'Caretaker',
            contact_number: apiCaretaker.phone || apiCaretaker.contactNumber || '',
            email: apiCaretaker.email || '',
            notes: apiCaretaker.notes || ''
          };
        });
      }
      
      // If we have selected association info, add it to form data
      if (selectedAssociationId && selectedAssociationName) {
        formData.association_id = selectedAssociationId;
        formData.association_name = selectedAssociationName;
      }
      
      // Add project info if available
      if (selectedProjectId) {
        formData.project_id = selectedProjectId;
        const selectedProject = projects.find(p => p.id === selectedProjectId);
        if (selectedProject) {
          formData.project_name = getProjectName(selectedProject);
        }
      }

      const method = mode === 'edit' ? 'PUT' : 'POST';
      const url = mode === 'edit' 
        ? `/api/monitoring/site-visits/${selectedSiteVisitId}`
        : '/api/monitoring/site-visits';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        handleBackToList();
        fetchData();
        alert('Site visit saved successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to save site visit');
      }
    } catch (error) {
      console.error('Error saving site visit:', error);
      alert(`Failed to save site visit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSiteVisit = async (siteVisitId: string) => {
    if (!confirm('Are you sure you want to delete this site visit?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/monitoring/site-visits/${siteVisitId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        handleBackToList();
        fetchData();
        alert('Site visit deleted successfully!');
      } else {
        throw new Error('Failed to delete site visit');
      }
    } catch (error) {
      console.error('Error deleting site visit:', error);
      alert('Failed to delete site visit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVisitNumber = (visitNumber: number) => {
    setSelectedVisitForProject(visitNumber);
    setShowProjectSelection(true);
  };

  const handleViewRankingDetails = (projectId: string, associationId?: string) => {
    // You can navigate to a detailed view or show a modal
    console.log('View ranking details:', { projectId, associationId });
    // For now, we'll just show an alert
    const ranking = projectRankings.find(r => 
      r.project_id === projectId && 
      (!associationId || r.association_id === associationId)
    );
    if (ranking) {
      alert(`Project: ${ranking.project_name}\nAssociation: ${ranking.association_name}\nScore: ${ranking.score}/100\nEligibility Status:\n- Membership Renewal: ${ranking.renewal_eligibility ? '✅ Eligible' : '❌ Not Eligible'}\n- Pig Addition: ${ranking.pig_addition_eligibility ? '✅ Eligible' : '❌ Not Eligible'}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-50 text-green-700 border-green-200',
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      'in-progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircle className="h-3 w-3" />,
      scheduled: <Clock className="h-3 w-3" />,
      'in-progress': <AlertCircle className="h-3 w-3" />,
      cancelled: <AlertCircle className="h-3 w-3" />,
    };
    return icons[status as keyof typeof icons] || <Clock className="h-3 w-3" />;
  };

  const getRankingStatusColor = (status: ProjectRanking['status']) => {
    const colors = {
      excellent: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border-emerald-200',
      good: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border-blue-200',
      fair: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-amber-200',
      poor: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-800 border-gray-200';
  };

  const getRankingStatusIcon = (status: ProjectRanking['status']) => {
    const icons = {
      excellent: <Trophy className="h-4 w-4 text-yellow-500" />,
      good: <Star className="h-4 w-4 text-blue-500" />,
      fair: <Target className="h-4 w-4 text-amber-500" />,
      poor: <AlertCircle className="h-4 w-4 text-gray-500" />,
    };
    return icons[status];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-gray-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-amber-100';
    return 'bg-gray-100';
  };

  const getVisitNumberColor = (visitNumber: number) => {
    const colors = {
      1: 'bg-blue-100 text-blue-800 border-blue-200',
      2: 'bg-green-100 text-green-800 border-green-200',
      3: 'bg-purple-100 text-purple-800 border-purple-200',
      4: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[visitNumber as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredSiteVisits = siteVisits.filter(visit => {
    const matchesSearch = 
      visit.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.association_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
    const matchesVisitNumber = visitNumberFilter === 'all' || visit.visit_number.toString() === visitNumberFilter;

    return matchesSearch && matchesStatus && matchesVisitNumber;
  });

  const filteredRankings = projectRankings.filter(ranking => {
    const matchesSearch = 
      ranking.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ranking.association_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ranking.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = rankingFilter === 'all' || 
      (rankingFilter === 'renewal' && ranking.renewal_eligibility) ||
      (rankingFilter === 'pig_addition' && ranking.pig_addition_eligibility);

    return matchesSearch && matchesFilter;
  });

  // Get caretaker names for display
  const getCaretakerNames = (siteVisit: SiteVisit): string => {
    if (siteVisit.caretakers.length === 0) return 'No caretakers';
    
    return siteVisit.caretakers
      .slice(0, 2)
      .map(c => c.name)
      .join(', ') + (siteVisit.caretakers.length > 2 ? ` +${siteVisit.caretakers.length - 2} more` : '');
  };

  // Convert API caretakers to form caretakers
  const convertToFormCaretakers = (): any[] => {
    return caretakers.map(caretaker => ({
      id: caretaker.id,
      name: getFullName(caretaker),
      role: caretaker.role || 'Caretaker',
      contact_number: caretaker.phone || caretaker.contactNumber || '',
      email: caretaker.email || '',
      notes: caretaker.notes || '',
      status: caretaker.status || 'active',
      slpAssociation: caretaker.slpAssociation || 'No Association'
    }));
  };

  // Project Selection Modal Component - FIXED WITH PROPER KEYS
  const ProjectSelectionModal = () => {
    if (!showProjectSelection || !selectedVisitForProject) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Transparent blurry backdrop */}
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => {
            setShowProjectSelection(false);
            setSelectedVisitForProject(null);
          }}
        />
        
        {/* Modal content */}
        <div className="relative bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Select Project for {selectedVisitForProject}{selectedVisitForProject === 1 ? 'st' : selectedVisitForProject === 2 ? 'nd' : selectedVisitForProject === 3 ? 'rd' : 'th'} Visit
                </h3>
                <p className="text-gray-600 mt-1">
                  Choose a project and association for this site visit
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowProjectSelection(false);
                  setSelectedVisitForProject(null);
                }}
                className="h-10 w-10 hover:bg-gray-100/80"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No projects available</p>
                </div>
              ) : (
                projects.map((project, projectIndex) => {
                  const associations = project.operationalInformation?.multipleAssociations || [];
                  const projectName = getProjectName(project);
                  
                  return (
                    <Card 
                      key={`project-modal-${project.id}-${projectIndex}`}
                      className="border-gray-200/50 bg-white/60"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Building className="h-5 w-5 text-blue-500" />
                              <div>
                                <h4 className="font-semibold text-gray-900">{projectName}</h4>
                                <p className="text-sm text-gray-500">
                                  {project.enterpriseSetup?.enterpriseType} • {project.enterpriseSetup?.cityMunicipality}, {project.enterpriseSetup?.province}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {associations.length === 0 ? (
                              <div className="text-sm text-gray-500 italic">
                                No associations for this project
                              </div>
                            ) : associations.length === 1 ? (
                              <Button
                                key={`project-${project.id}-association-${associations[0].id}`}
                                onClick={() => handleAddSiteVisit(
                                  selectedVisitForProject,
                                  project.id,
                                  associations[0].id,
                                  associations[0].name
                                )}
                                className="w-full flex items-center justify-between bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border-blue-200/50 backdrop-blur-sm"
                                variant="outline"
                              >
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>{associations[0].name}</span>
                                </div>
                                <Plus className="h-4 w-4" />
                              </Button>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Select an association:</p>
                                {associations.map((association, associationIndex) => (
                                  <Button
                                    key={`project-${project.id}-association-${association.id}-${associationIndex}`}
                                    onClick={() => handleAddSiteVisit(
                                      selectedVisitForProject,
                                      project.id,
                                      association.id,
                                      association.name
                                    )}
                                    className="w-full flex items-center justify-between hover:bg-gray-50/80 backdrop-blur-sm"
                                    variant="outline"
                                    size="sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Users className="h-3 w-3" />
                                      <div className="text-left">
                                        <div className="font-medium">{association.name}</div>
                                        <div className="text-xs text-gray-500 truncate">
                                          {association.location}
                                        </div>
                                      </div>
                                    </div>
                                    <ArrowLeft className="h-3 w-3 transform rotate-180" />
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render different modes
  if (mode === 'add' || mode === 'edit') {
    const initialData = mode === 'edit' && selectedSiteVisitId 
      ? siteVisits.find(v => v.id === selectedSiteVisitId)
      : null;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* ✅ FIXED: Using the correct component with proper props */}
          <SiteVisitForm 
            initialData={initialData}
            projectId={selectedProjectId || undefined}
            visitNumber={selectedVisitNumber || undefined}
            isEditing={mode === 'edit'}
            onSubmit={handleFormSubmit}
            onCancel={handleBackToList}
          />
        </div>
      </div>
    );
  }

  if (mode === 'view' && selectedSiteVisitId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* ✅ FIXED: Using the correct component with proper props */}
          <SiteVisitView
            siteVisitId={selectedSiteVisitId}
            onBack={handleBackToList}
            onEdit={() => handleEditSiteVisit(selectedSiteVisitId)}
          />
        </div>
      </div>
    );
  }

  // Default: List mode
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Loading site visits</p>
            <p className="text-gray-600 text-sm">Please wait while we load your data</p>
          </div>
        </div>
      </div>
    );
  }

  // Eligibility Stats
  const eligibleForRenewal = projectRankings.filter(r => r.renewal_eligibility).length;
  const eligibleForPigAddition = projectRankings.filter(r => r.pig_addition_eligibility).length;
  const totalProjects = projectRankings.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/admin/program-monitoring/project-monitoring')}
                className="h-10 w-10 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Site Visits & Ranking</h1>
                <p className="text-gray-600 mt-1">Manage project site visits and view eligibility rankings</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={fetchData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs for switching between views */}
        <Tabs defaultValue="visits" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="visits" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Site Visits
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Project Ranking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visits" className="space-y-8">
            {/* Quick Visit Number Cards - Now Clickable */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((visitNumber) => {
                const visitsForNumber = siteVisits.filter(v => v.visit_number === visitNumber);
                const completedVisits = visitsForNumber.filter(v => v.status === 'completed').length;
                
                return (
                  <Card 
                    key={`visit-card-${visitNumber}`} 
                    className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
                    onClick={() => handleSelectVisitNumber(visitNumber)}
                  >
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getVisitNumberColor(visitNumber)} font-semibold text-lg`}>
                          {visitNumber}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base mb-2">
                            {visitNumber}{visitNumber === 1 ? 'st' : visitNumber === 2 ? 'nd' : visitNumber === 3 ? 'rd' : 'th'} Visit
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            {completedVisits} completed • {visitsForNumber.length} total
                          </p>
                          
                          <div className="text-center">
                            <Badge 
                              variant="outline" 
                              className={`${getVisitNumberColor(visitNumber)} hover:opacity-90`}
                            >
                              Click to Add Visit
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Project Selection Modal */}
            <ProjectSelectionModal />

            {/* Site Visits Table */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl text-gray-900">Site Visit Records</CardTitle>
                    <CardDescription className="text-gray-600">
                      {filteredSiteVisits.length} site visits found
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search site visits..."
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
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem key="status-all" onClick={() => setStatusFilter("all")}>
                            All Status
                          </DropdownMenuItem>
                          <DropdownMenuItem key="status-completed" onClick={() => setStatusFilter("completed")}>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem key="status-scheduled" onClick={() => setStatusFilter("scheduled")}>
                            <Clock className="h-4 w-4 mr-2 text-blue-600" />
                            Scheduled
                          </DropdownMenuItem>
                          <DropdownMenuItem key="status-in-progress" onClick={() => setStatusFilter("in-progress")}>
                            <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem key="status-cancelled" onClick={() => setStatusFilter("cancelled")}>
                            <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                            Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
                            <Filter className="h-4 w-4" />
                            Visit
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Filter by Visit</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem key="visit-all" onClick={() => setVisitNumberFilter("all")}>
                            All Visits
                          </DropdownMenuItem>
                          {[1, 2, 3, 4].map((num) => (
                            <DropdownMenuItem 
                              key={`visit-${num}`}
                              onClick={() => setVisitNumberFilter(num.toString())}
                            >
                              {num}{num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'} Visit
                            </DropdownMenuItem>
                          ))}
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
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700">Visit Details</TableHead>
                        <TableHead className="font-semibold text-gray-700">Project & Association</TableHead>
                        <TableHead className="font-semibold text-gray-700">Caretakers</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSiteVisits.length > 0 ? (
                        filteredSiteVisits.map((visit, index) => (
                          <TableRow 
                            key={`visit-row-${visit.id || `index-${index}`}`} 
                            className="hover:bg-gray-50 group"
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={getVisitNumberColor(visit.visit_number)}
                                  >
                                    {visit.visit_number}{visit.visit_number === 1 ? 'st' : visit.visit_number === 2 ? 'nd' : visit.visit_number === 3 ? 'rd' : 'th'}
                                  </Badge>
                                  <div className="font-medium text-gray-900 text-sm">
                                    {visit.visit_purpose.slice(0, 50)}...
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {visit.participants.length} participants
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {visit.location.slice(0, 40)}...
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  {visit.project_name}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {visit.association_name}
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {getCaretakerNames(visit)}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={`flex items-center gap-1.5 w-fit ${getStatusColor(visit.status)}`}
                              >
                                {getStatusIcon(visit.status)}
                                {visit.status.charAt(0).toUpperCase() + visit.status.slice(1).replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            
                            <TableCell>
                              <div className="text-sm text-gray-700">
                                {formatDate(visit.visit_date)}
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewSiteVisit(visit.id)}
                                  className="h-8 w-8 p-0 hover:bg-gray-100 opacity-70 hover:opacity-100"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSiteVisit(visit.id)}
                                  className="h-8 w-8 p-0 hover:bg-gray-100 opacity-70 hover:opacity-100"
                                  title="Edit"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSiteVisit(visit.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-50 text-red-600 opacity-70 hover:opacity-100"
                                  title="Delete"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow key="no-results-row">
                          <TableCell colSpan={6} className="py-12 text-center">
                            <div className="text-gray-300 mb-3">
                              <Map className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No site visits found
                            </h3>
                            <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                              {searchTerm || statusFilter !== 'all' || visitNumberFilter !== 'all' 
                                ? "No site visits match your current filters."
                                : "Click on any of the visit cards above to create your first site visit."
                              }
                            </p>
                            {(searchTerm || statusFilter !== 'all' || visitNumberFilter !== 'all') && (
                              <Button 
                                onClick={() => {
                                  setSearchTerm('');
                                  setStatusFilter('all');
                                  setVisitNumberFilter('all');
                                }}
                                variant="outline"
                                size="sm"
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
          </TabsContent>

          <TabsContent value="ranking" className="space-y-8">
            {/* Eligibility Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-medium text-green-700">Eligible for Renewal</p>
                      </div>
                      <div className="text-3xl font-bold text-green-800">{eligibleForRenewal}</div>
                      <p className="text-sm text-green-600 mt-1">
                        {totalProjects > 0 ? `${Math.round((eligibleForRenewal / totalProjects) * 100)}% of projects` : 'No projects'}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Ready
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <PiggyBank className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-700">Eligible for Pig Addition</p>
                      </div>
                      <div className="text-3xl font-bold text-blue-800">{eligibleForPigAddition}</div>
                      <p className="text-sm text-blue-600 mt-1">
                        {totalProjects > 0 ? `${Math.round((eligibleForPigAddition / totalProjects) * 100)}% of projects` : 'No projects'}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      Ready
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        <p className="text-sm font-medium text-purple-700">Top Performing</p>
                      </div>
                      <div className="text-3xl font-bold text-purple-800">
                        {projectRankings.filter(r => r.status === 'excellent').length}
                      </div>
                      <p className="text-sm text-purple-600 mt-1">Excellent rating projects</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                      Excellent
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ranking Table */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl text-gray-900">Project Ranking & Eligibility</CardTitle>
                    <CardDescription className="text-gray-600">
                      {filteredRankings.length} projects ranked • Based on site visit performance
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search projects..."
                        className="pl-10 w-full sm:w-64 bg-gray-50 border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
                          <Filter className="h-4 w-4" />
                          Filter
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Filter by Eligibility</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem key="filter-all" onClick={() => setRankingFilter("all")}>
                          All Projects
                        </DropdownMenuItem>
                        <DropdownMenuItem key="filter-renewal" onClick={() => setRankingFilter("renewal")}>
                          <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                          Eligible for Renewal
                        </DropdownMenuItem>
                        <DropdownMenuItem key="filter-pig" onClick={() => setRankingFilter("pig_addition")}>
                          <PiggyBank className="h-4 w-4 mr-2 text-blue-600" />
                          Eligible for Pig Addition
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700">Rank</TableHead>
                        <TableHead className="font-semibold text-gray-700">Project Details</TableHead>
                        <TableHead className="font-semibold text-gray-700">Performance</TableHead>
                        <TableHead className="font-semibold text-gray-700">Eligibility</TableHead>
                        <TableHead className="font-semibold text-gray-700">Score</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRankings.length > 0 ? (
                        filteredRankings.map((ranking, index) => (
                          <TableRow 
                            key={`ranking-row-${ranking.id || `index-${index}`}`} 
                            className="hover:bg-gray-50/50 group"
                          >
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                  index === 1 ? 'bg-gray-100 text-gray-800 border-gray-300' :
                                  index === 2 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                } font-bold border`}>
                                  {index + 1}
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="space-y-2">
                                <div>
                                  <div className="font-semibold text-gray-900">{ranking.project_name}</div>
                                  <div className="text-sm text-gray-600 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {ranking.association_name}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {ranking.location}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                    {ranking.enterprise_type}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {ranking.member_count} members
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-600">Site Visit Progress</span>
                                    <span className="font-medium">{ranking.progress_percentage}%</span>
                                  </div>
                                  <Progress value={ranking.progress_percentage} className="h-2" />
                                </div>
                                <div className="text-sm text-gray-600">
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      {ranking.completed_visits} completed
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-blue-500" />
                                      {ranking.visit_count} total
                                    </span>
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500">
                                    Last visit: {ranking.last_visit_date === 'Never' ? 'Never' : formatDate(ranking.last_visit_date)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="space-y-2">
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1.5 w-fit ${getRankingStatusColor(ranking.status)}`}
                                >
                                  {getRankingStatusIcon(ranking.status)}
                                  {ranking.status.charAt(0).toUpperCase() + ranking.status.slice(1)}
                                </Badge>
                                
                                <div className="space-y-1">
                                  <div className={`flex items-center gap-2 text-sm ${ranking.renewal_eligibility ? 'text-green-600' : 'text-gray-500'}`}>
                                    {ranking.renewal_eligibility ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <X className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span>Membership Renewal</span>
                                  </div>
                                  <div className={`flex items-center gap-2 text-sm ${ranking.pig_addition_eligibility ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {ranking.pig_addition_eligibility ? (
                                      <CheckCircle className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <X className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span>Pig Addition</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex flex-col items-center">
                                <div className={`text-2xl font-bold ${getScoreColor(ranking.score)}`}>
                                  {ranking.score}
                                </div>
                                <div className="text-xs text-gray-500">/100</div>
                                <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${getScoreBgColor(ranking.score)} ${getScoreColor(ranking.score)}`}>
                                  {ranking.score >= 80 ? 'Excellent' : ranking.score >= 60 ? 'Good' : ranking.score >= 40 ? 'Fair' : 'Poor'}
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewRankingDetails(ranking.project_id, ranking.association_id)}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  Details
                                </Button>
                                {ranking.renewal_eligibility && (
                                  <Button 
                                    variant="default"
                                    size="sm"
                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => alert(`Proceed with membership renewal for ${ranking.association_name}`)}
                                  >
                                    <UserCheck className="h-3 w-3" />
                                    Renew
                                  </Button>
                                )}
                                {ranking.pig_addition_eligibility && ranking.enterprise_type === 'Swine Production' && (
                                  <Button 
                                    variant="default"
                                    size="sm"
                                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={() => alert(`Add pigs to ${ranking.project_name} - ${ranking.association_name}`)}
                                  >
                                    <PiggyBank className="h-3 w-3" />
                                    Add Pigs
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow key="no-rankings-row">
                          <TableCell colSpan={6} className="py-12 text-center">
                            <div className="text-gray-300 mb-3">
                              <Trophy className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No project rankings available
                            </h3>
                            <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                              {searchTerm || rankingFilter !== 'all' 
                                ? "No projects match your current filters."
                                : "Complete site visits to generate project rankings."
                              }
                            </p>
                            {(searchTerm || rankingFilter !== 'all') && (
                              <Button 
                                onClick={() => {
                                  setSearchTerm('');
                                  setRankingFilter('all');
                                }}
                                variant="outline"
                                size="sm"
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

            {/* Legend */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Excellent (80-100)</p>
                      <p className="text-xs text-gray-500">Top priority for renewal & expansion</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Good (60-79)</p>
                      <p className="text-xs text-gray-500">Eligible for most benefits</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Fair (40-59)</p>
                      <p className="text-xs text-gray-500">Needs improvement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Poor (0-39)</p>
                      <p className="text-xs text-gray-500">Requires immediate attention</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}