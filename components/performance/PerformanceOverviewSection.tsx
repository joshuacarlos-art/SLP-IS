'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  PlusCircle, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  User as UserIcon,
  Building,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

import { Caretaker, PerformanceAssessment, getFullName, getPerformanceColor, getStatusColor } from '@/types/performance';

interface PerformanceOverviewSectionProps {
  caretaker: Caretaker;
  assessments: PerformanceAssessment[];
  onClick: () => void;
  onAddAssessment: (caretaker: Caretaker) => void;
}

const PerformanceOverviewSection: React.FC<PerformanceOverviewSectionProps> = ({
  caretaker,
  assessments,
  onClick,
  onAddAssessment,
}) => {
  const caretakerId = caretaker.id || caretaker._id || '';
  
  // Calculate performance data
  const averageRating = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + a.rating, 0) / assessments.length
    : 0;
  
  const performanceScore = caretaker.performanceScore || averageRating * 20;
  const lastAssessment = assessments.length > 0
    ? new Date(assessments[assessments.length - 1].date || assessments[assessments.length - 1].assessmentDate)
    : null;

  // Get trend (simplified - would come from actual data)
  const getTrend = () => {
    if (assessments.length < 2) return 'stable';
    return 'stable'; // Simplified
  };

  const trend = getTrend();
  const trendIcon = trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> :
                    trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-500" /> :
                    <Minus className="h-4 w-4 text-gray-500" />;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Caretaker Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{getFullName(caretaker)}</h3>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(caretaker.status)}
                  >
                    {caretaker.status === 'active' ? 'Active' : 
                     caretaker.status === 'on-leave' || caretaker.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {caretaker.slpAssociation || 'No Association'}
                  </div>
                  {caretaker.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {caretaker.email}
                    </div>
                  )}
                  {caretaker.contactNumber && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {caretaker.contactNumber}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= averageRating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{averageRating.toFixed(1)}/5</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {trendIcon}
                    <span className="text-sm text-gray-500">{assessments.length} assessments</span>
                  </div>
                  
                  {lastAssessment && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Last: {lastAssessment.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Score and Actions */}
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-3xl font-bold">{performanceScore.toFixed(1)}</div>
              <Badge className={getPerformanceColor(performanceScore)}>
                {performanceScore >= 90 ? 'Excellent' :
                 performanceScore >= 80 ? 'Very Good' :
                 performanceScore >= 70 ? 'Good' :
                 performanceScore >= 60 ? 'Satisfactory' : 'Needs Improvement'}
              </Badge>
            </div>
            
            <div className="w-48">
              <Progress value={performanceScore} className="h-2" />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddAssessment(caretaker);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Assessment
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceOverviewSection;