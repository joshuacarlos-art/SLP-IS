"use client";

import { Menu, Bell, Search, User, Shield, Building, Mail, Phone, MapPin, X, Send, Key, Camera, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import ComposeNotificationModal from "@/components/notifications/compose-notification-modal";
import { useRouter } from "next/navigation";
import ChangePassword from "@/components/changepass/change-password";
import EditProfile from "@/components/profile/edit-profile";

interface HeaderProps {
  onMenuClick: () => void;
}

// Default User Profile Data
const defaultUserProfile = {
  name: "Joshua Carlos Gonzales",
  position: "Social Welfare Officer III",
  department: "Department of Social Welfare and Development",
  office: "Himamaylan City Office",
  email: "joshuacarlos@gmail.com",
  contact: "+63 912 345 6789",
  location: "Brgy. Paglaum, Pob. Binalbagan, Negros Occidental",
  employeeId: "DSWD-2023-04567",
  role: "Administrator",
  bio: "Dedicated social welfare officer with 5+ years of experience in community development and poverty alleviation programs.",
  photoUrl: ""
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(defaultUserProfile);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();

  // Load profile from MongoDB on component mount
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    loadUserProfile();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      // Use the authenticated user's email or fallback to default
      const userEmail = user?.email || defaultUserProfile.email;
      
      const response = await fetch(`/api/user/profile?email=${encodeURIComponent(userEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setUserProfile(data.profile);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleActivityLogClick = () => {
    router.push('/admin/activity-log');
  };

  const handleChangePasswordClick = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  const handleEditProfileClick = () => {
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (updatedProfile: any) => {
    try {
      // Update state immediately for better UX
      setUserProfile(updatedProfile);
      setIsEditProfileModalOpen(false);
      
      // Show success message (you can add a toast here)
      console.log('Profile updated successfully');
      
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Don't render time/date until client-side to avoid hydration mismatch
  const renderTimeAndDate = () => {
    if (!isClient || !currentTime) {
      return (
        <div className="hidden md:flex flex-col items-center justify-center mx-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      );
    }

    return (
      <div className="hidden md:flex flex-col items-center justify-center mx-4">
        <div className="text-sm font-medium text-foreground">
          {formatTime(currentTime)}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(currentTime)}
        </div>
      </div>
    );
  };

  const displayName = user?.name || userProfile.name;
  const displayRole = user?.role || userProfile.role;
  const displayEmail = user?.email || userProfile.email;

  return (
    <>
      <header className="flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        {/* Search bar */}
        <div className="flex flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search beneficiaries, programs, reports..."
              className="w-full pl-8 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Current Time and Date - Between search and notification */}
        {renderTimeAndDate()}
        
        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Compose Notification Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsComposeModalOpen(true)}
            title="Compose Notification"
            className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Compose Notification</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white"
                >
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                DSWD Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50">
                  <div className="font-medium text-sm">New Pantawid Pamilya Applications</div>
                  <div className="text-sm text-gray-600 mt-1">15 new applications pending review</div>
                  <div className="text-xs text-gray-400 mt-2">2 hours ago</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50">
                  <div className="font-medium text-sm">Sustainable Livelihood Program</div>
                  <div className="text-sm text-gray-600 mt-1">Quarterly report due next week</div>
                  <div className="text-xs text-gray-400 mt-2">5 hours ago</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50">
                  <div className="font-medium text-sm">Social Pension Payout</div>
                  <div className="text-sm text-gray-600 mt-1">Payout schedule updated for Negros Occidental</div>
                  <div className="text-xs text-gray-400 mt-2">1 day ago</div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-center cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin User Menu - Trigger for Profile Modal */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 px-2 hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white overflow-hidden border-2 border-white shadow-sm">
                    {userProfile.photoUrl ? (
                      <img 
                        src={userProfile.photoUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <div className="text-sm font-medium text-gray-900">{displayName}</div>
                    <div className="text-xs text-gray-500">{displayRole}</div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-gray-500">
                    {displayEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsProfileModalOpen(true)}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleActivityLogClick}
                className="cursor-pointer"
              >
                <span>Activity Log</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* DSWD Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-white text-gray-900">
  <div className="flex items-center gap-3">
    <User className="h-6 w-6 text-blue-600" />
    <h2 className="text-xl font-semibold">DSWD Profile</h2>
  </div>
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setIsProfileModalOpen(false)}
    className="h-8 w-8 text-gray-500 hover:bg-gray-100"
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </Button>
</div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 overflow-hidden border-4 border-blue-100">
                    {userProfile.photoUrl ? (
                      <img 
                        src={userProfile.photoUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{userProfile.name}</h3>
                  <p className="text-sm text-gray-600">{userProfile.position}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">DSWD OFFICIAL</span>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium">{userProfile.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Contact</p>
                          <p className="text-sm font-medium">{userProfile.contact}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium">{userProfile.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Employee ID</p>
                          <p className="text-sm font-medium font-mono">{userProfile.employeeId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Department Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm font-medium">{userProfile.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Office</p>
                        <p className="text-sm font-medium">{userProfile.office}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Position</p>
                        <p className="text-sm font-medium">{userProfile.position}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Role</p>
                        <p className="text-sm font-medium">{userProfile.role}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                {userProfile.bio && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">About</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{userProfile.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Key className="h-4 w-4" />
                <span>Secure your account regularly</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="border-gray-300"
                >
                  Close
                </Button>
                <Button 
                  onClick={handleChangePasswordClick}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Change Password
                </Button>
                <Button 
                  onClick={handleEditProfileClick}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfile
        profile={userProfile}
        onSave={handleSaveProfile}
        onClose={() => setIsEditProfileModalOpen(false)}
        isOpen={isEditProfileModalOpen}
      />

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClosePasswordModal}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <ChangePassword 
                onClose={handleClosePasswordModal}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Compose Notification Modal */}
      <ComposeNotificationModal 
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
      />
    </>
  );
}