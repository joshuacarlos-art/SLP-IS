"use client";

import { useState, useEffect } from 'react';
import { useInstitutionalBuyers } from '@/hooks/useInstitutionalBuyers';
import { InstitutionalBuyer, BuyerType, BuyerStatus, BuyerFormData } from '@/types/institutionalBuyers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Building,
  Users,
  Phone,
  Mail,
  MapPin,
  User,
  RefreshCw,
  FileText,
  ChevronDown,
  BarChart3,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
  X,
  Clock,
  Activity
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';

// Activity logging functions
const logActivity = async (
  module: string,
  action: string,
  details: string,
  status: 'success' | 'error' | 'warning' = 'success',
  metadata?: Record<string, any>
) => {
  try {
    const response = await fetch('/api/activity-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        module,
        action,
        details,
        status,
        metadata
      }),
    });

    if (!response.ok) {
      console.error('Failed to log activity');
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

const InstitutionalBuyersPage = () => {
  const {
    buyers,
    stats,
    loading,
    connectionError,
    fetchData,
    createBuyer,
    updateBuyer,
    deleteBuyer,
  } = useInstitutionalBuyers();

  const [showForm, setShowForm] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<InstitutionalBuyer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<BuyerType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<BuyerStatus | 'all'>('all');
  const [formData, setFormData] = useState<BuyerFormData>({
    buyer_name: '',
    contact_person: '',
    contact_number: '',
    email: '',
    type: 'corporate',
    address: '',
    status: 'draft'
  });

  const router = useRouter();

  useEffect(() => {
    // Log page access
    logActivity(
      'Institutional Buyers',
      'PAGE_ACCESS',
      'Accessed institutional buyers management page'
    );
    fetchData();
  }, [fetchData]);

  // Filter buyers based on search and filters
  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = 
      buyer.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.buyer_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || buyer.type === filterType;
    const matchesStatus = filterStatus === 'all' || buyer.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBuyer) {
        // Log edit attempt
        await logActivity(
          'Institutional Buyers',
          'UPDATE_BUYER_ATTEMPT',
          `Attempting to update buyer: ${formData.buyer_name}`,
          'success',
          {
            buyerId: editingBuyer.buyer_id,
            buyerName: formData.buyer_name,
            previousStatus: editingBuyer.status,
            newStatus: formData.status
          }
        );

        const result = await updateBuyer(editingBuyer.buyer_id, formData);
        
        if (result.success) {
          await logActivity(
            'Institutional Buyers',
            'UPDATE_BUYER_SUCCESS',
            `Successfully updated buyer: ${formData.buyer_name}`,
            'success',
            {
              buyerId: editingBuyer.buyer_id,
              buyerName: formData.buyer_name,
              status: formData.status,
              changes: {
                name: formData.buyer_name !== editingBuyer.buyer_name,
                contact: formData.contact_person !== editingBuyer.contact_person,
                status: formData.status !== editingBuyer.status
              }
            }
          );
        }
      } else {
        // Log creation attempt
        await logActivity(
          'Institutional Buyers',
          'CREATE_BUYER_ATTEMPT',
          `Attempting to create new buyer: ${formData.buyer_name}`,
          'success',
          {
            buyerName: formData.buyer_name,
            type: formData.type,
            status: formData.status
          }
        );

        const result = await createBuyer({
          ...formData,
          status: 'draft'
        });
        
        if (result.success) {
          await logActivity(
            'Institutional Buyers',
            'CREATE_BUYER_SUCCESS',
            `Successfully created new buyer: ${formData.buyer_name}`,
            'success',
            {
              buyerId: result.buyerId,
              buyerName: formData.buyer_name,
              type: formData.type,
              status: 'draft'
            }
          );
        }
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving buyer:', error);
      
      // Log error
      await logActivity(
        'Institutional Buyers',
        editingBuyer ? 'UPDATE_BUYER_ERROR' : 'CREATE_BUYER_ERROR',
        `Failed to ${editingBuyer ? 'update' : 'create'} buyer: ${formData.buyer_name}`,
        'error',
        {
          buyerName: formData.buyer_name,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
    }
  };

  const handleEdit = (buyer: InstitutionalBuyer) => {
    setEditingBuyer(buyer);
    setFormData({
      buyer_name: buyer.buyer_name,
      contact_person: buyer.contact_person,
      contact_number: buyer.contact_number,
      email: buyer.email,
      type: buyer.type,
      address: buyer.address || '',
      status: buyer.status
    });
    setShowForm(true);

    // Log edit view
    logActivity(
      'Institutional Buyers',
      'VIEW_EDIT_BUYER',
      `Viewing buyer details for editing: ${buyer.buyer_name}`,
      'success',
      {
        buyerId: buyer.buyer_id,
        buyerName: buyer.buyer_name,
        status: buyer.status
      }
    );
  };

  const handleDelete = async (buyerId: string) => {
    const buyer = buyers.find(b => b.buyer_id === buyerId);
    
    if (confirm(`Are you sure you want to delete ${buyer?.buyer_name}?`)) {
      try {
        // Log delete attempt
        await logActivity(
          'Institutional Buyers',
          'DELETE_BUYER_ATTEMPT',
          `Attempting to delete buyer: ${buyer?.buyer_name}`,
          'warning',
          {
            buyerId,
            buyerName: buyer?.buyer_name
          }
        );

        const result = await deleteBuyer(buyerId);
        
        if (result.success) {
          await logActivity(
            'Institutional Buyers',
            'DELETE_BUYER_SUCCESS',
            `Successfully deleted buyer: ${buyer?.buyer_name}`,
            'success',
            {
              buyerId,
              buyerName: buyer?.buyer_name,
              type: buyer?.type,
              status: buyer?.status
            }
          );
        }
        
        fetchData();
      } catch (error) {
        console.error('Error deleting buyer:', error);
        
        // Log delete error
        await logActivity(
          'Institutional Buyers',
          'DELETE_BUYER_ERROR',
          `Failed to delete buyer: ${buyer?.buyer_name}`,
          'error',
          {
            buyerId,
            buyerName: buyer?.buyer_name,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      buyer_name: '',
      contact_person: '',
      contact_number: '',
      email: '',
      type: 'corporate',
      address: '',
      status: 'draft'
    });
    setEditingBuyer(null);
    setShowForm(false);
  };

  const handleRefreshData = async () => {
    await logActivity(
      'Institutional Buyers',
      'MANUAL_REFRESH',
      'Manually refreshed institutional buyers data'
    );
    await fetchData();
  };

  const handleExportData = async () => {
    try {
      await logActivity(
        'Institutional Buyers',
        'EXPORT_DATA',
        'Exported institutional buyers data to CSV',
        'success',
        {
          recordCount: buyers.length,
          filters: {
            search: searchTerm,
            type: filterType,
            status: filterStatus
          }
        }
      );
      
      // Simple CSV export implementation
      const headers = ["Buyer ID", "Company Name", "Contact Person", "Contact Number", "Email", "Type", "Status", "Address", "Created Date"];
      const csvData = buyers.map(buyer => [
        buyer.buyer_id,
        buyer.buyer_name,
        buyer.contact_person,
        buyer.contact_number,
        buyer.email,
        buyer.type,
        buyer.status,
        buyer.address || '',
        new Date(buyer.createdAt).toLocaleDateString()
      ]);
      
      const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `institutional-buyers-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      
      await logActivity(
        'Institutional Buyers',
        'EXPORT_ERROR',
        'Failed to export institutional buyers data',
        'error',
        {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.trim()) {
      await logActivity(
        'Institutional Buyers',
        'SEARCH_BUYERS',
        `Searched for buyers: "${term}"`,
        'success',
        {
          searchTerm: term,
          resultsCount: filteredBuyers.length
        }
      );
    }
  };

  const handleFilterChange = async (filterType: string, value: string) => {
    if (filterType === 'type') {
      setFilterType(value as BuyerType | 'all');
    } else if (filterType === 'status') {
      setFilterStatus(value as BuyerStatus | 'all');
    }

    if (value !== 'all') {
      await logActivity(
        'Institutional Buyers',
        'FILTER_BUYERS',
        `Applied ${filterType} filter: ${value}`,
        'success',
        {
          filterType,
          filterValue: value,
          resultsCount: filteredBuyers.length
        }
      );
    }
  };

  const getStatusColor = (status: BuyerStatus) => {
    switch (status) {
      case 'active':
        return "bg-green-50 text-green-700 border-green-200";
      case 'draft':
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: BuyerStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'draft':
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getTypeIcon = (type: BuyerType) => {
    const icons = {
      corporate: <Building className="h-3 w-3" />,
      government: <Building className="h-3 w-3" />,
      educational: <Users className="h-3 w-3" />,
      healthcare: <Users className="h-3 w-3" />,
      retail: <Building className="h-3 w-3" />,
      other: <Building className="h-3 w-3" />,
    };
    return icons[type];
  };

  const formatDate = (dateString: Date) => 
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Calculate statistics based on current data
  const activeBuyers = buyers.filter(buyer => buyer.status === 'active').length;
  const draftBuyers = buyers.filter(buyer => buyer.status === 'draft').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Loading institutional buyers</p>
            <p className="text-gray-600 text-sm">Please wait while we load your buyers data</p>
          </div>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-red-900">Connection Error</h3>
                  <p className="text-red-700">{connectionError}</p>
                </div>
                <Button 
                  onClick={fetchData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Institutional Buyers</h1>
            <p className="text-gray-600">Manage corporate, government, and institutional buyers</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
           <Button 
  variant="outline"
  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
>
  <FileText className="h-4 w-4" />
  Export Data
</Button>
<Button 
  variant="outline"
  onClick={handleRefreshData}
  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
>
  <RefreshCw className="h-4 w-4" />
  Refresh
</Button>
<Button 
  variant="outline"
  onClick={() => setShowForm(true)}
  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
>
  <Plus className="h-4 w-4" />
  Add New Buyer
</Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Buyers</CardTitle>
              <Building className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{buyers.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                All institutional buyers
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Buyers</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activeBuyers}</div>
              <p className="text-xs text-gray-600 mt-1">
                Currently active
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Draft Buyers</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{draftBuyers}</div>
              <p className="text-xs text-gray-600 mt-1">
                Pending activation
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Buyer Types</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{new Set(buyers.map(buyer => buyer.type)).size}</div>
              <p className="text-xs text-gray-600 mt-1">Different categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Buyer Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBuyer ? 'Edit Buyer' : 'Add New Buyer'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                  className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Company Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.buyer_name}
                        onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                        className="w-full"
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Contact Person *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.contact_person}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        className="w-full"
                        placeholder="Enter contact person name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Contact Number *
                      </label>
                      <Input
                        type="tel"
                        required
                        value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                        className="w-full"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Type *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as BuyerType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors"
                      >
                        <option value="corporate">Corporate</option>
                        <option value="government">Government</option>
                        <option value="educational">Educational</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="retail">Retail</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as BuyerStatus })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors"
                        disabled={!editingBuyer}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                      </select>
                      {!editingBuyer && (
                        <p className="text-xs text-gray-500 mt-1">
                          New buyers are created as draft by default
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      placeholder="Enter company address"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {editingBuyer ? 'Update Buyer' : 'Create Buyer'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl text-gray-900">Buyer Management</CardTitle>
                <CardDescription className="text-gray-600">
                  Managing {filteredBuyers.length} institutional buyers
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search buyers..."
                    className="pl-10 w-full sm:w-64 bg-gray-50 border-gray-200"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
                        <Filter className="h-4 w-4" />
                        Type
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleFilterChange('type', 'all')}>All Types</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('type', 'corporate')}>Corporate</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('type', 'government')}>Government</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('type', 'educational')}>Educational</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('type', 'healthcare')}>Healthcare</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('type', 'retail')}>Retail</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('type', 'other')}>Other</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
                        <Filter className="h-4 w-4" />
                        Status
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleFilterChange('status', 'all')}>All Status</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('status', 'active')}>Active</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange('status', 'draft')}>Draft</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableHead className="py-4 font-semibold text-gray-700">Company</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Contact</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Location</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Created</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuyers.map((buyer) => (
                    <TableRow key={buyer._id} className="border-gray-200 hover:bg-gray-50 group">
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                            {buyer.buyer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {buyer.buyer_id}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <User className="h-3 w-3" />
                            {buyer.contact_person}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="h-3 w-3" />
                            {buyer.contact_number}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="h-3 w-3" />
                            {buyer.email}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        <Badge 
                          variant="outline" 
                          className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-200 capitalize"
                        >
                          {getTypeIcon(buyer.type)}
                          {buyer.type}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        {buyer.address ? (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">{buyer.address}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No address</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="py-4">
                        <Badge 
                          variant="outline" 
                          className={`flex items-center gap-1.5 font-medium ${getStatusColor(buyer.status)}`}
                        >
                          {getStatusIcon(buyer.status)}
                          {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(buyer.createdAt)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(buyer)}
                            className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            title="Edit Buyer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(buyer.buyer_id)}
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Buyer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredBuyers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2"><Building className="h-12 w-12 mx-auto" /></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No buyers found</h3>
                <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                    ? "No buyers match your current filters. Try adjusting your search criteria."
                    : "Get started by adding your first institutional buyer to manage their information."
                  }
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setFilterStatus('all');
                    if (buyers.length === 0) setShowForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {buyers.length === 0 ? 'Add Your First Buyer' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstitutionalBuyersPage;