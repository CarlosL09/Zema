import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  BarChart3,
  Settings,
  Plus,
  Activity,
  Target,
  Star,
  Archive,
  Filter,
  Inbox,
  Calendar,
  Shield,
  Workflow
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface DashboardStats {
  totalEmails: number;
  automatedActions: number;
  timeSaved: string;
  activeRules: number;
  connectedAccounts: number;
  unreadEmails: number;
  todayProcessed: number;
  weeklyGrowth: number;
  automationRate: number;
  timeEfficiency: number;
}

interface RecentActivity {
  id: number;
  action: string;
  time: string;
  type: 'automated' | 'user';
  icon: string;
  status: 'success' | 'pending' | 'info';
}

interface TopRule {
  id: number;
  name: string;
  executionsToday: number;
  timeSaved: string;
  efficiency: number;
}

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard data
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      // Mock data for demo - in production this would fetch real stats
      const mockStats: DashboardStats = {
        totalEmails: 1234,
        automatedActions: 456,
        timeSaved: "12.5h",
        activeRules: 8,
        connectedAccounts: 3,
        unreadEmails: 23,
        todayProcessed: 89,
        weeklyGrowth: 20.1,
        automationRate: 64,
        timeEfficiency: 92
      };
      return mockStats;
    }
  });

  const { data: recentActivities } = useQuery({
    queryKey: ['/api/dashboard/activities'],
    queryFn: async () => {
      const mockActivities: RecentActivity[] = [
        {
          id: 1,
          action: "Auto-archived 5 newsletter emails from TechCrunch",
          time: "2 minutes ago",
          type: "automated",
          icon: "archive",
          status: "success"
        },
        {
          id: 2,
          action: "Flagged urgent email from client as high priority",
          time: "15 minutes ago",
          type: "automated",
          icon: "flag",
          status: "success"
        },
        {
          id: 3,
          action: "Created new rule: Auto-accept team meetings",
          time: "1 hour ago",
          type: "user",
          icon: "plus",
          status: "info"
        },
        {
          id: 4,
          action: "Connected new Gmail account: work@company.com",
          time: "3 hours ago",
          type: "user",
          icon: "mail",
          status: "info"
        },
        {
          id: 5,
          action: "Processed 45 emails with smart categorization",
          time: "6 hours ago",
          type: "automated",
          icon: "filter",
          status: "success"
        }
      ];
      return mockActivities;
    }
  });

  const { data: topRules } = useQuery({
    queryKey: ['/api/dashboard/top-rules'],
    queryFn: async () => {
      const mockRules: TopRule[] = [
        {
          id: 1,
          name: "Newsletter Auto-Archive",
          executionsToday: 23,
          timeSaved: "2.3h",
          efficiency: 94
        },
        {
          id: 2,
          name: "Priority Email Flagging",
          executionsToday: 8,
          timeSaved: "45m",
          efficiency: 87
        },
        {
          id: 3,
          name: "Meeting Auto-Accept",
          executionsToday: 5,
          timeSaved: "30m",
          efficiency: 100
        }
      ];
      return mockRules;
    }
  });

  const displayStats = stats || {
    totalEmails: 0,
    automatedActions: 0,
    timeSaved: "0h",
    activeRules: 0,
    connectedAccounts: 0,
    unreadEmails: 0,
    todayProcessed: 0,
    weeklyGrowth: 0,
    automationRate: 0,
    timeEfficiency: 0
  };

  const getActivityIcon = (iconType: string) => {
    const iconMap = {
      archive: Archive,
      flag: AlertCircle,
      plus: Plus,
      mail: Mail,
      filter: Filter
    };
    const IconComponent = iconMap[iconType as keyof typeof iconMap] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back! Here's your email automation overview for today.
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/inbox">
              <Button variant="outline" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                View Inbox
              </Button>
            </Link>
            <Link href="/automation-templates">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Rule
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="rules">Top Rules</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emails Today</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.todayProcessed}</div>
                  <p className="text-xs text-muted-foreground">
                    +{displayStats.weeklyGrowth}% from last week
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Automated Actions</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.automatedActions}</div>
                  <p className="text-xs text-muted-foreground">
                    {displayStats.automationRate}% automation rate
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.timeSaved}</div>
                  <p className="text-xs text-muted-foreground">
                    This week
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread Emails</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.unreadEmails}</div>
                  <p className="text-xs text-muted-foreground">
                    3 high priority
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                </CardContent>
              </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.activeRules}</div>
                  <p className="text-xs text-muted-foreground">2 new this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.connectedAccounts}</div>
                  <p className="text-xs text-muted-foreground">Gmail, Outlook</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.totalEmails}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest email automation activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities?.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                      <div className="text-white">
                        {getActivityIcon(activity.icon)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                    <Badge variant={activity.type === 'automated' ? 'default' : 'secondary'}>
                      {activity.type === 'automated' ? 'Auto' : 'Manual'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automation Efficiency</CardTitle>
                  <CardDescription>How well your rules are performing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email Processing Rate</span>
                      <span className="text-sm text-muted-foreground">{displayStats.automationRate}%</span>
                    </div>
                    <Progress value={displayStats.automationRate} className="w-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Time Efficiency</span>
                      <span className="text-sm text-muted-foreground">{displayStats.timeEfficiency}%</span>
                    </div>
                    <Progress value={displayStats.timeEfficiency} className="w-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rule Accuracy</span>
                      <span className="text-sm text-muted-foreground">96%</span>
                    </div>
                    <Progress value={96} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Trends</CardTitle>
                  <CardDescription>Your automation performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Emails Processed</p>
                        <p className="text-xs text-muted-foreground">Monday - Sunday</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">425</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Rules Executed</p>
                        <p className="text-xs text-muted-foreground">Successful automations</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">287</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Time Saved</p>
                        <p className="text-xs text-muted-foreground">Estimated hours</p>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">12.5h</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Top Performing Rules
                </CardTitle>
                <CardDescription>Your most effective automation rules today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRules?.map((rule, index) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{rule.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {rule.executionsToday} executions today • {rule.timeSaved} saved
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{rule.efficiency}%</div>
                          <div className="text-xs text-muted-foreground">Efficiency</div>
                        </div>
                        <Progress value={rule.efficiency} className="w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    AI Insights
                  </CardTitle>
                  <CardDescription>Smart recommendations for your email workflow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Optimization Opportunity</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Create a rule to auto-archive emails from "noreply@" addresses. This could save you 30 minutes per week.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Great Progress!</h4>
                    <p className="text-sm text-green-700 dark:text-green-200">
                      Your automation rate increased by 25% this week. Keep up the excellent work!
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Account Suggestion</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-200">
                      Consider connecting your secondary Gmail account to centralize all email management.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Overview
                  </CardTitle>
                  <CardDescription>Email security and compliance status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phishing Detection</span>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Spam Filtering</span>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Encryption</span>
                    <Badge variant="default" className="bg-green-600">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliance Check</span>
                    <Badge variant="secondary">Last scan: 2 hours ago</Badge>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      All security measures are active. No threats detected in the last 7 days.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/inbox">
                <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Inbox className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">Check Inbox</span>
                </Button>
              </Link>
              
              <Link href="/automation-templates">
                <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-green-50 dark:hover:bg-green-900/20">
                  <Zap className="h-6 w-6 text-green-600" />
                  <span className="text-sm">Create Rule</span>
                </Button>
              </Link>
              
              <Link href="/email-accounts">
                <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <Users className="h-6 w-6 text-purple-600" />
                  <span className="text-sm">Add Account</span>
                </Button>
              </Link>
              
              <Link href="/platform-integrations">
                <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                  <span className="text-sm">Integrations</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}