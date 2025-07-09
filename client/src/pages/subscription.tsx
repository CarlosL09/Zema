import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, CreditCard, Calendar, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionStatus {
  status: string;
  plan: string;
  isActive: boolean;
  isTrialExpired: boolean;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  daysRemaining: number | null;
  emailsProcessed: number;
  emailLimit: number;
  usagePercentage: number;
  hasExceededLimit: boolean;
  billingPeriodStart: string | null;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  emailLimit: number;
  features: string[];
  popular?: boolean;
}

interface PricingInfo {
  plans: PricingPlan[];
  currency: string;
  trialDays: number;
}

export default function Subscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptionStatus, isLoading: statusLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
  });

  const { data: pricing, isLoading: pricingLoading } = useQuery<PricingInfo>({
    queryKey: ["/api/subscription/pricing"],
  });

  const startTrialMutation = useMutation({
    mutationFn: async (plan: string) => {
      return await apiRequest("POST", "/api/subscription/start-trial", { plan });
    },
    onSuccess: () => {
      toast({
        title: "Trial Started!",
        description: "Your 7-day free trial has begun. Payment method will be charged after trial ends.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start trial",
        variant: "destructive",
      });
    },
  });

  const upgradePlanMutation = useMutation({
    mutationFn: async (plan: string) => {
      return await apiRequest("POST", "/api/subscription/upgrade-plan", { plan });
    },
    onSuccess: () => {
      toast({
        title: "Plan Updated!",
        description: "Your plan has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive",
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/subscription/cancel");
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string, isActive: boolean, isTrialExpired: boolean) => {
    if (status === 'trialing' && !isTrialExpired) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Free Trial</Badge>;
    }
    if (status === 'active' && isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
    }
    if (status === 'canceled' || isTrialExpired) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
    }
    return <Badge variant="outline">No Subscription</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (statusLoading || pricingLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-gray-600 mb-8">Manage your Mailmatica subscription and billing information</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Current Status
              </CardTitle>
              <CardDescription>Your subscription details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {subscriptionStatus && getStatusBadge(
                  subscriptionStatus.status, 
                  subscriptionStatus.isActive, 
                  subscriptionStatus.isTrialExpired
                )}
              </div>

              {subscriptionStatus?.status === 'trialing' && subscriptionStatus.daysRemaining !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Days Remaining:</span>
                  <span className="font-semibold text-blue-600">
                    {subscriptionStatus.daysRemaining} days
                  </span>
                </div>
              )}

              {subscriptionStatus?.trialEndsAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Trial Ends:</span>
                  <span className="text-sm">{formatDate(subscriptionStatus.trialEndsAt)}</span>
                </div>
              )}

              {subscriptionStatus?.subscriptionEndsAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Subscription Ends:</span>
                  <span className="text-sm">{formatDate(subscriptionStatus.subscriptionEndsAt)}</span>
                </div>
              )}

              <div className="pt-4 border-t">
                {!subscriptionStatus?.isActive && !subscriptionStatus?.status ? (
                  <Button 
                    onClick={() => startTrialMutation.mutate('starter')}
                    disabled={startTrialMutation.isPending}
                    className="w-full"
                  >
                    {startTrialMutation.isPending ? 'Starting Trial...' : 'Start 7-Day Free Trial'}
                  </Button>
                ) : subscriptionStatus?.status === 'trialing' && !subscriptionStatus.isTrialExpired ? (
                  <Button 
                    onClick={() => cancelSubscriptionMutation.mutate()}
                    disabled={cancelSubscriptionMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {cancelSubscriptionMutation.isPending ? 'Canceling...' : 'Cancel Trial'}
                  </Button>
                ) : subscriptionStatus?.status === 'active' ? (
                  <Button 
                    onClick={() => cancelSubscriptionMutation.mutate()}
                    disabled={cancelSubscriptionMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {cancelSubscriptionMutation.isPending ? 'Canceling...' : 'Cancel Subscription'}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => startTrialMutation.mutate('starter')}
                    disabled={startTrialMutation.isPending}
                    className="w-full"
                  >
                    {startTrialMutation.isPending ? 'Starting Trial...' : 'Restart Subscription'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Current Plan
              </CardTitle>
              <CardDescription>Your subscription plan and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionStatus && (
                <>
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold capitalize">
                      {subscriptionStatus.plan} Plan
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {subscriptionStatus.emailsProcessed} / {subscriptionStatus.emailLimit} emails this month
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            subscriptionStatus.usagePercentage > 80 ? 'bg-red-500' :
                            subscriptionStatus.usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(subscriptionStatus.usagePercentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {subscriptionStatus.usagePercentage}% used
                      </div>
                    </div>
                  </div>

                  {subscriptionStatus.hasExceededLimit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-red-800 font-medium text-sm">
                        Email limit exceeded! Please upgrade your plan to continue processing emails.
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Available Plans
              </CardTitle>
              <CardDescription>Choose the plan that fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              {pricing && (
                <div className="grid gap-4 md:grid-cols-3">
                  {pricing.plans.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`border rounded-lg p-4 ${
                        plan.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      } ${
                        subscriptionStatus?.plan === plan.id ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full text-center mb-2">
                          Most Popular
                        </div>
                      )}
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <div className="text-2xl font-bold mt-2">
                          ${plan.price}
                          <span className="text-sm font-normal text-gray-600">/month</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {plan.emailLimit.toLocaleString()} emails/month
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        {subscriptionStatus?.plan === plan.id ? (
                          <div className="text-center text-sm text-green-600 font-medium">
                            Current Plan
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              if (subscriptionStatus?.status === 'trial' || subscriptionStatus?.status === 'inactive') {
                                startTrialMutation.mutate(plan.id);
                              } else {
                                upgradePlanMutation.mutate(plan.id);
                              }
                            }}
                            disabled={startTrialMutation.isPending || upgradePlanMutation.isPending}
                            className="w-full"
                            variant={plan.popular ? "default" : "outline"}
                          >
                            {subscriptionStatus?.status === 'trial' || subscriptionStatus?.status === 'inactive'
                              ? 'Start Trial'
                              : subscriptionStatus?.plan === 'starter' && plan.id === 'professional'
                              ? 'Upgrade'
                              : subscriptionStatus?.plan === 'starter' && plan.id === 'enterprise'
                              ? 'Upgrade'
                              : subscriptionStatus?.plan === 'professional' && plan.id === 'enterprise'
                              ? 'Upgrade'
                              : 'Switch Plan'
                            }
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trial Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              How the 7-Day Free Trial Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong>Start Your Trial:</strong> Get immediate access to all ZEMA features for 7 days completely free.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong>Payment Information Required:</strong> We collect your payment method upfront, but won't charge until your trial ends.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong>Cancel Anytime:</strong> Cancel before your trial ends and you won't be charged anything.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <strong>Automatic Billing:</strong> If you don't cancel, your subscription automatically continues at ${pricing?.monthlyPrice}/month.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}