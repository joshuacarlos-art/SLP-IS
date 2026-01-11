// components/monitoring/view-monitoring-modal.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MonitoringRecord } from '@/types/monitoring';
import { 
  FileText, 
  DollarSign, 
  BarChart3, 
  Calendar, 
  User, 
  MapPin,
  Building,
  X,
  Download,
  Printer
} from 'lucide-react';

interface ViewMonitoringModalProps {
  record: MonitoringRecord;
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

export default function ViewMonitoringModal({ 
  record, 
  isOpen, 
  onClose,
  projectName 
}: ViewMonitoringModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Downloading monitoring record:', record.id);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Monitoring Record Details</h2>
            <p className="text-sm text-gray-600 mt-1">{projectName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="bg-white/50 backdrop-blur-sm border-gray-300/50">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="bg-white/50 backdrop-blur-sm border-gray-300/50">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/50 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <p className="mt-1 text-sm text-gray-900">{projectName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monitoring Date</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(record.monitoring_date)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monitoring Year</label>
                    <p className="mt-1 text-sm text-gray-900">{record.monitoring_year}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Field Officer</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {record.field_officer_id}
                    </p>
                  </div>
                  {record.provincial_coordinator && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Provincial Coordinator</label>
                      <p className="mt-1 text-sm text-gray-900">{record.provincial_coordinator}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monitoring Type & Frequency</label>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="outline" className="capitalize bg-white/50 backdrop-blur-sm">
                        {record.monitoring_type}
                      </Badge>
                      <Badge variant="outline" className="capitalize bg-white/50 backdrop-blur-sm">
                        {record.monitoring_frequency}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-gray-50/50 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(record.monthly_gross_sales)}</div>
                  <div className="text-sm text-gray-600 mt-1">Gross Sales</div>
                </div>
                <div className="text-center p-4 bg-gray-50/50 rounded-lg backdrop-blur-sm">
                  <div className="text-lg font-semibold text-gray-900">{formatCurrency(record.monthly_cost_of_sales)}</div>
                  <div className="text-sm text-gray-600 mt-1">Cost of Sales</div>
                </div>
                <div className="text-center p-4 bg-green-50/50 rounded-lg backdrop-blur-sm">
                  <div className={`text-2xl font-bold ${record.monthly_gross_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(record.monthly_gross_profit)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Gross Profit</div>
                </div>
                <div className="text-center p-4 bg-gray-50/50 rounded-lg backdrop-blur-sm">
                  <div className="text-lg font-semibold text-gray-900">{formatCurrency(record.monthly_operating_expenses)}</div>
                  <div className="text-sm text-gray-600 mt-1">Operating Expenses</div>
                </div>
                <div className="text-center p-4 bg-blue-50/50 rounded-lg backdrop-blur-sm">
                  <div className={`text-2xl font-bold ${record.monthly_net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(record.monthly_net_income)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Net Income</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(record.verification_methods || record.notes_remarks) && (
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {record.verification_methods && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Methods</label>
                    <p className="text-sm text-gray-700 bg-gray-50/50 p-3 rounded-lg backdrop-blur-sm">{record.verification_methods}</p>
                  </div>
                )}
                {record.notes_remarks && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes & Remarks</label>
                    <p className="text-sm text-gray-700 bg-gray-50/50 p-3 rounded-lg backdrop-blur-sm whitespace-pre-wrap">{record.notes_remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                Record Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={
                    record.status === 'completed' ? "bg-green-100/50 text-green-800 backdrop-blur-sm" :
                    record.status === 'pending' ? "bg-yellow-100/50 text-yellow-800 backdrop-blur-sm" :
                    "bg-blue-100/50 text-blue-800 backdrop-blur-sm"
                  }>
                    {record.status?.charAt(0).toUpperCase() + record.status?.slice(1) || 'Unknown'}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    {record.is_archived ? 'This record has been archived' : 'Active monitoring record'}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>Created: {record.created_at ? formatDate(record.created_at) : 'Unknown'}</div>
                  {record.updated_at && (
                    <div>Updated: {formatDate(record.updated_at)}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50">
            <Button variant="outline" onClick={onClose} className="bg-white/50 backdrop-blur-sm border-gray-300/50">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}