import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  Settings, 
  Globe, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Link,
  Zap,
  Webhook
} from "lucide-react";

const webhookFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Valid URL is required"),
  platform: z.string().min(1, "Platform is required"),
  events: z.array(z.string()).min(1, "At least one event is required"),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
  isActive: z.boolean().default(true)
});

type WebhookFormData = z.infer<typeof webhookFormSchema>;

const PLATFORM_OPTIONS = [
  { value: 'notion', label: 'Notion', icon: '📝' },
  { value: 'zapier', label: 'Zapier', icon: '⚡' },
  { value: 'pabbly', label: 'Pabbly Connect', icon: '🔗' },
  { value: 'slack', label: 'Slack', icon: '💬' },
  { value: 'discord', label: 'Discord', icon: '🎮' },
  { value: 'teams', label: 'Microsoft Teams', icon: '👥' },
  { value: 'custom', label: 'Custom', icon: '🔧' }
];

const EVENT_OPTIONS = [
  { value: 'email.received', label: 'Email Received' },
  { value: 'email.sent', label: 'Email Sent' },
  { value: 'email.automated', label: 'Email Automated' },
  { value: 'template.used', label: 'Template Used' },
  { value: 'rule.triggered', label: 'Rule Triggered' },
  { value: 'integration.connected', label: 'Integration Connected' },
  { value: 'trial.started', label: 'Trial Started' },
  { value: 'subscription.created', label: 'Subscription Created' },
  { value: 'user.created', label: 'User Created' }
];

export default function WebhooksPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: "",
      url: "",
      platform: "",
      events: [],
      secret: "",
      headers: {},
      isActive: true
    }
  });

  // Fetch webhooks
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['/api/webhooks'],
  });

  // Fetch webhook stats
  const { data: stats } = useQuery({
    queryKey: ['/api/webhooks/stats'],
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormData) => {
      const res = await apiRequest("POST", "/api/webhooks", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks/stats'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Webhook created",
        description: "Your webhook has been created successfully.",
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

  // Update webhook mutation
  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<WebhookFormData>) => {
      const res = await apiRequest("PUT", `/api/webhooks/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks/stats'] });
      setEditingWebhook(null);
      toast({
        title: "Webhook updated",
        description: "Your webhook has been updated successfully.",
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

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/webhooks/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks/stats'] });
      toast({
        title: "Webhook deleted",
        description: "Your webhook has been deleted successfully.",
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

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/webhooks/${id}/test`);
      return await res.json();
    },
    onSuccess: (result) => {
      toast({
        title: result.success ? "Test successful" : "Test failed",
        description: result.success ? "Webhook test completed successfully." : result.error,
        variant: result.success ? "default" : "destructive",
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

  const onSubmit = (data: WebhookFormData) => {
    if (editingWebhook) {
      updateWebhookMutation.mutate({ id: editingWebhook.id, ...data });
    } else {
      createWebhookMutation.mutate(data);
    }
  };

  const handleEdit = (webhook: any) => {
    setEditingWebhook(webhook);
    form.reset({
      name: webhook.name,
      url: webhook.url,
      platform: webhook.platform,
      events: webhook.events,
      secret: webhook.secret || "",
      headers: webhook.headers || {},
      isActive: webhook.isActive
    });
    setIsCreateDialogOpen(true);
  };

  const handleToggleActive = (webhook: any) => {
    updateWebhookMutation.mutate({
      id: webhook.id,
      isActive: !webhook.isActive
    });
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = PLATFORM_OPTIONS.find(p => p.value === platform);
    return platformData?.icon || '🔧';
  };

  const getPlatformLabel = (platform: string) => {
    const platformData = PLATFORM_OPTIONS.find(p => p.value === platform);
    return platformData?.label || platform;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-gray-600 mt-2">
            Connect ZEMA with your favorite automation platforms
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingWebhook ? 'Edit Webhook' : 'Create New Webhook'}
              </DialogTitle>
              <DialogDescription>
                Set up a webhook to receive real-time notifications from ZEMA
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
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Webhook" {...field} />
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
                            {PLATFORM_OPTIONS.map((platform) => (
                              <SelectItem key={platform.value} value={platform.value}>
                                <span className="flex items-center gap-2">
                                  <span>{platform.icon}</span>
                                  {platform.label}
                                </span>
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
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://hooks.zapier.com/hooks/catch/..." {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL where ZEMA will send webhook notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="events"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Events</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {EVENT_OPTIONS.map((event) => (
                          <div key={event.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={event.value}
                              checked={field.value.includes(event.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, event.value]);
                                } else {
                                  field.onChange(field.value.filter(v => v !== event.value));
                                }
                              }}
                              className="rounded"
                            />
                            <label htmlFor={event.value} className="text-sm">
                              {event.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Webhook secret for verification" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used to verify webhook authenticity via HMAC signature
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Enable this webhook to receive events
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingWebhook(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createWebhookMutation.isPending || updateWebhookMutation.isPending}
                  >
                    {editingWebhook ? 'Update' : 'Create'} Webhook
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWebhooks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Webhooks</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeWebhooks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Webhooks</CardTitle>
          <CardDescription>
            Manage your webhook integrations with external platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-12">
              <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No webhooks yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first webhook to start receiving real-time notifications
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Webhook
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook: any) => (
                <div key={webhook.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPlatformIcon(webhook.platform)}</span>
                      <div>
                        <h3 className="font-medium">{webhook.name}</h3>
                        <p className="text-sm text-gray-600">{getPlatformLabel(webhook.platform)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={webhook.isActive ? "default" : "secondary"}>
                        {webhook.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testWebhookMutation.mutate(webhook.id)}
                          disabled={testWebhookMutation.isPending}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(webhook)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(webhook)}
                        >
                          {webhook.isActive ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                          disabled={deleteWebhookMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p><strong>URL:</strong> {webhook.url}</p>
                    <p><strong>Events:</strong> {webhook.events.join(", ")}</p>
                    {webhook.lastTriggered && (
                      <p><strong>Last triggered:</strong> {new Date(webhook.lastTriggered).toLocaleString()}</p>
                    )}
                    <div className="flex gap-4 mt-2">
                      <span className="text-green-600">✓ {webhook.successCount} successes</span>
                      <span className="text-red-600">✗ {webhook.failureCount} failures</span>
                    </div>
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