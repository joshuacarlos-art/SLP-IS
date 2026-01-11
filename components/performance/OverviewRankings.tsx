'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Users, 
  Star, 
  Eye, 
  PlusCircle,
  Building,
  CheckCircle,
  AlertTriangle,
  User as UserIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Weight,
  Thermometer,
  Droplets,
  PiggyBank,
  Leaf,
  Heart,
  Brain,
  Shield,
  Zap,
  FileText // Added FileText import
} from 'lucide-react';

import { Caretaker, PerformanceAssessment, getFullName, getPerformanceColor, getStatusColor } from '@/types/performance';

interface OverviewRankingsProps {
  caretakers: Caretaker[];
  assessments: PerformanceAssessment[];
  onViewCaretaker: (caretakerId: string) => void;
  onAddAssessment: (caretaker: Caretaker) => void;
  searchTerm?: string;
}

// Pig performance analytics data structure
interface PigPerformanceAnalytics {
  totalPigs: number;
  healthyPigs: number;
  averageWeight: number;
  averageHealthScore: number;
  topPerformers: number;
  needsAttention: number;
  feedEfficiency: number;
  growthRate: number;
}

// Mock pig data - In real app, this would come from your radar API
const mockPigAnalytics: PigPerformanceAnalytics = {
  totalPigs: 150,
  healthyPigs: 138,
  averageWeight: 85.5,
  averageHealthScore: 8.7,
  topPerformers: 45,
  needsAttention: 12,
  feedEfficiency: 2.8,
  growthRate: 0.75
};

const OverviewRankings: React.FC<OverviewRankingsProps> = ({
  caretakers,
  assessments,
  onViewCaretaker,
  onAddAssessment,
  searchTerm = '',
}) => {
  // Calculate caretaker rankings
  const rankedCaretakers = useMemo(() => {
    return caretakers
      .map(caretaker => {
        const caretakerId = caretaker.id || caretaker._id || '';
        const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
        
        let averageRating = 0;
        if (caretakerAssessments.length > 0) {
          averageRating = caretakerAssessments.reduce((sum, a) => sum + a.rating, 0) / caretakerAssessments.length;
        }
        
        const performanceScore = caretaker.performanceScore || averageRating * 20;
        
        return {
          ...caretaker,
          caretakerId,
          performanceScore,
          averageRating,
          totalAssessments: caretakerAssessments.length,
        };
      })
      .filter(caretaker => 
        getFullName(caretaker).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (caretaker.slpAssociation && caretaker.slpAssociation.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 10) // Top 10 only
      .map((caretaker, index) => ({
        ...caretaker,
        rank: index + 1,
      }));
  }, [caretakers, assessments, searchTerm]);

  // Calculate caretaker statistics
  const caretakerStatistics = useMemo(() => {
    const totalCaretakers = caretakers.length;
    const withAssessments = caretakers.filter(caretaker => {
      const caretakerId = caretaker.id || caretaker._id || '';
      return assessments.some(a => a.caretakerId === caretakerId);
    }).length;
    
    const averagePerformance = rankedCaretakers.length > 0
      ? rankedCaretakers.reduce((sum, c) => sum + c.performanceScore, 0) / rankedCaretakers.length
      : 0;
    
    const topPerformers = rankedCaretakers.filter(c => c.performanceScore >= 80).length;
    const needsImprovement = rankedCaretakers.filter(c => c.performanceScore < 60).length;
    
    return {
      totalCaretakers,
      withAssessments,
      averagePerformance,
      topPerformers,
      needsImprovement,
      assessmentRate: totalCaretakers > 0 ? (withAssessments / totalCaretakers) * 100 : 0
    };
  }, [caretakers, assessments, rankedCaretakers]);

  // Calculate pig analytics
  const pigAnalytics = useMemo(() => {
    return {
      ...mockPigAnalytics,
      healthRate: (mockPigAnalytics.healthyPigs / mockPigAnalytics.totalPigs) * 100,
      performanceRate: (mockPigAnalytics.topPerformers / mockPigAnalytics.totalPigs) * 100
    };
  }, []);

  // Get trend indicator
  const getTrendIndicator = () => {
    // For now, always return stable icon
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  // Get status text
  const getStatusText = (status?: string): string => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  // Get pig health color
  const getPigHealthColor = (score: number): string => {
    if (score >= 8.5) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 7.0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Get pig growth color
  const getPigGrowthColor = (rate: number): string => {
    if (rate >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Combined Statistics Cards - Human & Pig */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Human Caretaker Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg"> Caretakers</CardTitle>
            <CardDescription>Active caretakers performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-3xl font-bold">{caretakerStatistics.totalCaretakers}</div>
                <div className="text-sm text-gray-500">Total caretakers</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold">{caretakerStatistics.topPerformers}</div>
                <div className="text-xs text-gray-500">Top Performers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{caretakerStatistics.needsImprovement}</div>
                <div className="text-xs text-gray-500">Needs Help</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Avg. Performance</CardTitle>
            <CardDescription>caretaker score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-3xl font-bold">{caretakerStatistics.averagePerformance.toFixed(1)}</div>
                <div className="text-sm text-gray-500">out of 100</div>
              </div>
            </div>
            <Progress value={caretakerStatistics.averagePerformance} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        {/* Pig Performance Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Pig Population</CardTitle>
            <CardDescription>Connected to Pig Radar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PiggyBank className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-3xl font-bold">{pigAnalytics.totalPigs}</div>
                <div className="text-sm text-gray-500">Total pigs</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold">{pigAnalytics.healthyPigs}</div>
                <div className="text-xs text-gray-500">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{pigAnalytics.needsAttention}</div>
                <div className="text-xs text-gray-500">Needs Care</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Pig Health Score</CardTitle>
            <CardDescription>Average from Pig Radar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-600" />
              <div>
                <div className="text-3xl font-bold">{pigAnalytics.averageHealthScore.toFixed(1)}</div>
                <div className="text-sm text-gray-500">out of 10</div>
              </div>
            </div>
            <Badge className={`mt-2 ${getPigHealthColor(pigAnalytics.averageHealthScore)}`}>
              {pigAnalytics.averageHealthScore >= 8.5 ? 'Excellent' :
               pigAnalytics.averageHealthScore >= 7.0 ? 'Good' : 'Needs Attention'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Pig Performance Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Pig Performance Analytics
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
              Connected to Pig Radar
            </Badge>
          </CardTitle>
          <CardDescription>Real-time analytics from pig monitoring system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pig Growth Metrics */}
            <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Weight className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Avg Weight</span>
                </div>
                <Badge className={getPigGrowthColor(pigAnalytics.growthRate)}>
                  {pigAnalytics.growthRate >= 0.8 ? 'Fast' : 
                   pigAnalytics.growthRate >= 0.6 ? 'Normal' : 'Slow'}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{pigAnalytics.averageWeight} kg</div>
              <div className="text-sm text-gray-500 mt-1">
                Growth rate: {pigAnalytics.growthRate} kg/day
              </div>
            </div>

            {/* Feed Efficiency */}
            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Feed Efficiency</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {pigAnalytics.feedEfficiency < 3 ? 'Excellent' : 'Good'}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{pigAnalytics.feedEfficiency.toFixed(1)}</div>
              <div className="text-sm text-gray-500 mt-1">
                kg feed per kg weight gain
              </div>
            </div>

            {/* Health Distribution */}
            <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-violet-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Health Status</span>
                </div>
                <Badge className={getPigHealthColor(pigAnalytics.averageHealthScore)}>
                  {pigAnalytics.averageHealthScore >= 8.5 ? 'Healthy' : 'Monitoring'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Healthy: {pigAnalytics.healthyPigs}</span>
                  <span>{pigAnalytics.healthRate.toFixed(1)}%</span>
                </div>
                <Progress value={pigAnalytics.healthRate} className="h-2" />
              </div>
            </div>

            {/* Top Performers */}
            <div className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Top Performers</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {pigAnalytics.topPerformers}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{pigAnalytics.performanceRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500 mt-1">
                of pigs exceeding targets
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-1 justify-start"
                onClick={() => window.open('/admin/reports/performance-monitoring/pigs', '_self')}
              >
                <Activity className="h-4 w-4 mr-2" />
                View Pig Radar Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 justify-start"
                onClick={() => window.open('/admin/reports/performance-monitoring/pigs?tab=metrics', '_self')}
              >
                <Brain className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
           
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Human Caretakers */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Human Caretakers</CardTitle>
          <CardDescription>Highest performing human caretakers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankedCaretakers.map((caretaker, index) => (
              <div
                key={caretaker.caretakerId}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewCaretaker(caretaker.caretakerId)}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  } font-bold text-lg`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{getFullName(caretaker)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(caretaker.status)}
                      >
                        {caretaker.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {getStatusText(caretaker.status)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Building className="h-3 w-3" />
                        {caretaker.slpAssociation}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-xl">{caretaker.performanceScore.toFixed(1)}</div>
                    <Badge className={getPerformanceColor(caretaker.performanceScore)}>
                      {caretaker.performanceScore >= 90 ? 'Excellent' :
                       caretaker.performanceScore >= 80 ? 'Very Good' :
                       caretaker.performanceScore >= 70 ? 'Good' :
                       caretaker.performanceScore >= 60 ? 'Satisfactory' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {getTrendIndicator()}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddAssessment(caretaker);
                      }}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {rankedCaretakers.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No performance data</h3>
                <p className="text-gray-600 mb-4">
                  Add assessments to see rankings.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-gray-500">
              Showing {rankedCaretakers.length} of {caretakers.length} caretakers
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewCaretaker(rankedCaretakers[0]?.caretakerId || '')}
              disabled={rankedCaretakers.length === 0}
            >
              View All Rankings
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        

     
      </div>
    </div>
  );
};

export default OverviewRankings;