// components/monitoring/archive-monitoring-modal.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringRecord } from '@/types/monitoring';
import { 
  Archive,
  X,
  AlertTriangle,
  Calendar,
  DollarSign,
  Building
} from 'lucide-react';

interface ArchiveMonitoringModalProps {
  record: MonitoringRecord;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}

export default function ArchiveMonitoringModal({ 
  record, 
  isOpen, 
  onClose,
  onConfirm,
  projectName 
}: ArchiveMonitoringModalProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      setError(null);
      
      // Use the correct record ID (either id or _id)
      const recordId = record.id || record._id;
      
      if (!recordId) {
        throw new Error('Record ID not found');
      }

      console.log('Archiving record with ID:', recordId);

      const response = await fetch(`/api/monitoring/records/${recordId}/archive`, {
        method: 'PATCH',
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to archive record');
      }

      console.log('Archive successful:', responseData);
      onConfirm();
    } catch (error) {
      console.error('Error archiving record:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive monitoring record';
      setError(errorMessage);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-red-50/80 to-orange-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Archive className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Archive Record</h2>
              <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-white/50 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-3 p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Warning Alert */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-medium text-yellow-800">Archive Monitoring Record</h4>
              <p className="text-sm text-yellow-700">
                This record will be moved to archives and will no longer appear in active monitoring lists.
              </p>
            </div>
          </div>

          {/* Record Details */}
          <Card className="bg-gray-50/50 border-gray-200/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-900">{projectName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{formatDate(record.monitoring_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Sales: {formatCurrency(record.monthly_gross_sales || 0)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Field Officer: {record.field_officer_id}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isArchiving}
              className="border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleArchive}
              disabled={isArchiving}
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {isArchiving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Archiving...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Record
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
}