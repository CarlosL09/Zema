import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Mail,
  Star,
  Settings,
  RefreshCw,
  Users,
  BarChart3,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import Navigation from "@/components/navigation";

export default function Dashboard() {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      emailAddress: "john@company.com",
      provider: "gmail",
      displayName: "Work Gmail",
      isPrimary: true,
      isActive: true,
      syncStatus: "completed",
      lastSyncAt: new Date("2025-01-04T14:30:00"),
      unreadCount: 12,
      settings: { notifications: true, autoSync: true }
    },
    {
      id: 2,
      emailAddress: "john.doe@outlook.com", 
      provider: "outlook",
      displayName: "Personal Outlook",
      isPrimary: false,
      isActive: true,
      syncStatus: "syncing",
      lastSyncAt: new Date("2025-01-04T14:25:00"),
      unreadCount: 5,
      settings: { notifications: false, autoSync: true }
    },
    {
      id: 3,
      emailAddress: "support@company.com",
      provider: "gmail",
      displayName: "Support Gmail",
      isPrimary: false,
      isActive: true,
      syncStatus: "completed",
      lastSyncAt: new Date("2025-01-04T14:20:00"),
      unreadCount: 28,
      settings: { notifications: true, autoSync: false }
    }
  ]);

  const [recentEmails] = useState([
    {
      id: 1,
      subject: "Q4 Sales Report Review",
      sender: "sarah@company.com",
      accountEmail: "john@company.com",
      provider: "gmail",
      receivedAt: new Date("2025-01-04T14:45:00"),
      isRead: false,
      priority: "high"
    },
    {
      id: 2,
      subject: "Team Meeting Tomorrow",
      sender: "mike@company.com", 
      accountEmail: "john@company.com",
      provider: "gmail",
      receivedAt: new Date("2025-01-04T14:30:00"),
      isRead: false,
      priority: "medium"
    },
    {
      id: 3,
      subject: "Weekend Plans",
      sender: "friend@example.com",
      accountEmail: "john.doe@outlook.com",
      provider: "outlook",
      receivedAt: new Date("2025-01-04T13:15:00"),
      isRead: true,
      priority: "low"
    },
    {
      id: 4,
      subject: "Customer Issue #2847",
      sender: "customer@client.com",
      accountEmail: "support@company.com", 
      provider: "gmail",
      receivedAt: new Date("2025-01-04T12:30:00"),
      isRead: false,
      priority: "high"
    }
  ]);

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProviderIcon = (provider: string) => {
    return provider === 'gmail' ? '📧' : '📮';
  };

  const totalUnread = accounts.reduce((sum, acc) => sum + acc.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Email Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage multiple email accounts from one place
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Accounts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{accounts.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread Emails</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUnread}</p>
                </div>
                <Mail className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Syncs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {accounts.filter(acc => acc.syncStatus === 'syncing').length}
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Insights</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">15</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inbox" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="inbox">Unified Inbox</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Unified Inbox */}
          <TabsContent value="inbox">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Unified Inbox</CardTitle>
                      <CardDescription>
                        All your emails from multiple accounts in one place
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search emails..." className="pl-10 w-64" />
                      </div>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentEmails.map((email) => (
                      <div
                        key={email.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          !email.isRead ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : ''
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getProviderIcon(email.provider)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {email.subject}
                            </p>
                            {!email.isRead && (
                              <Badge variant="secondary" className="text-xs">New</Badge>
                            )}
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(email.priority)}`}>
                              {email.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>{email.sender}</span>
                            <span>•</span>
                            <span>{email.accountEmail}</span>
                            <span>•</span>
                            <span>{email.receivedAt.toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Account Management */}
          <TabsContent value="accounts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Email Accounts</CardTitle>
                  <CardDescription>
                    Manage your connected email accounts and sync settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div key={account.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {getProviderIcon(account.provider)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {account.displayName}
                            </h3>
                            {account.isPrimary && (
                              <Badge variant="default">
                                <Star className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                            <Badge variant="outline" className="capitalize">
                              {account.provider}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {account.emailAddress}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <div className="flex items-center gap-1">
                              {getSyncStatusIcon(account.syncStatus)}
                              <span className="text-gray-600 dark:text-gray-400 capitalize">
                                {account.syncStatus}
                              </span>
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">
                              {account.unreadCount} unread
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              Last sync: {account.lastSyncAt.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          {!account.isPrimary && (
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Add New Account</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" placeholder="john@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="provider">Provider</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gmail">Gmail</SelectItem>
                            <SelectItem value="outlook">Outlook</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button>Connect Account</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Cross-Account Analytics</CardTitle>
                  <CardDescription>
                    Insights and patterns across all your email accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Email Volume by Account</h3>
                      {accounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm">{account.emailAddress}</span>
                          </div>
                          <span className="text-sm font-medium">{account.unreadCount} emails</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">AI Insights</h3>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>• 68% of emails from work account are meeting requests</p>
                        <p>• Support emails typically require 2.3 hour response time</p>
                        <p>• Personal emails mostly received in evenings</p>
                        <p>• 15 emails flagged as high priority this week</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}