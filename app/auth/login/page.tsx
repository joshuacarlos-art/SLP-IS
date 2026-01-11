'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Loader2, Shield, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { logSuccess, logError } from "@/lib/activity/activity-logger";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaOperator, setCaptchaOperator] = useState<'+' | '-' | '*'>('+');
  const [captchaCorrectAnswer, setCaptchaCorrectAnswer] = useState(0);
  
  const { login, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Generate random CAPTCHA
  const generateCaptcha = () => {
    const operators = ['+', '-', '*'] as const;
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer;

    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * 5) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * 5) + 1;
        answer = num1 * num2;
        break;
    }

    setCaptchaNum1(num1!);
    setCaptchaNum2(num2!);
    setCaptchaOperator(operator);
    setCaptchaCorrectAnswer(answer!);
    setCaptchaAnswer("");
  };

  // Initialize CAPTCHA on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate CAPTCHA
    const userAnswer = parseInt(captchaAnswer);
    if (isNaN(userAnswer) || userAnswer !== captchaCorrectAnswer) {
      setError("Incorrect CAPTCHA answer. Please try again.");
      generateCaptcha(); // Generate new CAPTCHA
      setIsLoading(false);
      return;
    }

    console.log('=== LOGIN DEBUG START ===');
    console.log('Credentials:', { email, password });
    console.log('CAPTCHA Answer:', { userAnswer, correctAnswer: captchaCorrectAnswer, verified: true });

    try {
      const success = await login(email, password);
      console.log('Login function result:', success);
      
      if (success) {
        console.log('✅ Login successful, redirecting to dashboard...');
        
        // Log successful user login
        await logSuccess(
          'Authentication',
          'USER_LOGIN',
          `User logged in: ${email}`,
          email,
          {
            loginMethod: 'email_password',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            userType: 'user',
            captchaVerified: true
          }
        );
        
        router.push("/admin/dashboard");
      } else {
        console.log('❌ Login failed in handleSubmit');
        
        // Log failed login attempt
        await logError(
          'Authentication',
          'USER_LOGIN_FAILED',
          `Failed login attempt: ${email} - Invalid credentials`,
          email,
          {
            username: email,
            error: 'Invalid credentials',
            userType: 'user',
            attemptType: 'user_login',
            captchaVerified: true
          }
        );
        
        setError("Invalid email or password. Please check your credentials.");
        generateCaptcha(); // Generate new CAPTCHA on failed login
      }
    } catch (err) {
      console.error('💥 Login error in handleSubmit:', err);
      
      // Log login error
      await logError(
        'Authentication',
        'USER_LOGIN_ERROR',
        `Login error for: ${email} - ${err instanceof Error ? err.message : 'Unknown error'}`,
        email,
        {
          username: email,
          error: err instanceof Error ? err.message : 'Unknown error',
          userType: 'user',
          attemptType: 'user_login'
        }
      );
      
      setError("An error occurred during login. Please try again.");
      generateCaptcha(); // Generate new CAPTCHA on error
    } finally {
      setIsLoading(false);
      console.log('=== LOGIN DEBUG END ===');
    }
  };

  const isSubmitting = isLoading || authLoading;

  // Get operator symbol for display
  const getOperatorSymbol = (operator: string) => {
    switch (operator) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      default: return operator;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {/* SLP Logo */}
            <img 
              src="/slp.png" 
              alt="Sustainable Livelihood Program" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl">SLP-IS Portal</CardTitle>
          <CardDescription>
            Sustainable Livelihood Program - User Access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="user@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isSubmitting}
                className="disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isSubmitting}
                className="disabled:opacity-50"
              />
            </div>

            {/* Compact Number CAPTCHA Section */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Shield className="h-3 w-3 text-gray-500" />
                Security Check
              </Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Solve:</span>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-300">
                    <span className="font-medium text-sm">{captchaNum1}</span>
                    <span className="text-sm mx-1">{getOperatorSymbol(captchaOperator)}</span>
                    <span className="font-medium text-sm">{captchaNum2}</span>
                    <span className="text-sm mx-1">=</span>
                  </div>
                  <Input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="?"
                    className="w-16 h-8 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={generateCaptcha}
                  disabled={isSubmitting}
                  className="h-7 w-7"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Simple math verification to prevent automated attacks
              </p>
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                <div className="font-medium">Login Failed</div>
                <div>{error}</div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting || !captchaAnswer}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-green-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}