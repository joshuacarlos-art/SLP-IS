"use client";

import DashboardStats from "@/components/dashboard/stats-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import PigsOverview from "@/components/dashboard/pigs-overview";
import ProtectedRoute from "@/components/protected-route";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Download, 
  BarChart3, 
  Users, 
  DollarSign,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Target
} from "lucide-react";

// Import carousel components
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Import Recharts components
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  Pie, 
  PieChart, 
  Cell, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from "recharts";

// Types for predictive data
interface PredictiveData {
  period: string;
  actual: number | null;
  predicted: number;
  confidence: number;
}

// Chart data with proper colors
const growthData = [
  { month: "Jan", actual: 186, predicted: 160 },
  { month: "Feb", actual: 185, predicted: 170 },
  { month: "Mar", actual: 207, predicted: 180 },
  { month: "Apr", actual: 173, predicted: 160 },
  { month: "May", actual: 160, predicted: 190 },
  { month: "Jun", actual: 174, predicted: 204 },
];

const riskData = [
  { category: "Financial", value: 75, fullMark: 100 },
  { category: "Operational", value: 45, fullMark: 100 },
  { category: "Market", value: 60, fullMark: 100 },
  { category: "Compliance", value: 30, fullMark: 100 },
  { category: "Technical", value: 55, fullMark: 100 },
];

const performanceData = [
  { name: "Association A", value: 75 },
  { name: "Association B", value: 60 },
  { name: "Association C", value: 85 },
  { name: "Association D", value: 45 },
  { name: "Association E", value: 90 },
];

const revenueData = [
  { month: "Jul", revenue: 205, profit: 85 },
  { month: "Aug", revenue: 220, profit: 95 },
  { month: "Sep", revenue: 235, profit: 105 },
  { month: "Oct", revenue: 250, profit: 115 },
];

// Color constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const BLUE_COLOR = '#3b82f6';
const GREEN_COLOR = '#10b981';
const PURPLE_COLOR = '#8b5cf6';
const ORANGE_COLOR = '#f59e0b';

// Chart components using proper Recharts with explicit colors
const PredictiveGrowthChart = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading chart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-lg">Growth Trends</CardTitle>
        <CardDescription>Actual vs Predicted Performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={growthData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Bar
                dataKey="actual"
                fill={BLUE_COLOR}
                radius={[2, 2, 0, 0]}
                name="Actual"
                barSize={20}
              />
              <Bar
                dataKey="predicted"
                fill={GREEN_COLOR}
                radius={[2, 2, 0, 0]}
                name="Predicted"
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const RiskAssessment = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Assessing risks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-lg">Risk Assessment</CardTitle>
        <CardDescription>Program risk analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={riskData}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Radar
                name="Risk Level"
                dataKey="value"
                stroke={ORANGE_COLOR}
                fill={ORANGE_COLOR}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const PerformancePredictor = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading predictions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-lg">Performance</CardTitle>
        <CardDescription>Association performance distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const RevenueForecast = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading forecast...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-lg">Revenue Forecast</CardTitle>
        <CardDescription>Next 4 months projection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={revenueData}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <XAxis 
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Bar 
                dataKey="revenue" 
                fill={PURPLE_COLOR} 
                radius={[2, 2, 0, 0]} 
                name="Revenue ($K)" 
                barSize={20}
              />
              <Bar 
                dataKey="profit" 
                fill={GREEN_COLOR} 
                radius={[2, 2, 0, 0]} 
                name="Profit ($K)" 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const [predictiveData, setPredictiveData] = useState<PredictiveData[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    loadPredictiveData();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const loadPredictiveData = async () => {
    try {
      setIsLoadingPredictions(true);
      
      const mockPredictiveData: PredictiveData[] = [
        { period: 'Jan', actual: 120, predicted: 115, confidence: 0.85 },
        { period: 'Feb', actual: 135, predicted: 130, confidence: 0.82 },
        { period: 'Mar', actual: 150, predicted: 145, confidence: 0.88 },
        { period: 'Apr', actual: 165, predicted: 160, confidence: 0.84 },
        { period: 'May', actual: 180, predicted: 175, confidence: 0.86 },
        { period: 'Jun', actual: 195, predicted: 190, confidence: 0.83 },
      ];

      setPredictiveData(mockPredictiveData);
      
    } catch (error) {
      console.error('Error loading predictive data:', error);
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  const handleExportReport = async (format: string) => {
    try {
      console.log(`Exporting report as ${format}`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const calculateKPIs = () => {
    const actualData = predictiveData.filter(d => d.actual !== null) as (PredictiveData & { actual: number })[];
    
    const currentGrowth = actualData.length > 0 
      ? actualData.slice(-3).reduce((sum, d) => sum + d.actual, 0) / Math.min(actualData.length, 3)
      : 0;

    const accuracy = actualData.length > 0
      ? Math.round(actualData.reduce((sum, d) => sum + d.confidence, 0) / actualData.length * 100)
      : 0;

    return {
      currentGrowth: Math.round(currentGrowth),
      accuracy
    };
  };

  const kpis = calculateKPIs();

  // Analytics slides data
  const analyticsSlides = [
    {
      id: 1,
      title: "Growth Trends",
      description: "Performance analysis",
      component: <PredictiveGrowthChart isLoading={isLoadingPredictions} />
    },
    {
      id: 2,
      title: "Revenue Forecast",
      description: "Financial projections",
      component: <RevenueForecast isLoading={isLoadingPredictions} />
    },
    {
      id: 3,
      title: "Performance",
      description: "Association insights",
      component: <PerformancePredictor isLoading={isLoadingPredictions} />
    },
    {
      id: 4,
      title: "Risk Assessment",
      description: "Risk analysis",
      component: <RiskAssessment isLoading={isLoadingPredictions} />
    }
  ];

  const handlePreviousSlide = () => {
    setCurrentSlide(prev => (prev - 1 + 4) % 4);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % 4);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Overview of your sustainable livelihood program
              </p>
            </div>
            <Button 
              onClick={() => handleExportReport('pdf')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Current Stats */}
        <DashboardStats />
        
        {/* Analytics and Recent Activities Side by Side */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Analytics Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Analytics</h2>
                <p className="text-muted-foreground">
                  Key metrics and insights
                </p>
              </div>
              
              {/* Custom Carousel Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className="h-8 w-8"
                >
                  {isAutoPlay ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousSlide}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextSlide}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Analytics KPIs - Compact */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Current Growth</span>
                  </div>
                  <p className="text-xl font-bold mt-1">{kpis.currentGrowth}</p>
                  <p className="text-xs text-muted-foreground">Avg. monthly</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Model Accuracy</span>
                  </div>
                  <p className="text-xl font-bold mt-1">{kpis.accuracy}%</p>
                  <p className="text-xs text-muted-foreground">Prediction confidence</p>
                </CardContent>
              </Card>
            </div>

            {/* Compact Analytics Carousel */}
            <Card>
              <CardContent className="p-0">
                <Carousel 
                  className="w-full" 
                  opts={{ 
                    startIndex: currentSlide,
                    loop: true 
                  }}
                >
                  <CarouselContent>
                    {analyticsSlides.map((slide, index) => (
                      <CarouselItem key={slide.id}>
                        <div className="p-4">
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold">{slide.title}</h3>
                            <p className="text-sm text-muted-foreground">{slide.description}</p>
                          </div>
                          {slide.component}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  
                  {/* Compact navigation dots */}
                  <div className="flex justify-center gap-1 pb-4">
                    {analyticsSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          currentSlide === index 
                            ? 'bg-primary w-3' 
                            : 'bg-muted-foreground/20'
                        }`}
                      />
                    ))}
                  </div>
                </Carousel>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities and Pigs Overview Section */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <RecentActivity />
            
            {/* Pigs Overview */}
            <PigsOverview />
          </div>
        </div>

        {/* Compact Action Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-4 w-4" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">📈 Growth</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Expand in Region 5 - 23% higher success
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <h4 className="font-semibold text-sm text-green-900 dark:text-green-100">💰 Resources</h4>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Reallocate 15% budget to top performers
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100">⚠️ Risk</h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Monitor "Green Valley" association
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}