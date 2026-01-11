"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { Association } from '@/types/database';

interface EditAssociationModalProps {
  association: Association | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedAssociation: Association) => void;
}

export default function EditAssociationModal({
  association,
  isOpen,
  onClose,
  onUpdate
}: EditAssociationModalProps) {
  const [formData, setFormData] = useState<Partial<Association>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form data when association changes
  useEffect(() => {
    if (association) {
      setFormData({
        name: association.name,
        date_formulated: association.date_formulated,
        operational_reason: association.operational_reason,
        no_active_members: association.no_active_members,
        no_inactive_members: association.no_inactive_members,
        covid_affected: association.covid_affected,
        profit_sharing: association.profit_sharing,
        profit_sharing_amount: association.profit_sharing_amount,
        loan_scheme: association.loan_scheme,
        loan_scheme_amount: association.loan_scheme_amount,
        registrations_certifications: association.registrations_certifications,
        final_org_adjectival_rating: association.final_org_adjectival_rating,
        final_org_rating_assessment: association.final_org_rating_assessment,
        location: association.location,
        contact_person: association.contact_person,
        contact_number: association.contact_number,
        email: association.email
      });
    }
  }, [association]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleNumberChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? 0 : parseFloat(value)
    }));
  };

  const handleArrayChange = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!association?._id) return;

    setIsLoading(true);
    setError("");

    try {
      const associationId = association._id;
      
      console.log('🔄 Sending update request for ID:', associationId);
      console.log('📦 Update data:', formData);

      const response = await fetch(`/api/associations/id?id=${associationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          if (errorText) {
            errorMessage = `Server returned: ${errorText.substring(0, 100)}`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Update successful:', result);
      
      onUpdate(result);
      onClose();
    } catch (error: any) {
      console.error('❌ Error updating association:', error);
      setError(error.message || 'Failed to update association. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !association) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
          <div>
            <CardTitle className="text-lg">Edit Association</CardTitle>
            <CardDescription className="text-sm">
              Update association information
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7"
            disabled={isLoading}
          >
            <X className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                <div className="font-medium">Update Failed</div>
                <div>{error}</div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm">Association Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="h-9 text-sm"
                    placeholder="Enter association name"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date_formulated" className="text-sm">Date Established *</Label>
                  <Input
                    id="edit-date_formulated"
                    type="date"
                    value={formData.date_formulated ? new Date(formData.date_formulated).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('date_formulated', e.target.value)}
                    required
                    className="h-9 text-sm"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location" className="text-sm">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location || ""}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Enter location"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-operational_reason" className="text-sm">Operational Reason</Label>
                <Input
                  id="edit-operational_reason"
                  value={formData.operational_reason || ""}
                  onChange={(e) => handleInputChange('operational_reason', e.target.value)}
                  className="h-9 text-sm"
                  placeholder="Reason for operation"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Membership Information */}
            <div className="space-y-3">
              <h3 className="font-semibold">Membership</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-no_active_members" className="text-sm">Active Members *</Label>
                  <Input
                    id="edit-no_active_members"
                    type="number"
                    value={formData.no_active_members || 0}
                    onChange={(e) => handleNumberChange('no_active_members', e.target.value)}
                    required
                    className="h-9 text-sm"
                    min="0"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-no_inactive_members" className="text-sm">Inactive Members</Label>
                  <Input
                    id="edit-no_inactive_members"
                    type="number"
                    value={formData.no_inactive_members || 0}
                    onChange={(e) => handleNumberChange('no_inactive_members', e.target.value)}
                    className="h-9 text-sm"
                    min="0"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Financial Features */}
            <div className="space-y-3">
              <h3 className="font-semibold">Financial Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-profit_sharing"
                      checked={formData.profit_sharing || false}
                      onChange={(e) => handleCheckboxChange('profit_sharing', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                      disabled={isLoading}
                    />
                    <Label htmlFor="edit-profit_sharing" className="text-sm">Profit Sharing</Label>
                  </div>
                  {formData.profit_sharing && (
                    <Input
                      type="number"
                      value={formData.profit_sharing_amount || 0}
                      onChange={(e) => handleNumberChange('profit_sharing_amount', e.target.value)}
                      className="h-9 text-sm"
                      placeholder="Profit sharing amount"
                      disabled={isLoading}
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-loan_scheme"
                      checked={formData.loan_scheme || false}
                      onChange={(e) => handleCheckboxChange('loan_scheme', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                      disabled={isLoading}
                    />
                    <Label htmlFor="edit-loan_scheme" className="text-sm">Loan Scheme</Label>
                  </div>
                  {formData.loan_scheme && (
                    <Input
                      type="number"
                      value={formData.loan_scheme_amount || 0}
                      onChange={(e) => handleNumberChange('loan_scheme_amount', e.target.value)}
                      className="h-9 text-sm"
                      placeholder="Loan scheme amount"
                      disabled={isLoading}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-covid_affected"
                  checked={formData.covid_affected || false}
                  onChange={(e) => handleCheckboxChange('covid_affected', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                  disabled={isLoading}
                />
                <Label htmlFor="edit-covid_affected" className="text-sm">COVID Affected</Label>
              </div>
            </div>

            {/* Registrations & Certifications */}
            <div className="space-y-3">
              <h3 className="font-semibold">Registrations & Certifications</h3>
              
              <div className="space-y-2">
                <Label htmlFor="edit-registrations_certifications" className="text-sm">
                  Registrations & Certifications (comma-separated)
                </Label>
                <Input
                  id="edit-registrations_certifications"
                  value={formData.registrations_certifications?.join(', ') || ""}
                  onChange={(e) => handleArrayChange('registrations_certifications', e.target.value)}
                  className="h-9 text-sm"
                  placeholder="Certification 1, Certification 2, ..."
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Ratings */}
            <div className="space-y-3">
              <h3 className="font-semibold">Ratings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-final_org_adjectival_rating" className="text-sm">Adjectival Rating</Label>
                  <Input
                    id="edit-final_org_adjectival_rating"
                    value={formData.final_org_adjectival_rating || ""}
                    onChange={(e) => handleInputChange('final_org_adjectival_rating', e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Rating description"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-final_org_rating_assessment" className="text-sm">Rating Assessment</Label>
                  <Input
                    id="edit-final_org_rating_assessment"
                    value={formData.final_org_rating_assessment || ""}
                    onChange={(e) => handleInputChange('final_org_rating_assessment', e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Assessment details"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="font-semibold">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contact_person" className="text-sm">Contact Person</Label>
                  <Input
                    id="edit-contact_person"
                    value={formData.contact_person || ""}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Full name"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact_number" className="text-sm">Contact Number</Label>
                  <Input
                    id="edit-contact_number"
                    value={formData.contact_number || ""}
                    onChange={(e) => handleInputChange('contact_number', e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Phone number"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-9 text-sm"
                  placeholder="Email address"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 px-4 text-sm"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 h-9 px-6 text-sm disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Association"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}