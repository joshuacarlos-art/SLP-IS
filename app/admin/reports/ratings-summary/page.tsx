"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Download, 
  FileText,
  Eye,
  X,
  Loader2,
  User,
  Star,
  TrendingUp,
  PiggyBank,
  Building,
  Printer
} from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { activityLogger, logSuccess, logError, logWarning } from "@/lib/activity/activity-logger";

interface Caretaker {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  extension?: string;
  contactNumber?: string;
  email?: string;
  slpAssociation: string;
  modality?: string;
  status: string;
  cityMunicipality?: string;
  province?: string;
  region?: string;
  participantType: string;
  sex: string;
}

interface Association {
  _id: string;
  name: string;
  location: string;
  status: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  no_active_members: number;
  no_inactive_members: number;
  date_formulated: string;
  archived: boolean;
}

interface CaretakerRating {
  caretakerId: string;
  caretaker: Caretaker;
  association: Association;
  totalAssessments: number;
  overallRating: number;
  punctuality: number;
  communication: number;
  patientCare: number;
  professionalism: number;
  technicalSkills: number;
  weightedAverage: number;
  plusFactor: number;
  overallScore: number;
  descriptiveRating: string;
  lastAssessmentDate: string;
  totalPigs: number;
  healthyPigs: number;
  pigsBreedingRate: number;
}

// Caretaker Ratings specific logging functions
const logCaretakerRatingsActivity = {
  // Page access and navigation
  async logPageAccess() {
    return activityLogger.logSuccess(
      'Caretaker Ratings',
      'PAGE_ACCESS',
      'User accessed caretaker performance ratings page'
    );
  },

  async logCaretakerView(caretakerName: string, caretakerId: string) {
    return activityLogger.logSuccess(
      'Caretaker Ratings',
      'VIEW_CARETAKER',
      `Viewed performance details for ${caretakerName}`,
      undefined,
      { caretakerName, caretakerId }
    );
  },

  async logReportDownload(caretakerName: string, caretakerId: string) {
    return activityLogger.logSuccess(
      'Caretaker Ratings',
      'DOWNLOAD_REPORT',
      `Downloaded performance report for ${caretakerName}`,
      undefined,
      { caretakerName, caretakerId }
    );
  },

  async logSummaryPrint(filteredCount: number, totalCount: number) {
    return activityLogger.logSuccess(
      'Caretaker Ratings',
      'PRINT_SUMMARY',
      `Printed summary report for ${filteredCount} of ${totalCount} caretakers`,
      undefined,
      { filteredCount, totalCount }
    );
  },

  async logDataLoad(caretakerCount: number, associationCount: number, pigCount: number) {
    return activityLogger.logSuccess(
      'Caretaker Ratings',
      'LOAD_DATA',
      `Loaded ${caretakerCount} caretakers, ${associationCount} associations, and ${pigCount} pigs`,
      undefined,
      { caretakerCount, associationCount, pigCount }
    );
  },

  async logDataLoadError(error: string) {
    return activityLogger.logError(
      'Caretaker Ratings',
      'LOAD_DATA',
      `Failed to load caretaker ratings data: ${error}`,
      undefined,
      { error }
    );
  },

  async logSearch(searchTerm: string, resultCount: number) {
    return activityLogger.logSuccess(
      'Caretaker Ratings',
      'SEARCH_CARETAKERS',
      `Searched caretakers for "${searchTerm}" - found ${resultCount} results`,
      undefined,
      { searchTerm, resultCount }
    );
  },

  async logFilterApply(filterType: string, filterValue: string, resultCount: number) {
    return activityLogger.logSuccess(
      'Caretaker Ratings',
      'APPLY_FILTER',
      `Applied ${filterType} filter: ${filterValue} - showing ${resultCount} caretakers`,
      undefined,
      { filterType, filterValue, resultCount }
    );
  },

  async logFilterClear() {
    return activityLogger.logSuccess(
      'Caretaker Ratings',
      'CLEAR_FILTERS',
      'Cleared all caretaker filters'
    );
  },

  async logExportAttempt() {
    return activityLogger.logSuccess(
      'Caretaker Ratings',
      'EXPORT_ATTEMPT',
      'User attempted to export caretaker ratings data'
    );
  }
};

export default function RatingsSummaryPage() {
  const [caretakers, setCaretakers] = useState<CaretakerRating[]>([]);
  const [filteredCaretakers, setFilteredCaretakers] = useState<CaretakerRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [associationFilter, setAssociationFilter] = useState("all");
  const [selectedCaretaker, setSelectedCaretaker] = useState<CaretakerRating | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [associations, setAssociations] = useState<Association[]>([]);

  useEffect(() => {
    fetchAssociationsAndCaretakersData();
    logCaretakerRatingsActivity.logPageAccess();
  }, []);

  useEffect(() => {
    let filtered = caretakers;

    if (searchTerm) {
      filtered = filtered.filter(caretaker => {
        const fullName = getFullName(caretaker.caretaker).toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          caretaker.association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          caretaker.caretaker.cityMunicipality?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(caretaker => caretaker.caretaker.status === statusFilter);
    }

    if (modalityFilter !== "all") {
      filtered = filtered.filter(caretaker => caretaker.caretaker.modality === modalityFilter);
    }

    if (associationFilter !== "all") {
      filtered = filtered.filter(caretaker => caretaker.association._id === associationFilter);
    }

    setFilteredCaretakers(filtered);
  }, [caretakers, searchTerm, statusFilter, modalityFilter, associationFilter]);

  const fetchAssociationsAndCaretakersData = async () => {
    try {
      setIsLoading(true);
      
      const [associationsResponse, caretakersResponse, pigsResponse] = await Promise.all([
        fetch('/api/associations'),
        fetch('/api/caretakers'),
        fetch('/api/pigs')
      ]);

      const associationsData: Association[] = associationsResponse.ok 
        ? (await associationsResponse.json()).filter((assoc: Association) => !assoc.archived)
        : [];

      const caretakersData: Caretaker[] = caretakersResponse.ok 
        ? await caretakersResponse.json()
        : [];

      const pigsData: any[] = pigsResponse.ok 
        ? await pigsResponse.json()
        : [];

      setAssociations(associationsData);

      const caretakerRatings: CaretakerRating[] = caretakersData.map(caretaker => {
        const association = associationsData.find(assoc => assoc._id === caretaker.slpAssociation);
        
        const caretakerPigs = pigsData.filter(pig => 
          pig.caretakerId === caretaker._id || 
          pig.caretakerName === getFullName(caretaker)
        );

        const totalPigs = caretakerPigs.length;
        const healthyPigs = caretakerPigs.filter(pig => 
          pig.healthStatus === 'Excellent' || pig.healthStatus === 'Good'
        ).length;
        const breedingPigs = caretakerPigs.filter(pig => 
          pig.breedingStatus === 'Pregnant' || pig.breedingStatus === 'Lactating'
        ).length;

        const performance = calculatePerformanceMetrics(caretaker, caretakerPigs, association);
        
        return {
          caretakerId: caretaker._id,
          caretaker: caretaker,
          association: association || getDefaultAssociation(),
          totalAssessments: Math.floor(Math.random() * 10) + 1,
          overallRating: performance.overallRating,
          punctuality: performance.punctuality,
          communication: performance.communication,
          patientCare: performance.patientCare,
          professionalism: performance.professionalism,
          technicalSkills: performance.technicalSkills,
          weightedAverage: performance.weightedAverage,
          plusFactor: performance.plusFactor,
          overallScore: performance.overallScore,
          descriptiveRating: performance.descriptiveRating,
          lastAssessmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalPigs,
          healthyPigs,
          pigsBreedingRate: totalPigs > 0 ? (breedingPigs / totalPigs) * 100 : 0
        };
      });

      const validCaretakerRatings = caretakerRatings.filter(rating => 
        rating.association._id !== 'unknown'
      );

      setCaretakers(validCaretakerRatings);
      setFilteredCaretakers(validCaretakerRatings);

      // Log successful data load
      await logCaretakerRatingsActivity.logDataLoad(
        validCaretakerRatings.length,
        associationsData.length,
        pigsData.length
      );

    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Log data load error
      await logCaretakerRatingsActivity.logDataLoadError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultAssociation = (): Association => ({
    _id: 'unknown',
    name: 'Unknown Association',
    location: 'Unknown Location',
    status: 'inactive',
    no_active_members: 0,
    no_inactive_members: 0,
    date_formulated: new Date().toISOString(),
    archived: false
  });

  const calculatePerformanceMetrics = (caretaker: Caretaker, pigs: any[], association?: Association) => {
    const totalPigs = pigs.length;
    const healthyPigs = pigs.filter(pig => 
      pig.healthStatus === 'Excellent' || pig.healthStatus === 'Good'
    ).length;
    const breedingPigs = pigs.filter(pig => 
      pig.breedingStatus === 'Pregnant' || pig.breedingStatus === 'Lactating'
    ).length;

    const healthRate = totalPigs > 0 ? healthyPigs / totalPigs : 0;
    const breedingRate = totalPigs > 0 ? breedingPigs / totalPigs : 0;
    const activityScore = totalPigs > 0 ? Math.min(totalPigs / 10, 1) : 0;

    const punctuality = 1 + (activityScore * 4);
    const communication = 1 + (healthRate * 4);
    const patientCare = 1 + (healthRate * 4);
    const professionalism = 1 + ((healthRate + breedingRate) / 2 * 4);
    const technicalSkills = 1 + (breedingRate * 4);

    const weightedAverage = (
      punctuality * 0.2 + 
      communication * 0.2 + 
      patientCare * 0.25 + 
      professionalism * 0.15 + 
      technicalSkills * 0.2
    );

    let plusFactor = 0;
    if (caretaker.status === 'active') plusFactor += 0.05;
    if (association?.status === 'active') plusFactor += 0.05;
    if (totalPigs >= 5) plusFactor += 0.05;

    const overallScore = Math.min(weightedAverage + plusFactor, 5.0);

    const getDescriptiveRating = (rating: number) => {
      if (rating >= 4.5) return "Outstanding";
      if (rating >= 4.0) return "Very Satisfactory";
      if (rating >= 3.5) return "Satisfactory";
      if (rating >= 3.0) return "Fair";
      return "Needs Improvement";
    };

    return {
      overallRating: parseFloat(overallScore.toFixed(1)),
      punctuality: parseFloat(punctuality.toFixed(1)),
      communication: parseFloat(communication.toFixed(1)),
      patientCare: parseFloat(patientCare.toFixed(1)),
      professionalism: parseFloat(professionalism.toFixed(1)),
      technicalSkills: parseFloat(technicalSkills.toFixed(1)),
      weightedAverage: parseFloat(weightedAverage.toFixed(2)),
      plusFactor,
      overallScore: parseFloat(overallScore.toFixed(2)),
      descriptiveRating: getDescriptiveRating(overallScore)
    };
  };

  const getFullName = (caretaker: Caretaker): string => {
    return `${caretaker.firstName} ${caretaker.middleName || ''} ${caretaker.lastName}`.trim();
  };

  const handleViewDetails = async (caretaker: CaretakerRating) => {
    setSelectedCaretaker(caretaker);
    setIsDetailModalOpen(true);
    
    // Log caretaker view
    await logCaretakerRatingsActivity.logCaretakerView(
      getFullName(caretaker.caretaker),
      caretaker.caretakerId
    );
  };

  const handleDownloadReport = async (caretaker: CaretakerRating) => {
    try {
      // Log download attempt
      await logCaretakerRatingsActivity.logReportDownload(
        getFullName(caretaker.caretaker),
        caretaker.caretakerId
      );

      alert(`Downloading performance report for ${getFullName(caretaker.caretaker)}`);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const handlePrintSummaryReport = async () => {
    try {
      // Log print action
      await logCaretakerRatingsActivity.logSummaryPrint(
        filteredCaretakers.length,
        caretakers.length
      );

      const printContent = generateSummaryPrintContent();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
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
        await logCaretakerRatingsActivity.logSearch(term, filteredCaretakers.length);
      }, 500);
    }
  };

  const handleFilterChange = async (filterType: string, value: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'modality':
        setModalityFilter(value);
        break;
      case 'association':
        setAssociationFilter(value);
        break;
    }
    
    if (value) {
      await logCaretakerRatingsActivity.logFilterApply(filterType, value, filteredCaretakers.length);
    }
  };

  const handleClearFilters = async () => {
    setSearchTerm("");
    setStatusFilter("all");
    setModalityFilter("all");
    setAssociationFilter("all");
    
    // Log filter clearing
    await logCaretakerRatingsActivity.logFilterClear();
  };

  const handleExportClick = async () => {
    // Log export attempt
    await logCaretakerRatingsActivity.logExportAttempt();
    
    // Simulate export functionality
    alert("Export functionality would be implemented here");
  };

  const generateSummaryPrintContent = () => {
    return `
<html>
<head>
  <title>Caretaker Performance Ratings Summary</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { font-size: 24px; color: #1e40af; margin: 0; }
    .report-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; font-size: 12px; }
    .info-item { background: #f8fafc; padding: 8px; border-radius: 6px; border-left: 3px solid #3b82f6; }
    .performance-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
    .performance-table th { background: #1e40af; color: white; padding: 8px; text-align: center; border: 1px solid #e5e7eb; }
    .performance-table td { padding: 6px; text-align: center; border: 1px solid #e5e7eb; }
    .performance-table tr:nth-child(even) { background: #f8fafc; }
    .rating-outstanding { color: #059669; }
    .rating-very-satisfactory { color: #2563eb; }
    .rating-satisfactory { color: #d97706; }
    .rating-fair { color: #dc2626; }
    .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
    .signature-section { margin-top: 30px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }
    .signature-line { border-top: 1px solid #374151; margin-top: 40px; padding-top: 5px; text-align: center; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CARETAKER PERFORMANCE RATINGS SUMMARY</h1>
    <div>Report Period: ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}</div>
  </div>

  <div class="report-info">
    <div class="info-item">
      <div>Total Caretakers</div>
      <div><strong>${filteredCaretakers.length}</strong></div>
    </div>
    <div class="info-item">
      <div>Report Date</div>
      <div><strong>${new Date().toLocaleDateString()}</strong></div>
    </div>
    <div class="info-item">
      <div>Generated By</div>
      <div><strong>Association & Pig Management System</strong></div>
    </div>
  </div>

  <table class="performance-table">
    <thead>
      <tr>
        <th>Name of Caretaker</th>
        <th>Association</th>
        <th>Location</th>
        <th>Total Pigs</th>
        <th>Healthy Pigs</th>
        <th>Overall Score</th>
        <th>Descriptive Rating</th>
      </tr>
    </thead>
    <tbody>
      ${filteredCaretakers.map(caretaker => {
        const getRatingClass = (rating: string) => {
          switch(rating) {
            case 'Outstanding': return 'rating-outstanding';
            case 'Very Satisfactory': return 'rating-very-satisfactory';
            case 'Satisfactory': return 'rating-satisfactory';
            default: return 'rating-fair';
          }
        };
        
        return `
          <tr>
            <td style="text-align: left;"><strong>${getFullName(caretaker.caretaker)}</strong></td>
            <td style="text-align: left;">${caretaker.association.name}</td>
            <td style="text-align: left;">${caretaker.association.location}</td>
            <td>${caretaker.totalPigs}</td>
            <td>${caretaker.healthyPigs}</td>
            <td>${caretaker.overallScore.toFixed(1)}</td>
            <td class="${getRatingClass(caretaker.descriptiveRating)}"><strong>${caretaker.descriptiveRating}</strong></td>
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
    <p>Generated on ${new Date().toLocaleDateString()}</p>
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
      'on-leave': { color: "bg-yellow-100 text-yellow-800", label: "On Leave" },
      inactive: { color: "bg-red-100 text-red-800", label: "Inactive" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const calculateOverallMetrics = () => {
    if (filteredCaretakers.length === 0) return null;

    return {
      totalCaretakers: filteredCaretakers.length,
      avgOverallRating: filteredCaretakers.reduce((sum, caretaker) => sum + caretaker.overallRating, 0) / filteredCaretakers.length,
      totalPigs: filteredCaretakers.reduce((sum, caretaker) => sum + caretaker.totalPigs, 0),
      outstandingCount: filteredCaretakers.filter(c => c.descriptiveRating === "Outstanding").length,
      totalAssociations: new Set(filteredCaretakers.map(c => c.association._id)).size,
    };
  };

  const overallMetrics = calculateOverallMetrics();

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading performance ratings...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Caretaker Performance Ratings</h1>
            <p className="text-muted-foreground">
              Performance ratings based on association membership and pig management
            </p>
          </div>
          <Button onClick={handlePrintSummaryReport} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="mr-2 h-4 w-4" />
            Print Summary Report
          </Button>
        </div>

        {overallMetrics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><User className="h-4 w-4" />Total Caretakers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{overallMetrics.totalCaretakers}</div><p className="text-xs text-muted-foreground">In report view</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Star className="h-4 w-4" />Average Rating</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{overallMetrics.avgOverallRating.toFixed(1)}</div><p className="text-xs text-muted-foreground">Overall performance</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Building className="h-4 w-4" />Total Associations</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{overallMetrics.totalAssociations}</div><p className="text-xs text-muted-foreground">Represented</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4" />Outstanding Performers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{overallMetrics.outstandingCount}</div><p className="text-xs text-muted-foreground">Top rated caretakers</p></CardContent></Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Filter caretaker ratings by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Caretakers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="search" 
                    placeholder="Search by name, association..." 
                    value={searchTerm} 
                    onChange={(e) => handleSearchChange(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status" 
                  value={statusFilter} 
                  onChange={(e) => handleFilterChange('status', e.target.value)} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modality">Modality</Label>
                <select 
                  id="modality" 
                  value={modalityFilter} 
                  onChange={(e) => handleFilterChange('modality', e.target.value)} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Modalities</option>
                  <option value="Home-based">Home-based</option>
                  <option value="Center-based">Center-based</option>
                  <option value="Livelihood Assistance">Livelihood Assistance</option>
                  <option value="Skills Training">Skills Training</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="association">Association</Label>
                <select 
                  id="association" 
                  value={associationFilter} 
                  onChange={(e) => handleFilterChange('association', e.target.value)} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Associations</option>
                  {associations.map(association => (
                    <option key={association._id} value={association._id}>{association.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {(searchTerm || statusFilter !== "all" || modalityFilter !== "all" || associationFilter !== "all") && (
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Performance Ratings Summary</CardTitle>
                <CardDescription>{filteredCaretakers.length} of {caretakers.length} caretakers in report</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportClick}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-semibold">Caretaker Name</th>
                    <th className="text-left p-3 font-semibold">Association</th>
                    <th className="text-left p-3 font-semibold">Location</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                    <th className="text-center p-3 font-semibold">Total Pigs</th>
                    <th className="text-center p-3 font-semibold">Healthy Pigs</th>
                    <th className="text-center p-3 font-semibold">Overall Score</th>
                    <th className="text-center p-3 font-semibold">Rating</th>
                    <th className="text-center p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCaretakers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-muted-foreground">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Caretakers Found</h3>
                        <p>{caretakers.length === 0 ? 'No caretaker ratings available.' : 'No caretakers match your current filters.'}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCaretakers.map((caretaker) => (
                      <tr key={caretaker.caretakerId} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-semibold">{getFullName(caretaker.caretaker)}</td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{caretaker.association.name}</span>
                            <span className="text-xs text-muted-foreground">{caretaker.association.status === 'active' ? 'Active' : 'Inactive'} Association</span>
                          </div>
                        </td>
                        <td className="p-3">{caretaker.association.location}</td>
                        <td className="text-center p-3">{getStatusBadge(caretaker.caretaker.status)}</td>
                        <td className="text-center p-3">{caretaker.totalPigs}</td>
                        <td className="text-center p-3 text-green-600 font-semibold">{caretaker.healthyPigs}</td>
                        <td className="text-center p-3 font-semibold">{caretaker.overallScore.toFixed(1)}</td>
                        <td className="text-center p-3"><Badge className={getPerformanceColor(caretaker.overallScore)}>{caretaker.descriptiveRating}</Badge></td>
                        <td className="text-center p-3">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(caretaker)} className="h-8 w-8 p-0 text-blue-600"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(caretaker)} className="h-8 w-8 p-0 text-green-600"><Download className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {isDetailModalOpen && selectedCaretaker && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b bg-gray-50/80">
                <h2 className="text-2xl font-bold text-gray-800">{getFullName(selectedCaretaker.caretaker)} - Performance Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsDetailModalOpen(false)} className="hover:bg-gray-200 rounded-full w-8 h-8 p-0"><X className="h-4 w-4" /></Button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Caretaker Information</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div><Label>Association</Label><p className="font-semibold">{selectedCaretaker.association.name}</p></div>
                    <div><Label>Location</Label><p className="font-semibold">{selectedCaretaker.association.location}</p></div>
                    <div><Label>Modality</Label><p className="font-semibold">{selectedCaretaker.caretaker.modality || 'N/A'}</p></div>
                    <div><Label>Status</Label><div className="mt-1">{getStatusBadge(selectedCaretaker.caretaker.status)}</div></div>
                    <div><Label>Participant Type</Label><p className="font-semibold">{selectedCaretaker.caretaker.participantType}</p></div>
                  </CardContent></Card>

                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5" />Pig Management Summary</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div><Label>Total Pigs Managed</Label><p className="font-semibold text-2xl">{selectedCaretaker.totalPigs}</p></div>
                    <div><Label>Healthy Pigs</Label><p className="font-semibold text-2xl text-green-600">{selectedCaretaker.healthyPigs}</p></div>
                    <div><Label>Health Rate</Label><p className="font-semibold text-xl">{selectedCaretaker.totalPigs > 0 ? ((selectedCaretaker.healthyPigs / selectedCaretaker.totalPigs) * 100).toFixed(1) : '0'}%</p></div>
                    <div><Label>Breeding Rate</Label><p className="font-semibold text-xl">{selectedCaretaker.pigsBreedingRate.toFixed(1)}%</p></div>
                  </CardContent></Card>
                </div>

                <Card><CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader><CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center bg-blue-50 rounded-lg p-4"><div className="text-lg font-bold text-blue-600">{selectedCaretaker.punctuality.toFixed(1)}</div><div className="text-sm text-gray-600">Punctuality</div></div>
                    <div className="text-center bg-green-50 rounded-lg p-4"><div className="text-lg font-bold text-green-600">{selectedCaretaker.communication.toFixed(1)}</div><div className="text-sm text-gray-600">Communication</div></div>
                    <div className="text-center bg-purple-50 rounded-lg p-4"><div className="text-lg font-bold text-purple-600">{selectedCaretaker.patientCare.toFixed(1)}</div><div className="text-sm text-gray-600">Patient Care</div></div>
                    <div className="text-center bg-orange-50 rounded-lg p-4"><div className="text-lg font-bold text-orange-600">{selectedCaretaker.professionalism.toFixed(1)}</div><div className="text-sm text-gray-600">Professionalism</div></div>
                    <div className="text-center bg-red-50 rounded-lg p-4"><div className="text-lg font-bold text-red-600">{selectedCaretaker.technicalSkills.toFixed(1)}</div><div className="text-sm text-gray-600">Technical Skills</div></div>
                  </div>
                </CardContent></Card>

                <Card className="mt-6"><CardHeader><CardTitle>Final Performance Rating</CardTitle></CardHeader><CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center bg-gray-50 rounded-lg p-4"><div className="text-sm text-gray-600">Weighted Average</div><div className="text-xl font-bold">{selectedCaretaker.weightedAverage.toFixed(1)}</div></div>
                    <div className="text-center bg-gray-50 rounded-lg p-4"><div className="text-sm text-gray-600">Plus Factor</div><div className="text-xl font-bold">{selectedCaretaker.plusFactor.toFixed(2)}</div></div>
                    <div className="text-center bg-blue-50 rounded-lg p-4"><div className="text-sm text-gray-600">Overall Score</div><div className="text-2xl font-bold text-blue-600">{selectedCaretaker.overallScore.toFixed(1)}</div></div>
                    <div className="text-center rounded-lg p-4"><div className="text-sm text-gray-600">Descriptive Rating</div><Badge className={getPerformanceColor(selectedCaretaker.overallScore)}>{selectedCaretaker.descriptiveRating}</Badge></div>
                  </div>
                </CardContent></Card>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50/80">
                <Button variant="outline" onClick={() => handleDownloadReport(selectedCaretaker)} className="flex items-center gap-2"><Download className="h-4 w-4" />Download Report</Button>
                <Button onClick={() => setIsDetailModalOpen(false)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}