import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import zemaLogo from "../assets/zema-logo-latest.png";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Extract token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      setToken(urlToken);
    } else {
      setHasValidToken(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/reset-password", {
        token,
        newPassword
      });

      const data = await response.json();

      if (response.ok) {
        setIsResetComplete(true);
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated successfully.",
        });
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Failed to reset password",
          variant: "destructive",
        });
        
        if (data.message?.includes("Invalid or expired")) {
          setHasValidToken(false);
        }
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/">
              <div className="flex items-center justify-center mb-4 cursor-pointer">
                <img 
                  src={zemaLogo} 
                  alt="ZEMA" 
                  className="h-16 w-auto brightness-110 contrast-110"
                />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid Reset Link
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Link Expired or Invalid
              </CardTitle>
              <CardDescription className="text-center">
                This password reset link is no longer valid
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reset links expire after 1 hour for security. Please request a new one.
                </p>
                
                <Link href="/forgot-password">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Request New Reset Link
                  </Button>
                </Link>
                
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isResetComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/">
              <div className="flex items-center justify-center mb-4 cursor-pointer">
                <img 
                  src={zemaLogo} 
                  alt="ZEMA" 
                  className="h-16 w-auto brightness-110 contrast-110"
                />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Password Reset Complete
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Success!
              </CardTitle>
              <CardDescription className="text-center">
                Your password has been updated successfully
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="text-center space-y-4">
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Password Updated Successfully
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-2">
                    You can now sign in with your new password
                  </p>
                </div>
                
                <Link href="/sign-in">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Sign In Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center mb-4 cursor-pointer">
              <img 
                src={zemaLogo} 
                alt="ZEMA" 
                className="h-16 w-auto brightness-110 contrast-110"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Reset Password
            </CardTitle>
            <CardDescription className="text-center">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-12"
                      required
                      minLength={8}
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
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-cyan-600 hover:bg-cyan-700" 
                  disabled={isLoading}
                >
                  {isLoading ? "Updating Password..." : "Update Password"}
                </Button>
              </div>
            </form>

            {/* Navigation */}
            <div className="mt-6 text-center">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}