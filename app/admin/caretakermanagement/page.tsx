// app/admin/caretakermanagement/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  CaretakerCard, 
  AssessmentModal, 
  CaretakerFilters, 
  CaretakerStats,
  AddCaretakerModal
} from '@/components/caretaker';
import type { 
  Caretaker, 
  PerformanceAssessment, 
  AssessmentSummary,
  CaretakerFormData 
} from '@/components/caretaker/types';
import { getFullName } from '@/components/caretaker/types';
import { 
  logSuccess, 
  logError, 
  logWarning,
  logCaretakerCreate,
  logCaretakerDelete,
  logAssessmentCreate
} from '@/lib/activity/activity-logger';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// QR Code
import { QRCodeSVG } from 'qrcode.react';

// Icons
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Calendar, 
  Users, 
  Target, 
  TrendingUp,
  Building,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  MapPin,
  User,
  RefreshCw,
  FileText,
  DollarSign,
  Calculator,
  ArrowRight,
  Archive,
  Edit,
  Phone,
  Mail,
  Map,
  Trash2,
  MoreVertical,
  UserPlus,
  Star,
  Activity,
  Shield,
  PlusCircle,
  X,
  QrCode,
  Copy,
  Smartphone,
  ExternalLink,
  Printer,
  Check,
  AlertCircle,
  Info,
  ShieldCheck,
  Key,
  UserCheck,
  Hash,
  Building2,
  MailCheck,
  PhoneCall
} from 'lucide-react';

// Extended interfaces to include missing properties
interface ExtendedCaretakerFormData extends CaretakerFormData {
  phone?: string;
  contactNumber?: string;
}

interface ExtendedCaretaker extends Caretaker {
  phone?: string;
  contactNumber?: string;
}

// Interface for new assessment form
interface NewAssessmentFormData {
  rating: number;
  categories: {
    punctuality: number;
    communication: number;
    patientCare: number;
    professionalism: number;
    technicalSkills: number;
  };
  assessmentDate: string;
  assessedBy: string;
  comments: string;
}

// Interface for QR code data
interface CaretakerQRData {
  type: 'caretaker-registration';
  version: '1.0';
  caretakerId: string;
  caretakerName: string;
  caretakerEmail: string;
  associationId?: string;
  associationName?: string;
  registrationUrl: string;
  registrationEndpoint: string;
  timestamp: string;
  expiresAt: string;
  securityHash: string;
}

// Simple rating component to replace slider
const RatingInput = ({ 
  value, 
  onChange,
  label 
}: { 
  value: number; 
  onChange: (value: number) => void;
  label?: string;
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = (newValue: number) => {
    onChange(newValue);
  };

  const handleMouseEnter = (newValue: number) => {
    setHoverValue(newValue);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <span className="text-sm font-medium text-gray-700">
            {displayValue.toFixed(1)}/5.0
          </span>
        </div>
      )}
      
      {/* Star Rating */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`p-1 transition-all hover:scale-110 ${
              star <= displayValue ? 'text-yellow-500' : 'text-gray-300'
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            title={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star className={`h-6 w-6 ${star <= displayValue ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
      
      {/* Number Input as alternative */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex-1">
          <Input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={value}
            onChange={(e) => onChange(Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)))}
            className="w-full"
          />
        </div>
        <div className="text-sm font-medium min-w-12 text-center">
          {value.toFixed(1)}/5
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 pt-2">
        <span>Poor</span>
        <span>Fair</span>
        <span>Good</span>
        <span>Very Good</span>
        <span>Excellent</span>
      </div>
    </div>
  );
};

// QR Code Generator Component
const QRCodeGenerator = ({ 
  caretaker,
  onClose 
}: { 
  caretaker: ExtendedCaretaker;
  onClose: () => void;
}) => {
  const [qrData, setQRData] = useState<CaretakerQRData | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('qr');

  // Generate security hash
  const generateSecurityHash = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  };

  useEffect(() => {
    // Generate QR data when caretaker changes
    const generateQRData = () => {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://caretaker-system.com';
      const registrationEndpoint = '/api/auth/caretaker/register';
      const registrationUrl = `${baseUrl}${registrationEndpoint}?caretakerId=${caretaker.id}&token=${Date.now()}`;
      
      const dataString = `${caretaker.id}-${getFullName(caretaker)}-${Date.now()}`;
      const securityHash = generateSecurityHash(dataString);
      
      const qrData: CaretakerQRData = {
        type: 'caretaker-registration',
        version: '1.0',
        caretakerId: caretaker.id!,
        caretakerName: getFullName(caretaker),
        caretakerEmail: caretaker.email || `${caretaker.firstName.toLowerCase()}.${caretaker.lastName.toLowerCase()}@care.com`,
        associationId: caretaker.slpAssociation,
        associationName: caretaker.slpAssociation || 'Independent',
        registrationUrl: registrationUrl,
        registrationEndpoint: registrationEndpoint,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        securityHash: securityHash
      };
      
      setQRData(qrData);
      
      // Log QR code generation
      logSuccess(
        'Caretaker Management',
        'QR_CODE_GENERATED',
        `Generated unique QR code for ${getFullName(caretaker)}`,
        undefined,
        {
          caretakerId: caretaker.id,
          caretakerName: getFullName(caretaker),
          securityHash: securityHash,
          expiresAt: qrData.expiresAt
        }
      );
    };
    
    generateQRData();
  }, [caretaker]);

  const downloadQRCode = () => {
    if (!qrData) return;
    
    setDownloading(true);
    
    try {
      const svg = document.getElementById(`qr-code-${caretaker.id}`);
      if (!svg) throw new Error('QR Code SVG not found');
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        const fileName = `caretaker-registration-${caretaker.id}-${getFullName(caretaker).replace(/\s+/g, '-').toLowerCase()}.png`;
        downloadLink.download = fileName;
        downloadLink.href = pngFile;
        downloadLink.click();
        
        // Log download
        logSuccess(
          'Caretaker Management',
          'QR_CODE_DOWNLOADED',
          `Downloaded QR code for ${getFullName(caretaker)}`,
          undefined,
          {
            caretakerId: caretaker.id,
            fileName: fileName,
            format: 'PNG'
          }
        );
        
        setDownloading(false);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      setDownloading(false);
      alert('Failed to download QR code. Please try again.');
    }
  };

  const copyRegistrationLink = () => {
    if (!qrData) return;
    
    navigator.clipboard.writeText(qrData.registrationUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      logSuccess(
        'Caretaker Management',
        'REGISTRATION_LINK_COPIED',
        `Copied registration link for ${getFullName(caretaker)}`,
        undefined,
        {
          caretakerId: caretaker.id,
          url: qrData.registrationUrl
        }
      );
    });
  };

  const printQRCode = () => {
    const printContent = document.getElementById(`qr-print-${caretaker.id}`);
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print QR code');
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${getFullName(caretaker)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { text-align: center; max-width: 600px; margin: 0 auto; }
            .header { margin-bottom: 30px; }
            .qr-code { margin: 20px 0; }
            .info { margin-top: 30px; font-size: 14px; color: #666; }
            .instructions { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Caretaker Registration QR Code</h1>
              <h2>${getFullName(caretaker)}</h2>
              <p>ID: ${caretaker.id}</p>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="qr-code">
              ${new XMLSerializer().serializeToString(document.getElementById(`qr-code-${caretaker.id}`)!)}
            </div>
            <div class="instructions">
              <h3>Instructions:</h3>
              <p>1. Scan this QR code with the Caretaker Mobile App</p>
              <p>2. Follow the registration steps in the app</p>
              <p>3. Enter your email and create a password</p>
            </div>
            <div class="info">
              <p>This QR code is unique to ${getFullName(caretaker)} and expires on ${new Date(qrData!.expiresAt).toLocaleDateString()}</p>
            </div>
          </div>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    logSuccess(
      'Caretaker Management',
      'QR_CODE_PRINTED',
      `Printed QR code for ${getFullName(caretaker)}`,
      undefined,
      {
        caretakerId: caretaker.id,
        caretakerName: getFullName(caretaker)
      }
    );
  };

  if (!qrData) {
    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Loading QR Code...
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2">
          <QrCode className="h-6 w-6 text-blue-600" />
          Unique Registration QR Code
        </DialogTitle>
        <DialogDescription>
          Unique QR code for {getFullName(caretaker)} - Scan with mobile app to register
        </DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Caretaker Details
          </TabsTrigger>
          <TabsTrigger value="instructions" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Instructions
          </TabsTrigger>
        </TabsList>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code Display */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Scan This Code
                </CardTitle>
                <CardDescription>
                  Unique to {getFullName(caretaker)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="bg-white p-6 rounded-xl border-4 border-blue-100 shadow-lg" id={`qr-print-${caretaker.id}`}>
                    <QRCodeSVG
                      id={`qr-code-${caretaker.id}`}
                      value={JSON.stringify(qrData)}
                      size={280}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#1e40af"
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Unique to {getFullName(caretaker)}</span>
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        <code className="text-xs">ID: {caretaker.id}</code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={downloadQRCode}
                    disabled={downloading}
                    className="w-full justify-start gap-3"
                    variant="outline"
                  >
                    <Download className="h-4 w-4" />
                    {downloading ? 'Downloading...' : 'Download PNG'}
                  </Button>
                  
                  <Button 
                    onClick={printQRCode}
                    className="w-full justify-start gap-3"
                    variant="outline"
                  >
                    <Printer className="h-4 w-4" />
                    Print QR Code
                  </Button>
                  
                  <Button 
                    onClick={copyRegistrationLink}
                    className="w-full justify-start gap-3"
                    variant="outline"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Registration Link
                      </>
                    )}
                  </Button>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">QR Code Information:</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Generated:</span>
                        <span className="font-medium">
                          {new Date(qrData.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Expires:</span>
                        <span className="font-medium">
                          {new Date(qrData.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Security Hash:</span>
                        <code className="font-mono">{qrData.securityHash}</code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Caretaker Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Caretaker Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <Label className="text-gray-500">Full Name</Label>
                    </div>
                    <div className="text-lg font-semibold">
                      {getFullName(caretaker)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <Label className="text-gray-500">Caretaker ID</Label>
                    </div>
                    <div className="font-mono font-medium text-blue-600">
                      {caretaker.id}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <Label className="text-gray-500">Association</Label>
                    </div>
                    <div className="font-medium">
                      {caretaker.slpAssociation || 'Independent'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label className="text-gray-500">Registration Email</Label>
                    </div>
                    <div className="font-medium">
                      {qrData.caretakerEmail}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <Label className="text-gray-500">Date Started</Label>
                    </div>
                    <div className="font-medium">
                      {caretaker.dateStarted ? new Date(caretaker.dateStarted).toLocaleDateString() : 'Not set'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-gray-500" />
                      <Label className="text-gray-500">Status</Label>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`font-medium ${
                        caretaker.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        caretaker.status === 'on-leave' || caretaker.status === 'on_leave' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {caretaker.status ? caretaker.status.replace('-', ' ').replace('_', ' ').charAt(0).toUpperCase() + caretaker.status.slice(1).replace('-', ' ').replace('_', ' ') : 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Data Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Key className="h-5 w-5" />
                Registration Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-700">Registration URL</Label>
                    <div className="text-sm bg-white p-3 rounded border break-all">
                      {qrData.registrationUrl}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-blue-700">Security Hash</Label>
                    <div className="font-mono text-sm bg-white p-3 rounded border">
                      {qrData.securityHash}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-gray-500">Version</div>
                    <div className="font-medium">{qrData.version}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-gray-500">Generated</div>
                    <div className="font-medium">
                      {new Date(qrData.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-gray-500">Expires</div>
                    <div className="font-medium">
                      {new Date(qrData.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instructions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Registration Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3 text-center">
                    <div className="bg-blue-100 text-blue-800 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
                      <span className="font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Scan QR Code</h4>
                      <p className="text-sm text-gray-600">
                        Open the Caretaker Mobile App and tap "Register with QR Code"
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-center">
                    <div className="bg-blue-100 text-blue-800 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
                      <span className="font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Enter Details</h4>
                      <p className="text-sm text-gray-600">
                        The app will auto-fill your information. Verify and enter your email
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-center">
                    <div className="bg-blue-100 text-blue-800 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
                      <span className="font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Create Password</h4>
                      <p className="text-sm text-gray-600">
                        Create a secure password and complete registration
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-yellow-800">Important Notes</h4>
                      <ul className="space-y-1 text-sm text-yellow-700">
                        <li>• This QR code is unique to {getFullName(caretaker)} only</li>
                        <li>• QR code expires on {new Date(qrData.expiresAt).toLocaleDateString()}</li>
                        <li>• Do not share this QR code with anyone else</li>
                        <li>• Each caretaker must use their own unique QR code</li>
                        <li>• After scanning, caretaker will be redirected to registration page</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800">Technical Information</h4>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li>• QR Code Type: {qrData.type}</li>
                        <li>• Security: Encrypted with SHA-256 hash</li>
                        <li>• Registration Endpoint: {qrData.registrationEndpoint}</li>
                        <li>• Mobile App Required: Caretaker Mobile App v2.0+</li>
                        <li>• Support: Contact admin if QR code doesn't work</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DialogFooter className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
        <Button
          onClick={() => setActiveTab('qr')}
          variant="outline"
          className="flex-1"
        >
          <QrCode className="h-4 w-4 mr-2" />
          View QR Code
        </Button>
        <Button
          onClick={downloadQRCode}
          disabled={downloading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {downloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default function CaretakerManagementPage() {
  const [caretakers, setCaretakers] = useState<ExtendedCaretaker[]>([]);
  const [assessments, setAssessments] = useState<PerformanceAssessment[]>([]);
  const [selectedCaretaker, setSelectedCaretaker] = useState<ExtendedCaretaker | null>(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for assessment creation
  const [isCreateAssessmentModalOpen, setIsCreateAssessmentModalOpen] = useState(false);
  const [selectedCaretakerForAssessment, setSelectedCaretakerForAssessment] = useState<ExtendedCaretaker | null>(null);
  const [newAssessment, setNewAssessment] = useState<NewAssessmentFormData>({
    rating: 3.0,
    categories: {
      punctuality: 3.0,
      communication: 3.0,
      patientCare: 3.0,
      professionalism: 3.0,
      technicalSkills: 3.0
    },
    assessmentDate: new Date().toISOString().split('T')[0],
    assessedBy: '',
    comments: ''
  });
  const [creatingAssessment, setCreatingAssessment] = useState(false);

  // QR Code state
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedCaretakerForQR, setSelectedCaretakerForQR] = useState<ExtendedCaretaker | null>(null);

  // Log page access
  useEffect(() => {
    const logPageAccess = async () => {
      try {
        await logSuccess(
          'Caretaker Management',
          'PAGE_ACCESS',
          'Accessed caretaker management page'
        );
      } catch (error) {
        console.error('Failed to log page access:', error);
      }
    };

    logPageAccess();
  }, []);

  // Fetch caretakers and assessments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        // Log fetch start
        await logSuccess(
          'Caretaker Management',
          'FETCH_DATA_START',
          'Started fetching caretakers and assessments data'
        );

        // Fetch caretakers
        const caretakersResponse = await fetch('/api/caretakers');
        if (!caretakersResponse.ok) {
          throw new Error(`Failed to fetch caretakers: ${caretakersResponse.status}`);
        }
        const caretakersData = await caretakersResponse.json();
        setCaretakers(caretakersData);

        // Log successful caretakers fetch
        await logSuccess(
          'Caretaker Management',
          'FETCH_CARETAKERS_SUCCESS',
          `Successfully loaded ${caretakersData.length} caretakers`,
          undefined,
          { caretakerCount: caretakersData.length }
        );

        // Fetch assessments - handle 404 gracefully
        try {
          const assessmentsResponse = await fetch('/api/performance/assessments');
          if (assessmentsResponse.ok) {
            const assessmentsData = await assessmentsResponse.json();
            setAssessments(assessmentsData);
            
            // Log successful assessments fetch
            await logSuccess(
              'Caretaker Management',
              'FETCH_ASSESSMENTS_SUCCESS',
              `Successfully loaded ${assessmentsData.length} assessments`,
              undefined,
              { assessmentCount: assessmentsData.length }
            );
          } else if (assessmentsResponse.status === 404) {
            // Assessments API not implemented yet, use empty array
            console.log('Assessments API not available, using empty array');
            setAssessments([]);
            
            await logWarning(
              'Caretaker Management',
              'ASSESSMENTS_API_NOT_FOUND',
              'Assessments API endpoint not available, using empty assessments array'
            );
          } else {
            throw new Error(`Failed to fetch assessments: ${assessmentsResponse.status}`);
          }
        } catch (assessmentsError) {
          console.warn('Could not fetch assessments:', assessmentsError);
          setAssessments([]); // Use empty array if assessments fail
          
          await logWarning(
            'Caretaker Management',
            'FETCH_ASSESSMENTS_FAILED',
            'Failed to fetch assessments, using empty array',
            undefined,
            { error: assessmentsError instanceof Error ? assessmentsError.message : 'Unknown error' }
          );
        }

        // Log overall success
        await logSuccess(
          'Caretaker Management',
          'FETCH_DATA_COMPLETE',
          'Successfully completed loading all caretaker management data'
        );

      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
        setError(errorMessage);
        
        // Log error
        await logError(
          'Caretaker Management',
          'FETCH_DATA_ERROR',
          errorMessage
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCaretakers = useMemo(() => {
    return caretakers.filter(caretaker => {
      const fullName = getFullName(caretaker);
      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (caretaker.id && caretaker.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (caretaker.email && caretaker.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || caretaker.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [caretakers, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = caretakers.length;
    const active = caretakers.filter(c => c.status === 'active').length;
    const onLeave = caretakers.filter(c => c.status === 'on-leave' || c.status === 'on_leave').length;
    const inactive = caretakers.filter(c => c.status === 'inactive').length;

    return { total, active, onLeave, inactive };
  }, [caretakers]);

  // Function to update association member count
  const updateAssociationMemberCount = async (associationId: string, change: number) => {
    try {
      // First, get the current association data
      const associationResponse = await fetch(`/api/associations/id?id=${associationId}`);
      if (!associationResponse.ok) {
        console.warn('Association not found:', associationId);
        
        await logWarning(
          'Caretaker Management',
          'ASSOCIATION_NOT_FOUND',
          `Association ${associationId} not found while updating member count`,
          undefined,
          { associationId, change }
        );
        return;
      }
      
      const association = await associationResponse.json();
      
      // Calculate new active members count
      const currentActiveMembers = association.no_active_members || 0;
      const newActiveMembers = Math.max(0, currentActiveMembers + change);
      
      // Determine new status
      let newStatus = association.status;
      if (newActiveMembers === 0 && association.status === 'active') {
        newStatus = 'inactive'; // Change to inactive if no members left
      } else if (newActiveMembers > 0 && association.status === 'inactive') {
        newStatus = 'active'; // Change to active if first member added
      }
      
      // Update the association
      const updateResponse = await fetch(`/api/associations/id?id=${associationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...association,
          no_active_members: newActiveMembers,
          status: newStatus
        }),
      });

      if (!updateResponse.ok) {
        console.warn('Failed to update association member count');
        
        await logError(
          'Caretaker Management',
          'UPDATE_ASSOCIATION_MEMBER_COUNT_FAILED',
          `Failed to update member count for association ${associationId}`,
          undefined,
          { associationId, change, newActiveMembers }
        );
      } else {
        console.log(`Association ${associationId} member count updated: ${newActiveMembers} active members`);
        
        await logSuccess(
          'Caretaker Management',
          'UPDATE_ASSOCIATION_MEMBER_COUNT',
          `Updated association ${association.name} member count to ${newActiveMembers}`,
          undefined,
          { 
            associationId, 
            associationName: association.name,
            previousCount: currentActiveMembers,
            newCount: newActiveMembers,
            change,
            newStatus 
          }
        );
      }
    } catch (error) {
      console.error('Error updating association member count:', error);
      
      await logError(
        'Caretaker Management',
        'UPDATE_ASSOCIATION_MEMBER_COUNT_ERROR',
        `Error updating association member count: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        { associationId, change }
      );
    }
  };

  const calculateAssessmentSummary = (caretakerId: string): AssessmentSummary => {
    const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
    
    if (caretakerAssessments.length === 0) {
      return {
        averageRating: 0,
        totalAssessments: 0,
        categoryAverages: {
          punctuality: 0,
          communication: 0,
          patientCare: 0,
          professionalism: 0,
          technicalSkills: 0
        },
        performanceLevel: 'No Data'
      };
    }

    const totalRating = caretakerAssessments.reduce((sum, a) => sum + a.rating, 0);
    const averageRating = totalRating / caretakerAssessments.length;

    const categorySums = {
      punctuality: 0,
      communication: 0,
      patientCare: 0,
      professionalism: 0,
      technicalSkills: 0
    };

    caretakerAssessments.forEach(assessment => {
      const categories = assessment.categories || {
        punctuality: assessment.rating,
        communication: assessment.rating,
        patientCare: assessment.rating,
        professionalism: assessment.rating,
        technicalSkills: assessment.rating
      };

      categorySums.punctuality += categories.punctuality;
      categorySums.communication += categories.communication;
      categorySums.patientCare += categories.patientCare;
      categorySums.professionalism += categories.professionalism;
      categorySums.technicalSkills += categories.technicalSkills;
    });

    const categoryAverages = {
      punctuality: categorySums.punctuality / caretakerAssessments.length,
      communication: categorySums.communication / caretakerAssessments.length,
      patientCare: categorySums.patientCare / caretakerAssessments.length,
      professionalism: categorySums.professionalism / caretakerAssessments.length,
      technicalSkills: categorySums.technicalSkills / caretakerAssessments.length
    };

    const performanceLevel = averageRating >= 4.5 ? 'Excellent' :
                           averageRating >= 4.0 ? 'Very Good' :
                           averageRating >= 3.5 ? 'Good' :
                           averageRating >= 3.0 ? 'Satisfactory' : 'Needs Improvement';

    return {
      averageRating,
      totalAssessments: caretakerAssessments.length,
      categoryAverages,
      performanceLevel
    };
  };

  // NEW FUNCTION: Handle creating a new assessment
  const handleCreateAssessment = async (caretaker: ExtendedCaretaker) => {
    setSelectedCaretakerForAssessment(caretaker);
    
    // Reset form
    setNewAssessment({
      rating: 3.0,
      categories: {
        punctuality: 3.0,
        communication: 3.0,
        patientCare: 3.0,
        professionalism: 3.0,
        technicalSkills: 3.0
      },
      assessmentDate: new Date().toISOString().split('T')[0],
      assessedBy: '',
      comments: ''
    });
    
    setIsCreateAssessmentModalOpen(true);
  };

  // NEW FUNCTION: Save the new assessment
  const handleSaveAssessment = async () => {
    if (!selectedCaretakerForAssessment) return;

    try {
      setCreatingAssessment(true);
      setError(null);

      // Log assessment creation attempt
      await logSuccess(
        'Caretaker Management',
        'CREATE_ASSESSMENT_ATTEMPT',
        `Creating assessment for ${getFullName(selectedCaretakerForAssessment)}`,
        undefined,
        {
          caretakerId: selectedCaretakerForAssessment.id,
          caretakerName: getFullName(selectedCaretakerForAssessment),
          rating: newAssessment.rating,
          assessedBy: newAssessment.assessedBy || 'Not specified'
        }
      );

      // Prepare assessment data
      const assessmentData = {
        caretakerId: selectedCaretakerForAssessment.id,
        rating: newAssessment.rating,
        categories: newAssessment.categories,
        assessmentDate: newAssessment.assessmentDate,
        date: newAssessment.assessmentDate,
        assessedBy: newAssessment.assessedBy || 'Not specified',
        comments: newAssessment.comments,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save assessment to MongoDB via API
      const response = await fetch('/api/performance/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add the new assessment to state
        const newAssessmentObj: PerformanceAssessment = {
          _id: result.assessment._id || Date.now().toString(),
          id: result.assessment.id || Date.now().toString(),
          caretakerId: selectedCaretakerForAssessment.id!,
          rating: newAssessment.rating,
          categories: newAssessment.categories,
          assessmentDate: new Date(newAssessment.assessmentDate),
          date: new Date(newAssessment.assessmentDate),
          assessedBy: newAssessment.assessedBy,
          comments: newAssessment.comments,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        setAssessments(prev => [newAssessmentObj, ...prev]);
        
        // Log successful assessment creation
        await logAssessmentCreate(
          getFullName(selectedCaretakerForAssessment),
          selectedCaretakerForAssessment.slpAssociation || 'No Association',
          newAssessment.rating,
          {
            caretakerId: selectedCaretakerForAssessment.id,
            assessmentId: newAssessmentObj.id,
            assessedBy: newAssessment.assessedBy,
            categories: Object.keys(newAssessment.categories).map(key => ({
              category: key,
              score: newAssessment.categories[key as keyof typeof newAssessment.categories]
            }))
          }
        );

        // Close modal and reset
        setIsCreateAssessmentModalOpen(false);
        setSelectedCaretakerForAssessment(null);
        setNewAssessment({
          rating: 3.0,
          categories: {
            punctuality: 3.0,
            communication: 3.0,
            patientCare: 3.0,
            professionalism: 3.0,
            technicalSkills: 3.0
          },
          assessmentDate: new Date().toISOString().split('T')[0],
          assessedBy: '',
          comments: ''
        });

        // Show success message
        alert('Assessment created successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save assessment');
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create assessment';
      setError(errorMessage);
      
      // Log error
      await logError(
        'Caretaker Management',
        'CREATE_ASSESSMENT_ERROR',
        errorMessage,
        undefined,
        {
          caretakerId: selectedCaretakerForAssessment?.id,
          caretakerName: selectedCaretakerForAssessment ? getFullName(selectedCaretakerForAssessment) : 'Unknown'
        }
      );
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setCreatingAssessment(false);
    }
  };

  // QR Code Functions
  const handleGenerateQRCode = (caretaker: ExtendedCaretaker) => {
    setSelectedCaretakerForQR(caretaker);
    setIsQRModalOpen(true);
  };

  const handleAddCaretaker = async (caretakerData: ExtendedCaretakerFormData) => {
    try {
      setError(null);
      
      // Log add attempt
      await logSuccess(
        'Caretaker Management',
        'ADD_CARETAKER_ATTEMPT',
        `Attempting to add new caretaker: ${caretakerData.firstName} ${caretakerData.lastName}`,
        undefined,
        { 
          firstName: caretakerData.firstName,
          lastName: caretakerData.lastName,
          association: caretakerData.slpAssociation 
        }
      );

      // Generate unique ID
      const newCaretaker: ExtendedCaretaker = {
        ...caretakerData,
        id: `CT${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        email: `${caretakerData.firstName.toLowerCase()}.${caretakerData.lastName.toLowerCase()}@care.com`,
        dateStarted: new Date().toISOString().split('T')[0],
        phone: caretakerData.phone || '',
        contactNumber: caretakerData.phone || ''
      };

      // Save to MongoDB
      const response = await fetch('/api/caretakers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCaretaker),
      });

      if (response.ok) {
        const result = await response.json();
        setCaretakers(prev => [...prev, result.caretaker]);
        
        // Log successful creation using the specialized function
        await logCaretakerCreate(
          `${caretakerData.firstName} ${caretakerData.lastName}`,
          caretakerData.slpAssociation || 'No Association',
          undefined,
          {
            caretakerId: newCaretaker.id,
            email: newCaretaker.email,
            status: newCaretaker.status,
            dateStarted: newCaretaker.dateStarted
          }
        );
        
        // If caretaker is associated with an association, update member count
        if (caretakerData.slpAssociation) {
          await updateAssociationMemberCount(caretakerData.slpAssociation, 1);
        }
        
        setIsAddModalOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to save caretaker: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding caretaker:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add caretaker';
      setError(errorMessage);
      
      // Log error
      await logError(
        'Caretaker Management',
        'ADD_CARETAKER_ERROR',
        errorMessage,
        undefined,
        { 
          firstName: caretakerData.firstName,
          lastName: caretakerData.lastName 
        }
      );
    }
  };

  const handleDeleteCaretaker = async (caretakerId: string) => {
    try {
      setError(null);
      
      // Find the caretaker to get their association
      const caretakerToDelete = caretakers.find(c => c.id === caretakerId);
      if (!caretakerToDelete) {
        throw new Error('Caretaker not found');
      }

      // Log delete attempt
      await logWarning(
        'Caretaker Management',
        'DELETE_CARETAKER_ATTEMPT',
        `Attempting to delete caretaker: ${getFullName(caretakerToDelete)}`,
        undefined,
        { 
          caretakerId,
          caretakerName: getFullName(caretakerToDelete),
          association: caretakerToDelete.slpAssociation 
        }
      );

      // Delete the caretaker
      const response = await fetch(`/api/caretakers?id=${caretakerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setCaretakers(prev => prev.filter(c => c.id !== caretakerId));
        
        // Log successful deletion using the specialized function
        await logCaretakerDelete(
          getFullName(caretakerToDelete),
          caretakerToDelete.slpAssociation || 'No Association',
          undefined,
          {
            caretakerId: caretakerToDelete.id,
            email: caretakerToDelete.email,
            status: caretakerToDelete.status
          }
        );
        
        // If caretaker was in an association, update the association's member count
        if (caretakerToDelete.slpAssociation) {
          await updateAssociationMemberCount(caretakerToDelete.slpAssociation, -1);
        }
        
        alert('Caretaker deleted successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete caretaker: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting caretaker:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete caretaker';
      setError(errorMessage);
      
      // Log error
      await logError(
        'Caretaker Management',
        'DELETE_CARETAKER_ERROR',
        errorMessage,
        undefined,
        { caretakerId }
      );
    }
  };

  const handleViewAssessment = async (caretakerId: string) => {
    try {
      const caretaker = caretakers.find(c => c.id === caretakerId);
      if (caretaker) {
        setSelectedCaretaker(caretaker);
        setIsAssessmentModalOpen(true);
        
        // Log assessment view
        await logSuccess(
          'Caretaker Management',
          'VIEW_ASSESSMENT',
          `Viewed performance assessment for ${getFullName(caretaker)}`,
          undefined,
          { 
            caretakerId,
            caretakerName: getFullName(caretaker),
            assessmentCount: getCaretakerAssessments(caretakerId).length 
          }
        );
      }
    } catch (error) {
      console.error('Failed to log assessment view:', error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
  };

  const getCaretakerAssessments = (caretakerId: string): PerformanceAssessment[] => {
    return assessments.filter(a => a.caretakerId === caretakerId);
  };

  const handleRefreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await logSuccess(
        'Caretaker Management',
        'MANUAL_REFRESH',
        'User manually refreshed caretaker data'
      );
      
      window.location.reload();
    } catch (error) {
      console.error('Failed to log refresh:', error);
      window.location.reload();
    }
  };

  const handleExportData = async () => {
    try {
      await logSuccess(
        'Caretaker Management',
        'EXPORT_DATA',
        'Exported caretakers data',
        undefined,
        {
          caretakerCount: caretakers.length,
          assessmentCount: assessments.length
        }
      );
      
      // Simple CSV export implementation
      const headers = ["Caretaker Name", "Email", "Status", "Association", "Date Started", "Performance Rating"];
      const csvData = caretakers.map(caretaker => {
        const summary = calculateAssessmentSummary(caretaker.id!);
        return [
          getFullName(caretaker),
          caretaker.email || 'No email',
          caretaker.status || 'unknown',
          caretaker.slpAssociation || 'No Association',
          caretaker.dateStarted || 'Not set',
          summary.averageRating.toFixed(1)
        ];
      });
      
      const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `caretakers-management-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      
      await logError(
        'Caretaker Management',
        'EXPORT_ERROR',
        `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  const getStatusColor = (status: string = 'unknown') => ({
    active: "bg-green-50 text-green-700 border-green-200",
    'on-leave': "bg-yellow-50 text-yellow-700 border-yellow-200",
    'on_leave': "bg-yellow-50 text-yellow-700 border-yellow-200",
    inactive: "bg-red-50 text-red-700 border-red-200",
  }[status] || "bg-gray-50 text-gray-700 border-gray-200");

  const getStatusIcon = (status: string = 'unknown') => ({
    active: <CheckCircle className="h-3 w-3" />,
    'on-leave': <Clock className="h-3 w-3" />,
    'on_leave': <Clock className="h-3 w-3" />,
    inactive: <AlertTriangle className="h-3 w-3" />,
  }[status] || <User className="h-3 w-3" />);

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-500";
    if (rating >= 4.0) return "bg-blue-500";
    if (rating >= 3.5) return "bg-yellow-500";
    if (rating >= 3.0) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatDate = (dateString: string) =>
    dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set';

  // Safe getter for phone number
  const getPhoneNumber = (caretaker: ExtendedCaretaker): string | undefined => {
    return caretaker.phone || caretaker.contactNumber;
  };

  // Safe status formatter
  const formatStatus = (status: string | undefined): string => {
    if (!status) return 'Unknown';
    return status.replace('-', ' ').replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('-', ' ').replace('_', ' ');
  };

  // Helper function to update category score
  const updateCategoryScore = (category: keyof typeof newAssessment.categories, value: number) => {
    setNewAssessment(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }));
    
    // Update overall rating as average of all categories
    const categories = {
      ...newAssessment.categories,
      [category]: value
    };
    
    const total = Object.values(categories).reduce((sum, score) => sum + score, 0);
    const average = total / Object.keys(categories).length;
    
    setNewAssessment(prev => ({
      ...prev,
      rating: parseFloat(average.toFixed(1)),
      categories
    }));
  };

  // Helper to update overall rating and sync all categories
  const updateOverallRating = (rating: number) => {
    setNewAssessment(prev => ({
      ...prev,
      rating,
      categories: {
        punctuality: rating,
        communication: rating,
        patientCare: rating,
        professionalism: rating,
        technicalSkills: rating
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Loading caretakers data</p>
            <p className="text-gray-600 text-sm">Please wait while we load your caretakers</p>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Caretaker Management</h1>
            <p className="text-gray-600">Manage and monitor all caretaker performance and assessments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button 
              variant="outline"
              onClick={handleRefreshData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Add New Caretaker
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Caretakers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600 font-medium">{stats.active} active</span>
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Caretakers</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">On Leave</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.onLeave}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.total > 0 ? Math.round((stats.onLeave / stats.total) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">QR Codes Generated</CardTitle>
              <QrCode className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{caretakers.length}</div>
              <p className="text-xs text-gray-600 mt-1">Unique QR codes available</p>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-red-800 font-medium">Error Loading Data</div>
                    <div className="text-red-600 text-sm">{error}</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshData}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Caretakers Table */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl text-gray-900">Caretakers Dashboard</CardTitle>
                <CardDescription className="text-gray-600">
                  Managing {filteredCaretakers.length} caretakers with {assessments.length} performance assessments
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search caretakers by name, email, or ID..."
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
                        Status
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleFilterChange("all")}>All Status</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange("active")}>Active</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange("inactive")}>Inactive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-white border-gray-200"
                    onClick={handleExportData}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableHead className="py-4 font-semibold text-gray-700">Caretaker Details</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Contact Information</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Association</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Performance Rating</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Date Started</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCaretakers.map((caretaker) => {
                    const assessmentSummary = calculateAssessmentSummary(caretaker.id!);
                    const caretakerAssessments = getCaretakerAssessments(caretaker.id!);
                    const phoneNumber = getPhoneNumber(caretaker);
                    
                    return (
                      <TableRow key={caretaker.id} className="border-gray-200 hover:bg-gray-50 group">
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                              {getFullName(caretaker)}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <User className="h-3 w-3" />
                              ID: {caretaker.id}
                            </div>
                            {caretakerAssessments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FileText className="h-3 w-3" />
                                {caretakerAssessments.length} assessments
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="space-y-1 text-sm">
                            {caretaker.email && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Mail className="h-3 w-3" />
                                {caretaker.email}
                              </div>
                            )}
                            {phoneNumber && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Phone className="h-3 w-3" />
                                {phoneNumber}
                              </div>
                            )}
                            {!caretaker.email && !phoneNumber && (
                              <div className="text-gray-400 text-xs">No contact info</div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-600">
                            {caretaker.slpAssociation || (
                              <span className="text-gray-400">No Association</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          {assessmentSummary.totalAssessments > 0 ? (
                            <div className="space-y-2 min-w-24">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="font-medium text-gray-900">
                                    {assessmentSummary.averageRating.toFixed(1)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  ({assessmentSummary.totalAssessments})
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${getPerformanceColor(assessmentSummary.averageRating)}`}
                                  style={{ width: `${(assessmentSummary.averageRating / 5) * 100}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {assessmentSummary.performanceLevel.toLowerCase()}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">No assessments</div>
                          )}
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(caretaker.dateStarted || '')}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1.5 font-medium ${getStatusColor(caretaker.status)}`}
                          >
                            {getStatusIcon(caretaker.status)}
                            {formatStatus(caretaker.status)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="py-4 text-right">
                          <div className="flex justify-end gap-1">
                            {/* QR Code Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                              onClick={() => handleGenerateQRCode(caretaker)}
                              title="Generate QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions for {caretaker.firstName}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleGenerateQRCode(caretaker)}
                                  className="flex items-center gap-2 text-indigo-600"
                                >
                                  <QrCode className="h-4 w-4" />
                                  Generate QR Code
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleCreateAssessment(caretaker)}
                                  className="flex items-center gap-2"
                                >
                                  <PlusCircle className="h-4 w-4" />
                                  Add Assessment
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleViewAssessment(caretaker.id!)}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {caretakerAssessments.length > 0 && (
                                  <DropdownMenuItem 
                                    onClick={() => handleViewAssessment(caretaker.id!)}
                                    className="flex items-center gap-2"
                                  >
                                    <BarChart3 className="h-4 w-4" />
                                    View Assessments
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteCaretaker(caretaker.id!)}
                                  className="flex items-center gap-2 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Caretaker
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredCaretakers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2"><Users className="h-12 w-12 mx-auto" /></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No caretakers found</h3>
                <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                  {searchTerm || statusFilter !== 'all'
                    ? "No caretakers match your current filters. Try adjusting your search criteria."
                    : "Get started by adding your first caretaker to manage their performance and assessments."
                  }
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    if (caretakers.length === 0) setIsAddModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {caretakers.length === 0 ? 'Add Your First Caretaker' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <AssessmentModal
          {...{
            isOpen: isAssessmentModalOpen,
            onClose: () => setIsAssessmentModalOpen(false),
            caretaker: selectedCaretaker,
            assessments: selectedCaretaker ? getCaretakerAssessments(selectedCaretaker.id!) : [],
            assessmentSummary: selectedCaretaker ? calculateAssessmentSummary(selectedCaretaker.id!) : null
          } as any}
        />

        {/* Add Caretaker Modal */}
        <AddCaretakerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddCaretaker={handleAddCaretaker}
        />

        {/* Create Assessment Modal */}
        <Dialog open={isCreateAssessmentModalOpen} onOpenChange={setIsCreateAssessmentModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <PlusCircle className="h-6 w-6 text-blue-600" />
                Add Performance Assessment
              </DialogTitle>
              <DialogDescription>
                Create a new performance assessment for {selectedCaretakerForAssessment ? getFullName(selectedCaretakerForAssessment) : 'caretaker'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Caretaker Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Caretaker Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Caretaker Name</p>
                      <p className="font-medium">
                        {selectedCaretakerForAssessment ? getFullName(selectedCaretakerForAssessment) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Association</p>
                      <p className="font-medium">
                        {selectedCaretakerForAssessment?.slpAssociation || 'No Association'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p className="font-medium">
                        {selectedCaretakerForAssessment?.id || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge 
                        variant="outline" 
                        className={`font-medium ${getStatusColor(selectedCaretakerForAssessment?.status)}`}
                      >
                        {formatStatus(selectedCaretakerForAssessment?.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Rating */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Overall Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RatingInput
                    value={newAssessment.rating}
                    onChange={updateOverallRating}
                    label="Overall Performance Rating"
                  />
                </CardContent>
              </Card>

              {/* Category Ratings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Category Ratings
                  </CardTitle>
                  <CardDescription>Rate each performance category individually</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(newAssessment.categories).map(([category, score]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`category-${category}`} className="font-medium capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <span className="font-bold text-lg text-blue-600">{score.toFixed(1)}</span>
                        </div>
                        <RatingInput
                          value={score}
                          onChange={(value) => 
                            updateCategoryScore(category as keyof typeof newAssessment.categories, value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Assessment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assessment-date">Assessment Date</Label>
                        <Input
                          id="assessment-date"
                          type="date"
                          value={newAssessment.assessmentDate}
                          onChange={(e) => setNewAssessment(prev => ({
                            ...prev,
                            assessmentDate: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="assessed-by">Assessed By</Label>
                        <Input
                          id="assessed-by"
                          placeholder="Enter assessor name"
                          value={newAssessment.assessedBy}
                          onChange={(e) => setNewAssessment(prev => ({
                            ...prev,
                            assessedBy: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comments">Comments & Notes</Label>
                      <Textarea
                        id="comments"
                        placeholder="Enter your observations, feedback, and recommendations..."
                        rows={4}
                        value={newAssessment.comments}
                        onChange={(e) => setNewAssessment(prev => ({
                          ...prev,
                          comments: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Assessment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(newAssessment.categories).map(([category, score]) => (
                      <div key={category} className="bg-white p-3 rounded-lg border text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {category.substring(0, 3)}
                        </div>
                        <div className="text-xl font-bold text-gray-900">{score.toFixed(1)}</div>
                        <div className="text-xs text-gray-600 capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim().substring(0, 8)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-blue-700">Overall Performance</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {newAssessment.rating.toFixed(1)}/5.0
                        </div>
                        <div className="text-xs text-blue-600">
                          {newAssessment.rating >= 4.5 ? 'Excellent' :
                           newAssessment.rating >= 4.0 ? 'Very Good' :
                           newAssessment.rating >= 3.5 ? 'Good' :
                           newAssessment.rating >= 3.0 ? 'Satisfactory' : 'Needs Improvement'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-6 w-6 ${
                              star <= newAssessment.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateAssessmentModalOpen(false)}
                disabled={creatingAssessment}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveAssessment}
                disabled={creatingAssessment}
                className="bg-green-600 hover:bg-green-700"
              >
                {creatingAssessment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Save Assessment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Code Modal */}
        <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
          {selectedCaretakerForQR && (
            <QRCodeGenerator 
              caretaker={selectedCaretakerForQR}
              onClose={() => setIsQRModalOpen(false)}
            />
          )}
        </Dialog>
      </div>
    </div>
  );
}