import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Mail, Users, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import TrialStatus from "@/components/trial-status";
import Navigation from "@/components/navigation";

interface TrialStatus {
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  status: string;
  plan: string;
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "Free Forever",
    description: "Perfect for individuals getting started with email automation",
    features: [
      "50 emails per month",
      "Basic email templates",
      "Simple automation rules",
      "Email security scanning",
      "Community support"
    ],
    icon: <Mail className="h-6 w-6" />,
    popular: false
  },
  {
    id: "professional",
    name: "Professional", 
    price: 19,
    period: "per month",
    description: "Ideal for professionals and small teams",
    features: [
      "2,500 emails per month",
      "Advanced email templates",
      "Smart automation rules",
      "Priority support",
      "Gmail & Outlook integration",
      "Custom template builder",
      "Advanced security features"
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 49,
    period: "per month", 
    description: "For larger teams and advanced automation needs",
    features: [
      "10,000 emails per month",
      "All professional features",
      "Multi-account management",
      "Advanced analytics",
      "Custom integrations",
      "Priority phone support",
      "SSO & advanced security",
      "Custom onboarding"
    ],
    icon: <Shield className="h-6 w-6" />,
    popular: false
  }
];

export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trialStatus } = useQuery<TrialStatus>({
    queryKey: ["/api/trial/status"],
  });

  const upgradeMutation = useMutation({
    mutationFn: async (plan: string) => {
      return await apiRequest("POST", "/api/trial/upgrade", { plan });
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Your plan has been successfully upgraded!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trial/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade your plan",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    upgradeMutation.mutate(planId);
  };

  const isCurrentPlan = (planId: string) => {
    return trialStatus?.plan === planId && trialStatus?.status === "active";
  };

  const showTrialBanner = trialStatus?.status === "trial" && !trialStatus?.isExpired;
  const showExpiredBanner = trialStatus?.isExpired;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start with our free plan and upgrade as your email automation needs grow
            </p>
          </div>

          {/* Trial Status Card */}
          {(showTrialBanner || showExpiredBanner) && (
            <div className="flex justify-center mb-8">
              <TrialStatus />
            </div>
          )}

          {/* Trial Banner */}
          {showTrialBanner && (
            <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center text-center">
                <Zap className="h-5 w-5 text-cyan-600 mr-2" />
                <span className="text-cyan-800 dark:text-cyan-200">
                  You have {trialStatus.daysRemaining} days left in your free trial. 
                  Upgrade now to continue enjoying all ZEMA features!
                </span>
              </div>
            </div>
          )}

          {/* Expired Banner */}
          {showExpiredBanner && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center text-center">
                <Shield className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 dark:text-red-200">
                  Your trial has expired. Please upgrade to continue using ZEMA.
                </span>
              </div>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-cyan-500 dark:ring-cyan-400' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2 text-cyan-600">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4">
                    {isCurrentPlan(plan.id) ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={upgradeMutation.isPending && selectedPlan === plan.id}
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-cyan-500 hover:bg-cyan-600' 
                            : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900'
                        }`}
                      >
                        {upgradeMutation.isPending && selectedPlan === plan.id ? (
                          "Processing..."
                        ) : plan.price === 0 ? (
                          "Start Free"
                        ) : (
                          `Upgrade to ${plan.name}`
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Can I cancel anytime?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What happens after my trial?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  After your 14-day trial, you'll be moved to our free Starter plan unless you upgrade to a paid plan.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Do you offer refunds?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  We offer a 30-day money-back guarantee on all paid plans if you're not satisfied.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Can I change plans later?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Absolutely! You can upgrade or downgrade your plan at any time from your account settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}