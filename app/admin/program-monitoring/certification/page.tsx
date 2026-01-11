'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { 
  Search, Award, Eye, Printer, Trash2 
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// ==================== INTERFACES ====================
interface FinalAssessment {
  id: string;
  project_id: string;
  project_name: string;
  assessment_type: string;
  total_rating: number;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  accomplished_by: string;
  reviewed_by?: string;
  approved_by?: string;
  assessment_date: string;
  created_at: string;
  overall_score: number;
  max_score: number;
  sections: AssessmentSection[];
}

interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  weight: number;
  score: number;
  max_score: number;
  criteria: AssessmentCriteria[];
}

interface AssessmentCriteria {
  id: string;
  description: string;
  score: number;
  max_score: number;
  comments: string;
}

interface Project {
  id: string;
  enterpriseSetup?: {
    projectName?: string;
    enterpriseType?: string;
  };
  projectName?: string;
}

// ==================== ACTIVITY LOGGING FUNCTIONS ====================
const logCertificationActivity = {
  // View actions
  viewList: async () => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'VIEW_CERTIFICATION_LIST',
          module: 'Certification',
          details: 'User viewed the certification records list',
          status: 'success'
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  viewDetails: async (projectName: string, certificationId: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'VIEW_CERTIFICATION_DETAILS',
          module: 'Certification',
          details: `User viewed certification details for project: ${projectName}`,
          status: 'success',
          metadata: { projectName, certificationId }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Print actions
  printCertification: async (projectName: string, certificationId: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'PRINT_CERTIFICATION',
          module: 'Certification',
          details: `User printed certification for project: ${projectName}`,
          status: 'success',
          metadata: { projectName, certificationId, documentType: 'certification' }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Search and filter actions
  search: async (searchTerm: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'SEARCH_CERTIFICATIONS',
          module: 'Certification',
          details: `User searched certifications with term: ${searchTerm}`,
          status: 'success',
          metadata: { searchTerm }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  filter: async (filterType: string, filterValue: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'FILTER_CERTIFICATIONS',
          module: 'Certification',
          details: `User filtered certifications by ${filterType}: ${filterValue}`,
          status: 'success',
          metadata: { filterType, filterValue }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Delete actions
  deleteSuccess: async (projectName: string, certificationId: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'DELETE_CERTIFICATION',
          module: 'Certification',
          details: `User deleted certification for project: ${projectName}`,
          status: 'warning',
          metadata: { projectName, certificationId }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  deleteError: async (projectName: string, error: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'DELETE_CERTIFICATION',
          module: 'Certification',
          details: `Failed to delete certification for project: ${projectName}`,
          status: 'error',
          metadata: { projectName, error }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Error logging
  loadError: async (error: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'LOAD_CERTIFICATIONS',
          module: 'Certification',
          details: `Failed to load certifications: ${error}`,
          status: 'error',
          metadata: { error }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Status change actions
  statusChange: async (projectName: string, oldStatus: string, newStatus: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'UPDATE_CERTIFICATION_STATUS',
          module: 'Certification',
          details: `Changed certification status for ${projectName} from ${oldStatus} to ${newStatus}`,
          status: 'success',
          metadata: { projectName, oldStatus, newStatus }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Export actions
  exportData: async (format: string, count: number) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'EXPORT_CERTIFICATIONS',
          module: 'Certification',
          details: `User exported ${count} certifications as ${format}`,
          status: 'success',
          metadata: { format, count }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Generic error logger
  logError: async (action: string, details: string, error: string, metadata?: Record<string, any>) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          module: 'Certification',
          details: `${details}: ${error}`,
          status: 'error',
          metadata: { ...metadata, error }
        }),
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }
  }
};

// ==================== CERTIFICATION PRINT COMPONENT ====================
function CertificationPrint({ assessment }: { assessment: FinalAssessment }) {
  const handlePrint = async () => {
    try {
      await logCertificationActivity.printCertification(assessment.project_name, assessment.id);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const printDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const assessmentDate = new Date(assessment.assessment_date)
        .toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

      const marketDemandScore = assessment.sections?.find(s => 
        s.title.toLowerCase().includes('market') && 
        s.title.toLowerCase().includes('demand')
      )?.score || 0;
      
      const marketSupplyScore = assessment.sections?.find(s => 
        s.title.toLowerCase().includes('market') && 
        s.title.toLowerCase().includes('supply')
      )?.score || 0;
      
      const enterprisePlanScore = assessment.sections?.find(s => 
        s.title.toLowerCase().includes('enterprise') || 
        s.title.toLowerCase().includes('plan')
      )?.score || 0;
      
      const financialStabilityScore = assessment.sections?.find(s => 
        s.title.toLowerCase().includes('financial') || 
        s.title.toLowerCase().includes('stability')
      )?.score || 0;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Enterprise Certification - ${assessment.project_name}</title>
          <style>
            @page { 
              margin: 0.5in; 
              size: letter;
            }
            
            * { 
              box-sizing: border-box; 
              margin: 0; 
              padding: 0; 
            }
            
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.3;
              color: #000;
              background: white;
              font-size: 12px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .container { 
              width: 100%; 
              max-width: 7.5in;
              margin: 0 auto;
            }
            
            .certificate-header {
              text-align: center;
              border-bottom: 3px double #2e75b6;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            
            .certificate-title {
              font-size: 24px;
              font-weight: bold;
              color: #2e75b6;
              margin-bottom: 10px;
            }
            
            .certificate-subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 15px;
            }
            
            .certificate-summary {
              background: #f0f7ff;
              border: 2px solid #2e75b6;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 25px;
              text-align: center;
            }
            
            .final-rating {
              font-size: 32px;
              font-weight: bold;
              color: #2e75b6;
              margin-bottom: 10px;
            }
            
            .rating-label {
              font-size: 14px;
              color: #666;
              font-weight: bold;
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 25px;
            }
            
            .detail-item {
              padding: 10px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .detail-label {
              font-weight: bold;
              color: #2e75b6;
              margin-bottom: 5px;
            }
            
            .detail-value { color: #1f2937; }
            
            .scores-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1px;
              background: #d0d0d0;
              border: 1px solid #d0d0d0;
              margin-bottom: 25px;
            }
            
            .score-cell {
              background: white;
              padding: 15px 10px;
              text-align: center;
              border: none;
            }
            
            .score-header {
              background: #e6f0ff;
              font-weight: bold;
              color: #2e75b6;
            }
            
            .score-value {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 5px;
            }
            
            .score-label {
              font-size: 11px;
              color: #666;
            }
            
            .certificate-footer {
              margin-top: 40px;
              border-top: 2px solid #2e75b6;
              padding-top: 25px;
            }
            
            .signatures {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 25px;
              margin-bottom: 20px;
            }
            
            .signature-box { text-align: center; }
            
            .signature-line {
              border-top: 1px solid #000;
              margin: 40px 0 8px;
              height: 1px;
            }
            
            .signature-name {
              font-weight: bold;
              font-size: 12px;
              margin-top: 5px;
            }
            
            .signature-role {
              font-size: 11px;
              color: #666;
              margin-top: 2px;
            }
            
            .certificate-footer-note {
              text-align: center;
              font-size: 10px;
              color: #999;
              margin-top: 15px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            
            @media print {
              body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
              }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="certificate-header">
              <div class="certificate-title">ENTERPRISE ASSESSMENT CERTIFICATION</div>
              <div class="certificate-subtitle">Official Evaluation Report</div>
            </div>

            <div class="certificate-summary">
              <div class="final-rating">${assessment.total_rating}%</div>
              <div class="rating-label">OVERALL ASSESSMENT RATING</div>
              <div style="margin-top: 10px; font-size: 14px; color: #666;">
                Project: ${assessment.project_name} | Date: ${assessmentDate}
              </div>
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Project Name</div>
                <div class="detail-value">${assessment.project_name}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Assessment Date</div>
                <div class="detail-value">${assessmentDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Assessment Type</div>
                <div class="detail-value">${assessment.assessment_type}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Coordinator</div>
                <div class="detail-value">${assessment.accomplished_by}</div>
              </div>
            </div>

            <div class="scores-grid">
              <div class="score-cell score-header">Assessment Criteria</div>
              <div class="score-cell score-header">Score</div>
              
              <div class="score-cell">
                <div class="score-label">Market Demand</div>
                <div class="score-value">${marketDemandScore}</div>
              </div>
              <div class="score-cell">
                <div class="score-label">Market Supply</div>
                <div class="score-value">${marketSupplyScore}</div>
              </div>
              <div class="score-cell">
                <div class="score-label">Enterprise Plan</div>
                <div class="score-value">${enterprisePlanScore}</div>
              </div>
              <div class="score-cell">
                <div class="score-label">Financial Stability</div>
                <div class="score-value">${financialStabilityScore}</div>
              </div>
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
                Overall Performance
              </div>
              <div style="font-size: 20px; font-weight: bold; color: #2e75b6;">
                Total Rating: ${assessment.total_rating}% | 
                Score: ${assessment.overall_score}/${assessment.max_score}
              </div>
            </div>

            <div class="certificate-footer">
              <div class="signatures">
                <div class="signature-box">
                  <div class="signature-line"></div>
                  <div class="signature-role">Assessed By</div>
                  <div class="signature-name">${assessment.accomplished_by}</div>
                  <div class="signature-role">Coordinator</div>
                </div>
                
                ${assessment.reviewed_by ? `
                  <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-role">Reviewed By</div>
                    <div class="signature-name">${assessment.reviewed_by}</div>
                    <div class="signature-role">Review Committee</div>
                  </div>
                ` : ''}
                
                ${assessment.approved_by ? `
                  <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-role">Approved By</div>
                    <div class="signature-name">${assessment.approved_by}</div>
                    <div class="signature-role">Approving Authority</div>
                  </div>
                ` : ''}
              </div>
              
              <div class="certificate-footer-note">
                This certification is issued based on the comprehensive assessment 
                conducted on ${assessmentDate}.<br>
                Certificate generated on ${printDate} 
              </div>
            </div>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    } catch (error) {
      console.error('Error printing certification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await logCertificationActivity.logError(
        'PRINT_CERTIFICATION',
        `Failed to print certification for ${assessment.project_name}`,
        errorMessage,
        { projectName: assessment.project_name }
      );
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
      title="Print Certification"
    >
      <Printer size={16} />
    </button>
  );
}

// ==================== DELETE BUTTON COMPONENT ====================
function DeleteButton({ 
  onDelete, 
  projectName, 
  certificationId 
}: { 
  onDelete: () => void;
  projectName: string;
  certificationId: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      await logCertificationActivity.deleteSuccess(projectName, certificationId);
      onDelete();
    } catch (error) {
      console.error('Error logging delete activity:', error);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete Record"
      >
        <Trash2 size={16} />
      </button>

      {showConfirm && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 min-w-48">
          <p className="text-sm text-gray-700 mb-2">Delete this certification?</p>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== VIEW MODAL COMPONENT ====================
function AssessmentViewModal({ 
  assessment, 
  onClose 
}: { 
  assessment: FinalAssessment; 
  onClose: () => void;
}) {
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Certification Details</h2>
              <p className="text-gray-600 text-sm">{assessment.project_name}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-xs text-gray-500">Assessment Type</h3>
              <p className="text-sm font-medium">{assessment.assessment_type}</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500">Overall Score</h3>
              <p className="text-sm font-semibold">
                {assessment.overall_score}/{assessment.max_score} 
                ({Math.round((assessment.overall_score / assessment.max_score) * 100)}%)
              </p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500">Total Rating</h3>
              <p className="text-sm font-semibold text-green-600">{assessment.total_rating}%</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500">Status</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assessment.status)}`}>
                {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
              </span>
            </div>
            <div>
              <h3 className="text-xs text-gray-500">Coordinator</h3>
              <p className="text-sm font-medium">{assessment.accomplished_by}</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500">Reviewed By</h3>
              <p className="text-sm font-medium">{assessment.reviewed_by || '-'}</p>
            </div>
          </div>

          <div className="space-y-3">
            {assessment.sections?.map((section: AssessmentSection) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{section.title}</h4>
                    <p className="text-xs text-gray-600">{section.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {section.score}/{section.max_score}
                    </p>
                    <p className="text-xs text-gray-500">Weight: {section.weight}%</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {section.criteria?.map((criterion: AssessmentCriteria) => (
                    <div key={criterion.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-700">{criterion.description}</span>
                      <span className="font-medium">
                        {criterion.score}/{criterion.max_score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN CONTENT COMPONENT (WRAPPED IN SUSPENSE) ====================
function CertificationPageContent() {
  const [assessments, setAssessments] = useState<FinalAssessment[]>([
    {
      id: "1",
      project_id: "1",
      project_name: "Swine Farming",
      assessment_type: "Final Evaluation",
      total_rating: 61,
      status: "approved",
      accomplished_by: "Baron gonzales",
      reviewed_by: "Review Committee",
      assessment_date: "2025-10-28",
      created_at: "2025-10-28",
      overall_score: 61,
      max_score: 100,
      sections: []
    }
  ]);
  const [filteredAssessments, setFilteredAssessments] = useState<FinalAssessment[]>([]);
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", projectName: "Swine Farming" }
  ]);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<FinalAssessment | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [filters, setFilters] = useState({
    project_id: '',
    status: '',
    search: ''
  });

  // This is now safely wrapped in Suspense
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get('assessmentId');

  const getProjectName = (project: Project): string => {
    return project?.enterpriseSetup?.projectName || 
           project?.projectName || 
           'Unknown Project';
  };

  const getStatusColor = (status: string) => {
    const map: { [k: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return map[status] || map.draft;
  };

  const getSectionScore = (assessment: FinalAssessment, sectionKeywords: string[]): number => {
    const section = assessment.sections?.find(s => 
      sectionKeywords.some(keyword => 
        s.title.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    return section?.score || 0;
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/final-assessments');
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
        await logCertificationActivity.viewList();
      } else {
        throw new Error('Failed to fetch assessments');
      }
    } catch (err) {
      console.error('Error fetching assessments:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      await logCertificationActivity.loadError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        const safe = data.map((p: any) => ({
          id: p.id || p._id,
          enterpriseSetup: {
            projectName: p.enterpriseSetup?.projectName || p.projectName,
            enterpriseType: p.enterpriseSetup?.enterpriseType || p.enterpriseType
          },
          projectName: p.enterpriseSetup?.projectName || p.projectName
        }));
        setProjects(safe);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  useEffect(() => {
    fetchAssessments();
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = assessments;

    if (filters.project_id) {
      filtered = filtered.filter(a => a.project_id === filters.project_id);
    }
    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.project_name.toLowerCase().includes(s) ||
        a.accomplished_by.toLowerCase().includes(s) ||
        a.assessment_type.toLowerCase().includes(s)
      );
    }

    setFilteredAssessments(filtered);

    if (assessmentIdFromUrl && assessments.length > 0) {
      const assessmentFromUrl = assessments.find(a => a.id === assessmentIdFromUrl);
      if (assessmentFromUrl) {
        setSelectedAssessment(assessmentFromUrl);
        setShowViewModal(true);
      }
    }
  }, [assessments, filters, assessmentIdFromUrl]);

  // Log filter changes
  useEffect(() => {
    if (filters.search) {
      logCertificationActivity.search(filters.search);
    }
  }, [filters.search]);

  useEffect(() => {
    if (filters.project_id) {
      const projectName = projects.find(p => p.id === filters.project_id)?.projectName || filters.project_id;
      logCertificationActivity.filter('project', projectName);
    }
  }, [filters.project_id, projects]);

  useEffect(() => {
    if (filters.status) {
      logCertificationActivity.filter('status', filters.status);
    }
  }, [filters.status]);

  const handleDelete = async (id: string, projectName: string) => {
    try {
      const res = await fetch(`/api/final-assessments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAssessments();
        alert('Certification record deleted successfully!');
      } else {
        throw new Error('Failed to delete certification record');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      await logCertificationActivity.deleteError(projectName, errorMessage);
      alert('Error deleting certification record');
    }
  };

  const handleView = async (assessment: FinalAssessment) => {
    setSelectedAssessment(assessment);
    setShowViewModal(true);
    await logCertificationActivity.viewDetails(assessment.project_name, assessment.id);
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      
      // Create CSV content
      const headers = ['Project Name', 'Assessment Type', 'Overall Score', 'Max Score', 'Total Rating', 'Status', 'Coordinator', 'Assessment Date'];
      const csvData = filteredAssessments.map(assessment => [
        assessment.project_name,
        assessment.assessment_type,
        assessment.overall_score.toString(),
        assessment.max_score.toString(),
        `${assessment.total_rating}%`,
        assessment.status,
        assessment.accomplished_by,
        new Date(assessment.assessment_date).toLocaleDateString()
      ]);
      
      const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certifications-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      await logCertificationActivity.exportData('CSV', filteredAssessments.length);
    } catch (error) {
      console.error('Error exporting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await logCertificationActivity.logError(
        'EXPORT_CERTIFICATIONS',
        'Failed to export certifications data',
        errorMessage
      );
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Project Certification</h1>
              <p className="text-gray-600 text-sm">
                Manage and issue project assessment certifications
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportData}
              disabled={exportLoading || filteredAssessments.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={16} />
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={filters.project_id}
                onChange={e => setFilters({ ...filters, project_id: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {getProjectName(p)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search projects or coordinators..."
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={() => setFilters({ project_id: '', status: '', search: '' })} 
                className="w-full px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{filteredAssessments.length}</div>
            <div className="text-sm text-gray-600">Total Certifications</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredAssessments.filter(a => a.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredAssessments.filter(a => a.status === 'submitted').length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredAssessments.filter(a => a.status === 'reviewed').length}
            </div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
        </div>

        {/* Certification Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 text-sm mt-2">Loading certification records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Project Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Coordinator
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      M. Demand
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      M. Supply
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Ent. Plan
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Fin. Stability
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Rating
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-3 py-6 text-center text-gray-500">
                        <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">No certification records found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {assessments.length === 0 ? 
                            'No assessments available' : 
                            'Try adjusting your filters'
                          }
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAssessments.map(assessment => (
                      <tr key={assessment.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          {assessment.project_name}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {formatDate(assessment.assessment_date)}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {assessment.assessment_type}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {assessment.accomplished_by}
                        </td>
                        <td className="px-3 py-2 text-sm text-center font-semibold">
                          {getSectionScore(assessment, ['market', 'demand'])}
                        </td>
                        <td className="px-3 py-2 text-sm text-center font-semibold">
                          {getSectionScore(assessment, ['market', 'supply'])}
                        </td>
                        <td className="px-3 py-2 text-sm text-center font-semibold">
                          {getSectionScore(assessment, ['enterprise', 'plan'])}
                        </td>
                        <td className="px-3 py-2 text-sm text-center font-semibold">
                          {getSectionScore(assessment, ['financial', 'stability'])}
                        </td>
                        <td className="px-3 py-2 text-sm font-semibold text-green-600 text-center">
                          {assessment.total_rating}%
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assessment.status)}`}>
                            {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleView(assessment)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <CertificationPrint assessment={assessment} />
                            <DeleteButton 
                              onDelete={() => handleDelete(assessment.id, assessment.project_name)}
                              projectName={assessment.project_name}
                              certificationId={assessment.id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Modal */}
        {showViewModal && selectedAssessment && (
          <AssessmentViewModal
            assessment={selectedAssessment}
            onClose={() => setShowViewModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// ==================== MAIN EXPORT COMPONENT (WITH SUSPENSE) ====================
export default function CertificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 text-sm mt-2">Loading certification page...</p>
        </div>
      </div>
    }>
      <CertificationPageContent />
    </Suspense>
  );
}