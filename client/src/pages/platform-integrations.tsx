import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus,
  Settings,
  Trash2,
  TestTube,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

// Platform integration form schema
const integrationSchema = z.object({
  name: z.string().min(1, "Integration name is required"),
  platform: z.string().min(1, "Platform is required"),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

type IntegrationFormData = z.infer<typeof integrationSchema>;

interface PlatformIntegration {
  id: number;
  name: string;
  platform: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  config?: any;
  status: string;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function PlatformIntegrations() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<PlatformIntegration | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<number, boolean>>({});

  // Fetch user integrations
  const { data: integrations = [], isLoading, refetch } = useQuery<PlatformIntegration[]>({
    queryKey: ["/api/integrations"],
  });

  // Create integration mutation
  const createMutation = useMutation({
    mutationFn: async (data: IntegrationFormData) => {
      const response = await apiRequest("POST", "/api/integrations", {
        ...data,
        config: data.webhookUrl ? { webhookUrl: data.webhookUrl } : {}
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsAddDialogOpen(false);
      toast({ title: "Integration created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete integration mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({ title: "Integration deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test integration mutation
  const testMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/integrations/${id}/test`);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: result.success ? "Test successful" : "Test failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sync integration mutation
  const syncMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/integrations/${id}/sync`);
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: result.success ? "Sync successful" : "Sync failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      name: "",
      platform: "",
      apiKey: "",
      apiSecret: "",
      accessToken: "",
      refreshToken: "",
      webhookUrl: "",
      description: "",
    },
  });

  const onSubmit = (data: IntegrationFormData) => {
    createMutation.mutate(data);
  };

  const toggleApiKeyVisibility = (integrationId: number) => {
    setShowApiKeys(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Connected</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const platformOptions = [
    { value: "notion", label: "Notion" },
    { value: "zapier", label: "Zapier" },
    { value: "pabbly", label: "Pabbly Connect" },
    { value: "airtable", label: "Airtable" },
    { value: "slack", label: "Slack" },
    { value: "discord", label: "Discord" },
    { value: "telegram", label: "Telegram" },
    { value: "trello", label: "Trello" },
    { value: "asana", label: "Asana" },
    { value: "monday", label: "Monday.com" },
    { value: "clickup", label: "ClickUp" },
    { value: "linear", label: "Linear" },
    { value: "jira", label: "Jira" },
    { value: "github", label: "GitHub" },
    { value: "gitlab", label: "GitLab" },
    { value: "salesforce", label: "Salesforce" },
    { value: "hubspot", label: "HubSpot" },
    { value: "pipedrive", label: "Pipedrive" },
    { value: "stripe", label: "Stripe" },
    { value: "paypal", label: "PayPal" },
    { value: "shopify", label: "Shopify" },
    { value: "google_calendar", label: "Google Calendar" },
    { value: "outlook_calendar", label: "Outlook Calendar" },
    { value: "zoom", label: "Zoom" },
    { value: "teams", label: "Microsoft Teams" },
    { value: "google_meet", label: "Google Meet" },
    { value: "calendly", label: "Calendly" },
    { value: "typeform", label: "Typeform" },
    { value: "google_forms", label: "Google Forms" },
    { value: "mailchimp", label: "Mailchimp" },
    { value: "sendgrid", label: "SendGrid" },
    { value: "twilio", label: "Twilio" },
    { value: "dropbox", label: "Dropbox" },
    { value: "google_drive", label: "Google Drive" },
    { value: "onedrive", label: "OneDrive" },
    { value: "aws_s3", label: "AWS S3" },
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Anthropic" },
    { value: "cohere", label: "Cohere" },
    { value: "custom", label: "Custom API" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Platform Integrations
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Connect and manage your third-party platform integrations
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Integration</DialogTitle>
                  <DialogDescription>
                    Connect a new platform to enhance your email automation capabilities.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My Notion Workspace" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="platform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {platformOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your API key" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apiSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Secret (Optional)</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your API secret" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/webhook" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe this integration..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Create Integration
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {integrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No integrations yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Connect your first platform integration to start automating your workflows.
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Integration
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      {getStatusBadge(integration.status)}
                    </div>
                    <CardDescription>
                      {integration.platform.charAt(0).toUpperCase() + integration.platform.slice(1)} integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      {/* API Key Display */}
                      {integration.apiKey && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              API Key
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleApiKeyVisibility(integration.id)}
                            >
                              {showApiKeys[integration.id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {showApiKeys[integration.id] ? integration.apiKey : "••••••••••••••••"}
                          </p>
                        </div>
                      )}

                      {/* Last Sync */}
                      {integration.lastSync && (
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Sync
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(integration.lastSync).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testMutation.mutate(integration.id)}
                          disabled={testMutation.isPending}
                        >
                          {testMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4 mr-1" />
                          )}
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncMutation.mutate(integration.id)}
                          disabled={syncMutation.isPending}
                        >
                          {syncMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-1" />
                          )}
                          Sync
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(integration.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Integration Help
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Secure Storage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  All API keys are encrypted before storage
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ExternalLink className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Platform Docs</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Check platform documentation for API setup
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TestTube className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Test Connections</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Verify your integrations work correctly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}