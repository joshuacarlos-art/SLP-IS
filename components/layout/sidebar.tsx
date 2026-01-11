"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  Settings, 
  X,
  BarChart3,
  ClipboardList,
  Shield,
  Activity,
  LogOut,
  Building,
  UserCog,
  PiggyBank,
  Folder,
  ChevronDown,
  ChevronRight,
  Monitor,
  FileText,
  Info,
  Landmark,
  Store,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Award,
  Upload,
  Image
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState, useRef, useEffect } from "react"; // Added useEffect import

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
    description: "Overview and analytics"
  },
  {
    name: "Associations",
    href: "/admin/associations",
    icon: Building,
    description: "Manage farmer associations"
  },
  {
    name: "Caretakers",
    href: "/admin/caretakermanagement",
    icon: UserCog,
    description: "Manage animal caretakers",
    badge: "12"
  },
  {
    name: "Pig Records",
    href: "/admin/pigrecords",
    icon: PiggyBank,
    description: "Manage pig records",
    badge: "24"
  },
  {
    name: "MD Projects",
    href: "/admin/projects",
    icon: Folder,
    description: "Manage development projects",
    badge: "8"
  },
];

const reportsSubmenu = [
  {
    name: "Performance",
    href: "/admin/reports/performance-monitoring",
    icon: Activity,
    description: "System performance"
  },
  {
    name: "Financial",
    href: "/admin/reports/financial-reports",
    icon: BarChart3,
    description: "Financial analytics"
  },
  {
    name: "Association",
    href: "/admin/reports/association-reports",
    icon: Building,
    description: "Group reports"
  },
  {
    name: "Issues",
    href: "/admin/reports/issues-challenges",
    icon: ClipboardList,
    description: "Reported issues",
    badge: "3"
  },
  {
    name: "Ratings",
    href: "/admin/reports/ratings-summary",
    icon: Shield,
    description: "Performance ratings"
  },
];

const programMonitoringSubmenu = [
  {
    name: "Projects",
    href: "/admin/program-monitoring/project-monitoring",
    icon: ClipboardList,
    description: "Track metrics",
    badge: "5"
  },
  {
    name: "Financial",
    href: "/admin/program-monitoring/financial-records",
    icon: FileText,
    description: "Financial data"
  },
  {
    name: "General Info",
    href: "/admin/program-monitoring/general-info",
    icon: Info,
    description: "Project information"
  },
  {
    name: "Buyers",
    href: "/admin/program-monitoring/institutional-buyers",
    icon: Building,
    description: "Institutional buyers"
  },
  {
    name: "Attributes",
    href: "/admin/program-monitoring/md-attributes",
    icon: UserCheck,
    description: "MD attributes"
  },
  {
    name: "Assessment",
    href: "/admin/program-monitoring/final-assessment",
    icon: CheckCircle,
    description: "Final assessment"
  },
  {
    name: "Certification",
    href: "/admin/program-monitoring/certification",
    icon: Award,
    description: "Project certification"
  },
  {
    name: "Practices",
    href: "/admin/program-monitoring/good-practices",
    icon: CheckCircle,
    description: "Good practices"
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isProgramMonitoringOpen, setIsProgramMonitoringOpen] = useState(false);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load logo from localStorage on component mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('dswd-sidebar-logo');
    if (savedLogo) {
      setLogoImage(savedLogo);
    }
  }, []);

  // Save logo to localStorage whenever it changes
  useEffect(() => {
    if (logoImage) {
      localStorage.setItem('dswd-sidebar-logo', logoImage);
    } else {
      localStorage.removeItem('dswd-sidebar-logo');
    }
  }, [logoImage]);

  const isReportsActive = pathname.startsWith('/admin/reports');
  const isProgramMonitoringActive = pathname.startsWith('/admin/program-monitoring');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Please select an image smaller than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveLogo = () => {
    setLogoImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const NavItem = ({ item, level = 0 }: { item: any; level?: number }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 group",
          "hover:bg-gray-100 hover:text-gray-900",
          isActive 
            ? "bg-gray-100 text-gray-900 font-medium border-r-2 border-r-gray-900" 
            : "text-gray-600"
        )}
        onClick={() => onClose()}
        style={{ marginLeft: level * 12 }}
      >
        <item.icon className={cn(
          "h-4 w-4 transition-colors shrink-0",
          isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"
        )} />
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="truncate text-sm font-normal">{item.name}</span>
          {item.badge && (
            <span className={cn(
              "px-1.5 py-0.5 text-xs rounded-full font-medium min-w-[20px] text-center flex-shrink-0 ml-2",
              isActive 
                ? "bg-gray-200 text-gray-900" 
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-900"
            )}>
              {item.badge}
            </span>
          )}
        </div>
      </Link>
    );
  };

  const DropdownSection = ({ 
    title, 
    icon: Icon, 
    isOpen, 
    onToggle, 
    isActive, 
    items,
    description 
  }: { 
    title: string;
    icon: any;
    isOpen: boolean;
    onToggle: () => void;
    isActive: boolean;
    items: any[];
    description: string;
  }) => (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 group",
          "hover:bg-gray-100 hover:text-gray-900",
          isActive && "bg-gray-100 text-gray-900 font-medium"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Icon className={cn(
            "h-4 w-4 transition-colors shrink-0",
            isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"
          )} />
          <div className="flex flex-col flex-1 text-left min-w-0">
            <span className="truncate text-sm font-normal">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {items.some(item => item.badge) && (
            <span className={cn(
              "px-1.5 py-0.5 text-xs rounded-full font-medium flex-shrink-0",
              isActive 
                ? "bg-gray-200 text-gray-900" 
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-900"
            )}>
              {items.filter(item => item.badge).length}
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="h-3 w-3 text-gray-400 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-3 w-3 text-gray-400 transition-transform duration-200" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="space-y-1 ml-3 border-l border-gray-300 pl-2">
          {items.map((item) => (
            <NavItem key={item.name} item={item} level={1} />
          ))}
        </div>
      )}
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-gray-300">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Compact Header with DSWD Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-white shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo Container with Upload Option */}
          <div className="relative group">
            {logoImage ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-300">
                  <img 
                    src={logoImage} 
                    alt="DSWD Logo" 
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 leading-tight">DSWD IS</span>
                  <span className="text-xs text-gray-600 leading-tight">Information System</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={handleUploadClick}
                  title="Click to upload DSWD logo"
                >
                  <Image className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 leading-tight">DSWD IS</span>
                  <span className="text-xs text-gray-600 leading-tight">Information System</span>
                  <button 
                    onClick={handleUploadClick}
                    className="text-xs text-blue-600 hover:text-blue-800 text-left mt-1 flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    Upload Logo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-7 w-7 hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-hidden">
        <nav className="h-full overflow-y-auto px-3 py-4 space-y-1">
          {/* Main Navigation */}
          <div className="space-y-0.5">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          {/* Program Monitoring */}
          <div className="pt-2">
            <DropdownSection
              title="Program Monitoring"
              icon={Monitor}
              isOpen={isProgramMonitoringOpen}
              onToggle={() => setIsProgramMonitoringOpen(!isProgramMonitoringOpen)}
              isActive={isProgramMonitoringActive}
              items={programMonitoringSubmenu}
              description="Project tracking"
            />
          </div>

          {/* Reports & Analytics */}
          <div className="pt-2">
            <DropdownSection
              title="Reports & Analytics"
              icon={BarChart3}
              isOpen={isReportsOpen}
              onToggle={() => setIsReportsOpen(!isReportsOpen)}
              isActive={isReportsActive}
              items={reportsSubmenu}
              description="Analytics and insights"
            />
          </div>
        </nav>
      </div>
      
      {/* Compact Footer */}
      <div className="border-t border-gray-300 p-3 space-y-2 shrink-0">
        {/* Admin Status */}
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700">
            <Shield className="h-3 w-3 text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-xs font-medium text-gray-900 leading-tight">Admin User</span>
            <span className="text-xs text-gray-600 leading-tight">Administrator</span>
          </div>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        </div>
        
        {/* Version Info */}
        <div className="text-center">
          <div className="text-xs text-gray-600">
            Information System
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            v1.0.0
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-64">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}