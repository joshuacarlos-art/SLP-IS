'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Plus, Users, FileText, X, Eye, Edit, Archive, Search, Loader2, AlertCircle, Award, BadgeCheck } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { Association } from '@/types/database';
import EditAssociationModal from '@/components/associations/edit-association-modal';
import { useAssociations } from './association-context';

export default function AssociationsPage() {
  const { associations, fetchAssociations } = useAssociations();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);
  const [editingAssociation, setEditingAssociation] = useState<Association | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data that matches your database structure
  const [formData, setFormData] = useState({
    name: "",
    date_formulated: new Date().toISOString().split('T')[0],
    status: "active" as const,
    location: "",
    contact_person: "",
    contact_number: "",
    email: "",
    operational_reason: "",
    no_active_members: 0,
    no_inactive_members: 0,
    covid_affected: false,
    profit_sharing: false,
    profit_sharing_amount: 0,
    loan_scheme: false,
    loan_scheme_amount: 0,
    registrations_certifications: [] as string[],
    final_org_adjectival_rating: "",
    final_org_rating_assessment: "",
    archived: false,
  });

  // Fetch associations on component mount
  useEffect(() => {
    const loadAssociations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await fetchAssociations();
      } catch (error) {
        console.error('❌ Error fetching associations:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch associations');
      } finally {
        setIsLoading(false);
      }
    };

    loadAssociations();
  }, [fetchAssociations]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const response = await fetch('/api/associations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        // Reset form
        setFormData({
          name: "",
          date_formulated: new Date().toISOString().split('T')[0],
          status: "active",
          location: "",
          contact_person: "",
          contact_number: "",
          email: "",
          operational_reason: "",
          no_active_members: 0,
          no_inactive_members: 0,
          covid_affected: false,
          profit_sharing: false,
          profit_sharing_amount: 0,
          loan_scheme: false,
          loan_scheme_amount: 0,
          registrations_certifications: [],
          final_org_adjectival_rating: "",
          final_org_rating_assessment: "",
          archived: false,
        });
        await fetchAssociations();
        alert('Association created successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create association');
      }
    } catch (error) {
      console.error('Error creating association:', error);
      alert(error instanceof Error ? error.message : 'Failed to create association');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewAssociation = (association: Association) => {
    setSelectedAssociation(association);
    setShowView(true);
  };

  const handleEditAssociation = (association: Association) => {
    setEditingAssociation(association);
    setShowEdit(true);
  };

  const handleUpdateAssociation = async (updatedAssociation: Association) => {
    try {
      const associationId = updatedAssociation._id;
      
      if (!associationId) {
        throw new Error('Association ID is required for update');
      }

      console.log('🔄 Updating association with ID:', associationId);

      const response = await fetch(`/api/associations/id?id=${associationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAssociation),
      });

      console.log('📡 Response status:', response.status, response.statusText);

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
      
      await fetchAssociations();
      
      setShowEdit(false);
      setEditingAssociation(null);
      alert('Association updated successfully!');
      
    } catch (error: any) {
      console.error('❌ Error updating association:', error);
      alert(`Failed to update association: ${error.message}`);
    }
  };

  const handleArchiveAssociation = async (associationId: string) => {
    if (confirm('Are you sure you want to archive this association?')) {
      try {
        const response = await fetch(`/api/associations/id/archive`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: associationId }),
        });

        if (response.ok) {
          await fetchAssociations();
          if (showView) setShowView(false);
          alert('Association archived successfully!');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to archive association');
        }
      } catch (error) {
        console.error('Error archiving association:', error);
        alert(error instanceof Error ? error.message : 'Failed to archive association');
      }
    }
  };

  const handleRestoreAssociation = async (associationId: string) => {
    try {
      const response = await fetch(`/api/associations/id/restore`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: associationId }),
      });

      if (response.ok) {
        await fetchAssociations();
        if (showView) setShowView(false);
        alert('Association restored successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore association');
      }
    } catch (error) {
      console.error('Error restoring association:', error);
      alert(error instanceof Error ? error.message : 'Failed to restore association');
    }
  };

  const activeAssociations = associations.filter(assoc => !assoc.archived);
  const archivedAssociations = associations.filter(assoc => assoc.archived);
  const filteredAssociations = activeAssociations.filter(association =>
    searchTerm === "" || 
    association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (association.location && association.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (association.contact_person && association.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadgeClass = (status: string) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-orange-100 text-orange-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading associations...</p>
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
            <h1 className="text-3xl font-bold">Associations</h1>
            <p className="text-muted-foreground">Manage farmer associations - SLP Admin Invest</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={() => setShowArchived(true)}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archived ({archivedAssociations.length})
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              New Association
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Failed to load associations</p>
                  <p className="text-sm">{error}</p>
                  <Button 
                    onClick={fetchAssociations} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Total Associations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAssociations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeAssociations.reduce((sum, assoc) => sum + (assoc.no_active_members || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeAssociations.filter(a => a.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Archived
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{archivedAssociations.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Associations List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Associations</CardTitle>
                <CardDescription>
                  {filteredAssociations.length} of {activeAssociations.length} associations
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search associations..."
                  value={searchTerm}
                  onChange={handleSearch} 
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAssociations.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {activeAssociations.length === 0 ? 'No Associations Found' : 'No Matching Associations'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeAssociations.length === 0 
                      ? 'Get started by creating your first association.' 
                      : 'Try adjusting your search terms.'
                    }
                  </p>
                  {activeAssociations.length === 0 && (
                    <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Association
                    </Button>
                  )}
                </div>
              ) : (
                filteredAssociations.map((association) => (
                  <Card key={association._id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg truncate">{association.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(association.status)}`}>
                            {association.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            <span>{association.location || 'No location'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{association.no_active_members} active members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Contact: {association.contact_person || 'Not specified'}</span>
                          </div>
                        </div>

                        {/* Additional info */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {association.profit_sharing && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Profit Sharing: ₱{association.profit_sharing_amount?.toLocaleString()}
                            </span>
                          )}
                          {association.loan_scheme && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                              Loan Scheme: ₱{association.loan_scheme_amount?.toLocaleString()}
                            </span>
                          )}
                          {association.covid_affected && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                              COVID Affected
                            </span>
                          )}
                          {association.registrations_certifications && association.registrations_certifications.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              <BadgeCheck className="h-3 w-3 mr-1" />
                              {association.registrations_certifications.length} Certifications
                            </span>
                          )}
                          {association.final_org_adjectival_rating && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              <Award className="h-3 w-3 mr-1" />
                              Rating: {association.final_org_adjectival_rating}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAssociation(association)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAssociation(association)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => association._id && handleArchiveAssociation(association._id)}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Association Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b sticky top-0 bg-white z-10">
                <CardTitle>Create New Association</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Association Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input
                          id="contact_person"
                          value={formData.contact_person}
                          onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_number">Contact Number</Label>
                        <Input
                          id="contact_number"
                          value={formData.contact_number}
                          onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="no_active_members">Active Members</Label>
                        <Input
                          id="no_active_members"
                          type="number"
                          value={formData.no_active_members}
                          onChange={(e) => setFormData({...formData, no_active_members: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="no_inactive_members">Inactive Members</Label>
                        <Input
                          id="no_inactive_members"
                          type="number"
                          value={formData.no_inactive_members}
                          onChange={(e) => setFormData({...formData, no_inactive_members: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date_formulated">Date Established</Label>
                        <Input
                          id="date_formulated"
                          type="date"
                          value={formData.date_formulated}
                          onChange={(e) => setFormData({...formData, date_formulated: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operational_reason">Operational Reason</Label>
                      <textarea
                        id="operational_reason"
                        value={formData.operational_reason}
                        onChange={(e) => setFormData({...formData, operational_reason: e.target.value})}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                        placeholder="Reason for operation and community purpose"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                      <BadgeCheck className="h-5 w-5" />
                      Additional Information
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="registrations_certifications">
                        Registrations & Certifications
                      </Label>
                      <Input
                        id="registrations_certifications"
                        value={formData.registrations_certifications.join(', ')}
                        onChange={(e) => setFormData({
                          ...formData, 
                          registrations_certifications: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                        })}
                        placeholder="DA Registered, LGU Certified, Organic Certified, ..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple certifications with commas
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="final_org_adjectival_rating">
                          Final Organizational Adjectival Rating
                        </Label>
                        <select
                          id="final_org_adjectival_rating"
                          value={formData.final_org_adjectival_rating}
                          onChange={(e) => setFormData({...formData, final_org_adjectival_rating: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Select Rating</option>
                          <option value="Excellent">Excellent</option>
                          <option value="Outstanding">Outstanding</option>
                          <option value="Very Satisfactory">Very Satisfactory</option>
                          <option value="Satisfactory">Satisfactory</option>
                          <option value="Needs Improvement">Needs Improvement</option>
                          <option value="Poor">Poor</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="final_org_rating_assessment">
                          Final Organizational Rating Assessment
                        </Label>
                        <Input
                          id="final_org_rating_assessment"
                          value={formData.final_org_rating_assessment}
                          onChange={(e) => setFormData({...formData, final_org_rating_assessment: e.target.value})}
                          placeholder="Detailed assessment of organizational performance"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Features */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Financial Features</h3>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="covid_affected"
                        checked={formData.covid_affected}
                        onChange={(e) => setFormData({...formData, covid_affected: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="covid_affected">COVID Affected</Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="profit_sharing"
                            checked={formData.profit_sharing}
                            onChange={(e) => setFormData({...formData, profit_sharing: e.target.checked})}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor="profit_sharing">Profit Sharing</Label>
                        </div>
                        {formData.profit_sharing && (
                          <Input
                            type="number"
                            value={formData.profit_sharing_amount}
                            onChange={(e) => setFormData({...formData, profit_sharing_amount: parseInt(e.target.value) || 0})}
                            placeholder="Profit sharing amount"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="loan_scheme"
                            checked={formData.loan_scheme}
                            onChange={(e) => setFormData({...formData, loan_scheme: e.target.checked})}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor="loan_scheme">Loan Scheme</Label>
                        </div>
                        {formData.loan_scheme && (
                          <Input
                            type="number"
                            value={formData.loan_scheme_amount}
                            onChange={(e) => setFormData({...formData, loan_scheme_amount: parseInt(e.target.value) || 0})}
                            placeholder="Loan scheme amount"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={formLoading}>
                      {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Association"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Association Modal */}
        {showView && selectedAssociation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b sticky top-0 bg-white z-10">
                <CardTitle>Association Details</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowView(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{selectedAssociation.name}</h2>
                    <p className="text-muted-foreground">
                      {selectedAssociation.location} • Established: {new Date(selectedAssociation.date_formulated).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(selectedAssociation.status)}`}>
                    {selectedAssociation.status}
                  </span>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Contact Person</Label>
                      <p>{selectedAssociation.contact_person || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Contact Number</Label>
                      <p>{selectedAssociation.contact_number || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p>{selectedAssociation.email || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Members</Label>
                      <p>{selectedAssociation.no_active_members} active / {selectedAssociation.no_inactive_members} inactive</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Operational Reason</Label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedAssociation.operational_reason || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">COVID Affected</Label>
                      <p>{selectedAssociation.covid_affected ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5" />
                    Additional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4" />
                        Registrations & Certifications
                      </Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedAssociation.registrations_certifications && selectedAssociation.registrations_certifications.length > 0 ? (
                          selectedAssociation.registrations_certifications.map((cert, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                              {cert}
                            </span>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No certifications registered</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Final Organizational Adjectival Rating
                        </Label>
                        <p className="mt-1 font-medium">{selectedAssociation.final_org_adjectival_rating || 'Not rated'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Final Organizational Rating Assessment</Label>
                        <p className="mt-1 p-2 bg-gray-50 rounded-md">{selectedAssociation.final_org_rating_assessment || 'No assessment'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                {(selectedAssociation.profit_sharing || selectedAssociation.loan_scheme) && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Financial Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedAssociation.profit_sharing && (
                        <div>
                          <Label className="text-muted-foreground">Profit Sharing</Label>
                          <p className="text-lg font-semibold text-green-600">₱{selectedAssociation.profit_sharing_amount?.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedAssociation.loan_scheme && (
                        <div>
                          <Label className="text-muted-foreground">Loan Scheme</Label>
                          <p className="text-lg font-semibold text-blue-600">₱{selectedAssociation.loan_scheme_amount?.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowView(false)}>
                    Close
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowView(false);
                      handleEditAssociation(selectedAssociation);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  {selectedAssociation.archived ? (
                    <Button 
                      onClick={() => selectedAssociation._id && handleRestoreAssociation(selectedAssociation._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Restore
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => selectedAssociation._id && handleArchiveAssociation(selectedAssociation._id)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Archive
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Archived Associations Modal */}
        {showArchived && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                <CardTitle>Archived Associations</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowArchived(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {archivedAssociations.length === 0 ? (
                    <div className="text-center py-8">
                      <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No archived associations</p>
                    </div>
                  ) : (
                    archivedAssociations.map((association) => (
                      <Card key={association._id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{association.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {association.location} • {association.no_active_members} members
                            </p>
                          </div>
                          <Button
                            onClick={() => association._id && handleRestoreAssociation(association._id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Restore
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Association Modal */}
        {showEdit && editingAssociation && (
          <EditAssociationModal
            association={editingAssociation}
            isOpen={showEdit}
            onClose={() => {
              setShowEdit(false);
              setEditingAssociation(null);
            }}
            onUpdate={handleUpdateAssociation}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}