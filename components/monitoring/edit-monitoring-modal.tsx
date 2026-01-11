// components/monitoring/edit-monitoring-modal.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MonitoringRecord } from '@/types/monitoring';
import { 
  X,
  Calculator,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react';

interface EditMonitoringModalProps {
  record: MonitoringRecord;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRecord: MonitoringRecord) => void;
  projectName: string;
}

export default function EditMonitoringModal({ 
  record, 
  isOpen, 
  onClose,
  onSuccess,
  projectName 
}: EditMonitoringModalProps) {
  const [formData, setFormData] = useState({
    monthly_gross_sales: record.monthly_gross_sales || 0,
    monthly_cost_of_sales: record.monthly_cost_of_sales || 0,
    monthly_operating_expenses: record.monthly_operating_expenses || 0,
    status: record.status || 'completed'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateGrossProfit = () => {
    return formData.monthly_gross_sales - formData.monthly_cost_of_sales;
  };

  const calculateNetIncome = () => {
    return calculateGrossProfit() - formData.monthly_operating_expenses;
  };

  const handleNumberChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
    setError(null);
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const grossProfit = calculateGrossProfit();
      const netIncome = calculateNetIncome();

      const updatedData = {
        monthly_gross_sales: formData.monthly_gross_sales,
        monthly_cost_of_sales: formData.monthly_cost_of_sales,
        monthly_operating_expenses: formData.monthly_operating_expenses,
        monthly_gross_profit: grossProfit,
        monthly_net_income: netIncome,
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      // Use the correct record ID (either id or _id)
      const recordId = record.id || record._id;
      
      if (!recordId) {
        throw new Error('Record ID not found');
      }

      console.log('🚀 Starting update process...');
      console.log('📝 Record ID:', recordId);
      console.log('📊 Update data:', updatedData);

      // Update record in MongoDB
      const response = await fetch(`/api/monitoring/records/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      let responseData;
      try {
        responseData = await response.json();
        console.log('📡 Response data:', responseData);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error('Server returned invalid response format');
      }

      if (!response.ok) {
        console.error('❌ API error response:', responseData);
        const errorMessage = responseData?.error || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log('✅ Update successful:', responseData);

      // Ensure the response has proper IDs
      const processedRecord: MonitoringRecord = {
        ...responseData,
        id: responseData.id || responseData._id || recordId,
        _id: responseData._id || responseData.id || recordId
      };

      onSuccess(processedRecord);
      
    } catch (error) {
      console.error('❌ Error updating monitoring record:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update monitoring record. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const grossProfit = calculateGrossProfit();
  const netIncome = calculateNetIncome();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { 
      style: 'currency', 
      currency: 'PHP', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(amount);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Monitoring Record</h2>
            <p className="text-sm text-gray-600 mt-1">{projectName}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-white/50 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-3 p-4 border border-red-200 bg-red-50 rounded-lg animate-in fade-in-0 duration-300">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Update Failed</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Please check your connection and try again. If the problem persists, contact support.
                  </p>
                </div>
              </div>
            )}

            {/* Record Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-sm">
              <CardHeader className="pb-4 bg-blue-50/30 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                  <Building className="h-5 w-5" />
                  Record Information
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Basic information about this monitoring record
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Project</Label>
                    <p className="text-sm text-gray-900 font-medium">{projectName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Monitoring Date</Label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(record.monitoring_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Field Officer</Label>
                    <p className="text-sm text-gray-900">{record.field_officer_id}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Monitoring Type</Label>
                    <p className="text-sm text-gray-900 capitalize">{record.monitoring_type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-sm">
              <CardHeader className="pb-4 bg-green-50/30 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-green-900">
                  <Calculator className="h-5 w-5" />
                  Financial Information
                </CardTitle>
                <CardDescription className="text-green-700">
                  Update financial data for this monitoring record
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthly_gross_sales" className="text-sm font-medium text-gray-700">
                        Monthly Gross Sales (₱)
                      </Label>
                      <Input
                        id="monthly_gross_sales"
                        type="number"
                        value={formData.monthly_gross_sales}
                        onChange={(e) => handleNumberChange('monthly_gross_sales', e.target.value)}
                        placeholder="0"
                        required
                        min="0"
                        step="0.01"
                        className="border-gray-200 focus:border-green-300 focus:ring-green-200 transition-colors"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthly_cost_of_sales" className="text-sm font-medium text-gray-700">
                        Monthly Cost of Sales (₱)
                      </Label>
                      <Input
                        id="monthly_cost_of_sales"
                        type="number"
                        value={formData.monthly_cost_of_sales}
                        onChange={(e) => handleNumberChange('monthly_cost_of_sales', e.target.value)}
                        placeholder="0"
                        required
                        min="0"
                        step="0.01"
                        className="border-gray-200 focus:border-green-300 focus:ring-green-200 transition-colors"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthly_operating_expenses" className="text-sm font-medium text-gray-700">
                        Monthly Operating Expenses (₱)
                      </Label>
                      <Input
                        id="monthly_operating_expenses"
                        type="number"
                        value={formData.monthly_operating_expenses}
                        onChange={(e) => handleNumberChange('monthly_operating_expenses', e.target.value)}
                        placeholder="0"
                        required
                        min="0"
                        step="0.01"
                        className="border-gray-200 focus:border-green-300 focus:ring-green-200 transition-colors"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">Calculated Values</Label>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg space-y-4 border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Gross Profit:</span>
                        <span className={`text-lg font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(grossProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Net Income:</span>
                        <span className={`text-lg font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(netIncome)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-green-200">
                        <div className="flex justify-between items-center text-xs text-green-700">
                          <span>Gross Sales:</span>
                          <span>{formatCurrency(formData.monthly_gross_sales)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-green-700">
                          <span>Cost of Sales:</span>
                          <span>{formatCurrency(formData.monthly_cost_of_sales)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-green-700">
                          <span>Operating Expenses:</span>
                          <span>{formatCurrency(formData.monthly_operating_expenses)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-sm">
              <CardHeader className="pb-4 bg-purple-50/30 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
                  <CheckCircle className="h-5 w-5" />
                  Status Information
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Update the status of this monitoring record
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">Record Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={handleStatusChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="border-gray-200 focus:ring-purple-200 transition-colors">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed" className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Completed
                        </SelectItem>
                        <SelectItem value="pending">
                          Pending Review
                        </SelectItem>
                        <SelectItem value="draft">
                          Draft
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500">
                    Updating the status helps track the progress of this monitoring record.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200/50 bg-gray-50/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors min-w-20"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md min-w-32"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Record
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}