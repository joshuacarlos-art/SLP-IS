"use client";

import { X, Send, Search, User, Users, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface ComposeNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: (notificationData: NotificationData) => void;
}

export interface NotificationData {
  recipients: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  specificUsers: string[]; // Changed from optional to required
  userGroups: string[]; // Changed from optional to required
  associations: string[]; // Changed from optional to required
}

// User interface matching your caretaker structure
interface NotificationUser {
  id: string;
  _id?: string;
  name: string;
  type: "caretaker" | "field_officer";
  email: string;
  association?: string;
  slpAssociation?: string;
  department?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  participantType?: string;
  status?: string;
}

// Association interface
interface Association {
  _id: string;
  name: string;
  location: string;
  no_active_members: number;
  status: string;
  archived?: boolean;
  date_formulated?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  operational_reason?: string;
  no_inactive_members?: number;
  covid_affected?: boolean;
  profit_sharing?: boolean;
  profit_sharing_amount?: number;
  loan_scheme?: boolean;
  loan_scheme_amount?: number;
  registrations_certifications?: string[];
  final_org_adjectival_rating?: string;
  final_org_rating_assessment?: string;
}

export default function ComposeNotificationModal({ 
  isOpen, 
  onClose,
  onSend 
}: ComposeNotificationModalProps) {
  const [formData, setFormData] = useState<NotificationData>({
    recipients: "",
    title: "",
    message: "",
    type: "announcement",
    priority: "medium",
    specificUsers: [],
    userGroups: [],
    associations: []
  });

  const [userSearch, setUserSearch] = useState("");
  const [associationSearch, setAssociationSearch] = useState("");
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showAssociationSelector, setShowAssociationSelector] = useState(false);
  const [users, setUsers] = useState<NotificationUser[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingAssociations, setIsLoadingAssociations] = useState(false);

  // Fetch users and associations when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchAssociations();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      console.log('🔄 Fetching users for notifications...');
      
      // Fetch caretakers from your API
      const caretakersResponse = await fetch('/api/caretakers');
      if (!caretakersResponse.ok) {
        throw new Error(`Failed to fetch caretakers: ${caretakersResponse.status}`);
      }
      const caretakersData = await caretakersResponse.json();
      
      // Transform caretakers to NotificationUser format
      const caretakerUsers: NotificationUser[] = caretakersData
        .filter((caretaker: any) => caretaker.status === 'active') // Only active caretakers
        .map((caretaker: any) => ({
          id: caretaker.id || caretaker._id, // Use the actual ID from your data
          _id: caretaker._id,
          name: `${caretaker.firstName} ${caretaker.middleName ? caretaker.middleName + ' ' : ''}${caretaker.lastName}${caretaker.extension ? ', ' + caretaker.extension : ''}`.trim(),
          type: "caretaker",
          email: caretaker.email || `${caretaker.firstName?.toLowerCase()}.${caretaker.lastName?.toLowerCase()}@care.com`,
          association: caretaker.slpAssociation,
          slpAssociation: caretaker.slpAssociation,
          firstName: caretaker.firstName,
          lastName: caretaker.lastName,
          middleName: caretaker.middleName,
          participantType: caretaker.participantType,
          status: caretaker.status
        }));

      // Field officers - empty array since you don't have them
      const fieldOfficerUsers: NotificationUser[] = [];

      setUsers([...caretakerUsers, ...fieldOfficerUsers]);
      console.log('✅ Loaded users:', caretakerUsers.length, 'caretakers');
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchAssociations = async () => {
    try {
      setIsLoadingAssociations(true);
      console.log('🔄 Fetching associations for notifications...');
      
      const response = await fetch('/api/associations');
      if (!response.ok) {
        throw new Error(`Failed to fetch associations: ${response.status}`);
      }
      
      const associationsData = await response.json();
      // Filter only active associations
      const activeAssociations = associationsData.filter((assoc: Association) => 
        !assoc.archived && assoc.status === 'active' && (assoc.no_active_members || 0) > 0
      );
      
      setAssociations(activeAssociations);
      console.log('✅ Loaded associations:', activeAssociations.length);
      
    } catch (error) {
      console.error('❌ Error fetching associations:', error);
      setAssociations([]);
    } finally {
      setIsLoadingAssociations(false);
    }
  };

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    
    return users.filter(user =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (user.association && user.association.toLowerCase().includes(userSearch.toLowerCase())) ||
      (user.firstName && user.firstName.toLowerCase().includes(userSearch.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(userSearch.toLowerCase()))
    );
  }, [users, userSearch]);

  // Filter associations based on search
  const filteredAssociations = useMemo(() => {
    if (!associationSearch) return associations;
    
    return associations.filter(association =>
      association.name.toLowerCase().includes(associationSearch.toLowerCase()) ||
      (association.location && association.location.toLowerCase().includes(associationSearch.toLowerCase()))
    );
  }, [associations, associationSearch]);

  const handleInputChange = (field: keyof NotificationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset selections when recipient type changes
    if (field === 'recipients') {
      if (value !== 'specific' && value !== 'association') {
        setFormData(prev => ({
          ...prev,
          specificUsers: [],
          userGroups: [],
          associations: []
        }));
      }
      
      // Show appropriate selector
      setShowUserSelector(value === 'specific');
      setShowAssociationSelector(value === 'association');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setFormData(prev => {
      const currentUsers = prev.specificUsers;
      const newUsers = currentUsers.includes(userId)
        ? currentUsers.filter(id => id !== userId)
        : [...currentUsers, userId];
      
      return {
        ...prev,
        specificUsers: newUsers
      };
    });
  };

  const toggleAssociationSelection = (associationId: string) => {
    setFormData(prev => {
      const currentAssociations = prev.associations;
      const newAssociations = currentAssociations.includes(associationId)
        ? currentAssociations.filter(id => id !== associationId)
        : [...currentAssociations, associationId];
      
      return {
        ...prev,
        associations: newAssociations
      };
    });
  };

  const toggleGroupSelection = (groupType: string) => {
    setFormData(prev => {
      const currentGroups = prev.userGroups;
      const newGroups = currentGroups.includes(groupType)
        ? currentGroups.filter(type => type !== groupType)
        : [...currentGroups, groupType];
      
      // Auto-select/deselect all users of this type
      const userType = groupType as "caretaker" | "field_officer";
      const userIdsOfType = users.filter(u => u.type === userType).map(u => u.id);
      
      let newSpecificUsers = [...prev.specificUsers];
      
      if (newGroups.includes(groupType)) {
        // Add all users of this type
        userIdsOfType.forEach(userId => {
          if (!newSpecificUsers.includes(userId)) {
            newSpecificUsers.push(userId);
          }
        });
      } else {
        // Remove all users of this type
        newSpecificUsers = newSpecificUsers.filter(userId => !userIdsOfType.includes(userId));
      }
      
      return {
        ...prev,
        userGroups: newGroups,
        specificUsers: newSpecificUsers
      };
    });
  };

  const getSelectedUsersCount = () => {
    return formData.specificUsers.length;
  };

  const getSelectedAssociationsCount = () => {
    return formData.associations.length;
  };

  const getSelectedUserNames = () => {
    const selectedNames = formData.specificUsers.map(userId => {
      const user = users.find(u => u.id === userId);
      return user?.name;
    }).filter(Boolean);
    
    if (selectedNames.length === 0) return "No users selected";
    
    return selectedNames.length > 3 
      ? `${selectedNames.slice(0, 3).join(", ")} and ${selectedNames.length - 3} more...`
      : selectedNames.join(", ");
  };

  const getSelectedAssociationNames = () => {
    const selectedNames = formData.associations.map(associationId => {
      const association = associations.find(a => a._id === associationId);
      return association?.name;
    }).filter(Boolean);
    
    if (selectedNames.length === 0) return "No associations selected";
    
    return selectedNames.length > 3 
      ? `${selectedNames.slice(0, 3).join(", ")} and ${selectedNames.length - 3} more...`
      : selectedNames.join(", ");
  };

  // Get users from selected associations
  const getUsersFromSelectedAssociations = () => {
    if (formData.associations.length === 0) return [];
    
    return users.filter(user => 
      user.slpAssociation && formData.associations.includes(user.slpAssociation)
    );
  };

  // Get counts for different recipient types
  const getCaretakerCount = () => users.filter(u => u.type === 'caretaker').length;
  const getFieldOfficerCount = () => users.filter(u => u.type === 'field_officer').length;

  const handleSend = () => {
    // Validate required fields
    if (!formData.recipients || !formData.title || !formData.message) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate specific users selection
    if (formData.recipients === 'specific' && formData.specificUsers.length === 0) {
      alert("Please select at least one user");
      return;
    }

    // Validate association selection
    if (formData.recipients === 'association' && formData.associations.length === 0) {
      alert("Please select at least one association");
      return;
    }

    // Debug: Log the actual data being sent
    console.log('📤 Sending notification with data:', {
      recipients: formData.recipients,
      title: formData.title,
      specificUsers: formData.specificUsers,
      associations: formData.associations,
      userGroups: formData.userGroups,
      selectedUserDetails: formData.specificUsers.map(id => 
        users.find(u => u.id === id)?.name
      ),
      selectedAssociationDetails: formData.associations.map(id => 
        associations.find(a => a._id === id)?.name
      )
    });

    // Call the onSend callback if provided
    if (onSend) {
      onSend(formData);
    } else {
      // Default behavior - show summary
      let recipientSummary = "";
      let recipientCount = 0;

      switch (formData.recipients) {
        case 'caretakers':
          recipientCount = getCaretakerCount();
          recipientSummary = `All ${recipientCount} caretakers`;
          break;
        case 'field_officers':
          recipientCount = getFieldOfficerCount();
          recipientSummary = `All ${recipientCount} field officers`;
          break;
        case 'both':
          recipientCount = users.length;
          recipientSummary = `All ${getCaretakerCount()} caretakers and ${getFieldOfficerCount()} field officers`;
          break;
        case 'specific':
          recipientCount = getSelectedUsersCount();
          recipientSummary = `${recipientCount} specific users`;
          break;
        case 'association':
          const associationUsers = getUsersFromSelectedAssociations();
          recipientCount = associationUsers.length;
          recipientSummary = `${recipientCount} users from ${getSelectedAssociationsCount()} associations`;
          break;
      }
      
      alert(`Notification ready to send!\n\nRecipients: ${recipientSummary}\nTitle: ${formData.title}\nType: ${formData.type}\nPriority: ${formData.priority}`);
    }

    // Reset form and close modal
    handleClose();
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      recipients: "",
      title: "",
      message: "",
      type: "announcement",
      priority: "medium",
      specificUsers: [],
      userGroups: [],
      associations: []
    });
    setUserSearch("");
    setAssociationSearch("");
    setShowUserSelector(false);
    setShowAssociationSelector(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background">
          <h2 className="text-lg font-semibold">Compose Notification</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Recipients Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Send to *</label>
            <select 
              className="w-full border rounded px-3 py-2 text-sm"
              value={formData.recipients}
              onChange={(e) => handleInputChange('recipients', e.target.value)}
              required
            >
              <option value="">Select recipients...</option>
              <option value="caretakers">👥 All Caretakers ({getCaretakerCount()})</option>
              <option value="field_officers" disabled={getFieldOfficerCount() === 0}>
                👮 All Field Officers ({getFieldOfficerCount()}) {getFieldOfficerCount() === 0 && '(None available)'}
              </option>
              <option value="both">
                👥 Caretakers & 👮 Field Officers ({users.length})
              </option>
              <option value="association">🏢 Specific Associations</option>
              <option value="specific">🎯 Specific Users</option>
            </select>
          </div>

          {/* Specific Association Selection */}
          {formData.recipients === 'association' && (
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Select Associations</label>
                <Badge variant="secondary">
                  {getSelectedAssociationsCount()} selected
                </Badge>
              </div>

              {/* Association Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search associations by name or location..."
                  className="w-full pl-8"
                  value={associationSearch}
                  onChange={(e) => setAssociationSearch(e.target.value)}
                />
              </div>

              {/* Selected Associations Preview */}
              {getSelectedAssociationsCount() > 0 && (
                <div className="text-xs text-muted-foreground p-2 bg-white rounded border">
                  <strong>Selected:</strong> {getSelectedAssociationNames()}
                </div>
              )}

              {/* Associations List */}
              <div className="max-h-48 overflow-y-auto border rounded-md bg-white">
                {isLoadingAssociations ? (
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Loading associations...</span>
                  </div>
                ) : filteredAssociations.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {associations.length === 0 ? 'No active associations available' : 'No associations found matching your search.'}
                  </div>
                ) : (
                  filteredAssociations.map((association) => (
                    <div
                      key={association._id}
                      className={`flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        formData.associations.includes(association._id) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => toggleAssociationSelection(association._id)}
                    >
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full border-2 ${
                        formData.associations.includes(association._id) 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm truncate">{association.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {association.no_active_members || 0} members
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {association.location || 'No location specified'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Status: <span className="capitalize">{association.status || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Click on associations to select/deselect. All active members of selected associations will receive the notification.
              </div>
            </div>
          )}

          {/* Specific User Selection */}
          {formData.recipients === 'specific' && (
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Select Specific Users</label>
                <Badge variant="secondary">
                  {getSelectedUsersCount()} selected
                </Badge>
              </div>

              {/* Quick Group Selection */}
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant={formData.userGroups.includes('caretakers') ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleGroupSelection('caretakers')}
                  className="text-xs"
                  disabled={getCaretakerCount() === 0}
                >
                  <Users className="h-3 w-3 mr-1" />
                  Select All Caretakers ({getCaretakerCount()})
                </Button>
                <Button
                  type="button"
                  variant={formData.userGroups.includes('field_officers') ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleGroupSelection('field_officers')}
                  className="text-xs"
                  disabled={getFieldOfficerCount() === 0}
                >
                  <Building className="h-3 w-3 mr-1" />
                  Select All Field Officers ({getFieldOfficerCount()})
                </Button>
              </div>

              {/* User Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or association..."
                  className="w-full pl-8"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              {/* Selected Users Preview */}
              {getSelectedUsersCount() > 0 && (
                <div className="text-xs text-muted-foreground p-2 bg-white rounded border">
                  <strong>Selected:</strong> {getSelectedUserNames()}
                </div>
              )}

              {/* Users List */}
              <div className="max-h-48 overflow-y-auto border rounded-md bg-white">
                {isLoadingUsers ? (
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Loading users...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {users.length === 0 ? 'No active users available' : 'No users found matching your search.'}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        formData.specificUsers.includes(user.id) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full border-2 ${
                        formData.specificUsers.includes(user.id) 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm truncate">{user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.type === 'caretaker' ? '👥 Caretaker' : '👮 Field Officer'}
                          </Badge>
                          {user.status && (
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {user.status}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.type === 'caretaker' 
                            ? `Association: ${user.association || 'Not assigned'}`
                            : `Department: ${user.department || 'Not specified'}`
                          }
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Click on users to select/deselect. Only active users are shown.
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="Enter notification title..."
              className="w-full"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message *</label>
            <textarea
              placeholder="Write your message here..."
              rows={4}
              className="w-full border rounded px-3 py-2 text-sm resize-none"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              required
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select 
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="announcement">📢 Announcement</option>
                <option value="alert">🚨 Alert</option>
                <option value="reminder">⏰ Reminder</option>
                <option value="update">🔄 Update</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select 
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>

          {/* Recipient Summary */}
          {formData.recipients && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm font-medium text-blue-800 mb-1">
                📋 Notification Summary
              </div>
              <div className="text-sm text-blue-700">
                <strong>Recipients:</strong> {
                  formData.recipients === 'caretakers' && `👥 All Caretakers (${getCaretakerCount()})`}
                  {formData.recipients === 'field_officers' && `👮 All Field Officers (${getFieldOfficerCount()})`}
                  {formData.recipients === 'both' && `👥 All Caretakers & 👮 All Field Officers (${users.length})`}
                  {formData.recipients === 'association' && `🏢 ${getSelectedAssociationsCount()} associations (${getUsersFromSelectedAssociations().length} users)`}
                  {formData.recipients === 'specific' && `🎯 ${getSelectedUsersCount()} specific users`}
              </div>
              {formData.recipients === 'specific' && getSelectedUsersCount() > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  <strong>Selected Users:</strong> {getSelectedUserNames()}
                </div>
              )}
              {formData.recipients === 'association' && getSelectedAssociationsCount() > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  <strong>Selected Associations:</strong> {getSelectedAssociationNames()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t sticky bottom-0 bg-background">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={
              !formData.recipients || 
              !formData.title || 
              !formData.message ||
              (formData.recipients === 'specific' && getSelectedUsersCount() === 0) ||
              (formData.recipients === 'association' && getSelectedAssociationsCount() === 0)
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>
    </div>
  );
}