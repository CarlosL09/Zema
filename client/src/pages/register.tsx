import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { UserPlus, ArrowLeft, Mail, Lock, User } from "lucide-react";
import zemaLogo from "@assets/41_1751750660031.png";
import { apiRequest } from "@/lib/queryClient";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    acceptTerms: false
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare registration data
      const registrationData = {
        username: formData.email, // Use email as username
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company
      };

      // Call registration API
      const response = await apiRequest("POST", "/api/register", registrationData);
      
      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Welcome to ZEMA! Your account has been created successfully.",
        });
        
        // Redirect to dashboard after successful registration
        setTimeout(() => {
          setLocation("/user-dashboard-v2");
        }, 1500);
      } else {
        const errorData = await response.text();
        throw new Error(errorData || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join ZEMA and start automating your emails today
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              Register New User
            </CardTitle>
            <CardDescription className="text-center">
              Fill in your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your Company"
                    className="pl-10"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange('acceptTerms', checked === true)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
                  I agree to the{" "}
                  <Link href="/terms">
                    <span className="text-cyan-600 hover:text-cyan-500 underline">
                      Terms of Service
                    </span>
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy">
                    <span className="text-cyan-600 hover:text-cyan-500 underline">
                      Privacy Policy
                    </span>
                  </Link>
                </Label>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link href="/sign-in">
                  <Button variant="link" className="text-sm">
                    Already have an account? Sign in here
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
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mt-6 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-cyan-900 dark:text-cyan-100">What you get with ZEMA</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-xs text-cyan-800 dark:text-cyan-200">
              <div>• AI-powered email automation</div>
              <div>• Multi-account management</div>
              <div>• Advanced security features</div>
              <div>• Real-time analytics dashboard</div>
              <div>• 20+ pre-built templates</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}