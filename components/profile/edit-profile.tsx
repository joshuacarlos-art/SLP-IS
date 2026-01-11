'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Camera, User, Mail, Phone, MapPin, Building, CreditCard, X } from "lucide-react";
import { logSuccess, logError } from "@/lib/activity/activity-logger";

interface UserProfile {
  name: string;
  position: string;
  department: string;
  office: string;
  email: string;
  contact: string;
  location: string;
  employeeId: string;
  role: string;
  bio?: string;
  photoUrl?: string;
}

interface EditProfileProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function EditProfile({ profile, onSave, onClose, isOpen }: EditProfileProps) {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setSelectedPhoto(null);
      setPhotoPreview(null);
      setError("");
    }
  }, [isOpen, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.employeeId.trim()) return "Employee ID is required";
    if (!formData.position.trim()) return "Position is required";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address";
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('profile', JSON.stringify(formData));
      
      if (selectedPhoto) {
        formDataToSend.append('photo', selectedPhoto);
      }

      // Send to backend API
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      
      // Call the parent's onSave function with the updated data
      onSave(result.profile);
      
      await logSuccess('Profile', 'PROFILE_UPDATED', 'User profile updated successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setError(errorMessage);
      await logError('Profile', 'PROFILE_UPDATE_FAILED', `Profile update error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Photo Upload */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                        {photoPreview ? (
                          <img 
                            src={photoPreview} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : profile.photoUrl ? (
                          <img 
                            src={profile.photoUrl} 
                            alt="Current profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <label 
                        htmlFor="profile-photo"
                        className="absolute -bottom-1 -right-1 bg-gray-800 text-white rounded-full p-2 cursor-pointer hover:bg-gray-700 transition-colors"
                      >
                        <Camera className="h-3 w-3" />
                        <span className="sr-only">Change photo</span>
                      </label>
                    </div>
                    <input
                      id="profile-photo"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Profile Photo</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, max 5MB</p>
                    {selectedPhoto && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemovePhoto}
                        className="mt-2 h-7 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                        disabled={isLoading}
                      >
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-10 text-sm border-gray-300 focus:border-gray-400"
                      placeholder="Enter your full name"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700">Employee ID *</Label>
                    <Input
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className="h-10 text-sm border-gray-300 focus:border-gray-400"
                      placeholder="Enter employee ID"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-10 text-sm border-gray-300 focus:border-gray-400"
                      placeholder="Enter email address"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-sm font-medium text-gray-700">Contact Number</Label>
                    <Input
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className="h-10 text-sm border-gray-300 focus:border-gray-400"
                      placeholder="Enter contact number"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="h-10 text-sm border-gray-300 focus:border-gray-400"
                      placeholder="Enter your location"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="h-10 text-sm border-gray-300 focus:border-gray-400"
                      placeholder="Enter department"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="office" className="text-sm font-medium text-gray-700">Office</Label>
                    <Input
                      id="office"
                      name="office"
                      value={formData.office}
                      onChange={handleInputChange}
                      className="h-10 text-sm border-gray-300 focus:border-gray-400"
                      placeholder="Enter office"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium text-gray-700">Position *</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="h-10 text-sm border-gray-300 focus:border-gray-400"
                      placeholder="Enter position"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="h-10 text-sm border-gray-300 focus:border-gray-400"
                      placeholder="Enter role"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      className="min-h-[80px] text-sm border-gray-300 focus:border-gray-400"
                      placeholder="Tell us about yourself..."
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-6 bg-red-50 border-red-200">
              <AlertDescription className="text-sm text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-10 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="h-10 px-6 bg-gray-900 text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}