'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  User,
  Check
} from 'lucide-react';

interface ProjectMonitoringFormProps {
  projectId: string;
  associationId?: string | null;
  onSuccess: (record: MonitoringRecord) => void;
  onCancel: () => void;
}

interface Association {
  id: string;
  _id?: string;
  name: string;
  location: string;
}

export default function ProjectMonitoringForm({ 
  projectId, 
  associationId,
  onSuccess, 
  onCancel 
}: ProjectMonitoringFormProps) {
  const [formData, setFormData] = useState({
    monitoring_date: new Date().toISOString().split('T')[0],
    monitoring_year: new Date().getFullYear(),
    monitoring_frequency: 'monthly',
    field_officer_id: '',
    provincial_coordinator: '',
    monitoring_type: 'routine',
    monthly_gross_sales: 0,
    monthly_cost_of_sales: 0,
    monthly_operating_expenses: 0,
    verification_methods: '',
    notes_remarks: '',
    status: 'completed'
  });

  const [associations, setAssociations] = useState<Association[]>([]);
  const [selectedAssociation, setSelectedAssociation] = useState<string>(associationId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssociations();
  }, [projectId, associationId]);

  const fetchAssociations = async () => {
    try {
      const response = await fetch('/api/monitoring/associations');
      if (response.ok) {
        const associationsData = await response.json();
        setAssociations(associationsData);
        
        // Set default association if none selected
        if (!associationId && associationsData.length > 0) {
          setSelectedAssociation(associationsData[0].id || associationsData[0]._id);
        }
        
        // If associationId is provided, set it as selected
        if (associationId) {
          setSelectedAssociation(associationId);
        }
      } else {
        // Fallback to mock data if API fails
        const mockAssociations: Association[] = [
          { id: '1', name: 'Farmers Association 1', location: 'sitio tabugon brgy caradio-an himamaylan city, Negros Occidental' },
          { id: '2', name: 'Farmers Association 3', location: 'sitio garangan Brgy. tooy Him, Negros Occidental' },
          { id: '3', name: 'Farmers Association 2', location: 'brgy manggabat him, neg, occ' },
        ];
        setAssociations(mockAssociations);
        if (!associationId && mockAssociations.length > 0) {
          setSelectedAssociation(mockAssociations[0].id);
        }
        if (associationId) {
          setSelectedAssociation(associationId);
        }
      }
    } catch (error) {
      console.error('Error fetching associations:', error);
    }
  };

  // Get the selected association object
  const getSelectedAssociation = (): Association | undefined => {
    return associations.find(assoc => 
      assoc.id === selectedAssociation || assoc._id === selectedAssociation
    );
  };

  const calculateGrossProfit = () => {
    return formData.monthly_gross_sales - formData.monthly_cost_of_sales;
  };

  const calculateNetIncome = () => {
    return calculateGrossProfit() - formData.monthly_operating_expenses;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    handleInputChange(field, numValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedAssoc = getSelectedAssociation();
      if (!selectedAssoc) {
        alert('Please select an association');
        return;
      }

      const monitoringData = {
        ...formData,
        project_id: projectId,
        association_ids: [selectedAssociation], // Store the selected association ID
        association_name: selectedAssoc.name, // Store association name for easy display
        association_location: selectedAssoc.location, // Store location for easy display
        monthly_gross_profit: calculateGrossProfit(),
        monthly_net_income: calculateNetIncome(),
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to MongoDB
      const response = await fetch('/api/monitoring/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(monitoringData),
      });

      if (!response.ok) {
        throw new Error('Failed to create monitoring record');
      }

      const newRecord = await response.json();
      
      onSuccess(newRecord);
    } catch (error) {
      console.error('Error creating monitoring record:', error);
      alert('Failed to create monitoring record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const grossProfit = calculateGrossProfit();
  const netIncome = calculateNetIncome();
  const selectedAssoc = getSelectedAssociation();

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Monitoring Record</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a new monitoring record for {selectedAssoc ? selectedAssoc.name : 'the association'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="hover:bg-white/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Association Selection */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="pb-4 bg-blue-50/50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                  <Building className="h-5 w-5" />
                  Select Association
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Choose which association this monitoring record is for
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <Select value={selectedAssociation} onValueChange={setSelectedAssociation}>
                  <SelectTrigger className="border-blue-200 focus:ring-blue-200">
                    <SelectValue placeholder="Select an association" />
                  </SelectTrigger>
                  <SelectContent>
                    {associations.map((association) => (
                      <SelectItem key={association.id || association._id} value={(association.id || association._id || '').toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{association.name}</span>
                          <span className="text-xs text-gray-500">{association.location}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Display selected association details */}
                {selectedAssoc && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <Check className="h-4 w-4" />
                      <span className="font-medium">Selected Association:</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div><strong>Name:</strong> {selectedAssoc.name}</div>
                      <div><strong>Location:</strong> {selectedAssoc.location}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-4 bg-gray-50/50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <Calendar className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monitoring_date" className="text-gray-700">Monitoring Date</Label>
                    <Input
                      id="monitoring_date"
                      type="date"
                      value={formData.monitoring_date}
                      onChange={(e) => handleInputChange('monitoring_date', e.target.value)}
                      required
                      className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monitoring_year" className="text-gray-700">Monitoring Year</Label>
                    <Input
                      id="monitoring_year"
                      type="number"
                      value={formData.monitoring_year}
                      onChange={(e) => handleInputChange('monitoring_year', parseInt(e.target.value))}
                      required
                      className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field_officer_id" className="text-gray-700">Field Officer</Label>
                    <Input
                      id="field_officer_id"
                      value={formData.field_officer_id}
                      onChange={(e) => handleInputChange('field_officer_id', e.target.value)}
                      placeholder="Enter field officer name"
                      required
                      className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provincial_coordinator" className="text-gray-700">Provincial Coordinator (Optional)</Label>
                    <Input
                      id="provincial_coordinator"
                      value={formData.provincial_coordinator}
                      onChange={(e) => handleInputChange('provincial_coordinator', e.target.value)}
                      placeholder="Enter provincial coordinator name"
                      className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monitoring_frequency" className="text-gray-700">Monitoring Frequency</Label>
                    <Select 
                      value={formData.monitoring_frequency} 
                      onValueChange={(value) => handleInputChange('monitoring_frequency', value)}
                    >
                      <SelectTrigger className="border-gray-200 focus:ring-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monitoring_type" className="text-gray-700">Monitoring Type</Label>
                    <Select 
                      value={formData.monitoring_type} 
                      onValueChange={(value) => handleInputChange('monitoring_type', value)}
                    >
                      <SelectTrigger className="border-gray-200 focus:ring-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="spot">Spot Check</SelectItem>
                        <SelectItem value="special">Special Monitoring</SelectItem>
                        <SelectItem value="validation">Validation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="border-green-100 shadow-sm">
              <CardHeader className="pb-4 bg-green-50/50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-green-900">
                  <Calculator className="h-5 w-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_gross_sales" className="text-gray-700">Monthly Gross Sales (₱)</Label>
                    <Input
                      id="monthly_gross_sales"
                      type="number"
                      value={formData.monthly_gross_sales}
                      onChange={(e) => handleNumberChange('monthly_gross_sales', e.target.value)}
                      placeholder="0"
                      required
                      className="border-gray-200 focus:border-green-300 focus:ring-green-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly_cost_of_sales" className="text-gray-700">Monthly Cost of Sales (₱)</Label>
                    <Input
                      id="monthly_cost_of_sales"
                      type="number"
                      value={formData.monthly_cost_of_sales}
                      onChange={(e) => handleNumberChange('monthly_cost_of_sales', e.target.value)}
                      placeholder="0"
                      required
                      className="border-gray-200 focus:border-green-300 focus:ring-green-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly_operating_expenses" className="text-gray-700">Monthly Operating Expenses (₱)</Label>
                    <Input
                      id="monthly_operating_expenses"
                      type="number"
                      value={formData.monthly_operating_expenses}
                      onChange={(e) => handleNumberChange('monthly_operating_expenses', e.target.value)}
                      placeholder="0"
                      required
                      className="border-gray-200 focus:border-green-300 focus:ring-green-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Calculated Values</Label>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg space-y-3 border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Gross Profit:</span>
                        <span className={`text-lg font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₱{grossProfit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Net Income:</span>
                        <span className={`text-lg font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₱{netIncome.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border-purple-100 shadow-sm">
              <CardHeader className="pb-4 bg-purple-50/50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
                  <User className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification_methods" className="text-gray-700">Verification Methods</Label>
                  <Textarea
                    id="verification_methods"
                    value={formData.verification_methods}
                    onChange={(e) => handleInputChange('verification_methods', e.target.value)}
                    placeholder="Describe the methods used to verify the information..."
                    rows={3}
                    className="border-gray-200 focus:border-purple-300 focus:ring-purple-200 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes_remarks" className="text-gray-700">Notes & Remarks</Label>
                  <Textarea
                    id="notes_remarks"
                    value={formData.notes_remarks}
                    onChange={(e) => handleInputChange('notes_remarks', e.target.value)}
                    placeholder="Add any additional notes or remarks..."
                    rows={3}
                    className="border-gray-200 focus:border-purple-300 focus:ring-purple-200 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-700">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:ring-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isSubmitting}
              className="border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedAssociation}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Record...
                </>
              ) : (
                `Create Record for ${selectedAssoc?.name || 'Association'}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}