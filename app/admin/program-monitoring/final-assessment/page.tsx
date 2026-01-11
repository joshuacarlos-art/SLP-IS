'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Search, Edit, Trash2, Download, Eye, Plus, X, Minus, Printer, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

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
const logAssessmentActivity = {
  // View actions
  viewList: async () => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'VIEW_ASSESSMENT_LIST',
          module: 'Final Assessment',
          details: 'User viewed the final assessments list',
          status: 'success'
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  viewDetails: async (projectName: string, assessmentId: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'VIEW_ASSESSMENT_DETAILS',
          module: 'Final Assessment',
          details: `User viewed assessment details for project: ${projectName}`,
          status: 'success',
          metadata: { projectName, assessmentId }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Print actions
  printReport: async (projectName: string, assessmentId: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'PRINT_ASSESSMENT_REPORT',
          module: 'Final Assessment',
          details: `User printed assessment report for project: ${projectName}`,
          status: 'success',
          metadata: { projectName, assessmentId, documentType: 'report' }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  printCertification: async (projectName: string, assessmentId: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'PRINT_ASSESSMENT_CERTIFICATION',
          module: 'Final Assessment',
          details: `User printed assessment certification for project: ${projectName}`,
          status: 'success',
          metadata: { projectName, assessmentId, documentType: 'certification' }
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
          action: 'SEARCH_ASSESSMENTS',
          module: 'Final Assessment',
          details: `User searched assessments with term: ${searchTerm}`,
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
          action: 'FILTER_ASSESSMENTS',
          module: 'Final Assessment',
          details: `User filtered assessments by ${filterType}: ${filterValue}`,
          status: 'success',
          metadata: { filterType, filterValue }
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Delete actions
  deleteSuccess: async (projectName: string, assessmentId: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'DELETE_ASSESSMENT',
          module: 'Final Assessment',
          details: `User deleted assessment for project: ${projectName}`,
          status: 'warning',
          metadata: { projectName, assessmentId }
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
          action: 'DELETE_ASSESSMENT',
          module: 'Final Assessment',
          details: `Failed to delete assessment for project: ${projectName}`,
          status: 'error',
          metadata: { projectName, error }
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
          action: 'EXPORT_ASSESSMENTS',
          module: 'Final Assessment',
          details: `User exported ${count} assessments as ${format}`,
          status: 'success',
          metadata: { format, count }
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
          action: 'LOAD_ASSESSMENTS',
          module: 'Final Assessment',
          details: `Failed to load assessments: ${error}`,
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
          action: 'UPDATE_ASSESSMENT_STATUS',
          module: 'Final Assessment',
          details: `Changed assessment status for ${projectName} from ${oldStatus} to ${newStatus}`,
          status: 'success',
          metadata: { projectName, oldStatus, newStatus }
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
          module: 'Final Assessment',
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

// ==================== MINIMALIST EXCEL-STYLE FINAL ASSESSMENT REPORT ====================
function AssessmentPrint({ assessment }: { assessment: FinalAssessment }) {
  const handlePrint = async () => {
    try {
      await logAssessmentActivity.printReport(assessment.project_name, assessment.id);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const printDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const assessmentDate = new Date(assessment.assessment_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      // Generate sections HTML with Excel-like styling
      const sectionsHTML = assessment.sections?.map((section, sectionIndex) => {
        const sectionPercentage = section.max_score > 0 ? Math.round((section.score / section.max_score) * 100) : 0;
        
        const criteriaHTML = section.criteria?.map((criterion, critIndex) => {
          const criterionPercentage = criterion.max_score > 0 ? Math.round((criterion.score / criterion.max_score) * 100) : 0;
          return `
            <tr class="${critIndex % 2 === 0 ? 'even' : 'odd'}">
              <td class="criteria">${criterion.description}</td>
              <td class="score">${criterion.score}</td>
              <td class="score">${criterion.max_score}</td>
              <td class="percentage">${criterionPercentage}%</td>
              <td class="comments">${criterion.comments || ''}</td>
            </tr>
          `;
        }).join('');

        return `
          <div class="section" style="page-break-inside: ${sectionIndex === assessment.sections.length - 1 ? 'auto' : 'avoid'};">
            <div class="section-header">
              <div class="section-title">${section.title}</div>
              <div class="section-meta">
                <span>Weight: ${section.weight}%</span>
                <span class="separator">|</span>
                <span>Score: ${section.score}/${section.max_score}</span>
                <span class="separator">|</span>
                <span>${sectionPercentage}%</span>
              </div>
            </div>
            <div class="section-desc">${section.description}</div>
            
            <table class="criteria-table">
              <thead>
                <tr class="header">
                  <th class="criteria-col">Assessment Criteria</th>
                  <th class="score-col">Score</th>
                  <th class="score-col">Max</th>
                  <th class="percentage-col">%</th>
                  <th class="comments-col">Comments</th>
                </tr>
              </thead>
              <tbody>
                ${criteriaHTML}
                <tr class="section-total">
                  <td class="total-label"><strong>Section Total</strong></td>
                  <td class="score total-value">${section.score}</td>
                  <td class="score total-value">${section.max_score}</td>
                  <td class="percentage total-value">${sectionPercentage}%</td>
                  <td class="comments"></td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      }).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Final Assessment - ${assessment.project_name}</title>
          <style>
            @page { 
              margin: 0.5in; 
              size: letter;
              @bottom-right {
                content: "Page " counter(page);
                font-size: 10px;
                color: #666;
              }
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
              font-size: 11px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .container { 
              width: 100%; 
              max-width: 7.5in;
              margin: 0 auto;
            }
            
            /* Header */
            .header {
              border-bottom: 2px solid #2e75b6;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            
            .header-main {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            
            .title {
              font-size: 18px;
              font-weight: bold;
              color: #2e75b6;
            }
            
            .subtitle {
              font-size: 14px;
              color: #666;
            }
            
            .header-info {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #666;
            }
            
            /* Summary Grid */
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 1px;
              background: #d0d0d0;
              border: 1px solid #d0d0d0;
              margin-bottom: 20px;
            }
            
            .summary-cell {
              background: white;
              padding: 12px 8px;
              text-align: center;
              border: none;
            }
            
            .main-grade {
              background: #f0f7ff;
            }
            
            .grade-value {
              font-size: 24px;
              font-weight: bold;
              color: #2e75b6;
              line-height: 1;
            }
            
            .grade-label {
              font-size: 9px;
              color: #666;
              margin-top: 4px;
            }
            
            /* Info Grid */
            .info {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 1px;
              background: #d0d0d0;
              border: 1px solid #d0d0d0;
              margin-bottom: 20px;
            }
            
            .info-cell {
              background: white;
              padding: 6px 8px;
              border: none;
              font-size: 10px;
            }
            
            .info-label {
              background: #f8f8f8;
              font-weight: bold;
              color: #2e75b6;
            }
            
            /* Sections */
            .section {
              margin-bottom: 20px;
            }
            
            .section-header {
              background: #e6f0ff;
              border: 1px solid #b8d4ff;
              padding: 8px 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .section-title {
              font-weight: bold;
              color: #2e75b6;
              font-size: 12px;
            }
            
            .section-meta {
              font-size: 10px;
              color: #666;
              display: flex;
              gap: 8px;
            }
            
            .separator {
              color: #999;
            }
            
            .section-desc {
              background: #f8f8f8;
              border-left: 1px solid #b8d4ff;
              border-right: 1px solid #b8d4ff;
              padding: 4px 10px;
              font-size: 10px;
              color: #666;
              font-style: italic;
            }
            
            /* Table */
            .criteria-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #b8d4ff;
            }
            
            .header {
              background: #e6f0ff;
            }
            
            .header th {
              border: 1px solid #b8d4ff;
              padding: 8px 6px;
              font-weight: bold;
              font-size: 10px;
              color: #2e75b6;
              text-align: center;
            }
            
            .criteria-col {
              text-align: left;
              width: 45%;
            }
            
            .score-col, .percentage-col {
              width: 12%;
            }
            
            .comments-col {
              text-align: left;
              width: 19%;
            }
            
            .criteria-table td {
              border: 1px solid #d0d0d0;
              padding: 6px 6px;
              font-size: 10px;
              vertical-align: top;
            }
            
            .even {
              background: #ffffff;
            }
            
            .odd {
              background: #f8f8f8;
            }
            
            .criteria {
              font-weight: 500;
            }
            
            .score, .percentage {
              text-align: center;
              font-weight: 600;
            }
            
            .percentage {
              color: #2e75b6;
            }
            
            .comments {
              font-size: 9px;
              color: #666;
            }
            
            /* Section Total */
            .section-total {
              background: #e6f0ff;
              border-top: 2px solid #b8d4ff;
            }
            
            .section-total td {
              border: 1px solid #b8d4ff;
              padding: 8px 6px;
              font-weight: bold;
            }
            
            .total-label {
              text-align: right;
              color: #2e75b6;
            }
            
            .total-value {
              color: #2e75b6;
            }
            
            /* Footer */
            .footer {
              margin-top: 30px;
              border-top: 1px solid #2e75b6;
              padding-top: 20px;
            }
            
            .signatures {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 15px;
            }
            
            .signature {
              text-align: center;
            }
            
            .signature-line {
              border-top: 1px solid #000;
              margin: 25px 0 5px;
              height: 1px;
            }
            
            .signature-name {
              font-weight: bold;
              font-size: 10px;
              margin-top: 2px;
            }
            
            .signature-role {
              font-size: 9px;
              color: #666;
            }
            
            .report-footer {
              text-align: center;
              font-size: 9px;
              color: #999;
              margin-top: 10px;
              border-top: 1px solid #ddd;
              padding-top: 8px;
            }
            
            /* Print */
            @media print {
              body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
              }
              .no-print { display: none; }
              .section { 
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="header-main">
                <div class="title">FINAL ASSESSMENT REPORT</div>
                <div class="subtitle">${assessment.assessment_type}</div>
              </div>
              <div class="header-info">
                <span>Project: ${assessment.project_name}</span>
                <span>Date: ${assessmentDate}</span>
              </div>
            </div>

            <!-- Summary -->
            <div class="summary">
              <div class="summary-cell main-grade">
                <div class="grade-value">${assessment.total_rating}%</div>
                <div class="grade-label">FINAL RATING</div>
              </div>
              <div class="summary-cell">
                <div class="grade-value">${assessment.overall_score}</div>
                <div class="grade-label">SCORE EARNED</div>
              </div>
              <div class="summary-cell">
                <div class="grade-value">${assessment.max_score}</div>
                <div class="grade-label">MAX SCORE</div>
              </div>
              <div class="summary-cell">
                <div class="grade-value">
                  ${assessment.max_score > 0 ? Math.round((assessment.overall_score / assessment.max_score) * 100) : 0}%
                </div>
                <div class="grade-label">RAW PERCENTAGE</div>
              </div>
            </div>

            <!-- Information -->
            <div class="info">
              <div class="info-cell info-label">Project Name</div>
              <div class="info-cell">${assessment.project_name}</div>
              <div class="info-cell info-label">Assessment Date</div>
              <div class="info-cell">${assessmentDate}</div>
              
              <div class="info-cell info-label">Assessment Type</div>
              <div class="info-cell">${assessment.assessment_type}</div>
              <div class="info-cell info-label">Evaluator</div>
              <div class="info-cell">${assessment.accomplished_by}</div>
              
              ${assessment.reviewed_by ? `
                <div class="info-cell info-label">Reviewed By</div>
                <div class="info-cell">${assessment.reviewed_by}</div>
              ` : ''}
              
              ${assessment.approved_by ? `
                <div class="info-cell info-label">Approved By</div>
                <div class="info-cell">${assessment.approved_by}</div>
              ` : ''}
            </div>

            <!-- Assessment Sections -->
            ${sectionsHTML}

            <!-- Signatures -->
            <div class="footer">
              <div class="signatures">
                <div class="signature">
                  <div class="signature-line"></div>
                  <div class="signature-role">Evaluated By</div>
                  <div class="signature-name">${assessment.accomplished_by}</div>
                  <div class="signature-role">Date: ${assessmentDate}</div>
                </div>
                
                ${assessment.reviewed_by ? `
                  <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-role">Reviewed By</div>
                    <div class="signature-name">${assessment.reviewed_by}</div>
                    <div class="signature-role">Date: ${assessmentDate}</div>
                  </div>
                ` : ''}
                
                ${assessment.approved_by ? `
                  <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-role">Approved By</div>
                    <div class="signature-name">${assessment.approved_by}</div>
                    <div class="signature-role">Date: ${assessmentDate}</div>
                  </div>
                ` : ''}
              </div>
              
              <div class="report-footer">
                Report generated on ${printDate} 
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
      console.error('Error printing assessment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await logAssessmentActivity.logError(
        'PRINT_ASSESSMENT_REPORT',
        `Failed to print assessment report for ${assessment.project_name}`,
        errorMessage,
        { projectName: assessment.project_name }
      );
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
      title="Print Assessment Report"
    >
      <Printer size={16} />
    </button>
  );
}

// ==================== CERTIFICATION PRINT COMPONENT ====================
function CertificationPrint({ assessment }: { assessment: FinalAssessment }) {
  const handlePrint = async () => {
    try {
      await logAssessmentActivity.printCertification(assessment.project_name, assessment.id);
      
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
                Certificate generated on ${printDate} • Reference ID: ${assessment.id}
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
      await logAssessmentActivity.logError(
        'PRINT_ASSESSMENT_CERTIFICATION',
        `Failed to print assessment certification for ${assessment.project_name}`,
        errorMessage,
        { projectName: assessment.project_name }
      );
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
      title="Print Certification"
    >
      <Award size={16} />
    </button>
  );
}

// ==================== VIEW MODAL ====================
function AssessmentViewModal({ assessment, onClose }: { assessment: FinalAssessment, onClose: () => void }) {
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assessment Details</h2>
              <p className="text-gray-600 mt-1">{assessment.project_name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Assessment Type</h3>
              <p className="text-sm text-gray-900">{assessment.assessment_type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Overall Score</h3>
              <p className="text-sm font-semibold text-gray-900">
                {assessment.overall_score}/{assessment.max_score} ({Math.round((assessment.overall_score / assessment.max_score) * 100)}%)
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Rating</h3>
              <p className="text-sm font-semibold text-green-600">{assessment.total_rating}%</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assessment.status)}`}>
                {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Accomplished By</h3>
              <p className="text-sm text-gray-900">{assessment.accomplished_by}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Reviewed By</h3>
              <p className="text-sm text-gray-900">{assessment.reviewed_by || '-'}</p>
            </div>
          </div>

          <div className="space-y-4">
            {assessment.sections?.map((section: AssessmentSection) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {section.score}/{section.max_score}
                    </p>
                    <p className="text-xs text-gray-500">Weight: {section.weight}%</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {section.criteria?.map((criterion: AssessmentCriteria) => (
                    <div key={criterion.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{criterion.description}</span>
                      <span className="font-medium text-gray-900">
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

// ==================== MAIN PAGE ====================
export default function FinalAssessmentPage() {
  const [assessments, setAssessments] = useState<FinalAssessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<FinalAssessment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<FinalAssessment | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [filters, setFilters] = useState({
    project_id: '',
    status: '',
    search: ''
  });

  const router = useRouter();

  const getProjectName = (project: Project): string => {
    return project?.enterpriseSetup?.projectName || project?.projectName || 'Unknown Project';
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/final-assessments');
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
        
        // Log successful load
        await logAssessmentActivity.viewList();
      } else {
        throw new Error('Failed to fetch assessments');
      }
    } catch (err) {
      console.error('Error fetching assessments:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      await logAssessmentActivity.loadError(errorMessage);
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
  }, [assessments, filters]);

  // Log filter changes
  useEffect(() => {
    if (filters.search) {
      logAssessmentActivity.search(filters.search);
    }
  }, [filters.search]);

  useEffect(() => {
    if (filters.project_id) {
      const projectName = projects.find(p => p.id === filters.project_id)?.projectName || filters.project_id;
      logAssessmentActivity.filter('project', projectName);
    }
  }, [filters.project_id, projects]);

  useEffect(() => {
    if (filters.status) {
      logAssessmentActivity.filter('status', filters.status);
    }
  }, [filters.status]);

  const handleDelete = async (id: string, projectName: string) => {
    if (!confirm('Delete this assessment?')) return;
    try {
      const res = await fetch(`/api/final-assessments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await logAssessmentActivity.deleteSuccess(projectName, id);
        fetchAssessments();
        alert('Deleted!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      await logAssessmentActivity.deleteError(projectName, errorMessage);
      alert('Error deleting');
    }
  };

  const handleViewAssessment = async (assessment: FinalAssessment) => {
    setSelectedAssessment(assessment);
    setShowViewModal(true);
    await logAssessmentActivity.viewDetails(assessment.project_name, assessment.id);
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      
      // Create CSV content
      const headers = ['Project Name', 'Assessment Type', 'Overall Score', 'Max Score', 'Total Rating', 'Status', 'Accomplished By', 'Assessment Date'];
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
      link.download = `final-assessments-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      await logAssessmentActivity.exportData('CSV', filteredAssessments.length);
    } catch (error) {
      console.error('Error exporting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await logAssessmentActivity.logError(
        'EXPORT_ASSESSMENTS',
        'Failed to export assessments data',
        errorMessage
      );
    } finally {
      setExportLoading(false);
    }
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

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
              <h1 className="text-xl font-semibold text-gray-900">Final Assessment</h1>
              <p className="text-gray-600 text-sm">Project evaluation and scoring</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportData}
              disabled={exportLoading || filteredAssessments.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
            
       <Button
  onClick={() => router.push('/final-assessments/create')}
  variant="outline"
  size="sm"
  className="flex items-center gap-2"
>
  <Plus className="h-4 w-4" />
  New Assessment
</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filters.project_id}
                onChange={e => setFilters({ ...filters, project_id: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{getProjectName(p)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search projects, evaluators..."
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => setFilters({ project_id: '', status: '', search: '' })} 
                className="w-full px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
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
            <div className="text-sm text-gray-600">Total Assessments</div>
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
            <div className="text-2xl font-bold text-gray-600">
              {filteredAssessments.filter(a => a.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 text-sm mt-2">Loading assessments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                        <CheckCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">No assessments found</p>
                        {filters.search || filters.project_id || filters.status ? (
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        ) : null}
                      </td>
                    </tr>
                  ) : (
                    filteredAssessments.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{a.project_name}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{a.assessment_type}</td>
                        <td className="px-3 py-2 text-sm">{a.overall_score}/{a.max_score}</td>
                        <td className="px-3 py-2 text-sm font-semibold text-green-600">{a.total_rating}%</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(a.status)}`}>
                            {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">{formatDate(a.assessment_date)}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleViewAssessment(a)} 
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <AssessmentPrint assessment={a} />
                            <CertificationPrint assessment={a} />
                            <button 
                              onClick={() => handleDelete(a.id, a.project_name)} 
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Assessment"
                            >
                              <Trash2 size={16} />
                            </button>
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