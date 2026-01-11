'use client';

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface Project {
  id: string;
  enterpriseSetup: {
    projectName: string;
    enterpriseType: string;
  };
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

interface AssessmentCreateModalProps {
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssessmentCreateModal({ projects, onClose, onSuccess }: AssessmentCreateModalProps) {
  const [formData, setFormData] = useState({
    project_id: '',
    assessment_type: 'Final Evaluation',
    accomplished_by: '',
    reviewed_by: '',
    approved_by: '',
    assessment_date: new Date().toISOString().split('T')[0]
  });

  const [sections, setSections] = useState<AssessmentSection[]>([
    {
      id: '1',
      title: 'Technical Performance',
      description: 'Evaluation of technical implementation',
      weight: 30,
      score: 0,
      max_score: 100,
      criteria: [
        { id: '1-1', description: 'Quality of work', score: 0, max_score: 25, comments: '' },
        { id: '1-2', description: 'Technical compliance', score: 0, max_score: 25, comments: '' },
        { id: '1-3', description: 'Innovation', score: 0, max_score: 25, comments: '' },
        { id: '1-4', description: 'Documentation', score: 0, max_score: 25, comments: '' }
      ]
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Calculate total scores
      const totalMaxScore = sections.reduce((sum, section) => sum + section.max_score, 0);
      const totalScore = sections.reduce((sum, section) => sum + section.score, 0);

      const assessmentData = {
        ...formData,
        project_name: projects.find(p => p.id === formData.project_id)?.enterpriseSetup.projectName || '',
        overall_score: totalScore,
        max_score: totalMaxScore,
        total_rating: Math.round((totalScore / totalMaxScore) * 100),
        status: 'draft',
        sections: sections,
        created_at: new Date().toISOString()
      };

      const response = await fetch('/api/final-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        onSuccess();
        alert('Assessment created successfully!');
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to create assessment');
      }
    } catch (error: any) {
      setError('Error creating assessment. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const newSection: AssessmentSection = {
      id: Date.now().toString(),
      title: '',
      description: '',
      weight: 0,
      score: 0,
      max_score: 0,
      criteria: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: string, value: any) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setSections(updatedSections);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Create Final Assessment</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
              <select
                required
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.enterpriseSetup.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
              <input
                type="text"
                value={formData.assessment_type}
                onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accomplished By *</label>
              <input
                type="text"
                required
                value={formData.accomplished_by}
                onChange={(e) => setFormData({ ...formData, accomplished_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Date</label>
              <input
                type="date"
                value={formData.assessment_date}
                onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Assessment Sections */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Assessment Sections</h3>
              <button
                type="button"
                onClick={addSection}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus size={16} />
                Add Section
              </button>
            </div>

            {sections.map((section, index) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                      <input
                        type="number"
                        value={section.weight}
                        onChange={(e) => updateSection(index, 'weight', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={section.description}
                        onChange={(e) => updateSection(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="ml-3 p-1 text-red-600 hover:text-red-800"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Creating...' : 'Create Assessment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}