"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, ArrowLeft, Plus, Eye, X, Loader2, TrendingUp, TrendingDown, DollarSign, PieChart, Search, Building, Users, Calendar, Calculator, User } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import FinancialDashboard from "@/components/reports/financial-dashboard";
import ViewFinancialReportModal from "@/components/reports/view-financial-report";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Association, FinancialReport, Caretaker, Project } from "@/types/financial";

// Simple activity logging function
const logActivity = async (module: string, action: string, details: string, status: 'success' | 'error' | 'warning' = 'success', metadata?: any) => {
  try {
    const activity = {
      module,
      action,
      details,
      status,
      metadata,
      timestamp: new Date().toISOString(),
      user: 'Admin User'
    };

    // Send to your activity logs API
    await fetch('/api/activity-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activity),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

const logSuccess = (module: string, action: string, details: string, metadata?: any) => 
  logActivity(module, action, details, 'success', metadata);

const logError = (module: string, action: string, details: string, metadata?: any) => 
  logActivity(module, action, details, 'error', metadata);

const logWarning = (module: string, action: string, details: string, metadata?: any) => 
  logActivity(module, action, details, 'warning', metadata);

// Add Financial Report Form Component
function AddFinancialReportForm({ 
  associations, 
  caretakers,
  isOpen, 
  onClose, 
  onReportAdded 
}: { 
  associations: Association[];
  caretakers: Caretaker[];
  isOpen: boolean;
  onClose: () => void;
  onReportAdded: () => void;
}) {
  const [formData, setFormData] = useState<Partial<FinancialReport>>({
    associationId: "",
    associationName: "",
    period: "",
    sales: 0,
    costs: 0,
    profit: 0,
    share80: 0,
    assShare20: 0,
    monitoring2: 0,
    expenses: 0,
    balance: 0,
    reportDate: new Date(),
    caretakerId: "",
    caretakerName: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCaretakerAssociation, setSelectedCaretakerAssociation] = useState<Association | null>(null);

  const calculateFinancials = (sales: number, costs: number, expenses: number) => {
    const profit = sales - costs;
    const share80 = profit * 0.8;
    const assShare20 = profit * 0.2;
    const monitoring2 = profit * 0.02;
    const balance = profit - expenses - monitoring2;

    return {
      profit,
      share80,
      assShare20,
      monitoring2,
      balance
    };
  };

  const handleInputChange = (field: string, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value
    };

    // Auto-calculate financials when sales, costs, or expenses change
    if (field === 'sales' || field === 'costs' || field === 'expenses') {
      const sales = field === 'sales' ? parseFloat(value) || 0 : parseFloat(newFormData.sales?.toString() || '0');
      const costs = field === 'costs' ? parseFloat(value) || 0 : parseFloat(newFormData.costs?.toString() || '0');
      const expenses = field === 'expenses' ? parseFloat(value) || 0 : parseFloat(newFormData.expenses?.toString() || '0');

      const calculated = calculateFinancials(sales, costs, expenses);
      
      newFormData.profit = calculated.profit;
      newFormData.share80 = calculated.share80;
      newFormData.assShare20 = calculated.assShare20;
      newFormData.monitoring2 = calculated.monitoring2;
      newFormData.balance = calculated.balance;
    }

    // Update caretaker and association when caretaker is selected
    if (field === 'caretakerId' && value) {
      const selectedCaretaker = caretakers.find(caretaker => caretaker.id === value);
      if (selectedCaretaker) {
        newFormData.caretakerName = `${selectedCaretaker.firstName} ${selectedCaretaker.lastName}`;
        
        // Find the association for this caretaker
        const caretakerAssociation = associations.find(assoc => assoc._id === selectedCaretaker.slpAssociation);
        if (caretakerAssociation) {
          newFormData.associationId = caretakerAssociation._id;
          newFormData.associationName = caretakerAssociation.name;
          setSelectedCaretakerAssociation(caretakerAssociation);
        }
      } else {
        // Reset association if no caretaker selected
        newFormData.associationId = "";
        newFormData.associationName = "";
        setSelectedCaretakerAssociation(null);
      }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/financial-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newReport = await response.json();
      
      // Log successful report creation
      await logSuccess(
        'Financial Reports',
        'CREATE_REPORT',
        `Created financial report for ${formData.associationName} - ${formData.period}`,
        {
          reportId: newReport._id,
          associationName: formData.associationName,
          period: formData.period,
          sales: formData.sales,
          profit: formData.profit,
          caretakerName: formData.caretakerName
        }
      );

      onClose();
      resetForm();
      onReportAdded();
    } catch (error: any) {
      console.error('Error creating financial report:', error);
      
      // Log failed report creation
      await logError(
        'Financial Reports',
        'CREATE_REPORT',
        `Failed to create financial report: ${error.message}`,
        {
          associationName: formData.associationName,
          period: formData.period,
          error: error.message
        }
      );
      
      alert(`Failed to create financial report: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      associationId: "",
      associationName: "",
      period: "",
      sales: 0,
      costs: 0,
      profit: 0,
      share80: 0,
      assShare20: 0,
      monitoring2: 0,
      expenses: 0,
      balance: 0,
      reportDate: new Date(),
      caretakerId: "",
      caretakerName: ""
    });
    setSelectedCaretakerAssociation(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getActiveCaretakers = () => {
    return caretakers.filter(caretaker => caretaker.status === 'active');
  };

  const getCaretakerFullName = (caretaker: Caretaker) => {
    return `${caretaker.firstName} ${caretaker.lastName}`;
  };

  const getAssociationName = (caretaker: Caretaker) => {
    const association = associations.find(assoc => assoc._id === caretaker.slpAssociation);
    return association ? association.name : 'No Association';
  };

  useEffect(() => {
    if (isOpen) {
      // Log when form is opened
      logSuccess(
        'Financial Reports',
        'OPEN_CREATE_FORM',
        'Opened financial report creation form'
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold">Add Financial Report</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Caretaker & Association
              </CardTitle>
              <CardDescription>
                Select the caretaker responsible for this report. The association will be automatically filled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="caretaker">Responsible Caretaker *</Label>
                  <select
                    id="caretaker"
                    value={formData.caretakerId}
                    onChange={(e) => handleInputChange('caretakerId', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select Caretaker</option>
                    {getActiveCaretakers().map((caretaker) => (
                      <option key={caretaker.id} value={caretaker.id}>
                        {getCaretakerFullName(caretaker)} - {getAssociationName(caretaker)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="association">Association</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm items-center">
                    {selectedCaretakerAssociation ? (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{selectedCaretakerAssociation.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedCaretakerAssociation.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedCaretakerAssociation.status}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select a caretaker to see association</span>
                    )}
                  </div>
                  {selectedCaretakerAssociation && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <p>Location: {selectedCaretakerAssociation.location}</p>
                      <p>Active Members: {selectedCaretakerAssociation.activeMembers}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Reporting Period *</Label>
                  <Input
                    id="period"
                    placeholder="e.g., Q1 2024, January 2024"
                    value={formData.period}
                    onChange={(e) => handleInputChange('period', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportDate">Report Date *</Label>
                  <Input
                    id="reportDate"
                    type="date"
                    value={formData.reportDate ? new Date(formData.reportDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('reportDate', new Date(e.target.value))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Inputs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Financial Inputs
              </CardTitle>
              <CardDescription>
                Enter the financial figures. Profit and shares will be calculated automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sales">Total Sales ($) *</Label>
                  <Input
                    id="sales"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.sales}
                    onChange={(e) => handleInputChange('sales', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costs">Total Costs ($) *</Label>
                  <Input
                    id="costs"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.costs}
                    onChange={(e) => handleInputChange('costs', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenses">Other Expenses ($)</Label>
                  <Input
                    id="expenses"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.expenses}
                    onChange={(e) => handleInputChange('expenses', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculated Results */}
          <Card>
            <CardHeader>
              <CardTitle>Calculated Results</CardTitle>
              <CardDescription>
                These values are automatically calculated based on your inputs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">Profit</div>
                  <div className={`text-lg font-bold ${(formData.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(formData.profit || 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">80% Share</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(formData.share80 || 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">20% Association</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(formData.assShare20 || 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">Final Balance</div>
                  <div className={`text-lg font-bold ${(formData.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(formData.balance || 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading || !formData.caretakerId}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Report
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Financial Reports Page Component
function FinancialReportsPage() {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<FinancialReport[]>([]);
  const [selectedAssociation, setSelectedAssociation] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const [selectedCaretaker, setSelectedCaretaker] = useState<Caretaker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);

  // Fetch associations, financial reports, projects, and caretakers on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter reports based on search term and selected association
  useEffect(() => {
    const filterReports = () => {
      let filtered = financialReports;

      // Filter by association
      if (selectedAssociation !== "all") {
        filtered = filtered.filter(report => report.associationId === selectedAssociation);
      }

      // Filter by search term
      if (searchTerm.trim() !== "") {
        filtered = filtered.filter(report =>
          report.associationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (report.caretakerName && report.caretakerName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredReports(filtered);
    };

    filterReports();
  }, [searchTerm, selectedAssociation, financialReports]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // Log data fetching start
      await logSuccess(
        'Financial Reports',
        'FETCH_DATA',
        'Started fetching financial reports data'
      );

      console.log('🔄 Fetching all data for financial reports...');

      // Fetch all data in parallel
      const [associationsResponse, financialReportsResponse, projectsResponse, caretakersResponse] = await Promise.all([
        fetch('/api/associations'),
        fetch('/api/financial-reports'),
        fetch('/api/projects'),
        fetch('/api/caretakers')
      ]);

      // Handle associations response
      if (associationsResponse.ok) {
        const associationsData = await associationsResponse.json();
        console.log('✅ Associations loaded:', associationsData.length);
        setAssociations(associationsData);
      } else {
        console.error('❌ Failed to fetch associations:', associationsResponse.status);
        await logError(
          'Financial Reports',
          'FETCH_ASSOCIATIONS',
          `Failed to fetch associations: ${associationsResponse.status}`
        );
      }

      // Handle financial reports response
      if (financialReportsResponse.ok) {
        const financialReportsData = await financialReportsResponse.json();
        console.log('✅ Financial reports loaded:', financialReportsData.length);
        setFinancialReports(financialReportsData);
        
        // Log successful data fetch
        await logSuccess(
          'Financial Reports',
          'FETCH_REPORTS',
          `Successfully loaded ${financialReportsData.length} financial reports`,
          { reportCount: financialReportsData.length }
        );
      } else {
        console.error('❌ Failed to fetch financial reports:', financialReportsResponse.status);
        setFinancialReports([]);
        await logError(
          'Financial Reports',
          'FETCH_REPORTS',
          `Failed to fetch financial reports: ${financialReportsResponse.status}`
        );
      }

      // Handle projects response
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        console.log('✅ Projects loaded:', projectsData.length);
        setProjects(projectsData);
      } else {
        console.error('❌ Failed to fetch projects:', projectsResponse.status);
        setProjects([]);
      }

      // Handle caretakers response
      if (caretakersResponse.ok) {
        const caretakersData = await caretakersResponse.json();
        console.log('✅ Caretakers loaded:', caretakersData.length);
        setCaretakers(caretakersData);
      } else {
        console.error('❌ Failed to fetch caretakers:', caretakersResponse.status);
        setCaretakers([]);
      }

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      await logError(
        'Financial Reports',
        'FETCH_DATA',
        `Error fetching financial data: ${error}`,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFinancialReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/financial-reports');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setFinancialReports(data);
      
      await logSuccess(
        'Financial Reports',
        'REFRESH_REPORTS',
        'Refreshed financial reports list'
      );
    } catch (error) {
      console.error('Error fetching financial reports:', error);
      setFinancialReports([]);
      await logError(
        'Financial Reports',
        'REFRESH_REPORTS',
        `Failed to refresh reports: ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = (report: FinancialReport) => {
    setSelectedReport(report);
    
    // Find the caretaker associated with this report
    if (report.caretakerId) {
      const reportCaretaker = caretakers.find(caretaker => caretaker.id === report.caretakerId);
      setSelectedCaretaker(reportCaretaker || null);
    } else {
      setSelectedCaretaker(null);
    }
    
    setShowView(true);
    
    // Log report view
    logSuccess(
      'Financial Reports',
      'VIEW_REPORT',
      `Viewed financial report for ${report.associationName} - ${report.period}`,
      {
        reportId: report._id,
        associationName: report.associationName,
        period: report.period,
        profit: report.profit
      }
    );
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const reportToDelete = financialReports.find(report => report._id === reportId);
      
      const response = await fetch(`/api/financial-reports?id=${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFinancialReports(prev => prev.filter(report => report._id !== reportId));
        setShowView(false);
        
        // Log successful deletion
        await logSuccess(
          'Financial Reports',
          'DELETE_REPORT',
          `Deleted financial report for ${reportToDelete?.associationName} - ${reportToDelete?.period}`,
          {
            reportId,
            associationName: reportToDelete?.associationName,
            period: reportToDelete?.period
          }
        );
        
        alert('Financial report deleted successfully');
      } else {
        throw new Error('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting financial report:', error);
      
      // Log failed deletion
      await logError(
        'Financial Reports',
        'DELETE_REPORT',
        `Failed to delete financial report: ${error}`,
        { reportId, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      alert('Failed to delete financial report');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    // Log search activity
    if (term.trim()) {
      logSuccess(
        'Financial Reports',
        'SEARCH_REPORTS',
        `Searched financial reports for: ${term}`,
        { searchTerm: term, resultCount: filteredReports.length }
      );
    }
  };

  const handleAssociationFilter = (associationId: string) => {
    setSelectedAssociation(associationId);
    
    const associationName = associationId === 'all' 
      ? 'All Associations' 
      : associations.find(a => a._id === associationId)?.name || associationId;
    
    // Log filter activity
    logSuccess(
      'Financial Reports',
      'FILTER_REPORTS',
      `Filtered financial reports by association: ${associationName}`,
      { associationId, associationName, resultCount: filteredReports.length }
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTrendIcon = (amount: number) => {
    return amount >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getActiveAssociations = () => {
    return associations.filter(assoc => assoc.status !== 'archived');
  };

  // Calculate totals for summary cards - enhanced with project and caretaker data
  const totalSales = filteredReports.reduce((sum, report) => sum + report.sales, 0);
  const totalProfit = filteredReports.reduce((sum, report) => sum + report.profit, 0);
  const totalBalance = filteredReports.reduce((sum, report) => sum + report.balance, 0);
  const totalAssShare = filteredReports.reduce((sum, report) => sum + report.assShare20, 0);

  // Calculate additional metrics from projects and caretakers
  const totalProjects = projects.length;
  const totalCaretakers = caretakers.length;
  const activeAssociationsCount = getActiveAssociations().length;

  useEffect(() => {
    // Log page access
    logSuccess(
      'Financial Reports',
      'PAGE_ACCESS',
      'User accessed the financial reports page'
    );
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-sm text-muted-foreground">
            Manage financial reports for caretakers and their associations
          </p>
        </div>
        <Button 
          onClick={() => {
            setShowForm(true);
            logSuccess(
              'Financial Reports',
              'OPEN_CREATE_FORM',
              'Opened financial report creation form from main button'
            );
          }} 
          className="bg-green-600 hover:bg-green-700 h-9"
        >
          <Plus className="mr-2 h-3 w-3" />
          New Report
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Total Sales</CardTitle>
              <DollarSign className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">Across all reports</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl font-bold">{formatCurrency(totalProfit)}</div>
            <p className="text-xs text-muted-foreground">Net profit</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Association Share</CardTitle>
              <PieChart className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl font-bold">{formatCurrency(totalAssShare)}</div>
            <p className="text-xs text-muted-foreground">20% share</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Final Balance</CardTitle>
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">After all deductions</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Active Associations</CardTitle>
              <Building className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl font-bold">{activeAssociationsCount}</div>
            <p className="text-xs text-muted-foreground">With financial reports</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Total Projects</CardTitle>
              <FileText className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">Across all associations</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Total Caretakers</CardTitle>
              <Users className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl font-bold">{totalCaretakers}</div>
            <p className="text-xs text-muted-foreground">Association members</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="space-y-2">
            <Label htmlFor="association-filter" className="text-sm">Filter by Association</Label>
            <select
              id="association-filter"
              value={selectedAssociation}
              onChange={(e) => handleAssociationFilter(e.target.value)}
              className="flex h-9 w-full sm:w-48 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All Associations</option>
              {getActiveAssociations().map((association) => (
                <option key={association._id} value={association._id}>
                  {association.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="search" className="text-sm">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by association, period, or caretaker..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing {filteredReports.length} of {financialReports.length} reports</span>
        </div>
      </div>

      {/* Financial Reports List */}
      <div className="grid gap-3">
        {filteredReports.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="p-0">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">
                {financialReports.length === 0 ? 'No Financial Reports' : 'No Matching Reports'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {financialReports.length === 0 
                  ? 'Start by adding your first financial report.'
                  : 'No reports found matching your search criteria.'
                }
              </p>
              {financialReports.length === 0 && (
                <Button 
                  onClick={() => {
                    setShowForm(true);
                    logSuccess(
                      'Financial Reports',
                      'OPEN_CREATE_FORM_FROM_EMPTY',
                      'Opened financial report creation form from empty state'
                    );
                  }} 
                  className="bg-green-600 hover:bg-green-700 h-9"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add Report
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report._id} className="p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{report.associationName}</h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {report.period}
                    </span>
                    {report.caretakerName && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {report.caretakerName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Report Date: {new Date(report.reportDate).toLocaleDateString()}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Sales</div>
                      <div className="font-semibold">{formatCurrency(report.sales)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Profit</div>
                      <div className="font-semibold flex items-center gap-1">
                        {getTrendIcon(report.profit)}
                        {formatCurrency(report.profit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Ass. Share (20%)</div>
                      <div className="font-semibold text-green-600">{formatCurrency(report.assShare20)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Balance</div>
                      <div className="font-semibold flex items-center gap-1">
                        {getTrendIcon(report.balance)}
                        {formatCurrency(report.balance)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewReport(report)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Financial Report Form Modal */}
      <AddFinancialReportForm
        associations={associations}
        caretakers={caretakers}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onReportAdded={fetchFinancialReports}
      />

      {/* View Financial Report Modal */}
      <ViewFinancialReportModal
        report={selectedReport}
        caretaker={selectedCaretaker || undefined}
        isOpen={showView}
        onClose={() => {
          setShowView(false);
          setSelectedCaretaker(null);
        }}
        onEdit={(report) => {
          console.log('Edit report:', report);
          setShowView(false);
          logSuccess(
            'Financial Reports',
            'EDIT_REPORT',
            `Started editing financial report for ${report.associationName}`,
            { reportId: report._id, associationName: report.associationName }
          );
        }}
        onDelete={(reportId) => {
          if (confirm('Are you sure you want to delete this financial report?')) {
            handleDeleteReport(reportId);
          }
        }}
      />
    </div>
  );
}

// Main Financial Page Component
type FinancialView = 'dashboard' | 'reports';

export default function FinancialPage() {
  const [currentView, setCurrentView] = useState<FinancialView>('dashboard');

  const handleViewChange = (view: FinancialView) => {
    setCurrentView(view);
    
    // Log view change
    logSuccess(
      'Financial Reports',
      'CHANGE_VIEW',
      `Switched to ${view} view`,
      { previousView: currentView, newView: view }
    );
  };

  useEffect(() => {
    // Log page access
    logSuccess(
      'Financial Management',
      'PAGE_ACCESS',
      'User accessed the financial management page'
    );
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                window.history.back();
                logSuccess(
                  'Financial Management',
                  'NAVIGATE_BACK',
                  'User navigated back from financial management'
                );
              }}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Financial Management</h1>
              <p className="text-muted-foreground">
                {currentView === 'dashboard' ? 'Financial overview and analytics' : 'Manage financial reports'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-1">
              <Button
                variant={currentView === 'dashboard' ? "default" : "ghost"}
                onClick={() => handleViewChange('dashboard')}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Financial Dashboard</span>
              </Button>
              <Button
                variant={currentView === 'reports' ? "default" : "ghost"}
                onClick={() => handleViewChange('reports')}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Financial Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div>
          {currentView === 'dashboard' && <FinancialDashboard />}
          {currentView === 'reports' && <FinancialReportsPage />}
        </div>
      </div>
    </ProtectedRoute>
  );
}