import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Mail, 
  Plus, 
  Settings, 
  Trash2, 
  RefreshCw, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Star,
  Globe
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface EmailAccount {
  id: number;
  emailAddress: string;
  provider: string;
  displayName?: string;
  isActive: boolean;
  isPrimary: boolean;
  syncStatus: string;
  lastSyncAt?: string;
  createdAt: string;
}

export default function EmailAccounts() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    emailAddress: "",
    provider: "",
    displayName: "",
    password: "",
    imapServer: "",
    imapPort: ""
  });

  // Handle OAuth callback messages from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success) {
      toast({
        title: "Success",
        description: success,
      });
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
      // Refresh accounts list
      queryClient.invalidateQueries({ queryKey: ["/api/email-accounts"] });
    } else if (error) {
      toast({
        title: "OAuth Error",
        description: error,
        variant: "destructive",
      });
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast, queryClient]);

  // Fetch email accounts
  const { data: accounts = [], isLoading } = useQuery<EmailAccount[]>({
    queryKey: ["/api/email-accounts"],
  });

  // Add email account mutation
  const addAccountMutation = useMutation({
    mutationFn: async (accountData: typeof newAccount) => {
      const response = await apiRequest("POST", "/api/email-accounts", accountData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-accounts"] });
      setIsAddDialogOpen(false);
      setNewAccount({ emailAddress: "", provider: "", displayName: "", password: "", imapServer: "", imapPort: "" });
      toast({
        title: "Success",
        description: "Email account added successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add email account",
        variant: "destructive",
      });
    },
  });

  const handleOAuthConnect = async (provider: string) => {
    if (!newAccount.emailAddress) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("GET", `/api/oauth/${provider}/auth?email=${encodeURIComponent(newAccount.emailAddress)}`);
      const data = await response.json();

      if (data.authUrl) {
        // Open OAuth flow in new window
        window.open(data.authUrl, '_blank', 'width=500,height=600');
        toast({
          title: "OAuth Started",
          description: `Please complete authentication in the popup window`,
        });
      } else {
        throw new Error(data.message || 'Failed to start OAuth flow');
      }
    } catch (error: any) {
      if (error.message.includes('OAuth not configured')) {
        toast({
          title: "OAuth Setup Required",
          description: "OAuth credentials are not configured. Please use the App Password option below for now.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "OAuth Error",
          description: error.message || `Failed to start ${provider} OAuth`,
          variant: "destructive",
        });
      }
    }
  };

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      await apiRequest("DELETE", `/api/email-accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-accounts"] });
      toast({
        title: "Success",
        description: "Email account removed successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove email account",
        variant: "destructive",
      });
    },
  });

  // Sync account mutation
  const syncAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await apiRequest("POST", `/api/email-accounts/${accountId}/sync`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-accounts"] });
      toast({
        title: "Success",
        description: "Email sync started successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start sync",
        variant: "destructive",
      });
    },
  });

  // Set primary account mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await apiRequest("POST", `/api/email-accounts/${accountId}/set-primary`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-accounts"] });
      toast({
        title: "Success",
        description: "Primary account updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set primary account",
        variant: "destructive",
      });
    },
  });

  const handleAddAccount = () => {
    if (!newAccount.emailAddress || !newAccount.provider) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    addAccountMutation.mutate(newAccount);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'gmail':
        return <Mail className="w-5 h-5 text-red-500" />;
      case 'outlook':
        return <Mail className="w-5 h-5 text-blue-500" />;
      default:
        return <Globe className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Synced</Badge>;
      case 'syncing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Syncing</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected email accounts and sync settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              window.location.href = '/dashboard';
            }}
          >
            ← Back to Dashboard
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => {
              console.log("Button clicked - current state:", isAddDialogOpen);
              setIsAddDialogOpen(true);
              console.log("Dialog state set to true");
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>

        {isAddDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Add Email Account</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Connect a new email account to ZEMA for automation and management.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newAccount.emailAddress}
                    onChange={(e) => setNewAccount({ ...newAccount, emailAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Email Provider</Label>
                  <Select value={newAccount.provider} onValueChange={(value) => setNewAccount({ ...newAccount, provider: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmail">Gmail</SelectItem>
                      <SelectItem value="outlook">Outlook</SelectItem>
                      <SelectItem value="yahoo">Yahoo</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name (Optional)</Label>
                  <Input
                    id="displayName"
                    placeholder="Enter display name"
                    value={newAccount.displayName}
                    onChange={(e) => setNewAccount({ ...newAccount, displayName: e.target.value })}
                  />
                </div>
                
                {/* Authentication section */}
                {newAccount.provider && (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-medium text-sm">Authentication</h3>
                    
                    {(newAccount.provider === 'gmail' || newAccount.provider === 'outlook') && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          For {newAccount.provider === 'gmail' ? 'Gmail' : 'Outlook'}, you can use either OAuth (recommended) or App Password
                        </div>
                        
                        {/* OAuth Option */}
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">OAuth Authentication (Recommended)</h4>
                              <p className="text-xs text-muted-foreground">Secure authentication via {newAccount.provider === 'gmail' ? 'Google' : 'Microsoft'}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOAuthConnect(newAccount.provider)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            >
                              Connect via OAuth
                            </Button>
                          </div>
                        </div>
                        
                        {/* Password Option */}
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm mb-2">App Password</h4>
                          <div className="space-y-2">
                            <Input
                              type="password"
                              placeholder="Enter app password"
                              value={newAccount.password}
                              onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                            />
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>Generate an app password in your {newAccount.provider === 'gmail' ? 'Google' : 'Microsoft'} account settings:</p>
                              <div className="pl-2 space-y-1">
                                {newAccount.provider === 'gmail' ? (
                                  <>
                                    <p>• Go to Google Account → Security → 2-Step Verification</p>
                                    <p>• Click "App passwords" and generate one for "Mail"</p>
                                  </>
                                ) : (
                                  <>
                                    <p>• Go to Outlook.com → Security → Advanced security options</p>
                                    <p>• Generate an app password for IMAP/SMTP access</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(newAccount.provider === 'yahoo' || newAccount.provider === 'other') && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password or app password"
                          value={newAccount.password}
                          onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Use your email password or generate an app password for better security
                        </p>
                      </div>
                    )}
                    
                    {newAccount.provider === 'other' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="imapServer">IMAP Server</Label>
                          <Input
                            id="imapServer"
                            placeholder="e.g. imap.gmail.com"
                            value={newAccount.imapServer || ''}
                            onChange={(e) => setNewAccount({ ...newAccount, imapServer: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="imapPort">IMAP Port</Label>
                          <Input
                            id="imapPort"
                            placeholder="993"
                            value={newAccount.imapPort || ''}
                            onChange={(e) => setNewAccount({ ...newAccount, imapPort: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAccount} disabled={addAccountMutation.isPending}>
                  {addAccountMutation.isPending ? "Adding..." : "Add Account"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{accounts.filter(a => a.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Synced</p>
                <p className="text-2xl font-bold">{accounts.filter(a => a.syncStatus === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Primary</p>
                <p className="text-2xl font-bold">{accounts.filter(a => a.isPrimary).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Accounts List */}
      <div className="space-y-4">
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Email Accounts</h3>
              <p className="text-muted-foreground mb-4">
                Connect your first email account to start using ZEMA's automation features.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getProviderIcon(account.provider)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{account.emailAddress}</h3>
                        {account.isPrimary && (
                          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                        {getSyncStatusBadge(account.syncStatus)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {account.displayName || account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
                      </p>
                      {account.lastSyncAt && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {new Date(account.lastSyncAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={account.isActive}
                      onCheckedChange={(checked) => {
                        // Toggle active status - implement if needed
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncAccountMutation.mutate(account.id)}
                      disabled={syncAccountMutation.isPending}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    {!account.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryMutation.mutate(account.id)}
                        disabled={setPrimaryMutation.isPending}
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAccountMutation.mutate(account.id)}
                      disabled={deleteAccountMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}