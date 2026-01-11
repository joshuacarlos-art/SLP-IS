'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  Award,
  Star,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  FileText,
  MessageSquare,
  Heart,
  Zap,
  Shield,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LineChart as LineChartIcon,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  Building,
  CalendarDays,
  Timer,
  Brain,
  MessageCircle,
  ShieldCheck,
  Pill,
  Stethoscope,
  ClipboardCheck,
  Bell,
  Send,
  Edit,
  Trash2,
  Printer,
  Share2,
  History,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';

// Import unified types and API
import { performanceApi, transformCaretakerData, transformAssessmentData } from '@/lib/api/performance';
import { 
  Caretaker, 
  PerformanceAssessment,
  PerformanceMetric,
  PerformanceAlert,
  PerformanceTrendData,
  PerformanceComparison,
  ShiftPerformance,
  SkillAssessment,
  getFullName,
  convertToPercentage,
  convertFromPercentage,
  formatPercentage,
  getPerformanceLevel,
  getPerformanceColor,
  getStatusColor
} from '@/types/performance';

interface CaretakerPerformanceProps {
  caretakerId: string;
  onBack?: () => void;
}

export default function CaretakerPerformance({ caretakerId, onBack }: CaretakerPerformanceProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caretaker, setCaretaker] = useState<Caretaker | null>(null);
  const [assessments, setAssessments] = useState<PerformanceAssessment[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCaretakerData();
  }, [caretakerId, timeRange]);

  const fetchCaretakerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch caretaker data
      const caretakerData = await performanceApi.getCaretakerById(caretakerId);
      setCaretaker(transformCaretakerData(caretakerData));

      // Fetch assessments
      const assessmentsData = await performanceApi.getCaretakerAssessments(caretakerId);
      setAssessments(assessmentsData.map(transformAssessmentData));

    } catch (error) {
      console.error('Error loading caretaker performance data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchCaretakerData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Loading caretaker performance data</p>
            <p className="text-gray-600 text-sm">Please wait while we load the performance metrics</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !caretaker) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-red-800 font-medium">Error Loading Data</div>
                  <div className="text-red-600 text-sm">{error || 'No data available'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {onBack && (
                  <Button variant="outline" onClick={onBack}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button variant="outline" onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate performance summary
  const averageRating = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + a.rating, 0) / assessments.length
    : 0;

  const performanceScore = caretaker.performanceScore || averageRating * 20;
  const lastAssessment = assessments.length > 0
    ? new Date(assessments[assessments.length - 1].date || assessments[assessments.length - 1].assessmentDate)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {getFullName(caretaker)}
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant={caretaker.status === 'active' ? 'default' : 'outline'} 
                        className={caretaker.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                        {caretaker.status === 'active' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {caretaker.status === 'active' ? 'Active' : 
                         caretaker.status === 'on-leave' || caretaker.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-gray-600">ID: {caretakerId}</span>
                      <span className="text-sm text-gray-600">
                        <Building className="h-3 w-3 inline mr-1" />
                        {caretaker.slpAssociation}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
  value={timeRange} 
  onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'quarter' | 'year')}
>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {caretaker.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{caretaker.email}</span>
              </div>
            )}
            {caretaker.contactNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{caretaker.contactNumber}</span>
              </div>
            )}
            {caretaker.dateStarted && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays className="h-4 w-4" />
                <span>Started: {new Date(caretaker.dateStarted).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Performance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Overall Score</CardTitle>
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPercentage(performanceScore)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getPerformanceColor(performanceScore)}>
                      {getPerformanceLevel(performanceScore)}
                    </Badge>
                    <span className="text-sm text-gray-500">Rank #{caretaker.rank || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}/5
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= averageRating
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Assessments</CardTitle>
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {assessments.length}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {lastAssessment ? `Last: ${lastAssessment.toLocaleDateString()}` : 'No assessments yet'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
                    <Activity className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {caretaker.status === 'active' ? 'Active' : 
                     caretaker.status === 'on-leave' || caretaker.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {caretaker.slpAssociation}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Assessments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Assessments</CardTitle>
                <CardDescription>Latest performance evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                {assessments.length > 0 ? (
                  <div className="space-y-4">
                    {assessments.slice(-3).reverse().map((assessment) => (
                      <div key={assessment._id || assessment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {new Date(assessment.date || assessment.assessmentDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">{assessment.assessedBy}</div>
                          </div>
                          <Badge className={getPerformanceColor(assessment.rating * 20)}>
                            {assessment.rating.toFixed(1)}/5
                          </Badge>
                        </div>
                        {assessment.comments && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{assessment.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>No assessments yet</p>
                    <p className="text-sm">Add assessments to track performance</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Assessment History</CardTitle>
                <CardDescription>All performance assessments for {getFullName(caretaker)}</CardDescription>
              </CardHeader>
              <CardContent>
                {assessments.length > 0 ? (
                  <div className="space-y-6">
                    {assessments.map((assessment) => {
                      const categories = assessment.categories || {
                        punctuality: assessment.rating,
                        communication: assessment.rating,
                        patientCare: assessment.rating,
                        professionalism: assessment.rating,
                        technicalSkills: assessment.rating
                      };
                      
                      return (
                        <div key={assessment._id || assessment.id} className="border rounded-lg p-6 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3">
                                <Badge className={getPerformanceColor(assessment.rating * 20)}>
                                  {assessment.rating.toFixed(1)}/5 Overall
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {new Date(assessment.date || assessment.assessmentDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="mt-2">
                                <div className="font-medium">Assessed by: {assessment.assessedBy}</div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(categories).map(([category, value]) => (
                              <div key={category} className="text-center">
                                <div className="text-sm text-gray-500 capitalize">
                                  {category.replace(/([A-Z])/g, ' $1')}
                                </div>
                                <div className={`text-xl font-bold mt-1 ${getPerformanceColor(value * 20)} px-2 py-1 rounded`}>
                                  {value.toFixed(1)}/5
                                </div>
                              </div>
                            ))}
                          </div>

                          {assessment.comments && (
                            <div className="mt-6">
                              <div className="font-medium mb-2">Comments</div>
                              <p className="text-gray-700">{assessment.comments}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
                    <p className="text-gray-600">
                      No performance assessments have been added for this caretaker yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
        </Tabs>
      </div>
    </div>
  );
}