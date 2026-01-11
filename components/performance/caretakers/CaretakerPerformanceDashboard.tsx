'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Building,
  User as UserIcon,
  Mail,
  Phone,
  PlusCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

// Import the Caretaker type and getFullName function
import type { Caretaker, PerformanceAssessment } from '@/components/caretaker/types';
import { getFullName } from '@/components/caretaker/types';

interface CaretakerPerformanceDashboardProps {
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  caretakers?: Caretaker[];
  assessments?: PerformanceAssessment[];
  onViewCaretaker?: (caretakerId: string) => void;
  onAddAssessment?: (caretaker: TopPerformer) => void;
}

interface Alert {
  id: string;
  caretakerId: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  date: string;
}

interface TopPerformer {
  id: string;
  name: string;
  score: number;
  rank: number;
  association: string;
  email?: string;
  status?: string;
  phone?: string;
  dateStarted?: string | Date;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Helper function to get caretaker ID (handles both id and _id)
const getCaretakerId = (caretaker: Caretaker): string => {
  return caretaker.id || caretaker._id || '';
};

// Calculate performance summary from real data
const calculatePerformanceSummary = (
  caretakers: Caretaker[],
  assessments: PerformanceAssessment[]
) => {
  const totalCaretakers = caretakers.length;
  const activeCaretakers = caretakers.filter(c => c.status === 'active').length;
  const onLeaveCaretakers = caretakers.filter(c => c.status === 'on-leave' || c.status === 'on_leave').length;
  
  // Calculate average performance rating
  let totalRating = 0;
  let ratedCaretakers = 0;
  
  caretakers.forEach(caretaker => {
    const caretakerId = getCaretakerId(caretaker);
    if (!caretakerId) return;
    
    const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
    if (caretakerAssessments.length > 0) {
      const averageRating = caretakerAssessments.reduce((sum, a) => sum + a.rating, 0) / caretakerAssessments.length;
      totalRating += averageRating;
      ratedCaretakers++;
    }
  });
  
  const averageOverallScore = ratedCaretakers > 0 ? (totalRating / ratedCaretakers) * 20 : 0; // Convert 0-5 rating to 0-100 score
  
  // Calculate top performers (score > 80)
  const topPerformersCount = caretakers.filter(caretaker => {
    const caretakerId = getCaretakerId(caretaker);
    if (!caretakerId) return false;
    
    const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
    if (caretakerAssessments.length === 0) return false;
    
    const averageRating = caretakerAssessments.reduce((sum, a) => sum + a.rating, 0) / caretakerAssessments.length;
    return averageRating * 20 > 80; // Score > 80
  }).length;
  
  // Calculate needs improvement (score < 60)
  const needsImprovementCount = caretakers.filter(caretaker => {
    const caretakerId = getCaretakerId(caretaker);
    if (!caretakerId) return false;
    
    const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
    if (caretakerAssessments.length === 0) return false;
    
    const averageRating = caretakerAssessments.reduce((sum, a) => sum + a.rating, 0) / caretakerAssessments.length;
    return averageRating * 20 < 60; // Score < 60
  }).length;
  
  return {
    totalCaretakers,
    activeCaretakers,
    onLeaveCaretakers,
    averageOverallScore,
    topPerformers: topPerformersCount,
    needsImprovement: needsImprovementCount,
    averageAttendanceRate: 92.3, // This would come from actual attendance data
    totalAssessments: assessments.length,
  };
};

// Generate performance trends from assessments
const generatePerformanceTrends = (
  assessments: PerformanceAssessment[],
  timeRange: 'week' | 'month' | 'quarter' | 'year'
) => {
  const now = new Date();
  const periods = timeRange === 'week' ? 7 : 
                 timeRange === 'month' ? 12 : 
                 timeRange === 'quarter' ? 4 : 12;
  
  const trends = [];
  
  for (let i = periods - 1; i >= 0; i--) {
    let periodDate = new Date();
    if (timeRange === 'week') {
      periodDate.setDate(now.getDate() - i);
      const period = periodDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Filter assessments for this day
      const dayAssessments = assessments.filter(assessment => {
        const assessmentDate = new Date(assessment.date || assessment.assessmentDate);
        return assessmentDate.toDateString() === periodDate.toDateString();
      });
      
      const averageRating = dayAssessments.length > 0 
        ? dayAssessments.reduce((sum, a) => sum + a.rating, 0) / dayAssessments.length
        : 0;
      
      trends.push({
        period,
        overallScore: averageRating * 20,
        attendance: 85 + Math.random() * 10,
        patientCare: 82 + Math.random() * 12,
        communication: 83 + Math.random() * 10,
        professionalism: 88 + Math.random() * 8,
      });
    } else {
      periodDate.setMonth(now.getMonth() - i);
      const period = periodDate.toLocaleDateString('en-US', { month: 'short' });
      
      // Filter assessments for this month
      const monthAssessments = assessments.filter(assessment => {
        const assessmentDate = new Date(assessment.date || assessment.assessmentDate);
        return assessmentDate.getMonth() === periodDate.getMonth() && 
               assessmentDate.getFullYear() === periodDate.getFullYear();
      });
      
      const averageRating = monthAssessments.length > 0 
        ? monthAssessments.reduce((sum, a) => sum + a.rating, 0) / monthAssessments.length
        : 0;
      
      trends.push({
        period,
        overallScore: averageRating * 20,
        attendance: 85 + Math.random() * 10,
        patientCare: 82 + Math.random() * 12,
        communication: 83 + Math.random() * 10,
        professionalism: 88 + Math.random() * 8,
      });
    }
  }
  
  return trends;
};

// Get top performers from real data
const getTopPerformers = (
  caretakers: Caretaker[],
  assessments: PerformanceAssessment[],
  limit: number = 5
): TopPerformer[] => {
  const performers = caretakers
    .map(caretaker => {
      const caretakerId = getCaretakerId(caretaker);
      if (!caretakerId) return null;
      
      const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
      if (caretakerAssessments.length === 0) return null;
      
      const averageRating = caretakerAssessments.reduce((sum, a) => sum + a.rating, 0) / caretakerAssessments.length;
      const score = averageRating * 20;
      
      return {
        id: caretakerId,
        name: getFullName(caretaker),
        score,
        rank: 0, // Will be set after sorting
        association: caretaker.slpAssociation,
        email: caretaker.email || `${caretaker.firstName?.toLowerCase()}.${caretaker.lastName?.toLowerCase()}@care.com`,
        status: caretaker.status || 'active',
        phone: caretaker.contactNumber,
        dateStarted: caretaker.dateStarted,
      };
    })
    .filter((performer): performer is NonNullable<typeof performer> => performer !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((performer, index) => ({
      ...performer,
      rank: index + 1,
    }));
  
  return performers;
};

// Get association performance from real data
const getAssociationPerformance = (
  caretakers: Caretaker[],
  assessments: PerformanceAssessment[]
) => {
  const associationMap = new Map();
  
  caretakers.forEach(caretaker => {
    const association = caretaker.slpAssociation || 'No Association';
    const caretakerId = getCaretakerId(caretaker);
    
    if (!caretakerId) return;
    
    const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
    const averageRating = caretakerAssessments.length > 0
      ? caretakerAssessments.reduce((sum, a) => sum + a.rating, 0) / caretakerAssessments.length
      : 0;
    
    if (!associationMap.has(association)) {
      associationMap.set(association, {
        association,
        totalScore: averageRating * 20,
        caretakerCount: 1,
        ratedCaretakers: averageRating > 0 ? 1 : 0,
      });
    } else {
      const data = associationMap.get(association);
      data.totalScore += averageRating * 20;
      data.caretakerCount += 1;
      if (averageRating > 0) data.ratedCaretakers += 1;
      associationMap.set(association, data);
    }
  });
  
  const associations = Array.from(associationMap.values())
    .map(data => ({
      association: data.association,
      avgScore: data.ratedCaretakers > 0 ? data.totalScore / data.ratedCaretakers : 0,
      caretakers: data.caretakerCount,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
  
  return associations;
};

// Generate alerts based on performance
const generatePerformanceAlerts = (
  caretakers: Caretaker[],
  assessments: PerformanceAssessment[]
): Alert[] => {
  const alerts: Alert[] = [];
  
  caretakers.forEach(caretaker => {
    const caretakerId = getCaretakerId(caretaker);
    if (!caretakerId) return;
    
    const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
    if (caretakerAssessments.length === 0) return;
    
    const averageRating = caretakerAssessments.reduce((sum, a) => sum + a.rating, 0) / caretakerAssessments.length;
    const score = averageRating * 20;
    
    if (score < 50) {
      alerts.push({
        id: `alert-${caretakerId}`,
        caretakerId: caretakerId,
        type: 'critical',
        title: 'Critical Performance Issue',
        description: `${getFullName(caretaker)} has a very low performance score (${score.toFixed(1)})`,
        severity: 'high',
        date: new Date().toISOString().split('T')[0],
      });
    } else if (score < 60) {
      alerts.push({
        id: `alert-${caretakerId}`,
        caretakerId: caretakerId,
        type: 'warning',
        title: 'Performance Needs Improvement',
        description: `${getFullName(caretaker)} has a low performance score (${score.toFixed(1)})`,
        severity: 'medium',
        date: new Date().toISOString().split('T')[0],
      });
    }
  });
  
  return alerts;
};

export default function CaretakerPerformanceDashboard({ 
  timeRange = 'month',
  caretakers = [],
  assessments = [],
  onViewCaretaker,
  onAddAssessment,
}: CaretakerPerformanceDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Calculate real data
  const performanceSummary = calculatePerformanceSummary(caretakers, assessments);
  const performanceTrends = generatePerformanceTrends(assessments, timeRange);
  const topPerformers = getTopPerformers(caretakers, assessments, 5);
  const associationPerformance = getAssociationPerformance(caretakers, assessments);
  const alerts = generatePerformanceAlerts(caretakers, assessments);
  
  // Generate category performance from assessments
  const categoryPerformance = assessments.length > 0 ? [
    {
      category: 'Punctuality',
      score: assessments.reduce((sum, a) => sum + (a.categories?.punctuality || a.rating), 0) / assessments.length * 20,
      target: 85,
    },
    {
      category: 'Communication',
      score: assessments.reduce((sum, a) => sum + (a.categories?.communication || a.rating), 0) / assessments.length * 20,
      target: 85,
    },
    {
      category: 'Patient Care',
      score: assessments.reduce((sum, a) => sum + (a.categories?.patientCare || a.rating), 0) / assessments.length * 20,
      target: 90,
    },
    {
      category: 'Professionalism',
      score: assessments.reduce((sum, a) => sum + (a.categories?.professionalism || a.rating), 0) / assessments.length * 20,
      target: 90,
    },
    {
      category: 'Technical Skills',
      score: assessments.reduce((sum, a) => sum + (a.categories?.technicalSkills || a.rating), 0) / assessments.length * 20,
      target: 88,
    },
  ] : [
    { category: 'Punctuality', score: 0, target: 85 },
    { category: 'Communication', score: 0, target: 85 },
    { category: 'Patient Care', score: 0, target: 90 },
    { category: 'Professionalism', score: 0, target: 90 },
    { category: 'Technical Skills', score: 0, target: 88 },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusColor = (status: string = 'unknown') => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on-leave':
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string = 'unknown') => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'on-leave':
      case 'on_leave':
        return <Clock className="h-3 w-3" />;
      case 'inactive':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <UserIcon className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Not set';
    
    try {
      const dateObj = dateString instanceof Date ? dateString : new Date(dateString);
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  // Get the status text with proper formatting
  const getStatusText = (status?: string): string => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">Showing data for:</span>
          <Select defaultValue={timeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Performance Score</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceSummary.averageOverallScore.toFixed(1)}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              {performanceSummary.averageOverallScore > 70 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span>{getPerformanceLabel(performanceSummary.averageOverallScore)}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  <span>Needs attention</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Contributors</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceSummary.topPerformers}</div>
            <p className="text-xs text-gray-500">
              {caretakers.length > 0 
                ? Math.round((performanceSummary.topPerformers / caretakers.length) * 100) 
                : 0}% of total caretakers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceSummary.needsImprovement}</div>
            <p className="text-xs text-gray-500">
              {caretakers.length > 0 
                ? Math.round((performanceSummary.needsImprovement / caretakers.length) * 100) 
                : 0}% of total caretakers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceSummary.totalAssessments}</div>
            <p className="text-xs text-gray-500">
              {caretakers.length > 0 
                ? Math.round((performanceSummary.totalAssessments / caretakers.length) * 10) / 10 
                : 0} per caretaker
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="caretakers">
            <Users className="h-4 w-4 mr-2" />
            Caretakers
          </TabsTrigger>
          <TabsTrigger value="associations">
            <Building className="h-4 w-4 mr-2" />
            Associations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Charts and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Trends Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Overall performance score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {performanceTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="period" />
                        <YAxis domain={[0, 100]} />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="overallScore"
                          name="Overall Score"
                          stroke="#0088FE"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                        <p>No assessment data available</p>
                        <p className="text-sm">Add performance assessments to see trends</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance Alerts</CardTitle>
                    <CardDescription>
                      {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  {alerts.filter(a => a.severity === 'high').length > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {alerts.filter(a => a.severity === 'high').length} Critical
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.slice(0, 3).map(alert => (
                      <div
                        key={alert.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <div>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm">{alert.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Caretaker: {alert.caretakerId} • {new Date(alert.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No performance alerts</p>
                    <p className="text-sm">All caretakers are performing well</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Performers and Category Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Contributors (Best Performers) */}
            <Card>
              <CardHeader>
                <CardTitle>Top Contributors</CardTitle>
                <CardDescription>This period's best performing caretakers</CardDescription>
              </CardHeader>
              <CardContent>
                {topPerformers.length > 0 ? (
                  <div className="space-y-4">
                    {topPerformers.map(performer => (
                      <div
                        key={performer.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                            {performer.rank}
                          </div>
                          <div>
                            <div className="font-medium">{performer.name}</div>
                            <div className="text-sm text-gray-500">{performer.association}</div>
                            <div className="text-xs text-gray-500">{performer.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{performer.score.toFixed(1)}</div>
                          <Badge className={getPerformanceColor(performer.score)}>
                            {getPerformanceLabel(performer.score)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>No performance data available</p>
                    <p className="text-sm">Add assessments to see top contributors</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Category</CardTitle>
                <CardDescription>Average scores across different performance categories</CardDescription>
              </CardHeader>
              <CardContent>
                {assessments.length > 0 ? (
                  <div className="space-y-4">
                    {categoryPerformance.map(category => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="font-bold">{category.score.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(category.score / 100) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            Target: {category.target}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p>No category data available</p>
                    <p className="text-sm">Add assessments with categories</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Radar Chart */}
          {assessments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
                <CardDescription>Comparison across all performance categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={categoryPerformance}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Current Score"
                        dataKey="score"
                        stroke="#0088FE"
                        fill="#0088FE"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Target"
                        dataKey="target"
                        stroke="#FF8042"
                        fill="#FF8042"
                        fillOpacity={0.2}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Caretakers Tab - Detailed Performance Rankings */}
        <TabsContent value="caretakers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Caretaker Performance Rankings</CardTitle>
              <CardDescription>Detailed performance metrics for all caretakers</CardDescription>
            </CardHeader>
            <CardContent>
              {topPerformers.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden border rounded-lg">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="py-3 px-4">Rank</TableHead>
                            <TableHead className="py-3 px-4">Caretaker</TableHead>
                            <TableHead className="py-3 px-4 hidden md:table-cell">Contact</TableHead>
                            <TableHead className="py-3 px-4">Association</TableHead>
                            <TableHead className="py-3 px-4">Score</TableHead>
                            <TableHead className="py-3 px-4 hidden sm:table-cell">Status</TableHead>
                            <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topPerformers.map(performer => (
                            <TableRow key={performer.id} className="hover:bg-gray-50">
                              <TableCell className="py-3 px-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                                  {performer.rank}
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <div className="flex items-center gap-3 min-w-[200px]">
                                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{performer.name}</div>
                                    <div className="text-sm text-gray-500 truncate md:hidden">
                                      {performer.email?.split('@')[0]}...
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-4 hidden md:table-cell">
                                <div className="space-y-1 text-sm min-w-[180px]">
                                  {performer.email && (
                                    <div className="flex items-center gap-1 text-gray-600 truncate">
                                      <Mail className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{performer.email}</span>
                                    </div>
                                  )}
                                  {performer.phone && (
                                    <div className="flex items-center gap-1 text-gray-600 truncate">
                                      <Phone className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{performer.phone}</span>
                                    </div>
                                  )}
                                  {!performer.email && !performer.phone && (
                                    <div className="text-gray-400 text-xs">No contact info</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <div className="flex items-center gap-2 min-w-[150px]">
                                  <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{performer.association}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <div className="space-y-1 min-w-[120px]">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getPerformanceColor(performer.score)}>
                                      {performer.score.toFixed(1)}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {getPerformanceLabel(performer.score)}
                                  </div>
                                  <Progress value={performer.score} className="h-1.5" />
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-4 hidden sm:table-cell">
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1.5 font-medium text-xs ${getStatusColor(performer.status || 'unknown')}`}
                                >
                                  {getStatusIcon(performer.status || 'unknown')}
                                  <span className="truncate">{getStatusText(performer.status)}</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  {onViewCaretaker && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      onClick={() => onViewCaretaker(performer.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View</span>
                                    </Button>
                                  )}
                                  {onAddAssessment && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      onClick={() => onAddAssessment(performer)}
                                    >
                                      <PlusCircle className="h-4 w-4" />
                                      <span className="sr-only">Add Assessment</span>
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
                  <p className="text-gray-600">
                    No caretakers have performance assessments yet. Add assessments to see rankings.
                  </p>
                  {onAddAssessment && (
                    <Button
                      className="mt-4"
                      onClick={() => onAddAssessment({
                        id: '',
                        name: 'Add First Assessment',
                        score: 0,
                        rank: 0,
                        association: ''
                      })}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Assessment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards for Mobile */}
          <div className="lg:hidden">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">{topPerformers.filter(p => p.score >= 80).length}</div>
                    <div className="text-sm text-gray-600">Top Performers</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">{topPerformers.filter(p => p.score < 60).length}</div>
                    <div className="text-sm text-gray-600">Needs Help</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {topPerformers.length > 0 
                        ? (topPerformers.reduce((sum, p) => sum + p.score, 0) / topPerformers.length).toFixed(1)
                        : '0.0'
                      }
                    </div>
                    <div className="text-sm text-gray-600">Avg Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">{caretakers.length}</div>
                    <div className="text-sm text-gray-600">Total Caretakers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Associations Tab */}
        <TabsContent value="associations" className="space-y-6">
          {associationPerformance.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Association Performance Comparison</CardTitle>
                  <CardDescription>Compare performance across different associations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={associationPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="association" />
                        <YAxis domain={[0, 100]} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="avgScore" name="Average Score" fill="#0088FE" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="caretakers" name="Number of Caretakers" fill="#00C49F" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Association Details</CardTitle>
                  <CardDescription>Detailed performance metrics by association</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead>Association</TableHead>
                          <TableHead>Avg. Performance Score</TableHead>
                          <TableHead>Caretakers</TableHead>
                          <TableHead>Top Performer</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {associationPerformance.map(association => {
                          // Find top performer for this association
                          const topPerformer = topPerformers.find(
                            p => p.association === association.association
                          );
                          
                          return (
                            <TableRow key={association.association} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{association.association}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge className={getPerformanceColor(association.avgScore)}>
                                    {association.avgScore.toFixed(1)}
                                  </Badge>
                                  <Progress value={association.avgScore} className="h-2 w-32" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span>{association.caretakers} caretakers</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {topPerformer ? (
                                  <div className="text-sm">
                                    <div className="font-medium">{topPerformer.name}</div>
                                    <div className="text-gray-500">{topPerformer.score.toFixed(1)} score</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No top performer</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {association.avgScore >= 70 ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    Performing Well
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    Needs Attention
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Association Data</h3>
                  <p className="text-gray-600 mb-4">
                    No associations have performance data yet. Add caretakers with assessments to see association performance.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}