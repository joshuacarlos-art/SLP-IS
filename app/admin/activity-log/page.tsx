"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Download, Calendar, User, Shield, Building, ArrowLeft, X, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const router = useRouter();

  // Fetch activities from API
  const fetchActivities = async (page: number = 1, loadMore: boolean = false) => {
    if (!loadMore) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterModule !== 'all' && { module: filterModule }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await fetch(`/api/activity-logs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      
      if (loadMore) {
        setActivities(prev => [...prev, ...data.activities]);
      } else {
        setActivities(data.activities);
      }
      
      setPagination(data.pagination);
      
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchActivities(1);
  }, []);

  useEffect(() => {
    if (isClient) {
      setCurrentPage(1);
      fetchActivities(1);
    }
  }, [searchTerm, filterModule, filterStatus]);

  const clearAllActivities = async () => {
    if (confirm("Are you sure you want to clear all activity logs? This action cannot be undone.")) {
      try {
        const response = await fetch('/api/activity-logs', {
          method: 'DELETE'
        });

        if (response.ok) {
          setActivities([]);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: itemsPerPage
          });
        }
      } catch (error) {
        console.error('Error clearing activities:', error);
      }
    }
  };

  const loadMoreItems = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchActivities(nextPage, true);
  };

  const getStatusBadge = (status: ActivityLog["status"]) => {
    const statusConfig = {
      success: { label: "Success", variant: "default" as const, color: "bg-green-100 text-green-800 border-green-200" },
      error: { label: "Error", variant: "destructive" as const, color: "bg-red-100 text-red-800 border-red-200" },
      warning: { label: "Warning", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const exportToCSV = () => {
    const headers = ["Timestamp", "User", "Action", "Module", "Details", "IP Address", "Status"];
    const csvData = activities.map(activity => [
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
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const uniqueModules = Array.from(new Set(activities.map(activity => activity.module)));
  const hasMoreItems = currentPage < pagination.totalPages;

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">View system activities and user actions</p>
        </div>
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Loading activity log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/dashboard')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
              <p className="text-muted-foreground">View system activities and user actions</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={clearAllActivities}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
          <Button onClick={exportToCSV} className="flex items-center gap-2" disabled={isLoading}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Filter activities by module, status, or search for specific actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search activities, users, or details..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 min-w-[150px] justify-between" disabled={isLoading}>
                  <Filter className="h-4 w-4" />
                  {filterModule === "all" ? "All Modules" : filterModule}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 overflow-y-auto">
                <DropdownMenuItem onClick={() => setFilterModule("all")}>All Modules</DropdownMenuItem>
                {uniqueModules.map(module => (
                  <DropdownMenuItem key={module} onClick={() => setFilterModule(module)}>
                    {module}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 min-w-[130px] justify-between" disabled={isLoading}>
                  <Calendar className="h-4 w-4" />
                  {filterStatus === "all" ? "All Status" : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("success")}>Success</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("error")}>Error</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("warning")}>Warning</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setFilterModule("all");
                setFilterStatus("all");
              }}
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>System Activities</CardTitle>
              <CardDescription>
                {isLoading ? "Loading activities..." : `Showing ${activities.length} of ${pagination.totalItems} activities`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Page {currentPage} of {pagination.totalPages}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && !isLoadingMore ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 mt-1 flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium text-sm">{activity.user}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{activity.module}</span>
                          {getStatusBadge(activity.status)}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(activity.timestamp)}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium text-sm capitalize">{activity.action.replace(/_/g, ' ').toLowerCase()}</p>
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
                
                {activities.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Building className="h-12 w-12 text-muted-foreground/50" />
                      <div>
                        <p className="font-medium">No activities found</p>
                        <p className="text-sm text-muted-foreground">
                          {pagination.totalItems === 0 
                            ? "Activities will appear here automatically as users perform actions" 
                            : "Try adjusting your search or filters"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {hasMoreItems && (
                <div className="flex justify-center mt-6 pt-4 border-t">
                  <Button 
                    onClick={loadMoreItems} 
                    variant="outline" 
                    disabled={isLoadingMore}
                    className="flex items-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Load More ({pagination.totalItems - activities.length} remaining)
                      </>
                    )}
                  </Button>
                </div>
              )}

              {activities.length > 0 && !hasMoreItems && (
                <div className="text-center py-4 border-t">
                  <p className="text-sm text-muted-foreground">You've reached the end of the activity log</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}