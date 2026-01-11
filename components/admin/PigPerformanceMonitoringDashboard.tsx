// components/admin/PigPerformanceMonitoringDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertTriangle,
  Activity,
  Calendar,
  PiggyBank,
  Weight,
  Droplets,
  Thermometer,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  FileText,
  LineChart,
  BarChart3,
  Users,
  Filter,
  Search,
  Eye,
  PlusCircle,
  Save,
  Star,
  CheckCircle,
  Clock,
  Building,
  Award,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Types
interface PigData {
  id: string;
  tagNumber: string;
  name: string;
  breed: string;
  currentWeight: number;
  status: 'healthy' | 'sick' | 'recovering' | 'deceased';
  caretakerId?: string;
}

interface PigPerformanceMetrics {
  _id: string;
  date: string;
  weight: number;
  feedIntake: number;
  waterConsumption: number;
  healthScore: number;
  activityLevel: 'high' | 'medium' | 'low';
  temperature?: number;
  weightGain?: number;
  feedConversionRatio?: number;
  notes?: string;
}

interface PerformanceAlert {
  _id: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  message: string;
  createdAt: string;
  metric: string;
  value: number;
  threshold: number;
}

interface PigPerformanceSummary {
  performanceScore: number;
  averageDailyGain: number;
  averageFeedConversionRatio: number;
  healthTrend: 'improving' | 'declining' | 'stable';
}

interface CaretakerPigMetrics {
  caretakerId: string;
  caretakerName: string;
  totalPigsAssigned: number;
  pigsGained: number;
  pigsLost: number;
  averageDailyWeightGain: number;
  feedConversionEfficiency: number;
  consistencyScore: number;
  cleanlinessScore: number;
  averageHealthScore: number;
  performanceScore: number;
}

export default function PigPerformanceMonitoringDashboard() {
  const [selectedPigId, setSelectedPigId] = useState<string>('none');
  const [pigs, setPigs] = useState<PigData[]>([]);
  const [summary, setSummary] = useState<PigPerformanceSummary | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [recentMetrics, setRecentMetrics] = useState<PigPerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [newMetric, setNewMetric] = useState({
    weight: 0,
    feedIntake: 0,
    waterConsumption: 0,
    healthScore: 0,
    activityLevel: 'medium' as 'high' | 'medium' | 'low',
    notes: ''
  });
  const [caretakerMetrics, setCaretakerMetrics] = useState<CaretakerPigMetrics[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchAvailablePigs();
    fetchCaretakerMetrics();
  }, []);

  useEffect(() => {
    if (selectedPigId !== 'none') {
      fetchPerformanceData(selectedPigId);
    }
  }, [selectedPigId, timeRange]);

  const fetchAvailablePigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pigs');
      if (response.ok) {
        const data = await response.json();
        setPigs(data);
      } else {
        setError('Failed to load pigs data');
      }
    } catch (error) {
      console.error('Error fetching pigs:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async (pigId: string) => {
    if (pigId === 'none') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [summaryRes, alertsRes, metricsRes] = await Promise.all([
        fetch(`/api/admin/pig-performance/summary?pigId=${pigId}&timeRange=${timeRange}`),
        fetch(`/api/admin/pig-performance/alerts?pigId=${pigId}`),
        fetch(`/api/admin/pig-performance/metrics?pigId=${pigId}&limit=7`)
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setRecentMetrics(metricsData);
      }

    } catch (error) {
      console.error('Error fetching performance data:', error);
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCaretakerMetrics = async () => {
    try {
      const response = await fetch('/api/admin/caretaker-pig-metrics');
      if (response.ok) {
        const data = await response.json();
        setCaretakerMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching caretaker metrics:', error);
    }
  };

  const handleAddMetric = async () => {
    if (!newMetric.weight || !newMetric.feedIntake || !newMetric.waterConsumption) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/pig-performance/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pigId: selectedPigId,
          ...newMetric,
          date: new Date().toISOString()
        })
      });

      if (response.ok) {
        const newMetricData: PigPerformanceMetrics = {
          _id: `metric-${Date.now()}`,
          date: new Date().toISOString(),
          weight: newMetric.weight,
          feedIntake: newMetric.feedIntake,
          waterConsumption: newMetric.waterConsumption,
          healthScore: newMetric.healthScore,
          activityLevel: newMetric.activityLevel,
          notes: newMetric.notes
        };

        setRecentMetrics([newMetricData, ...recentMetrics]);
        setShowMetricModal(false);
        setNewMetric({
          weight: 0,
          feedIntake: 0,
          waterConsumption: 0,
          healthScore: 0,
          activityLevel: 'medium',
          notes: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save metric');
      }
    } catch (error) {
      console.error('Error adding metric:', error);
      setError('Failed to save metric');
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch('/api/admin/pig-performance/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      setAlerts(alerts.filter(alert => alert._id !== alertId));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const exportData = () => {
    const data = {
      pigId: selectedPigId,
      summary,
      alerts,
      recentMetrics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pig-performance-${selectedPigId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPerformanceGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getGradeColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sick': return 'bg-red-100 text-red-800 border-red-200';
      case 'recovering': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deceased': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectedPig = pigs.find(pig => pig.id === selectedPigId);

  // Chart data for demonstration
  const weightTrendData = recentMetrics.map(metric => ({
    date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: metric.weight,
    feedIntake: metric.feedIntake
  })).reverse();

  const healthDistributionData = [
    { name: 'Excellent', value: 65, color: '#10b981' },
    { name: 'Good', value: 20, color: '#3b82f6' },
    { name: 'Fair', value: 10, color: '#f59e0b' },
    { name: 'Poor', value: 5, color: '#ef4444' }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">Pig Performance Monitoring</h1>
          <p className="text-gray-600">Track and analyze individual pig performance metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Select
            value={timeRange}
            onValueChange={(value: '7d' | '30d' | '90d') => {
              setTimeRange(value);
              if (selectedPigId !== 'none') fetchPerformanceData(selectedPigId);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={selectedPigId}
            onValueChange={(value) => {
              setSelectedPigId(value);
              if (value !== 'none') fetchPerformanceData(value);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <PiggyBank className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select a Pig" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select Pig</SelectItem>
              {pigs.map(pig => (
                <SelectItem key={pig.id} value={pig.id}>
                  <div className="flex items-center justify-between">
                    <span>{pig.name}</span>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 text-xs ${getStatusColor(pig.status)}`}
                    >
                      {pig.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => setShowMetricModal(true)}
            disabled={selectedPigId === 'none'}
            className="bg-green-500 hover:bg-green-600"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Metric
          </Button>
          
          <Button
            onClick={exportData}
            variant="outline"
            disabled={selectedPigId === 'none'}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  if (selectedPigId !== 'none') fetchPerformanceData(selectedPigId);
                }}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading performance data...</p>
        </div>
      )}

      {selectedPigId === 'none' && !loading && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Select a Pig to Monitor</p>
              <p>Choose a pig from the dropdown above to view detailed performance metrics.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPigId !== 'none' && summary && !loading && !error && (
        <>
          {/* Pig Information */}
          {selectedPig && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedPig.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Breed:</span>
                        <span>{selectedPig.breed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(selectedPig.status)}
                        >
                          {selectedPig.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Current Weight:</span>
                        <span className="font-semibold">{selectedPig.currentWeight} kg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Medical History
                      </Button>
                      <Button variant="outline" size="sm">
                        <LineChart className="h-4 w-4 mr-2" />
                        Growth Chart
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Performance Score</CardTitle>
                <CardDescription>Overall Performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className={`text-3xl font-bold ${getGradeColor(summary.performanceScore)}`}>
                    {summary.performanceScore}
                  </p>
                  <span className={`text-xl font-semibold ${getGradeColor(summary.performanceScore)}`}>
                    {getPerformanceGrade(summary.performanceScore)}
                  </span>
                </div>
                <Progress 
                  value={summary.performanceScore} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Avg Daily Gain</CardTitle>
                <CardDescription>Weight Gain per Day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Weight className="h-6 w-6 text-blue-600" />
                  <p className="text-3xl font-bold text-blue-600">
                    {summary.averageDailyGain.toFixed(3)} kg
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Target: 0.8 kg/day
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Feed Efficiency</CardTitle>
                <CardDescription>Feed Conversion Ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-green-600" />
                  <p className="text-3xl font-bold text-green-600">
                    {summary.averageFeedConversionRatio.toFixed(2)}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Lower is better
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Health Status</CardTitle>
                <CardDescription>Health Trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Thermometer className={`h-6 w-6 ${
                    summary.healthTrend === 'improving' ? 'text-green-600' :
                    summary.healthTrend === 'declining' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <p className={`text-3xl font-bold ${
                    summary.healthTrend === 'improving' ? 'text-green-600' :
                    summary.healthTrend === 'declining' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {summary.healthTrend.charAt(0).toUpperCase() + summary.healthTrend.slice(1)}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {summary.healthTrend === 'improving' ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Improving</span>
                    </>
                  ) : summary.healthTrend === 'declining' ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Declining</span>
                    </>
                  ) : (
                    <span className="text-sm text-yellow-600">Stable</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weight & Feed Trend</CardTitle>
                <CardDescription>Weight and feed intake over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={weightTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="weight"
                        name="Weight (kg)"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="feedIntake"
                        name="Feed Intake (kg)"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Health Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Health Distribution</CardTitle>
                <CardDescription>Overall health status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {healthDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Active Alerts</CardTitle>
                    <CardDescription>Performance and health alerts</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    {alerts.length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div
                      key={alert._id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                        alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block w-3 h-3 rounded-full ${
                              alert.severity === 'high' ? 'bg-red-500' :
                              alert.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}></span>
                            <span className="font-medium text-gray-800 capitalize">
                              {alert.type.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{alert.message}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Metric: {alert.metric} | Value: {alert.value} | Threshold: {alert.threshold}
                          </p>
                        </div>
                        <Button
                          onClick={() => resolveAlert(alert._id)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 ml-4"
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance Metrics</CardTitle>
              <CardDescription>Latest measurements and observations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Weight (kg)</TableHead>
                      <TableHead>Feed Intake (kg)</TableHead>
                      <TableHead>Water (L)</TableHead>
                      <TableHead>Health Score</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMetrics.map((metric) => (
                      <TableRow 
                        key={metric._id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          {new Date(metric.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Weight className="h-4 w-4 text-gray-400" />
                            {metric.weight.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>{metric.feedIntake.toFixed(1)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-gray-400" />
                            {metric.waterConsumption.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              metric.healthScore >= 8 ? 'bg-green-100 text-green-800 border-green-200' :
                              metric.healthScore >= 6 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {metric.healthScore}/10
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              metric.activityLevel === 'high' ? 'bg-green-100 text-green-800 border-green-200' :
                              metric.activityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {metric.activityLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {metric.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {recentMetrics.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No recent metrics available</p>
                  <Button 
                    onClick={() => setShowMetricModal(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add First Metric
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Caretaker Performance Summary */}
          {caretakerMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Caretaker Pig Performance</CardTitle>
                <CardDescription>Performance metrics by caretaker</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Caretaker</TableHead>
                        <TableHead>Pigs Assigned</TableHead>
                        <TableHead>Avg Daily Gain</TableHead>
                        <TableHead>Feed Efficiency</TableHead>
                        <TableHead>Cleanliness</TableHead>
                        <TableHead>Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {caretakerMetrics.map((caretaker) => (
                        <TableRow key={caretaker.caretakerId} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{caretaker.caretakerName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{caretaker.totalPigsAssigned}</span>
                              <span className="text-sm text-gray-500">
                                (+{caretaker.pigsGained}, -{caretaker.pigsLost})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Weight className="h-4 w-4 text-blue-500" />
                              <span>{caretaker.averageDailyWeightGain.toFixed(3)} kg</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-green-500" />
                              <span>{caretaker.feedConversionEfficiency.toFixed(2)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-500" />
                              <span>{caretaker.cleanlinessScore}/5</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={caretaker.performanceScore} className="h-2 w-32" />
                              <span className="font-medium">{caretaker.performanceScore}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Add Metric Modal */}
      <Dialog open={showMetricModal} onOpenChange={setShowMetricModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add Performance Metric</DialogTitle>
            <DialogDescription>
              Add new performance metrics for {selectedPig?.name || 'selected pig'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={newMetric.weight || ''}
                  onChange={(e) => setNewMetric({...newMetric, weight: parseFloat(e.target.value) || 0})}
                  placeholder="e.g., 85.5"
                />
              </div>
              
              <div>
                <Label htmlFor="feedIntake">Feed Intake (kg) *</Label>
                <Input
                  id="feedIntake"
                  type="number"
                  step="0.1"
                  value={newMetric.feedIntake || ''}
                  onChange={(e) => setNewMetric({...newMetric, feedIntake: parseFloat(e.target.value) || 0})}
                  placeholder="e.g., 2.3"
                />
              </div>
              
              <div>
                <Label htmlFor="waterConsumption">Water Consumption (L) *</Label>
                <Input
                  id="waterConsumption"
                  type="number"
                  step="0.1"
                  value={newMetric.waterConsumption || ''}
                  onChange={(e) => setNewMetric({...newMetric, waterConsumption: parseFloat(e.target.value) || 0})}
                  placeholder="e.g., 8.5"
                />
              </div>
              
              <div>
                <Label htmlFor="healthScore">Health Score (0-10)</Label>
                <Input
                  id="healthScore"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={newMetric.healthScore || ''}
                  onChange={(e) => setNewMetric({...newMetric, healthScore: parseFloat(e.target.value) || 0})}
                  placeholder="e.g., 8.5"
                />
              </div>
              
              <div>
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select
                  value={newMetric.activityLevel}
                  onValueChange={(value: 'high' | 'medium' | 'low') => 
                    setNewMetric({...newMetric, activityLevel: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newMetric.notes}
                onChange={(e) => setNewMetric({...newMetric, notes: e.target.value})}
                placeholder="Add any observations or notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMetricModal(false)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleAddMetric}
              disabled={loading || !newMetric.weight || !newMetric.feedIntake || !newMetric.waterConsumption}
              className="bg-green-500 hover:bg-green-600"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Metric
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}