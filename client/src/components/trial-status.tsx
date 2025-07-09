import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, AlertCircle, Crown } from "lucide-react";
import { Link } from "wouter";

interface TrialStatus {
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  trialEndsAt: string;
  status: string;
  plan: string;
  emailQuota: number;
  progress: number;
  emailsProcessedThisMonth: number;
}

export default function TrialStatus() {
  const { data: trialStatus, isLoading } = useQuery<TrialStatus>({
    queryKey: ["/api/trial/status"],
  });

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trialStatus) {
    return null;
  }

  const getStatusColor = () => {
    if (trialStatus.isExpired) return "destructive";
    if (trialStatus.daysRemaining <= 3) return "secondary";
    return "default";
  };

  const getStatusIcon = () => {
    if (trialStatus.isExpired) return <AlertCircle className="h-4 w-4" />;
    if (trialStatus.status === "active") return <Crown className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          Trial Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
          <Badge variant={getStatusColor()}>
            {trialStatus.isExpired ? "Expired" : 
             trialStatus.status === "active" ? "Paid Plan" : 
             `${trialStatus.daysRemaining} days left`}
          </Badge>
        </div>

        {/* Trial Progress */}
        {trialStatus.status === "trial" && !trialStatus.isExpired && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Trial Progress</span>
              <span className="font-medium">{Math.round(trialStatus.progress)}%</span>
            </div>
            <Progress value={trialStatus.progress} className="h-2" />
          </div>
        )}

        {/* Email Usage */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Email Quota
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{trialStatus.emailsProcessedThisMonth} used</span>
            <span>{trialStatus.emailQuota} remaining</span>
          </div>
          <Progress 
            value={(trialStatus.emailsProcessedThisMonth / (trialStatus.emailsProcessedThisMonth + trialStatus.emailQuota)) * 100} 
            className="h-2" 
          />
        </div>

        {/* Plan Information */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan:</span>
          <span className="font-medium capitalize">{trialStatus.plan}</span>
        </div>

        {/* Action Buttons */}
        {trialStatus.status === "trial" && (
          <div className="space-y-2 pt-2">
            {trialStatus.isExpired ? (
              <Link href="/pricing">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                  Upgrade Now
                </Button>
              </Link>
            ) : trialStatus.daysRemaining <= 7 ? (
              <Link href="/pricing">
                <Button variant="outline" className="w-full">
                  Upgrade Before Trial Ends
                </Button>
              </Link>
            ) : (
              <Link href="/pricing">
                <Button variant="ghost" className="w-full text-cyan-600 hover:text-cyan-700">
                  View Upgrade Options
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Trial End Date */}
        {trialStatus.trialEndsAt && trialStatus.status === "trial" && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Trial ends on {new Date(trialStatus.trialEndsAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}