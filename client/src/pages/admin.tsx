import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, DollarSign, Mail, TrendingUp, Clock, Shield, Search, LogOut, Trash2, KeyRound, Ban, CheckCircle, Settings } from "lucide-react";
import { useState } from "react";
import Navigation from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionStatus: string;
  subscriptionPlan: string;
  trialEndsAt: string;
  subscriptionEndsAt: string;
  emailsProcessedThisMonth: number;
  emailLimitPerMonth: number;
  aiTokensUsedThisMonth: number;
  aiCostThisMonth: number;
  azureCreditsUsed: number;
  azureCreditsLimit: number;
  isBlocked: boolean;
  blockedReason: string | null;
  blockedAt: string | null;
  blockedBy: string | null;
  createdAt: string;
  lastLoginAt: string;
}

interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  trialUsers: number;
  expiredTrials: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalEmailsProcessed: number;
  averageEmailsPerUser: number;
  totalAiCosts: number;
  totalAzureCosts: number;
  averageAiCostPerUser: number;
  averageAzureCostPerUser: number;
}

export default function Admin() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPlan, setNewPlan] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [blockReason, setBlockReason] = useState<string>("");

  // All hooks must be called before any early returns
  const { data: adminStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/admin/status"],
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/users-stats"],
    enabled: !statusLoading && adminStatus?.isAdmin, // Only run if authenticated
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !statusLoading && adminStatus?.isAdmin, // Only run if authenticated
  });

  const { data: recentSignups } = useQuery<User[]>({
    queryKey: ["/api/admin/recent-signups"],
    enabled: !statusLoading && adminStatus?.isAdmin, // Only run if authenticated
  });

  // Admin mutations for user management - MUST be called before any early returns
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, plan, status }: { userId: string; plan: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/subscription`, { plan, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users-stats"] });
      toast({
        title: "Success",
        description: "User subscription updated successfully",
      });
      setSelectedUser(null);
      setNewPlan("");
      setNewStatus("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/block`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users-stats"] });
      toast({
        title: "Success",
        description: "User blocked successfully",
      });
      setSelectedUser(null);
      setBlockReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to block user",
        variant: "destructive",
      });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/unblock`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users-stats"] });
      toast({
        title: "Success",
        description: "User unblocked successfully",
      });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unblock user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users-stats"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Generate a temporary password
      const tempPassword = 'ZEMA' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!';
      await apiRequest("POST", `/api/admin/users/${userId}/reset-password`, {
        newPassword: tempPassword
      });
      return tempPassword;
    },
    onSuccess: (tempPassword) => {
      toast({
        title: "Password Reset",
        description: `New temporary password: ${tempPassword}`,
        duration: 10000, // Show for 10 seconds
      });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  // Handle authentication after all hooks are called
  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!adminStatus?.isAdmin) {
    window.location.href = "/admin-login";
    return null;
  }

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      toast({
        title: "Logged out",
        description: "Admin session ended",
      });
      window.location.href = "/admin-login";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.subscriptionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "trial": return "secondary";
      case "trial_expired": return "destructive";
      case "cancelled": return "outline";
      default: return "secondary";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "enterprise": return "default";
      case "professional": return "secondary";
      case "starter": return "outline";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (statsLoading || usersLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Monitor your ZEMA business metrics and user activity
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeSubscribers || 0} active subscribers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats?.totalRevenue || 0)} total revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.trialUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.expiredTrials || 0} expired trials
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Processed</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalEmailsProcessed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(stats?.averageEmailsPerUser || 0)} avg per user
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI & Azure Cost Analytics */}
          <div className="mb-4 flex justify-end">
            <Button
              onClick={async () => {
                try {
                  await apiRequest("POST", "/api/generate-sample-usage");
                  toast({
                    title: "Success",
                    description: "Sample usage data generated successfully",
                  });
                  // Refresh stats
                  window.location.reload();
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to generate sample data",
                    variant: "destructive",
                  });
                }
              }}
              variant="outline"
              size="sm"
            >
              Generate Sample Usage Data
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total AI Costs</CardTitle>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">OpenAI</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${((stats?.totalAiCosts || 0) / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: ${((stats?.averageAiCostPerUser || 0) / 100).toFixed(2)} per user
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Azure Costs</CardTitle>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Azure</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${((stats?.totalAzureCosts || 0) / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: ${((stats?.averageAzureCostPerUser || 0) / 100).toFixed(2)} per user
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Combined API Costs</CardTitle>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Total</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(((stats?.totalAiCosts || 0) + (stats?.totalAzureCosts || 0)) / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  OpenAI + Azure
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Per User</CardTitle>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Avg</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.totalUsers ? (((stats.totalAiCosts + stats.totalAzureCosts) / stats.totalUsers) / 100).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">All Users</TabsTrigger>
              <TabsTrigger value="recent">Recent Signups</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="trial_expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Emails Used</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(user.subscriptionStatus)}>
                              {user.subscriptionStatus.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPlanColor(user.subscriptionPlan)}>
                              {user.subscriptionPlan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              {user.emailsProcessedThisMonth || 0} / {user.emailLimitPerMonth || 0}
                              {user.isBlocked && (
                                <div className="text-xs text-red-600 mt-1">
                                  Access Blocked
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setNewPlan(user.subscriptionPlan);
                                      setNewStatus(user.subscriptionStatus);
                                    }}
                                    className="h-8"
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Manage User Subscription</DialogTitle>
                                    <DialogDescription>
                                      Update subscription plan and status for {user.firstName} {user.lastName} ({user.email})
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="plan">Subscription Plan</Label>
                                      <Select value={newPlan} onValueChange={setNewPlan}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="free">Free</SelectItem>
                                          <SelectItem value="pro">Pro</SelectItem>
                                          <SelectItem value="enterprise">Enterprise</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="status">Subscription Status</Label>
                                      <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="trial">Trial</SelectItem>
                                          <SelectItem value="active">Active</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                          <SelectItem value="expired">Expired</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={() => {
                                        if (selectedUser && newPlan && newStatus) {
                                          updateSubscriptionMutation.mutate({
                                            userId: selectedUser.id,
                                            plan: newPlan,
                                            status: newStatus
                                          });
                                        }
                                      }}
                                      disabled={updateSubscriptionMutation.isPending}
                                    >
                                      Update Subscription
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              {user.isBlocked ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => unblockUserMutation.mutate(user.id)}
                                  disabled={unblockUserMutation.isPending}
                                  className="h-8"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setBlockReason("");
                                      }}
                                      className="h-8"
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Block User</DialogTitle>
                                      <DialogDescription>
                                        Block access for {user.firstName} {user.lastName} ({user.email})
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="reason">Reason for blocking</Label>
                                        <Textarea
                                          id="reason"
                                          placeholder="Enter reason for blocking this user..."
                                          value={blockReason}
                                          onChange={(e) => setBlockReason(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="destructive"
                                        onClick={() => {
                                          if (selectedUser && blockReason.trim()) {
                                            blockUserMutation.mutate({
                                              userId: selectedUser.id,
                                              reason: blockReason
                                            });
                                          }
                                        }}
                                        disabled={blockUserMutation.isPending || !blockReason.trim()}
                                      >
                                        Block User
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}

                              {/* Reset Password Button for Active Users */}
                              {user.subscriptionStatus === 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Reset password for ${user.email}? A new temporary password will be generated.`)) {
                                      resetPasswordMutation.mutate(user.id);
                                    }
                                  }}
                                  disabled={resetPasswordMutation.isPending}
                                  className="h-8 text-blue-600 hover:text-blue-700"
                                >
                                  <KeyRound className="h-4 w-4" />
                                </Button>
                              )}

                              {/* Delete User Button for Inactive Users */}
                              {['trial_expired', 'cancelled', 'expired'].includes(user.subscriptionStatus) && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to permanently delete user ${user.email}? This action cannot be undone.`)) {
                                      deleteUserMutation.mutate(user.id);
                                    }
                                  }}
                                  disabled={deleteUserMutation.isPending}
                                  className="h-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Signups (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Trial Ends</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentSignups?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(user.subscriptionStatus)}>
                              {user.subscriptionStatus.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPlanColor(user.subscriptionPlan)}>
                              {user.subscriptionPlan}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            {user.trialEndsAt ? formatDate(user.trialEndsAt) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Subscription Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Active Subscribers</span>
                        <Badge variant="default">{stats?.activeSubscribers || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Trial Users</span>
                        <Badge variant="secondary">{stats?.trialUsers || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Expired Trials</span>
                        <Badge variant="destructive">{stats?.expiredTrials || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Email Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Processed</span>
                        <span className="font-semibold">{stats?.totalEmailsProcessed || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average per User</span>
                        <span className="font-semibold">{Math.round(stats?.averageEmailsPerUser || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Revenue</span>
                        <span className="font-semibold">{formatCurrency(stats?.totalRevenue || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}