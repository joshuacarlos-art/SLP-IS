"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Filter, 
  Search,
  Wallet,
  PiggyBank,
  BarChart3,
  Building,
  Users,
  FileText,
  Loader2,
  Download,
  RefreshCw
} from "lucide-react";
import { activityLogger, logSuccess, logError, logWarning } from "@/lib/activity/activity-logger";

interface FinancialSummary {
  total_income: number;
  total_expense: number;
  total_savings: number;
  total_amount: number;
  avg_amount: number;
  min_amount: number;
  max_amount: number;
}

interface DistributionItem {
  record_type: string;
  total: number;
}

interface DashboardData {
  summary: FinancialSummary;
  distribution: DistributionItem[];
  record_count: number;
}

export default function FinancialDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    project_id: "",
    date_from: "",
    date_to: ""
  });

  useEffect(() => {
    fetchDashboardData();
    // Log dashboard access
    activityLogger.logDashboardAccess().catch(console.error);
  }, []);

  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (filterParams.project_id) params.append('project_id', filterParams.project_id);
      if (filterParams.date_from) params.append('date_from', filterParams.date_from);
      if (filterParams.date_to) params.append('date_to', filterParams.date_to);

      const response = await fetch(`/api/financial-dashboard?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        
        // Log successful data fetch
        await logSuccess(
          'Financial Dashboard',
          'FETCH_DATA',
          `Loaded dashboard data with ${data.record_count} records`,
          undefined,
          { 
            recordCount: data.record_count,
            filters: filterParams,
            totalAmount: data.summary.total_amount 
          }
        );
      } else {
        console.error('Failed to fetch dashboard data');
        setDashboardData(null);
        
        // Log data fetch error
        await logError(
          'Financial Dashboard',
          'FETCH_DATA',
          `Failed to load dashboard data: HTTP ${response.status}`,
          undefined,
          { status: response.status, filters: filterParams }
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(null);
      
      // Log fetch error
      await logError(
        'Financial Dashboard',
        'FETCH_DATA',
        `Error loading dashboard data: ${error}`,
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error', filters }
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = async () => {
    // Log filter application
    await logSuccess(
      'Financial Dashboard',
      'APPLY_FILTERS',
      'Applied dashboard filters',
      undefined,
      { filters }
    );
    
    fetchDashboardData(filters);
  };

  const handleClearFilters = async () => {
    const clearedFilters = { project_id: "", date_from: "", date_to: "" };
    
    // Log filter clearing
    await logSuccess(
      'Financial Dashboard',
      'CLEAR_FILTERS',
      'Cleared all dashboard filters'
    );
    
    setFilters(clearedFilters);
    fetchDashboardData(clearedFilters);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    
    // Log manual refresh
    await logSuccess(
      'Financial Dashboard',
      'REFRESH_DATA',
      'Manually refreshed dashboard data'
    );
    
    fetchDashboardData();
  };

  const handleExportData = async (format: string) => {
    try {
      // Log export attempt
      await logSuccess(
        'Financial Dashboard',
        'EXPORT_DATA',
        `Exporting dashboard data as ${format}`,
        undefined,
        { format, filters }
      );

      // Simulate export functionality
      const exportData = {
        ...dashboardData,
        exportDate: new Date().toISOString(),
        filters: filters
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-dashboard-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log successful export
      await logSuccess(
        'Financial Dashboard',
        'EXPORT_SUCCESS',
        `Successfully exported dashboard data as ${format}`,
        undefined,
        { format, recordCount: dashboardData?.record_count }
      );

    } catch (error) {
      console.error('Error exporting data:', error);
      
      // Log export error
      await logError(
        'Financial Dashboard',
        'EXPORT_FAILED',
        `Failed to export dashboard data: ${error}`,
        undefined,
        { format, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getDistributionColors = (type: string) => {
    const colors: { [key: string]: string } = {
      income: 'text-green-600 bg-green-100',
      expense: 'text-red-600 bg-red-100',
      savings: 'text-blue-600 bg-blue-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const handleCardView = async (cardType: string) => {
    // Log when user views specific dashboard cards
    await logSuccess(
      'Financial Dashboard',
      'VIEW_CARD',
      `Viewed ${cardType} dashboard card`,
      undefined,
      { cardType, value: dashboardData?.summary[cardType as keyof FinancialSummary] }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground">Loading financial data...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of financial records and distributions
            {dashboardData && ` • ${dashboardData.record_count} records processed`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportData('json')}
            disabled={!dashboardData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Records
          </CardTitle>
          <CardDescription>
            Filter financial records by project and date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_id">Project ID</Label>
              <Input
                id="project_id"
                type="number"
                placeholder="Enter project ID"
                value={filters.project_id}
                onChange={(e) => handleFilterChange('project_id', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_from">Date From</Label>
              <Input
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_to">Date To</Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
            <div className="space-y-2 flex items-end gap-2">
              <Button onClick={handleApplyFilters} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Apply
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {dashboardData ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Total Income */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardView('total_income')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData.summary.total_income)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total income records
                </p>
              </CardContent>
            </Card>

            {/* Total Expense */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardView('total_expense')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(dashboardData.summary.total_expense)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total expense records
                </p>
              </CardContent>
            </Card>

            {/* Total Savings */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardView('total_savings')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <PiggyBank className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(dashboardData.summary.total_savings)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total savings records
                </p>
              </CardContent>
            </Card>

            {/* Overall Total */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardView('total_amount')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Total</CardTitle>
                <Wallet className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(dashboardData.summary.total_amount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All financial records
                </p>
              </CardContent>
            </Card>

            {/* Average Amount */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardView('avg_amount')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(dashboardData.summary.avg_amount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average per record
                </p>
              </CardContent>
            </Card>

            {/* Record Count */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardView('record_count')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
                <FileText className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {dashboardData.record_count}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total records found
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Amount Range</CardTitle>
                <CardDescription>Minimum and maximum record amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Minimum</div>
                    <div className="text-xl font-bold text-yellow-600">
                      {formatCurrency(dashboardData.summary.min_amount)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Maximum</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(dashboardData.summary.max_amount)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Record Distribution</CardTitle>
                <CardDescription>Breakdown by record type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.distribution.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDistributionColors(item.record_type)}`}>
                        {item.record_type.toUpperCase()}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Financial Data</h3>
            <p className="text-muted-foreground">
              No financial records found matching your criteria. Try adjusting your filters.
            </p>
            <Button 
              onClick={handleRefreshData} 
              className="mt-4"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}