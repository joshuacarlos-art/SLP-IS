'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Medal, 
  Trophy, 
  Star, 
  Target, 
  TrendingUp,
  Award,
  Eye,
  Building,
  Users,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Caretaker, PerformanceAssessment } from '@/types/performance';
import { 
  getFullName, 
  calculatePerformanceScore, 
  getPerformanceLabel,
  getScoreColor,
  getBadgeColor,
  getRankColor 
} from '@/lib/utils/performance';
import { formatAssociationName } from '@/lib/utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface TopPerformersViewProps {
  caretakers: Caretaker[];
  assessments: PerformanceAssessment[];
  onViewCaretaker: (caretakerId: string) => void;
  selectedAssociation?: string;
  limit?: number;
}

export default function TopPerformersView({
  caretakers,
  assessments,
  onViewCaretaker,
  selectedAssociation = 'all',
  limit = 10
}: TopPerformersViewProps) {
  // Calculate top performers
  const topPerformers = useMemo(() => {
    const rankings = caretakers
      .map(caretaker => {
        const caretakerId = caretaker.id || caretaker._id;
        if (!caretakerId) return null;
        
        const caretakerAssessments = assessments.filter((a: PerformanceAssessment) => 
          a.caretakerId === caretakerId
        );
        if (caretakerAssessments.length === 0) return null;
        
        const { score, averageRating } = calculatePerformanceScore(caretakerAssessments);
        
        return {
          caretaker,
          score,
          assessments: caretakerAssessments.length,
          averageRating,
          caretakerId
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));

    // Apply association filter if needed
    let filteredRankings = rankings;
    if (selectedAssociation !== 'all') {
      filteredRankings = rankings.filter(item => 
        item.caretaker.slpAssociation === selectedAssociation
      );
      
      // Re-rank within the association
      filteredRankings = filteredRankings
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }));
    }

    return filteredRankings.slice(0, limit);
  }, [caretakers, assessments, selectedAssociation, limit]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    if (rank <= 10) return <Trophy className="h-5 w-5 text-blue-500" />;
    return <Star className="h-4 w-4 text-gray-400" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (topPerformers.length === 0) {
      return {
        averageScore: '0.0',
        totalAssessments: 0,
        bestCategory: null as { range: string; count: number; color: string } | null,
        improvement: 0
      };
    }

    const averageScore = topPerformers.reduce((sum, item) => sum + item.score, 0) / topPerformers.length;
    const totalAssessments = topPerformers.reduce((sum, item) => sum + item.assessments, 0);
    
    // Calculate score distribution among top performers
    const scoreRanges = [
      { range: '95-100', count: 0, color: '#10b981' },
      { range: '90-94', count: 0, color: '#34d399' },
      { range: '85-89', count: 0, color: '#3b82f6' },
      { range: '80-84', count: 0, color: '#f59e0b' },
      { range: '75-79', count: 0, color: '#f97316' },
    ];

    topPerformers.forEach(item => {
      if (item.score >= 95) scoreRanges[0].count++;
      else if (item.score >= 90) scoreRanges[1].count++;
      else if (item.score >= 85) scoreRanges[2].count++;
      else if (item.score >= 80) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });

    const bestCategory = scoreRanges.reduce((prev, current) => 
      prev.count > current.count ? prev : current
    );

    // Calculate improvement from previous period (placeholder - you would need historical data)
    const improvement = 2.5; // placeholder percentage

    return {
      averageScore: averageScore.toFixed(1),
      totalAssessments,
      bestCategory,
      improvement
    };
  }, [topPerformers]);

  if (topPerformers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Top Performers Yet</h3>
            <p className="text-gray-600">
              Top performers will appear once multiple caretakers have assessments.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Average Score</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.averageScore}</p>
                <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Top {topPerformers.length} performers</span>
                </div>
              </div>
              <Target className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Total Assessments</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.totalAssessments}</p>
                <div className="text-sm text-yellow-600 mt-1">
                  Across all top performers
                </div>
              </div>
              <Award className="h-10 w-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Best Score Range</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.bestCategory?.range}</p>
                <div className="text-sm text-green-600 mt-1">
                  {stats.bestCategory?.count} caretakers
                </div>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Avg. Improvement</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">+{stats.improvement}%</p>
                <div className="text-sm text-purple-600 mt-1">
                  From last period
                </div>
              </div>
              <Crown className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Top {topPerformers.length} Performers
                  </CardTitle>
                  <CardDescription>
                    {selectedAssociation === 'all' 
                      ? 'Best performing caretakers across all associations' 
                      : `Top performers in ${formatAssociationName(selectedAssociation)}`
                    }
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  {topPerformers.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((item) => (
                  <div 
                    key={item.caretakerId}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => onViewCaretaker(item.caretakerId)}
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getRankBadge(item.rank)}`}>
                      {item.rank}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                            {getFullName(item.caretaker)}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {formatAssociationName(item.caretaker.slpAssociation)}
                            </span>
                            <span className="text-sm text-gray-400">
                              • {item.assessments} assessment{item.assessments !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                            {item.score.toFixed(0)}
                          </div>
                          <Badge className={`mt-1 ${getBadgeColor(item.score)}`}>
                            {getPerformanceLabel(item.score)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Performance Score</span>
                          <span>{item.score.toFixed(0)}/100</span>
                        </div>
                        <Progress value={item.score} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {getRankIcon(item.rank)}
                          <span className="text-sm text-gray-600">
                            {item.rank === 1 ? 'Top Performer' : 
                             item.rank === 2 ? 'Second Place' : 
                             item.rank === 3 ? 'Third Place' : 
                             `Rank ${item.rank}`}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewCaretaker(item.caretakerId);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics and Distribution */}
        <div className="space-y-6">
          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>Performance spread among top {topPerformers.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { range: '95-100', count: topPerformers.filter(p => p.score >= 95).length, color: '#10b981' },
                      { range: '90-94', count: topPerformers.filter(p => p.score >= 90 && p.score < 95).length, color: '#34d399' },
                      { range: '85-89', count: topPerformers.filter(p => p.score >= 85 && p.score < 90).length, color: '#3b82f6' },
                      { range: '80-84', count: topPerformers.filter(p => p.score >= 80 && p.score < 85).length, color: '#f59e0b' },
                      { range: '75-79', count: topPerformers.filter(p => p.score >= 75 && p.score < 80).length, color: '#f97316' },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} caretakers`, 'Count']}
                      labelFormatter={(label) => `Score Range: ${label}`}
                    />
                    <Bar 
                      dataKey="count" 
                      name="Number of Caretakers"
                      radius={[4, 4, 0, 0]}
                    >
                      {[
                        { range: '95-100', count: topPerformers.filter(p => p.score >= 95).length, color: '#10b981' },
                        { range: '90-94', count: topPerformers.filter(p => p.score >= 90 && p.score < 95).length, color: '#34d399' },
                        { range: '85-89', count: topPerformers.filter(p => p.score >= 85 && p.score < 90).length, color: '#3b82f6' },
                        { range: '80-84', count: topPerformers.filter(p => p.score >= 80 && p.score < 85).length, color: '#f59e0b' },
                        { range: '75-79', count: topPerformers.filter(p => p.score >= 75 && p.score < 80).length, color: '#f97316' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top 3 Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Top 3 Performers
              </CardTitle>
              <CardDescription>Leading caretakers by performance score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.slice(0, 3).map((item) => (
                  <div 
                    key={item.caretakerId}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => onViewCaretaker(item.caretakerId)}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getRankBadge(item.rank)}`}>
                      {item.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {getFullName(item.caretaker)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 truncate">
                          {formatAssociationName(item.caretaker.slpAssociation)}
                        </div>
                        <div className={`font-bold ${getScoreColor(item.score)}`}>
                          {item.score.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage top performers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // You can add functionality to generate reports
                    console.log('Generate report clicked');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Generate Performance Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // You can add functionality to recognize top performers
                    console.log('Recognize performers clicked');
                  }}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Recognize Top Performers
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // You can add functionality to schedule reviews
                    console.log('Schedule reviews clicked');
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Schedule Performance Reviews
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}