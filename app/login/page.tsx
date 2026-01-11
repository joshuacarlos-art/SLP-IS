// app/login/page.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Loader2 } from "lucide-react";
import PigIcon from "@/components/ui/pig-icon";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("joshuacarlos@gmail.com");
  const [password, setPassword] = useState("joshua062102");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log('=== LOGIN DEBUG START ===');
    console.log('Credentials:', { email, password });

    try {
      const success = await login(email, password);
      console.log('Login function result:', success);
      
      if (success) {
        console.log('✅ Login successful, redirecting to dashboard...');
        router.push("/admin/dashboard");
      } else {
        console.log('❌ Login failed in handleSubmit');
        setError("Invalid email or password. Please check your credentials.");
      }
    } catch (err) {
      console.error('💥 Login error in handleSubmit:', err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
      console.log('=== LOGIN DEBUG END ===');
    }
  };

  const isSubmitting = isLoading || authLoading;

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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
              <PigIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">SLP Admin</CardTitle>
          <CardDescription>
            Sustainable Livelihood Program - Admin Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="joshuacarlos@gmail.com" 
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
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                <div className="font-medium">Login Failed</div>
                <div>{error}</div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
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
          
        </CardContent>
      </Card>
    </div>
  );
}