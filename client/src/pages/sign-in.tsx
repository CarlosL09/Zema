import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { LogIn, User, ArrowLeft, Shield, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import zemaLogo from "@assets/41_1751750660031.png";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const handleSignIn = async (email: string, password: string) => {
    // Check if account is locked
    if (isLocked) {
      const remainingTime = lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 1000) : 0;
      setErrorMessage(`Account temporarily locked. Try again in ${remainingTime} seconds.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage(""); // Clear any previous error messages
    
    try {
      const response = await apiRequest("POST", "/api/login", {
        email,
        password
      });

      const data = await response.json();

      if (response.ok) {
        // Reset attempt count on successful login
        setAttemptCount(0);
        setIsLocked(false);
        setLockoutTime(null);
        setErrorMessage("");
        
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
        setLocation("/user-dashboard-v2");
      } else {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        
        if (newAttemptCount >= 5) {
          // Lock account for 5 minutes (300 seconds)
          const lockUntil = Date.now() + (5 * 60 * 1000);
          setIsLocked(true);
          setLockoutTime(lockUntil);
          setErrorMessage("Too many failed attempts. Account locked for 5 minutes.");
          toast({
            title: "Account Locked",
            description: "Too many failed attempts. Please wait 5 minutes before trying again.",
            variant: "destructive",
          });
        } else {
          const remainingAttempts = 5 - newAttemptCount;
          const errorMsg = `Invalid email or password. ${remainingAttempts} attempts remaining.`;
          setErrorMessage(errorMsg);
          toast({
            title: "Login Failed",
            description: errorMsg,
            variant: "destructive",
          });
        }
        
        // Clear the password field for security
        setPassword("");
        // Prevent any default browser behavior
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      // Clear the password field for security
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Handle lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime) {
      const timer = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutTime) {
          setIsLocked(false);
          setLockoutTime(null);
          setAttemptCount(0);
          setErrorMessage("");
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center mb-4 cursor-pointer">
              <div className="bg-black p-6 rounded-lg">
                <img 
                  src={zemaLogo} 
                  alt="ZEMA" 
                  className="h-16 w-auto brightness-110 contrast-110"
                />
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to your ZEMA account
          </p>
        </div>

        {/* Sign In Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your email automation dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Email/Password Login */}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSignIn(email, password);
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage(""); // Clear error when user starts typing
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage(""); // Clear error when user starts typing
                      }}
                      className="pl-10 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link href="/forgot-password">
                    <Button variant="link" className="p-0 h-auto text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      Forgot password?
                    </Button>
                  </Link>
                </div>

                {/* Error Message Display */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed" 
                  disabled={isLoading || isLocked}
                >
                  {isLocked 
                    ? `Account Locked (${lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 1000) : 0}s)`
                    : isLoading 
                    ? "Signing In..." 
                    : "Sign In with Email"
                  }
                </Button>
              </div>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link href="/register">
                  <Button variant="link" className="text-sm">
                    Don't have an account? Register here
                  </Button>
                </Link>
              </div>
              
              <div className="text-center">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>

              <div className="text-center border-t pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Administrator Access</p>
                <Link href="/admin-login">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <Shield className="w-4 h-4" />
                    Admin Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-900 dark:text-blue-100">Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
              <div>
                <strong>Email:</strong> demo@zema.com
              </div>
              <div>
                <strong>Password:</strong> demo123
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}