import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft, Mail, Send, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import zemaLogo from "../assets/zema-logo-latest.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/forgot-password", { email });
      const data = await response.json();

      if (response.ok) {
        setIsEmailSent(true);
        toast({
          title: "Reset Link Sent",
          description: "Check your email for password reset instructions.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reset email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    setEmail("");
  };

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
            Reset Your Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isEmailSent 
              ? "We've sent you a reset link"
              : "Enter your email to receive reset instructions"
            }
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              {isEmailSent ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Email Sent
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Forgot Password
                </>
              )}
            </CardTitle>
            <CardDescription className="text-center">
              {isEmailSent 
                ? "Check your email inbox for reset instructions"
                : "We'll send you a secure link to reset your password"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!isEmailSent ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-cyan-600 hover:bg-cyan-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Reset link sent to {email}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-2">
                    The link will expire in 1 hour
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Didn't receive the email?
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleResendEmail}
                    className="w-full"
                  >
                    Send to Different Email
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link href="/sign-in">
                  <Button variant="link" className="text-sm">
                    Remember your password? Sign in
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

        {/* Help */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-900 dark:text-blue-100">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
              <p>• Check your spam folder if you don't see the email</p>
              <p>• Make sure you entered the correct email address</p>
              <p>• Reset links expire after 1 hour for security</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}