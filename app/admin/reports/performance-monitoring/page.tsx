'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  RefreshCw, 
  Users, 
  BarChart3,
  Eye,
  Building,
  Calendar,
  AlertTriangle,
  Star,
  User as UserIcon,
  CheckCircle,
  FileText,
  Activity,
  LineChart,
  PlusCircle,
  ChevronLeft,
  Bell,
  X,
  AlertCircle,
  TrendingUp,
  Trophy,
  Target,
  Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Import Components
import CaretakerPerformanceDashboard from '@/components/performance/caretakers/CaretakerPerformanceDashboard';
import CaretakerPerformance from '@/components/performance/caretakers/caretakerperformance';
import OverviewRankings from '@/components/performance/OverviewRankings';
import PerformanceOverviewSection from '@/components/performance/PerformanceOverviewSection';
import PerformanceAssessmentModal from '@/components/performance/PerformanceAssessmentModal';
import PigPerformanceMonitoringDashboard from '@/components/admin/PigPerformanceMonitoringDashboard';

// Import API and Types
import { performanceApi, transformCaretakerData, transformAssessmentData } from '@/lib/api/performance';
import { Caretaker, PerformanceAssessment, getFullName } from '@/types/performance';

export default function PerformanceMonitoringPage() {
  const router = useRouter();
  const params = useParams();
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
  const [assessments, setAssessments] = useState<PerformanceAssessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [associationFilter, setAssociationFilter] = useState('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCaretaker, setSelectedCaretaker] = useState<Caretaker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCaretakerId, setViewingCaretakerId] = useState<string | null>(null);
  const [associations, setAssociations] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<{message: string; type: 'success' | 'error' | 'info'; id: string}[]>([]);

  // Add notification
  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const notification = { message, type, id: Date.now().toString() };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Check URL params
  useEffect(() => {
    const caretakerIdFromUrl = params.id as string;
    if (caretakerIdFromUrl && caretakerIdFromUrl !== 'pigs') {
      setViewingCaretakerId(caretakerIdFromUrl);
      setActiveTab('caretaker-detail');
    } else if (caretakerIdFromUrl === 'pigs') {
      setActiveTab('pigs');
    }
  }, [params.id]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch caretakers
      try {
        const caretakersData = await performanceApi.getCaretakers();
        const transformedCaretakers = caretakersData.map(transformCaretakerData);
        setCaretakers(transformedCaretakers);

        // Extract associations
        const uniqueAssociations = Array.from(new Set(
          transformedCaretakers
            .map(c => c.slpAssociation)
            .filter(assoc => assoc && assoc.trim() !== '')
        ));
        setAssociations(uniqueAssociations as string[]);
        
        addNotification(`Loaded ${transformedCaretakers.length} caretakers`, 'success');
      } catch (err) {
        setCaretakers([]);
        setAssociations([]);
        addNotification('Failed to load caretakers', 'error');
        throw err;
      }

      // Fetch assessments
      try {
        const assessmentsData = await performanceApi.getAssessments();
        const transformedAssessments = assessmentsData.map(transformAssessmentData);
        setAssessments(transformedAssessments);
        addNotification(`Loaded ${assessmentsData.length} assessments`, 'success');
      } catch (err) {
        setAssessments([]);
        addNotification('No assessments found', 'info');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      addNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save assessment
  const handleSaveAssessment = async (assessmentData: Omit<PerformanceAssessment, 'id' | '_id'>): Promise<PerformanceAssessment> => {
    try {
      const savedAssessment = await performanceApi.createAssessment(assessmentData);
      const transformedAssessment = transformAssessmentData(savedAssessment);
      
      setAssessments(prev => [...prev, transformedAssessment]);
      addNotification('Assessment saved successfully', 'success');
      
      // Refresh data
      fetchData();
      
      return transformedAssessment;
    } catch (error) {
      console.error('Error saving assessment:', error);
      addNotification('Failed to save assessment', 'error');
      throw error;
    }
  };

  const handleViewCaretakerPerformance = useCallback((caretakerId: string) => {
    setViewingCaretakerId(caretakerId);
    setActiveTab('caretaker-detail');
    router.push(`/admin/reports/performance-monitoring/${caretakerId}`);
    addNotification(`Viewing caretaker details`, 'info');
  }, [router, addNotification]);

  const handleAddAssessment = useCallback((caretaker: Caretaker) => {
    setSelectedCaretaker(caretaker);
    setIsModalOpen(true);
    addNotification(`Adding assessment for ${getFullName(caretaker)}`, 'info');
  }, [addNotification]);

  const handleBackToDashboard = useCallback(() => {
    setViewingCaretakerId(null);
    setActiveTab('overview');
    router.push('/admin/reports/performance-monitoring');
    addNotification('Returned to dashboard', 'info');
  }, [router, addNotification]);

  // Filter caretakers
  const filteredCaretakers = caretakers.filter(caretaker => {
    const fullName = getFullName(caretaker);
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (caretaker.email && caretaker.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || caretaker.status === statusFilter;
    const matchesAssociation = associationFilter === 'all' || caretaker.slpAssociation === associationFilter;
    
    return matchesSearch && matchesStatus && matchesAssociation;
  });

  // If viewing caretaker detail
  if (viewingCaretakerId && activeTab === 'caretaker-detail') {
    const caretaker = caretakers.find(c => c.id === viewingCaretakerId || c._id === viewingCaretakerId);
    if (caretaker) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="mb-4 space-y-2">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                      notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                      'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="text-sm font-medium">{notification.message}</span>
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Back button and header */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToDashboard}
                className="mb-4 flex items-center gap-2 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Performance Dashboard
              </Button>
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {getFullName(caretaker)} Performance Details
                  </h1>
                  <p className="text-gray-600">
                    Detailed performance metrics and analytics
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fetchData()}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Button
                    onClick={() => handleAddAssessment(caretaker)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Assessment
                  </Button>
                </div>
              </div>
            </div>
            
            {/* CaretakerPerformance component */}
            <CaretakerPerformance
              caretakerId={viewingCaretakerId}
              onBack={handleBackToDashboard}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="mb-6 flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Performance Dashboard
            </Button>
            
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Caretaker Not Found</h3>
                  <p className="text-gray-600 mb-4">
                    The requested caretaker could not be found.
                  </p>
                  <Button onClick={handleBackToDashboard}>
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  }

  // If viewing pigs dashboard
  if (activeTab === 'pigs') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="mb-6 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Human Performance Dashboard
          </Button>
          
          <PigPerformanceMonitoringDashboard />
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Loading performance data</p>
            <p className="text-gray-600 text-sm">Please wait while we load performance metrics</p>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                  notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4" />
                    <span className="font-medium">{notification.message}</span>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Performance Monitoring</h1>
            <p className="text-gray-600">Track and analyze performance metrics and rankings</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => fetchData()} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            <Button 
              onClick={() => caretakers.length > 0 && handleAddAssessment(caretakers[0])}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Assessment
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-red-800 font-medium">Error Loading Data</div>
                    <div className="text-red-600 text-sm">{error}</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchData()}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5">
         
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Overview & Rankings
            </TabsTrigger>
            <TabsTrigger value="caretakers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Caretakers
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                {caretakers.length}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger value="pigs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Pig Performance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewRankings
              caretakers={caretakers}
              assessments={assessments}
              onViewCaretaker={handleViewCaretakerPerformance}
              onAddAssessment={handleAddAssessment}
              searchTerm={searchTerm}
            />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <CaretakerPerformanceDashboard 
              timeRange={timeRange} 
              caretakers={caretakers}
              assessments={assessments}
            />
          </TabsContent>

          {/* Caretakers Tab */}
          <TabsContent value="caretakers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-1">
                    <CardTitle>Caretaker Performance List</CardTitle>
                    <CardDescription>Browse and manage all caretaker performance records</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search caretakers..."
                          className="pl-10 w-full lg:w-64"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on-leave">On Leave</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={associationFilter} onValueChange={setAssociationFilter}>
                        <SelectTrigger className="w-[180px]">
                          <Building className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Association" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Associations</SelectItem>
                          {associations.map(association => (
                            <SelectItem key={association} value={association}>
                              {association}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredCaretakers.map((caretaker) => {
                    const caretakerId = caretaker.id || caretaker._id || '';
                    const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
                    
                    return (
                      <PerformanceOverviewSection
                        key={caretakerId}
                        caretaker={caretaker}
                        assessments={caretakerAssessments}
                        onClick={() => handleViewCaretakerPerformance(caretakerId)}
                        onAddAssessment={handleAddAssessment}
                      />
                    );
                  })}
                  
                  {filteredCaretakers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No caretakers found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || statusFilter !== 'all' || associationFilter !== 'all'
                          ? "No caretakers match your current filters."
                          : "No caretakers available."
                        }
                      </p>
                      <Button 
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setAssociationFilter('all');
                        }}
                        variant="outline"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-1">
                    <CardTitle>Performance Assessments</CardTitle>
                    <CardDescription>View and manage all performance assessments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caretakers.map(caretaker => {
                    const caretakerId = caretaker.id || caretaker._id;
                    if (!caretakerId) return null;
                    
                    const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
                    if (caretakerAssessments.length === 0) return null;
                    
                    return (
                      <Card key={caretakerId} className="border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{getFullName(caretaker)}</CardTitle>
                                <CardDescription>
                                  {caretaker.slpAssociation || 'No Association'} • {caretakerAssessments.length} assessments
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewCaretakerPerformance(caretakerId)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAddAssessment(caretaker)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Assessment
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {caretakerAssessments.slice(-3).reverse().map((assessment) => {
                              const categories = assessment.categories || {
                                punctuality: assessment.rating,
                                communication: assessment.rating,
                                patientCare: assessment.rating,
                                professionalism: assessment.rating,
                                technicalSkills: assessment.rating
                              };
                              
                              const date = assessment.date || assessment.assessmentDate;
                              
                              return (
                                <div key={assessment._id || assessment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="flex">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              className={`h-4 w-4 ${
                                                star <= assessment.rating
                                                  ? 'text-yellow-500 fill-yellow-500'
                                                  : 'text-gray-300'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="font-bold ml-2">{assessment.rating.toFixed(1)}/5</span>
                                        <Badge variant="outline" className="ml-2">
                                          {date ? new Date(date).toLocaleDateString() : 'No date'}
                                        </Badge>
                                        {assessment.assessedBy && (
                                          <Badge variant="secondary" className="ml-2">
                                            By: {assessment.assessedBy}
                                          </Badge>
                                        )}
                                      </div>
                                      {assessment.comments && (
                                        <p className="text-sm text-gray-600 mt-2">{assessment.comments}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {Object.entries(categories).map(([category, value]) => (
                                      <div key={category} className="text-center p-2 bg-gray-50 rounded">
                                        <div className="text-xs text-gray-500 capitalize">
                                          {category.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        <div className="font-bold text-lg">{value.toFixed(1)}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {assessments.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
                      <p className="text-gray-600 mb-4">
                        Get started by adding performance assessments.
                      </p>
                      <Button 
                        onClick={() => {
                          if (caretakers.length > 0) {
                            handleAddAssessment(caretakers[0]);
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add First Assessment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pig Performance Tab */}
          <TabsContent value="pigs" className="space-y-6">
            <PigPerformanceMonitoringDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Performance Assessment Modal */}
      <PerformanceAssessmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCaretaker(null);
        }}
        caretaker={selectedCaretaker}
        onSave={handleSaveAssessment}
      />
    </div>
  );
}