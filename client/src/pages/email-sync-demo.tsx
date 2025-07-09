import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Folder, 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  Cloud,
  Globe
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailAccount {
  id: number;
  provider: string;
  email: string;
  displayName: string;
  syncStatus: 'pending' | 'syncing' | 'completed' | 'error';
  lastSyncAt: Date;
  folderCount: number;
  emailCount: number;
}

interface SyncedFolder {
  id: string;
  name: string;
  provider: string;
  messageCount: number;
  unreadCount: number;
  smartFolderId: number;
}

interface EmailSyncData {
  connectedAccounts: EmailAccount[];
  syncedFolders: SyncedFolder[];
  totalSyncedEmails: number;
  totalUnreadEmails: number;
  supportedProviders: Array<{
    type: string;
    name: string;
    requiresOAuth: boolean;
  }>;
}

function getProviderIcon(provider: string) {
  switch (provider) {
    case 'gmail':
      return <Globe className="h-4 w-4 text-red-500" />;
    case 'outlook':
      return <Cloud className="h-4 w-4 text-blue-500" />;
    case 'yahoo':
      return <Mail className="h-4 w-4 text-purple-500" />;
    default:
      return <Mail className="h-4 w-4 text-gray-500" />;
  }
}

function getSyncStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'syncing':
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />;
  }
}

function getSyncStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'syncing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  }
}

export default function EmailSyncDemo() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  const { data: syncData, isLoading } = useQuery<EmailSyncData>({
    queryKey: ['/api/email-sync/demo'],
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!syncData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No email sync data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { connectedAccounts, syncedFolders, totalSyncedEmails, totalUnreadEmails, supportedProviders } = syncData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Email Account Synchronization</h1>
        <p className="text-muted-foreground">
          Connect and sync your email accounts to mirror their folder structures with AI-powered organization
        </p>
      </div>

      {/* Key Feature Alert */}
      <Alert>
        <RefreshCw className="h-4 w-4" />
        <AlertDescription>
          <strong>Real Email Integration:</strong> ZEMA syncs with your actual Gmail, Outlook, and Yahoo accounts, 
          mirroring their exact folder structures while adding intelligent AI-powered organization on top.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Active email providers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Synced Folders</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncedFolders.length}</div>
            <p className="text-xs text-muted-foreground">
              Mirrored folder structures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSyncedEmails.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Emails</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnreadEmails}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="folders">Synced Folders</TabsTrigger>
          <TabsTrigger value="providers">Add Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Email Accounts</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Connect Account
            </Button>
          </div>

          <div className="grid gap-4">
            {connectedAccounts.map((account) => (
              <Card key={account.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getProviderIcon(account.provider)}
                      <div>
                        <CardTitle className="text-lg">{account.displayName}</CardTitle>
                        <CardDescription>{account.email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getSyncStatusIcon(account.syncStatus)}
                      <Badge className={getSyncStatusColor(account.syncStatus)}>
                        {account.syncStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Account Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{account.folderCount}</p>
                      <p className="text-sm text-muted-foreground">Folders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{account.emailCount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Emails</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Last Sync</p>
                      <p className="text-sm font-medium">
                        {new Date(account.lastSyncAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Provider</p>
                      <p className="text-sm font-medium capitalize">{account.provider}</p>
                    </div>
                  </div>

                  {/* Sync Progress */}
                  {account.syncStatus === 'syncing' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Syncing folders...</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  )}

                  {/* Account Actions */}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mirrored Folder Structure</h2>
            <p className="text-sm text-muted-foreground">
              AI-enhanced organization of your original email folders
            </p>
          </div>

          <div className="grid gap-4">
            {syncedFolders.map((folder) => (
              <Card key={folder.id} className="transition-all hover:shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-medium">{folder.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {getProviderIcon(folder.provider)}
                          <span className="capitalize">{folder.provider}</span>
                          <span>•</span>
                          <span>Smart Folder #{folder.smartFolderId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold">{folder.messageCount}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-blue-600">{folder.unreadCount}</p>
                          <p className="text-xs text-muted-foreground">Unread</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Enhancement Indicator */}
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>AI Enhanced:</strong> Smart categorization, priority detection, and automated organization applied
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Supported Email Providers</h2>
            <p className="text-sm text-muted-foreground">
              Connect additional email accounts for unified management
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {supportedProviders.map((provider) => (
              <Card key={provider.type} className="transition-all hover:shadow-md cursor-pointer border-2 hover:border-blue-200">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-4">
                    {getProviderIcon(provider.type)}
                  </div>
                  <h3 className="font-semibold mb-2">{provider.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {provider.requiresOAuth ? 'OAuth 2.0' : 'IMAP/SMTP'}
                  </p>
                  <Button className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Connection Benefits */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Why Connect Your Email Accounts?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Exact Folder Mirroring</h4>
                      <p className="text-sm text-muted-foreground">
                        ZEMA replicates your existing folder structure perfectly
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">AI-Powered Enhancement</h4>
                      <p className="text-sm text-muted-foreground">
                        Smart categorization and priority detection on top of your folders
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Real-Time Synchronization</h4>
                      <p className="text-sm text-muted-foreground">
                        Changes in your email provider sync instantly to ZEMA
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Cross-Account Intelligence</h4>
                      <p className="text-sm text-muted-foreground">
                        Unified insights across all your connected email accounts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}