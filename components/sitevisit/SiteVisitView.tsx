'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  MapPin,
  Users,
  Building,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  Edit,
  Printer,
  Download,
  Mail,
  Phone,
  User,
  Briefcase,
  MessageSquare,
  Map,
  X
} from 'lucide-react';

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

interface SiteVisitViewProps {
  siteVisitId: string;
  onBack: () => void;
  onEdit?: () => void;
}

export function SiteVisitView({ siteVisitId, onBack, onEdit }: SiteVisitViewProps) {
  const [siteVisit, setSiteVisit] = useState<SiteVisit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteVisitData();
  }, [siteVisitId]);

  const fetchSiteVisitData = async () => {
    try {
      console.log('👁️ Fetching site visit:', siteVisitId);
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/monitoring/site-visits/${siteVisitId}`);
      console.log('👁️ Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('👁️ Site visit data:', data);
        setSiteVisit(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Error fetching site visit:', errorText);
        setError(`Failed to load site visit: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error in fetchSiteVisitData:', error);
      setError('Failed to load site visit data');
    } finally {
      setIsLoading(false);
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
      completed: <CheckCircle className="h-4 w-4" />,
      scheduled: <Clock className="h-4 w-4" />,
      'in-progress': <AlertCircle className="h-4 w-4" />,
      cancelled: <AlertCircle className="h-4 w-4" />,
    };
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!siteVisit) return;
    
    const dataStr = JSON.stringify(siteVisit, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `site-visit-${siteVisitId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Loading site visit details</p>
            <p className="text-gray-600 text-sm">Please wait while we load the data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !siteVisit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="text-gray-300 mb-3">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error ? 'Error Loading Site Visit' : 'Site Visit Not Found'}
          </h3>
          <p className="text-gray-500 mb-4 max-w-md">
            {error || 'The requested site visit could not be found.'}
          </p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

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
                onClick={onBack}
                className="h-10 w-10 hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">Site Visit Details</h1>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1.5 ${getStatusColor(siteVisit.status)}`}
                  >
                    {getStatusIcon(siteVisit.status)}
                    {siteVisit.status.charAt(0).toUpperCase() + siteVisit.status.slice(1).replace('-', ' ')}
                  </Badge>
                </div>
                <p className="text-gray-600 mt-1">
                  {siteVisit.visit_number}{siteVisit.visit_number === 1 ? 'st' : siteVisit.visit_number === 2 ? 'nd' : siteVisit.visit_number === 3 ? 'rd' : 'th'} visit for {siteVisit.project_name}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button 
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            {onEdit && (
              <Button 
                onClick={onEdit}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                Edit Visit
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visit Overview Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Visit Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Visit Number</p>
                    <div className="flex items-center gap-2">
                      <Badge className="text-base px-3 py-1 bg-blue-100 text-blue-800">
                        {siteVisit.visit_number}{siteVisit.visit_number === 1 ? 'st' : siteVisit.visit_number === 2 ? 'nd' : siteVisit.visit_number === 3 ? 'rd' : 'th'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Visit Date</p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      {formatDate(siteVisit.visit_date)}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Purpose</p>
                    <p className="text-gray-900">{siteVisit.visit_purpose}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Participants ({siteVisit.participants.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {siteVisit.participants.map((participant, index) => (
                        <Badge key={`participant-${index}-${siteVisit.id}`} variant="secondary" className="bg-gray-100 text-gray-700">
                          <User className="h-3 w-3 mr-1" />
                          {participant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <div className="flex items-start gap-2 text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span>{siteVisit.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Findings & Recommendations Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Findings & Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Findings & Observations</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">
                      {siteVisit.findings || 'No findings recorded.'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recommendations</h4>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">
                      {siteVisit.recommendations || 'No recommendations recorded.'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Next Steps</h4>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">
                      {siteVisit.next_steps || 'No next steps recorded.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Information Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{siteVisit.project_name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Association: {siteVisit.association_name}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Caretakers Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Caretakers ({siteVisit.caretakers.length})
                </CardTitle>
                <CardDescription>
                  Team members responsible for this visit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {siteVisit.caretakers.map((caretaker) => (
                  <div key={`caretaker-${caretaker.id}-${siteVisit.id}`} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{caretaker.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {caretaker.role}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {caretaker.contact_number && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{caretaker.contact_number}</span>
                        </div>
                      )}
                      
                      {caretaker.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{caretaker.email}</span>
                        </div>
                      )}
                      
                      {caretaker.notes && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 pt-2 border-t">
                          <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{caretaker.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Metadata Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Visit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created By</span>
                    <span className="font-medium">{siteVisit.created_by}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created At</span>
                    <span className="font-medium">{formatDateTime(siteVisit.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="font-medium">{formatDateTime(siteVisit.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}