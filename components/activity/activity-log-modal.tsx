"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, X, Calendar, User, Shield, Building } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Activity log data interface
interface ActivityLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: "success" | "error" | "warning";
}

// Mock data for activity logs
const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    timestamp: new Date("2024-01-15T08:30:00"),
    user: "Joshua Carlos Gonzales",
    action: "LOGIN",
    module: "Authentication",
    details: "User logged in successfully",
    ipAddress: "192.168.1.100",
    status: "success"
  },
  {
    id: "2",
    timestamp: new Date("2024-01-15T09:15:00"),
    user: "Joshua Carlos Gonzales",
    action: "CREATE_BENEFICIARY",
    module: "Beneficiary Management",
    details: "Added new beneficiary: Maria Santos",
    ipAddress: "192.168.1.100",
    status: "success"
  },
  {
    id: "3",
    timestamp: new Date("2024-01-15T10:30:00"),
    user: "Joshua Carlos Gonzales",
    action: "UPDATE_PROFILE",
    module: "User Management",
    details: "Updated beneficiary profile: Juan Dela Cruz",
    ipAddress: "192.168.1.100",
    status: "success"
  },
  {
    id: "4",
    timestamp: new Date("2024-01-15T11:45:00"),
    user: "Joshua Carlos Gonzales",
    action: "GENERATE_REPORT",
    module: "Reports",
    details: "Generated quarterly SLP report",
    ipAddress: "192.168.1.100",
    status: "success"
  },
  {
    id: "5",
    timestamp: new Date("2024-01-15T14:20:00"),
    user: "Joshua Carlos Gonzales",
    action: "FAILED_LOGIN",
    module: "Authentication",
    details: "Failed login attempt - invalid credentials",
    ipAddress: "192.168.1.150",
    status: "error"
  },
  {
    id: "6",
    timestamp: new Date("2024-01-15T15:30:00"),
    user: "Joshua Carlos Gonzales",
    action: "EXPORT_DATA",
    module: "Data Management",
    details: "Exported beneficiary list to CSV",
    ipAddress: "192.168.1.100",
    status: "success"
  },
  {
    id: "7",
    timestamp: new Date("2024-01-15T16:45:00"),
    user: "Joshua Carlos Gonzales",
    action: "SEND_NOTIFICATION",
    module: "Notifications",
    details: "Sent bulk notification to 150 beneficiaries",
    ipAddress: "192.168.1.100",
    status: "success"
  },
  {
    id: "8",
    timestamp: new Date("2024-01-14T13:20:00"),
    user: "Maria Santos",
    action: "VIEW_BENEFICIARY",
    module: "Beneficiary Management",
    details: "Accessed beneficiary records",
    ipAddress: "192.168.1.101",
    status: "success"
  },
  {
    id: "9",
    timestamp: new Date("2024-01-14T10:15:00"),
    user: "Juan Dela Cruz",
    action: "UPDATE_PROGRAM",
    module: "Program Management",
    details: "Modified SLP program details",
    ipAddress: "192.168.1.102",
    status: "success"
  },
  {
    id: "10",
    timestamp: new Date("2024-01-13T16:30:00"),
    user: "Ana Reyes",
    action: "DELETE_RECORD",
    module: "Data Management",
    details: "Removed duplicate beneficiary entry",
    ipAddress: "192.168.1.103",
    status: "warning"
  }
];

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityLogModal({ isOpen, onClose }: ActivityLogModalProps) {
  const [activities, setActivities] = useState<ActivityLog[]>(mockActivityLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter activities based on search and filters
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.module.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = filterModule === "all" || activity.module === filterModule;
    const matchesStatus = filterStatus === "all" || activity.status === filterStatus;
    
    return matchesSearch && matchesModule && matchesStatus;
  });

  const getStatusBadge = (status: ActivityLog["status"]) => {
    const statusConfig = {
      success: { label: "Success", variant: "default" as const, color: "bg-green-100 text-green-800" },
      error: { label: "Error", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      warning: { label: "Warning", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const exportToCSV = () => {
    // Simple CSV export implementation
    const headers = ["Timestamp", "User", "Action", "Module", "Details", "IP Address", "Status"];
    const csvData = filteredActivities.map(activity => [
      formatDateTime(activity.timestamp),
      activity.user,
      activity.action,
      activity.module,
      activity.details,
      activity.ipAddress,
      activity.status.toUpperCase()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dswd-activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get unique modules for filter
  const uniqueModules = Array.from(new Set(activities.map(activity => activity.module)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">DSWD Activity Log</h2>
              <p className="text-sm text-muted-foreground">
                Track system activities and user actions
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search activities, users, or details..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Module Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 min-w-[150px] justify-between">
                  <Filter className="h-4 w-4" />
                  {filterModule === "all" ? "All Modules" : filterModule}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 overflow-y-auto">
                <DropdownMenuItem onClick={() => setFilterModule("all")}>
                  All Modules
                </DropdownMenuItem>
                {uniqueModules.map(module => (
                  <DropdownMenuItem 
                    key={module} 
                    onClick={() => setFilterModule(module)}
                  >
                    {module}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 min-w-[130px] justify-between">
                  <Calendar className="h-4 w-4" />
                  {filterStatus === "all" ? "All Status" : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("success")}>
                  Success
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("error")}>
                  Error
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("warning")}>
                  Warning
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Button */}
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Activity Log List */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 mt-1 flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-sm">{activity.user}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {activity.module}
                        </span>
                        {getStatusBadge(activity.status)}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(activity.timestamp)}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-medium text-sm capitalize">
                        {activity.action.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>IP: {activity.ipAddress}</span>
                      <span>•</span>
                      <span>ID: {activity.id}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredActivities.length === 0 && (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Building className="h-12 w-12 text-muted-foreground/50" />
                    <div>
                      <p className="font-medium">No activities found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center p-6 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {filteredActivities.length} of {activities.length} activities
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterModule("all");
              setFilterStatus("all");
            }}>
              Clear Filters
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}