'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Star, X } from 'lucide-react';

import { Caretaker, PerformanceAssessment, getFullName } from '@/types/performance';

interface PerformanceAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  caretaker: Caretaker | null;
  onSave: (assessment: Omit<PerformanceAssessment, 'id' | '_id'>) => Promise<PerformanceAssessment>;
}

const PerformanceAssessmentModal: React.FC<PerformanceAssessmentModalProps> = ({
  isOpen,
  onClose,
  caretaker,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(3);
  const [comments, setComments] = useState('');
  const [assessedBy, setAssessedBy] = useState('');
  const [categories, setCategories] = useState({
    punctuality: 3,
    communication: 3,
    patientCare: 3,
    professionalism: 3,
    technicalSkills: 3,
  });

  if (!caretaker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessedBy.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const assessmentData: Omit<PerformanceAssessment, 'id' | '_id'> = {
        caretakerId: caretaker.id || caretaker._id || '',
        assessmentDate: new Date(),
        date: new Date(),
        rating,
        comments,
        assessedBy,
        categories,
        strengths: [],
        areasOfImprovement: [],
      };

      await onSave(assessmentData);
      handleClose();
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(3);
    setComments('');
    setAssessedBy('');
    setCategories({
      punctuality: 3,
      communication: 3,
      patientCare: 3,
      professionalism: 3,
      technicalSkills: 3,
    });
    onClose();
  };

  const updateCategory = (category: keyof typeof categories, value: number) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Performance Assessment</DialogTitle>
          <DialogDescription>
            Assess performance for {getFullName(caretaker)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Overall Rating */}
            <div className="space-y-4">
              <Label>Overall Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <Badge className="ml-4 text-lg">{rating.toFixed(1)}/5</Badge>
              </div>
            </div>

            {/* Category Ratings */}
            <div className="space-y-4">
              <Label>Category Ratings</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(categories).map(([category, value]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="capitalize">
                        {category.replace(/([A-Z])/g, ' $1')}
                      </Label>
                      <span className="font-medium">{value.toFixed(1)}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateCategory(category as keyof typeof categories, star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-5 w-5 transition-colors ${
                              star <= value
                                ? 'text-blue-500 fill-blue-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessor Information */}
            <div className="space-y-2">
              <Label htmlFor="assessedBy">Assessed By *</Label>
              <Input
                id="assessedBy"
                value={assessedBy}
                onChange={(e) => setAssessedBy(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add your assessment comments..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Assessment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceAssessmentModal;