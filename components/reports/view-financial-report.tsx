"use client";

import { FinancialReport, Association, Caretaker } from "@/types/financial";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  X, 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Calculator,
  Download,
  Printer,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface ViewFinancialReportProps {
  report: FinancialReport | null;
  association?: Association;
  caretaker?: Caretaker;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (report: FinancialReport) => void;
  onDelete?: (reportId: string) => void;
}

export default function ViewFinancialReportModal({ 
  report, 
  association,
  caretaker,
  isOpen, 
  onClose,
  onEdit,
  onDelete
}: ViewFinancialReportProps) {
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

  const getProfitMargin = (sales: number, profit: number) => {
    if (sales === 0) return 0;
    return (profit / sales) * 100;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const printContent = document.getElementById('financial-report-content');
    if (printContent && report) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Financial Report - ${report.associationName} - ${report.period}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .section { margin-bottom: 25px; }
                .financial-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; }
                .financial-item { padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                .positive { color: #059669; }
                .negative { color: #dc2626; }
                .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 20px; }
                .summary-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; }
                .caretaker-info { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!isOpen || !report) return null;

  const profitMargin = getProfitMargin(report.sales, report.profit);
  const hasCaretakerInfo = report.caretakerName && report.caretakerName.trim() !== '';

  // Get full caretaker name with middle name and extension if available
  const getCaretakerFullName = () => {
    if (!caretaker) return report.caretakerName || '';
    
    let fullName = `${caretaker.firstName}`;
    if (caretaker.middleName) fullName += ` ${caretaker.middleName}`;
    fullName += ` ${caretaker.lastName}`;
    if (caretaker.extension) fullName += ` ${caretaker.extension}`;
    
    return fullName;
  };

  // Get caretaker location if available
  const getCaretakerLocation = () => {
    if (!caretaker) return null;
    
    const locationParts = [];
    if (caretaker.cityMunicipality) locationParts.push(caretaker.cityMunicipality);
    if (caretaker.province) locationParts.push(caretaker.province);
    if (caretaker.region) locationParts.push(caretaker.region);
    
    return locationParts.length > 0 ? locationParts.join(', ') : null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">Financial Report</h2>
              <p className="text-sm text-muted-foreground">
                {report.associationName} • {report.period}
                {hasCaretakerInfo && ` • Managed by ${report.caretakerName}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div id="financial-report-content" className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                {hasCaretakerInfo ? 'Association & Caretaker Information' : 'Association Information'}
              </CardTitle>
              <CardDescription>
                {hasCaretakerInfo 
                  ? 'Basic information about this financial report and responsible caretaker'
                  : 'Basic information about this financial report'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Association</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{report.associationName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Reporting Period</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold">{report.period}</span>
                  </div>
                </div>

                {hasCaretakerInfo && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Responsible Caretaker</label>
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-800">{report.caretakerName}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Report Date</label>
                  <div className="p-3 bg-muted/50 rounded-lg font-semibold">
                    {new Date(report.reportDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Enhanced Caretaker Information Section */}
              {hasCaretakerInfo && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Caretaker Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium text-blue-700 mb-1">Full Name</div>
                      <div className="flex items-center gap-2 p-2 bg-white rounded border">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">{getCaretakerFullName()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-700 mb-1">Association</div>
                      <div className="flex items-center gap-2 p-2 bg-white rounded border">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">{report.associationName}</span>
                      </div>
                    </div>
                    {caretaker?.email && (
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-1">Email</div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded border">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{caretaker.email}</span>
                        </div>
                      </div>
                    )}
                    {caretaker?.contactNumber && (
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-1">Contact Number</div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded border">
                          <Phone className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{caretaker.contactNumber}</span>
                        </div>
                      </div>
                    )}
                    {getCaretakerLocation() && (
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-1">Location</div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded border">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{getCaretakerLocation()}</span>
                        </div>
                      </div>
                    )}
                    {caretaker?.modality && (
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-1">Modality</div>
                        <div className="p-2 bg-white rounded border">
                          <span className="text-sm">{caretaker.modality}</span>
                        </div>
                      </div>
                    )}
                    {caretaker?.participantType && (
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-1">Participant Type</div>
                        <div className="p-2 bg-white rounded border">
                          <span className="text-sm">{caretaker.participantType}</span>
                        </div>
                      </div>
                    )}
                    {caretaker?.sex && (
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-1">Gender</div>
                        <div className="p-2 bg-white rounded border">
                          <span className="text-sm capitalize">{caretaker.sex}</span>
                        </div>
                      </div>
                    )}
                    {caretaker?.status && (
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-1">Status</div>
                        <div className="p-2 bg-white rounded border">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            caretaker.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {caretaker.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
              <CardDescription>
                Key financial metrics and performance indicators
                {hasCaretakerInfo && ` for ${report.caretakerName}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg border">
                  <div className="text-sm font-medium text-blue-700 mb-1">Total Sales</div>
                  <div className="text-2xl font-bold text-blue-900">{formatCurrency(report.sales)}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border">
                  <div className="text-sm font-medium text-green-700 mb-1">Net Profit</div>
                  <div className="text-2xl font-bold text-green-900 flex items-center justify-center gap-1">
                    {getTrendIcon(report.profit)}
                    {formatCurrency(report.profit)}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border">
                  <div className="text-sm font-medium text-purple-700 mb-1">Profit Margin</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {profitMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border">
                  <div className="text-sm font-medium text-orange-700 mb-1">Final Balance</div>
                  <div className="text-2xl font-bold text-orange-900 flex items-center justify-center gap-1">
                    {getTrendIcon(report.balance)}
                    {formatCurrency(report.balance)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Financial Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5" />
                Detailed Financial Breakdown
              </CardTitle>
              <CardDescription>
                Complete financial calculations and allocations
                {hasCaretakerInfo && ` managed by ${report.caretakerName}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income & Expenses */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Income & Expenses</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Total Sales</span>
                      <span className="font-bold text-green-700">{formatCurrency(report.sales)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Total Costs</span>
                      <span className="font-bold text-red-700">{formatCurrency(report.costs)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Other Expenses</span>
                      <span className="font-bold text-blue-700">{formatCurrency(report.expenses)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-t-2 border-gray-300">
                      <span className="font-semibold">Gross Profit</span>
                      <span className={`font-bold text-lg ${report.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(report.profit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profit Distribution */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Profit Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">80% Share</span>
                      <span className="font-bold text-blue-700">{formatCurrency(report.share80)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">20% Association Share</span>
                      <span className="font-bold text-green-700">{formatCurrency(report.assShare20)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">2% Monitoring Fee</span>
                      <span className="font-bold text-purple-700">{formatCurrency(report.monitoring2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-t-2 border-orange-300">
                      <span className="font-semibold">Final Balance</span>
                      <span className={`font-bold text-lg ${report.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(report.balance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Performance Indicators
              </CardTitle>
              <CardDescription>
                Key performance metrics and ratios
                {hasCaretakerInfo && ` for ${report.caretakerName}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {profitMargin.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Profit Margin</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {report.profit !== 0 ? ((report.assShare20 / report.profit) * 100).toFixed(1) : '0.0'}%
                  </div>
                  <div className="text-sm text-gray-600">Association Share %</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {report.sales !== 0 ? ((report.expenses / report.sales) * 100).toFixed(1) : '0.0'}%
                  </div>
                  <div className="text-sm text-gray-600">Expense Ratio</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {report.balance >= 0 ? 'Positive' : 'Negative'}
                  </div>
                  <div className="text-sm text-gray-600">Financial Health</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Report Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Report ID:</span>
                  <span className="font-mono">{report._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{new Date(report.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Association ID:</span>
                  <span className="font-mono">{report.associationId}</span>
                </div>
                {report.caretakerId && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Caretaker ID:</span>
                      <span className="font-mono">{report.caretakerId}</span>
                    </div>
                    {hasCaretakerInfo && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Caretaker Name:</span>
                        <span className="font-semibold text-green-700">{report.caretakerName}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50/50">
          <div className="text-sm text-muted-foreground">
            Report generated on {new Date().toLocaleDateString()}
            {hasCaretakerInfo && ` • Managed by ${report.caretakerName}`}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(report)}>
                Edit Report
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(report._id)}>
                Delete Report
              </Button>
            )}
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}