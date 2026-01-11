'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus, Mail, Lock } from "lucide-react";
import { logSuccess, logError } from "@/lib/activity/activity-logger";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.name || !formData.email) {
      setError("Name and email are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await logSuccess(
          'Authentication',
          'OTP_SENT',
          `OTP sent to: ${formData.email}`,
          formData.email,
          {
            registrationMethod: 'email_otp',
            timestamp: new Date().toISOString()
          }
        );

        setOtpSent(true);
        setStep("otp");
      } else {
        await logError(
          'Authentication',
          'OTP_SEND_FAILED',
          `Failed to send OTP to ${formData.email}: ${data.error}`,
          formData.email,
          { error: data.error }
        );
        setError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      await logError(
        'Authentication',
        'OTP_SEND_ERROR',
        `Network error while sending OTP to ${formData.email}`,
        formData.email,
        { error: 'Network error' }
      );
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.otp) {
      setError("Please enter the OTP");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await logSuccess(
          'Authentication',
          'EMAIL_VERIFIED',
          `Email verified: ${formData.email}`,
          formData.email,
          {
            verificationMethod: 'otp',
            timestamp: new Date().toISOString()
          }
        );

        setEmailVerified(true);
        setStep("password");
      } else {
        await logError(
          'Authentication',
          'OTP_VERIFICATION_FAILED',
          `OTP verification failed for ${formData.email}`,
          formData.email,
          { error: data.error }
        );
        setError(data.error || 'Invalid OTP');
      }
    } catch (error) {
      await logError(
        'Authentication',
        'OTP_VERIFICATION_ERROR',
        `Network error during OTP verification for ${formData.email}`,
        formData.email,
        { error: 'Network error' }
      );
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Final registration with password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          otp: formData.otp // Include OTP for final verification
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await logSuccess(
          'Authentication',
          'USER_REGISTRATION',
          `New user registered: ${formData.name} (${formData.email})`,
          formData.email,
          {
            registrationMethod: 'email_otp_password',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        );

        // Redirect to login with success message
        window.location.href = '/auth/login?message=Registration successful. Please login.';
      } else {
        await logError(
          'Authentication',
          'USER_REGISTRATION',
          `Registration failed for ${formData.email}: ${data.error || 'Unknown error'}`,
          formData.email,
          {
            error: data.error,
            email: formData.email
          }
        );
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      await logError(
        'Authentication',
        'USER_REGISTRATION',
        `Registration error for ${formData.email}: Network error`,
        formData.email,
        {
          error: 'Network error',
          email: formData.email
        }
      );
      setError('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtpSent(false);
    setFormData(prev => ({ ...prev, otp: "" }));
  };

  const handleBackToOTP = () => {
    setStep("otp");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <CardTitle className="text-2xl">
                  {step === "email" && "Create Account"}
                  {step === "otp" && "Verify Email"}
                  {step === "password" && "Set Password"}
                </CardTitle>
                <CardDescription>
                  {step === "email" && "Enter your details to create a new account"}
                  {step === "otp" && `Enter the OTP sent to ${formData.email}`}
                  {step === "password" && "Create your password to complete registration"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex justify-between mb-6">
              <div className={`flex flex-col items-center ${step === "email" ? "text-green-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "email" ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                  1
                </div>
                <span className="text-xs mt-1">Email</span>
              </div>
              <div className={`flex flex-col items-center ${step === "otp" ? "text-green-600" : step === "password" ? "text-green-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "otp" || step === "password" ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                  2
                </div>
                <span className="text-xs mt-1">Verify</span>
              </div>
              <div className={`flex flex-col items-center ${step === "password" ? "text-green-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "password" ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                  3
                </div>
                <span className="text-xs mt-1">Password</span>
              </div>
            </div>

            <form onSubmit={
              step === "email" ? handleSendOTP :
              step === "otp" ? handleVerifyOTP :
              handleRegister
            } className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
              
              {/* Step 1: Email and Name */}
              {step === "email" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isLoading ? "Sending OTP..." : "Send Verification Code"}
                  </Button>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {step === "otp" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={formData.otp}
                      onChange={handleChange}
                      maxLength={6}
                      required
                    />
                    <p className="text-sm text-gray-600">
                      We sent a 6-digit code to {formData.email}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleBackToEmail}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={handleSendOTP}
                      disabled={isLoading}
                      className="text-sm"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </>
              )}

              {/* Step 3: Password Setup */}
              {step === "password" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password (min. 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleBackToOTP}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </>
              )}
            </form>

            {step === "email" && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-green-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}