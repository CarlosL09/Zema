import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, AlertCircle, CreditCard, Clock, DollarSign } from "lucide-react";

interface BillingEvent {
  id: number;
  userId: string;
  eventType: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  stripeEventId?: string;
  metadata?: any;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  subscriptionStatus: string;
  subscriptionPlan: string;
  emailsProcessedThisMonth: number;
  subscriptionEndsAt?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

const SUBSCRIPTION_PLANS = {
  starter: { name: "Starter", price: 2, emailLimit: 500 },
  professional: { name: "Professional", price: 5, emailLimit: 2000 },
  enterprise: { name: "Enterprise", price: 15, emailLimit: 10000 }
};

export default function BillingPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Fetch billing events
  const { data: billingEvents = [], isLoading: eventsLoading } = useQuery<BillingEvent[]>({
    queryKey: ["/api/billing/events"],
    retry: false,
  });

  // Fetch usage data
  const { data: usageData } = useQuery({
    queryKey: ["/api/subscription/usage"],
    retry: false,
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/subscription/create", { planId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription Created",
        description: "Your subscription has been created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (immediate: boolean = false) => {
      const response = await apiRequest("POST", "/api/subscription/cancel", { immediate });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (userLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your billing information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentPlan = SUBSCRIPTION_PLANS[user.subscriptionPlan as keyof typeof SUBSCRIPTION_PLANS];
  const usagePercentage = currentPlan ? (user.emailsProcessedThisMonth / currentPlan.emailLimit) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and view billing history</p>
      </div>

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {currentPlan ? currentPlan.name : "Free"} Plan
              </p>
              <p className="text-sm text-muted-foreground">
                {user.subscriptionStatus === "active" ? "Active" : user.subscriptionStatus}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-2xl">
                ${currentPlan ? currentPlan.price : 0}/month
              </p>
              {user.subscriptionEndsAt && (
                <p className="text-sm text-muted-foreground">
                  {user.subscriptionStatus === "canceled" ? "Ends" : "Next billing"}: {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {currentPlan && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Email Usage This Month</span>
                <span>{user.emailsProcessedThisMonth} / {currentPlan.emailLimit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
              {usagePercentage > 90 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You're approaching your monthly email limit. Consider upgrading your plan.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {user.subscriptionStatus === "active" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => cancelSubscriptionMutation.mutate(false)}
                disabled={cancelSubscriptionMutation.isPending}
              >
                Cancel at Period End
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelSubscriptionMutation.mutate(true)}
                disabled={cancelSubscriptionMutation.isPending}
              >
                Cancel Immediately
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      {(!user.subscriptionStatus || user.subscriptionStatus !== "active") && (
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose a plan that fits your email automation needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => (
                <div
                  key={planId}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPlan === planId ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPlan(planId)}
                >
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-2xl font-bold mt-2">${plan.price}/month</p>
                  <p className="text-sm text-muted-foreground">
                    Up to {plan.emailLimit.toLocaleString()} emails/month
                  </p>
                  <Button
                    className="w-full mt-4"
                    disabled={createSubscriptionMutation.isPending || selectedPlan !== planId}
                    onClick={(e) => {
                      e.stopPropagation();
                      createSubscriptionMutation.mutate(planId);
                    }}
                  >
                    {createSubscriptionMutation.isPending && selectedPlan === planId ? 'Creating...' : 'Select Plan'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : billingEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No billing events yet
            </p>
          ) : (
            <div className="space-y-3">
              {billingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {event.status === "succeeded" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : event.status === "failed" ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.createdAt).toLocaleDateString()} - {event.eventType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(event.amount / 100).toFixed(2)} {event.currency.toUpperCase()}
                    </p>
                    <Badge variant={event.status === "succeeded" ? "default" : event.status === "failed" ? "destructive" : "secondary"}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}