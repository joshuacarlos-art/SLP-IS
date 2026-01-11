// components/site-visit/SiteVisitItem.tsx
import React from 'react';
import { format } from 'date-fns';
import { MapPin, User, Building, Calendar, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SiteVisitItemProps {
  visit: {
    id: string;
    projectId: string;
    projectName?: string;
    caretakerId: string;
    caretakerName?: string;
    visitDate: string;
    visitPurpose: string;
    status: string;
    participants: string;
    findings: string;
    recommendations: string;
  };
  onClick?: () => void;
}

export default function SiteVisitItem({ visit, onClick }: SiteVisitItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:border-blue-300' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">{visit.visitPurpose}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-3 w-3" />
                {formatDate(visit.visitDate)}
              </div>
            </div>
            <Badge className={getStatusColor(visit.status)}>
              {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
            </Badge>
          </div>

          {/* Project Information */}
          <div className="flex items-start gap-2">
            <Building className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {visit.projectName || 'Unknown Project'}
              </div>
              <div className="text-gray-600 text-xs">
                Project ID: {visit.projectId}
              </div>
            </div>
          </div>

          {/* Caretaker Information */}
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {visit.caretakerName || 'Unknown Caretaker'}
              </div>
              <div className="text-gray-600 text-xs">
                Caretaker ID: {visit.caretakerId}
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <div className="font-medium">Participants:</div>
              <div className="text-xs line-clamp-2">{visit.participants}</div>
            </div>
          </div>

          {/* Findings Preview */}
          <div className="text-sm text-gray-600">
            <div className="font-medium">Findings:</div>
            <div className="text-xs line-clamp-2">{visit.findings}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}