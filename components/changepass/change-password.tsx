'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, Mail, Key, CheckCircle, ArrowLeft } from "lucide-react";
import { logSuccess, logError } from "@/lib/activity/activity-logger";
import Link from "next/link";

type Step = 'form' | 'otp' | 'success';

interface ChangePasswordProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function ChangePassword({ onClose, isModal = false }: ChangePasswordProps) {
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState("");
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear errors when user starts typing
    if (error) setError("");
  };

  const validateForm = (): string | null => {
    if (!formData.currentPassword) {
      return "Current password is required";
    }
    
    if (!formData.newPassword) {
      return "New password is required";
    }
    
    if (formData.newPassword.length < 8) {
      return "New password must be at least 8 characters long";
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      return "New passwords do not match";
    }
    
    return null;
  };

  const requestOTP = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/auth/request-password-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep('otp');
        setSuccess("OTP has been sent to your email!");
        setOtp("");
        
        // Log OTP request
        await logSuccess(
          'Authentication',
          'PASSWORD_OTP_REQUESTED',
          'Requested OTP for password change'
        );
      } else {
        setError(data.error || 'Failed to generate OTP');
        
        await logError(
          'Authentication',
          'PASSWORD_OTP_REQUEST_FAILED',
          `Failed to request OTP: ${data.error || 'Unknown error'}`
        );
      }
    } catch (err) {
      setError('Failed to request OTP. Please try again.');
      
      await logError(
        'Authentication',
        'PASSWORD_OTP_REQUEST_ERROR',
        `OTP request error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTPAndChangePassword = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          otp: otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep('success');
        setSuccess("Password changed successfully!");
        
        await logSuccess(
          'Authentication',
          'PASSWORD_CHANGED',
          'Password changed successfully with OTP verification'
        );
      } else {
        setError(data.error || 'Failed to change password');
        
        await logError(
          'Authentication',
          'PASSWORD_CHANGE_FAILED',
          `Failed to change password: ${data.error || 'Unknown error'}`
        );
      }
    } catch (err) {
      setError('Failed to change password. Please try again.');
      
      await logError(
        'Authentication',
        'PASSWORD_CHANGE_ERROR',
        `Password change error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/auth/request-password-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          resend: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("New OTP has been sent to your email!");
        setOtp("");
        
        await logSuccess(
          'Authentication',
          'PASSWORD_OTP_RESENT',
          'Resent OTP for password change'
        );
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('form');
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setOtp("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    // Reset form after a delay to allow modal close animation
    setTimeout(() => {
      resetForm();
    }, 300);
  };

  // If used as a standalone page (not modal)
  if (!isModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <CardTitle className="text-2xl">Change Password</CardTitle>
                  <CardDescription>
                    Secure your account with a new password
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Content renderer for both modal and standalone
  function renderContent() {
    return (
      <>
        {currentStep === 'form' && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter your new password (min. 8 characters)"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={requestOTP}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send OTP to Email
                </>
              )}
            </Button>
          </>
        )}

        {currentStep === 'otp' && (
          <>
            <div className="text-center mb-4">
              <div className="flex justify-center mb-2">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit OTP to verify your identity and change your password.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6} 
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    if (error) setError("");
                  }}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    {[...Array(6)].map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your email
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button 
                onClick={verifyOTPAndChangePassword}
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={resendOTP}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Resend OTP
              </Button>

              <Button 
                variant="ghost" 
                onClick={resetForm}
                className="w-full"
                disabled={isLoading}
              >
                Back to Form
              </Button>
            </div>
          </>
        )}

        {currentStep === 'success' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Password Changed Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              Your password has been updated successfully. 
              You will need to use your new password for your next login.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleClose}
                className="w-full"
              >
                {isModal ? 'Close' : 'Back to Dashboard'}
              </Button>
              <Button 
                onClick={resetForm}
                variant="outline"
                className="w-full"
              >
                Change Another Password
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return renderContent();
}