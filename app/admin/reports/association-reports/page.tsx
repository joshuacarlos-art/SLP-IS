"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Search, 
  Download, 
  Filter, 
  Calendar,
  BarChart3,
  Users,
  DollarSign,
  Award,
  TrendingUp,
  TrendingDown,
  FileText,
  Eye,
  X,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  Printer
} from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { Association } from '@/types/database';
import { activityLogger, logSuccess, logError, logWarning } from "@/lib/activity/activity-logger";

interface ReportSummary {
  associationId: string;
  associationName: string;
  location: string;
  status: string;
  totalMembers: number;
  activeMembers: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  sustainabilityScore: number;
  complianceRate: number;
  lastReportDate: string;
  reportPeriod: string;
}

interface PerformanceMetrics {
  financialHealth: number;
  membershipEngagement: number;
  operationalEfficiency: number;
  complianceScore: number;
  weightedAverage: number;
  plusFactor: number;
  overallRating: number;
  descriptiveRating: string;
}

// Association Reports specific logging functions
const logAssociationReportsActivity = {
  // Page access and navigation
  async logPageAccess() {
    return activityLogger.logSuccess(
      'Association Reports',
      'PAGE_ACCESS',
      'User accessed association reports page'
    );
  },

  async logReportView(associationName: string, reportId: string) {
    return activityLogger.logSuccess(
      'Association Reports',
      'VIEW_REPORT',
      `Viewed detailed report for ${associationName}`,
      undefined,
      { associationName, reportId }
    );
  },

  async logReportGenerate(associationName: string, associationId: string) {
    return activityLogger.logSuccess(
      'Association Reports',
      'GENERATE_REPORT',
      `Generated performance report for ${associationName}`,
      undefined,
      { associationName, associationId }
    );
  },

  async logReportDownload(associationName: string, reportId: string) {
    return activityLogger.logSuccess(
      'Association Reports',
      'DOWNLOAD_REPORT',
      `Downloaded report for ${associationName}`,
      undefined,
      { associationName, reportId }
    );
  },

  async logSummaryPrint(filteredCount: number, totalCount: number) {
    return activityLogger.logSuccess(
      'Association Reports',
      'PRINT_SUMMARY',
      `Printed summary report for ${filteredCount} of ${totalCount} associations`,
      undefined,
      { filteredCount, totalCount }
    );
  },

  async logMasterReportGenerate() {
    return activityLogger.logSuccess(
      'Association Reports',
      'GENERATE_MASTER_REPORT',
      'Started generating master report for all associations'
    );
  },

  // Filter and search activities
  async logSearch(searchTerm: string, resultCount: number) {
    return activityLogger.logSuccess(
      'Association Reports',
      'SEARCH_REPORTS',
      `Searched reports for "${searchTerm}" - found ${resultCount} results`,
      undefined,
      { searchTerm, resultCount }
    );
  },

  async logFilterApply(filterType: string, filterValue: string, resultCount: number) {
    return activityLogger.logSuccess(
      'Association Reports',
      'APPLY_FILTER',
      `Applied ${filterType} filter: ${filterValue} - showing ${resultCount} reports`,
      undefined,
      { filterType, filterValue, resultCount }
    );
  },

  async logFilterClear() {
    return activityLogger.logSuccess(
      'Association Reports',
      'CLEAR_FILTERS',
      'Cleared all report filters'
    );
  },

  // Error logging
  async logDataLoadError(error: string) {
    return activityLogger.logError(
      'Association Reports',
      'LOAD_DATA',
      `Failed to load association reports data: ${error}`,
      undefined,
      { error }
    );
  },

  async logReportGenerationError(associationName: string, error: string) {
    return activityLogger.logError(
      'Association Reports',
      'GENERATE_REPORT',
      `Failed to generate report for ${associationName}: ${error}`,
      undefined,
      { associationName, error }
    );
  }
};

export default function AssociationReportsPage() {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportSummary[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<{[key: string]: PerformanceMetrics}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [selectedReport, setSelectedReport] = useState<ReportSummary | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch associations and generate sample reports
  useEffect(() => {
    fetchAssociationsAndReports();
    logAssociationReportsActivity.logPageAccess();
  }, []);

  // Filter reports based on search and filters
  useEffect(() => {
    let filtered = reports;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.associationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.lastReportDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return reportDate >= startDate && reportDate <= endDate;
      });
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, dateRange]);

  const calculatePerformanceMetrics = (report: ReportSummary): PerformanceMetrics => {
    // Safely calculate scores with fallbacks for division by zero and invalid values
    const safeNetProfit = report.netProfit || 0;
    const safeTotalMembers = report.totalMembers > 0 ? report.totalMembers : 1;
    const safeActiveMembers = report.activeMembers || 0;
    const safeSustainabilityScore = Math.max(0, Math.min(100, report.sustainabilityScore || 0));
    const safeComplianceRate = Math.max(0, Math.min(100, report.complianceRate || 0));

    // Calculate scores on a 5-point scale (1.0 - 5.0)
    const financialHealth = 1 + (safeNetProfit >= 0 ? (Math.min(safeNetProfit / 50000, 1) * 4) : 0);
    
    const membershipEngagement = safeTotalMembers > 0 
      ? 1 + ((safeActiveMembers / safeTotalMembers) * 4)
      : 1;
    
    const operationalEfficiency = 1 + (safeSustainabilityScore / 100 * 4);
    const complianceScore = 1 + (safeComplianceRate / 100 * 4);

    const weightedAverage = (
      financialHealth * 0.3 + 
      membershipEngagement * 0.3 + 
      operationalEfficiency * 0.2 + 
      complianceScore * 0.2
    );

    const plusFactor = 0;
    const overallRating = weightedAverage + plusFactor;

    const getDescriptiveRating = (rating: number) => {
      if (rating >= 4.5) return "Outstanding";
      if (rating >= 4.0) return "Very Satisfactory";
      if (rating >= 3.5) return "Satisfactory";
      if (rating >= 3.0) return "Fair";
      return "Needs Improvement";
    };

    // Ensure all values are valid numbers and within expected ranges
    return {
      financialHealth: parseFloat(Math.max(1, Math.min(5, financialHealth)).toFixed(2)),
      membershipEngagement: parseFloat(Math.max(1, Math.min(5, membershipEngagement)).toFixed(2)),
      operationalEfficiency: parseFloat(Math.max(1, Math.min(5, operationalEfficiency)).toFixed(2)),
      complianceScore: parseFloat(Math.max(1, Math.min(5, complianceScore)).toFixed(2)),
      weightedAverage: parseFloat(Math.max(1, Math.min(5, weightedAverage)).toFixed(2)),
      plusFactor,
      overallRating: parseFloat(Math.max(1, Math.min(5, overallRating)).toFixed(2)),
      descriptiveRating: getDescriptiveRating(overallRating)
    };
  };

  const fetchAssociationsAndReports = async () => {
    try {
      setIsLoading(true);
      
      // Fetch associations
      const response = await fetch('/api/associations');
      if (!response.ok) throw new Error('Failed to fetch associations');
      
      const associationsData = await response.json();
      setAssociations(associationsData);

      // Generate sample reports from associations with safe defaults
      const generatedReports = associationsData.map((association: Association) => {
        const totalMembers = (association.no_active_members || 0) + (association.no_inactive_members || 0);
        const activeMembers = association.no_active_members || 0;
        const totalRevenue = Math.floor(Math.random() * 1000000) + 200000;
        const totalExpenses = Math.floor(Math.random() * 600000) + 100000;
        const netProfit = totalRevenue - totalExpenses;

        return {
          associationId: association._id || `temp-${Math.random()}`,
          associationName: association.name || 'Unknown Association',
          location: association.location || 'Unknown Location',
          status: association.status || 'active',
          totalMembers: Math.max(0, totalMembers),
          activeMembers: Math.max(0, Math.min(activeMembers, totalMembers)),
          totalRevenue: Math.max(0, totalRevenue),
          totalExpenses: Math.max(0, totalExpenses),
          netProfit: netProfit,
          sustainabilityScore: Math.max(60, Math.min(100, Math.floor(Math.random() * 40) + 60)),
          complianceRate: Math.max(70, Math.min(100, Math.floor(Math.random() * 30) + 70)),
          lastReportDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reportPeriod: 'Monthly'
        };
      });

      setReports(generatedReports);
      setFilteredReports(generatedReports);

      // Calculate performance metrics for each report
      const metrics: {[key: string]: PerformanceMetrics} = {};
      generatedReports.forEach((report: ReportSummary) => {
        metrics[report.associationId] = calculatePerformanceMetrics(report);
      });
      setPerformanceMetrics(metrics);

      // Log successful data load
      await activityLogger.logSuccess(
        'Association Reports',
        'LOAD_DATA',
        `Successfully loaded ${associationsData.length} associations and generated ${generatedReports.length} reports`,
        undefined,
        { associationCount: associationsData.length, reportCount: generatedReports.length }
      );

    } catch (error) {
      console.error('Error fetching associations and reports:', error);
      // Set empty arrays to prevent further errors
      setAssociations([]);
      setReports([]);
      setFilteredReports([]);
      setPerformanceMetrics({});

      // Log data load error
      await logAssociationReportsActivity.logDataLoadError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (associationId: string) => {
    setIsGenerating(associationId);
    try {
      const associationName = reports.find(r => r.associationId === associationId)?.associationName || 'Unknown Association';
      
      // Log report generation start
      await logAssociationReportsActivity.logReportGenerate(associationName, associationId);

      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would call your report generation API
      alert(`Report generated successfully for association ${associationName}`);
      
    } catch (error) {
      console.error('Error generating report:', error);
      const associationName = reports.find(r => r.associationId === associationId)?.associationName || 'Unknown Association';
      
      // Log report generation error
      await logAssociationReportsActivity.logReportGenerationError(
        associationName,
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadReport = async (report: ReportSummary) => {
    try {
      // Log download attempt
      await logAssociationReportsActivity.logReportDownload(report.associationName, report.associationId);

      // Simulate download
      alert(`Downloading report for ${report.associationName}`);
      // In real implementation, this would download the PDF/Excel file

    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const handleViewReport = async (report: ReportSummary) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
    
    // Log report view
    await logAssociationReportsActivity.logReportView(report.associationName, report.associationId);
  };

  const handlePrintSummaryReport = async () => {
    try {
      // Log print action
      await logAssociationReportsActivity.logSummaryPrint(filteredReports.length, reports.length);

      const printContent = generateSummaryPrintContent();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait a bit for content to render then print
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('Error printing summary report:', error);
      alert('Failed to print summary report. Please try again.');
    }
  };

  const handleSearchChange = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      // Log search activity with a slight delay to avoid too many logs
      setTimeout(async () => {
        await logAssociationReportsActivity.logSearch(term, filteredReports.length);
      }, 500);
    }
  };

  const handleStatusFilterChange = async (status: string) => {
    setStatusFilter(status);
    if (status !== "all") {
      await logAssociationReportsActivity.logFilterApply('status', status, filteredReports.length);
    }
  };

  const handleClearFilters = async () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange({ start: "", end: "" });
    
    // Log filter clearing
    await logAssociationReportsActivity.logFilterClear();
  };

  const handleMasterReportGenerate = async () => {
    try {
      // Log master report generation
      await logAssociationReportsActivity.logMasterReportGenerate();

      // Simulate master report generation
      alert("Generating comprehensive report for all associations...");
      
    } catch (error) {
      console.error('Error generating master report:', error);
      alert('Failed to generate master report. Please try again.');
    }
  };

  const generateSummaryPrintContent = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Association Performance Summary Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.4;
      color: #1f2937;
      background: #ffffff;
      padding: 20px;
    }
    
    .page-container {
      width: 100%;
      min-height: 100vh;
      background: white;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: #1e40af;
    }
    
    .header .subtitle {
      color: #6b7280;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .report-info {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    
    .info-item {
      background: #f8fafc;
      padding: 8px;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }
    
    .info-label {
      font-weight: 600;
      color: #64748b;
      font-size: 11px;
    }
    
    .info-value {
      font-weight: 700;
      color: #1f2937;
      font-size: 12px;
    }
    
    .performance-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }
    
    .performance-table th {
      background: #1e40af;
      color: white;
      font-weight: 600;
      padding: 10px 8px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    
    .performance-table td {
      padding: 8px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    
    .performance-table tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .performance-table tr:hover {
      background: #f0f9ff;
    }
    
    .rating-excellent { color: #059669; font-weight: 600; }
    .rating-very-satisfactory { color: #2563eb; font-weight: 600; }
    .rating-satisfactory { color: #d97706; font-weight: 600; }
    .rating-fair { color: #dc2626; font-weight: 600; }
    
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 10px;
      border-top: 1px solid #e5e7eb;
      padding-top: 15px;
    }
    
    .signature-section {
      margin-top: 30px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
    }
    
    .signature-line {
      border-top: 1px solid #374151;
      margin-top: 40px;
      padding-top: 5px;
      text-align: center;
      font-size: 11px;
      color: #374151;
    }
    
    @media print {
      body {
        padding: 0;
        margin: 0;
      }
      
      .page-container {
        box-shadow: none;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Header -->
    <div class="header">
      <h1>ASSOCIATION PERFORMANCE COMMITMENT REVIEW FORM</h1>
      <div class="subtitle">Summary of Ratings</div>
      <div class="subtitle">Report Period: ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}</div>
    </div>

    <!-- Report Information -->
    <div class="report-info">
      <div class="info-item">
        <div class="info-label">Total Associations</div>
        <div class="info-value">${filteredReports.length}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Report Date</div>
        <div class="info-value">${new Date().toLocaleDateString()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Generated By</div>
        <div class="info-value">Association Management System</div>
      </div>
    </div>

    <!-- Performance Table -->
    <table class="performance-table">
      <thead>
        <tr>
          <th>Name of Association</th>
          <th>Financial Health</th>
          <th>Membership Engagement</th>
          <th>Operational Efficiency</th>
          <th>Compliance Score</th>
          <th>Weighted Average</th>
          <th>Plus Factor</th>
          <th>Overall Rating</th>
          <th>Descriptive Rating</th>
        </tr>
      </thead>
      <tbody>
        ${filteredReports.map(report => {
          const metrics = performanceMetrics[report.associationId];
          if (!metrics) return '';
          
          const getRatingClass = (rating: string) => {
            switch(rating) {
              case 'Outstanding': return 'rating-excellent';
              case 'Very Satisfactory': return 'rating-very-satisfactory';
              case 'Satisfactory': return 'rating-satisfactory';
              default: return 'rating-fair';
            }
          };
          
          return `
            <tr>
              <td style="text-align: left; font-weight: 600;">${report.associationName}</td>
              <td>${metrics.financialHealth.toFixed(2)}</td>
              <td>${metrics.membershipEngagement.toFixed(2)}</td>
              <td>${metrics.operationalEfficiency.toFixed(2)}</td>
              <td>${metrics.complianceScore.toFixed(2)}</td>
              <td>${metrics.weightedAverage.toFixed(2)}</td>
              <td>${metrics.plusFactor.toFixed(1)}</td>
              <td>${metrics.overallRating.toFixed(2)}</td>
              <td class="${getRatingClass(metrics.descriptiveRating)}">${metrics.descriptiveRating}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div class="signature-section">
      <div>
        <div class="signature-line">Prepared by:</div>
      </div>
      <div>
        <div class="signature-line">Noted by:</div>
      </div>
    </div>

    <div class="footer">
      <p>Confidential Report - For Internal Use Only</p>
      <p>Generated by Association Management System on ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return "text-green-600 bg-green-100";
    if (score >= 4.0) return "text-blue-600 bg-blue-100";
    if (score >= 3.5) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      inactive: { color: "bg-yellow-100 text-yellow-800", label: "Inactive" },
      pending: { color: "bg-blue-100 text-blue-800", label: "Pending" },
      suspended: { color: "bg-red-100 text-red-800", label: "Suspended" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Safe number formatter to prevent NaN display
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(2);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading association reports...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Association Performance Reports</h1>
            <p className="text-muted-foreground">
              Performance commitment review reports for all associations
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handlePrintSummaryReport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Summary Report
            </Button>
            <Button 
              onClick={handleMasterReportGenerate}
              variant="outline"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Master Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>
              Filter association reports by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search Associations</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== "all" || dateRange.start || dateRange.end) && (
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Summary Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Performance Summary Report</CardTitle>
                <CardDescription>
                  {filteredReports.length} of {reports.length} associations in report
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort By
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-semibold">Name of Association</th>
                    <th className="text-center p-3 font-semibold">Financial Health</th>
                    <th className="text-center p-3 font-semibold">Membership Engagement</th>
                    <th className="text-center p-3 font-semibold">Operational Efficiency</th>
                    <th className="text-center p-3 font-semibold">Compliance Score</th>
                    <th className="text-center p-3 font-semibold">Weighted Average</th>
                    <th className="text-center p-3 font-semibold">Plus Factor</th>
                    <th className="text-center p-3 font-semibold">Overall Rating</th>
                    <th className="text-center p-3 font-semibold">Descriptive Rating</th>
                    <th className="text-center p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center p-8 text-muted-foreground">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Reports Found</h3>
                        <p>
                          {reports.length === 0 
                            ? 'No association reports available. Generate reports first.' 
                            : 'No reports match your current filters.'
                          }
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => {
                      const metrics = performanceMetrics[report.associationId];
                      if (!metrics) return null;

                      return (
                        <tr key={report.associationId} className="border-b hover:bg-muted/30">
                          <td className="p-3 font-semibold">{report.associationName}</td>
                          <td className="text-center p-3">{formatNumber(metrics.financialHealth)}</td>
                          <td className="text-center p-3">{formatNumber(metrics.membershipEngagement)}</td>
                          <td className="text-center p-3">{formatNumber(metrics.operationalEfficiency)}</td>
                          <td className="text-center p-3">{formatNumber(metrics.complianceScore)}</td>
                          <td className="text-center p-3 font-semibold">{formatNumber(metrics.weightedAverage)}</td>
                          <td className="text-center p-3">{formatNumber(metrics.plusFactor)}</td>
                          <td className="text-center p-3 font-semibold">{formatNumber(metrics.overallRating)}</td>
                          <td className="text-center p-3">
                            <Badge className={getPerformanceColor(metrics.overallRating)}>
                              {metrics.descriptiveRating}
                            </Badge>
                          </td>
                          <td className="text-center p-3">
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewReport(report)}
                                className="h-8 w-8 p-0 text-blue-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReport(report)}
                                className="h-8 w-8 p-0 text-green-600"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* View Report Modal */}
        {isViewModalOpen && selectedReport && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200/50">
              <div className="flex items-center justify-between p-6 border-b bg-gray-50/80">
                <h2 className="text-2xl font-bold text-gray-800">{selectedReport.associationName} - Detailed Report</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsViewModalOpen(false)}
                  className="hover:bg-gray-200 rounded-full w-8 h-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {performanceMetrics[selectedReport.associationId] && (
                  <div className="space-y-6">
                    {/* Performance Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatNumber(performanceMetrics[selectedReport.associationId].weightedAverage)}
                            </div>
                            <div className="text-sm text-muted-foreground">Weighted Average</div>
                          </div>
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {formatNumber(performanceMetrics[selectedReport.associationId].overallRating)}
                            </div>
                            <div className="text-sm text-muted-foreground">Overall Rating</div>
                          </div>
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">
                              {formatNumber(performanceMetrics[selectedReport.associationId].plusFactor)}
                            </div>
                            <div className="text-sm text-muted-foreground">Plus Factor</div>
                          </div>
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <Badge className={getPerformanceColor(performanceMetrics[selectedReport.associationId].overallRating)}>
                              {performanceMetrics[selectedReport.associationId].descriptiveRating}
                            </Badge>
                            <div className="text-sm text-muted-foreground mt-2">Rating</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Financial Health</Label>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-semibold">
                                {formatNumber(performanceMetrics[selectedReport.associationId].financialHealth)}
                              </span>
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(performanceMetrics[selectedReport.associationId].financialHealth / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Membership Engagement</Label>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-semibold">
                                {formatNumber(performanceMetrics[selectedReport.associationId].membershipEngagement)}
                              </span>
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${(performanceMetrics[selectedReport.associationId].membershipEngagement / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Operational Efficiency</Label>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-semibold">
                                {formatNumber(performanceMetrics[selectedReport.associationId].operationalEfficiency)}
                              </span>
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-600 h-2 rounded-full" 
                                  style={{ width: `${(performanceMetrics[selectedReport.associationId].operationalEfficiency / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Compliance Score</Label>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-semibold">
                                {formatNumber(performanceMetrics[selectedReport.associationId].complianceScore)}
                              </span>
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full" 
                                  style={{ width: `${(performanceMetrics[selectedReport.associationId].complianceScore / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Association Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label>Location</Label>
                            <p className="font-semibold">{selectedReport.location}</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                          </div>
                          <div>
                            <Label>Total Members</Label>
                            <p className="font-semibold">{selectedReport.totalMembers.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label>Active Members</Label>
                            <p className="font-semibold text-green-600">
                              {selectedReport.activeMembers.toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50/80">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReport(selectedReport)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}