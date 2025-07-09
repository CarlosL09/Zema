import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Globe, Calendar, TrendingUp, Brain, Send } from "lucide-react";

interface ScheduledEmail {
  id: number;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  content: string;
  scheduledFor: string;
  timezoneSuggestion?: string;
  optimalTimeSuggestion?: string;
  scheduleReason?: string;
  status: string;
  createdAt: string;
}

interface TimeSuggestion {
  suggestedTime: string;
  timezone: string;
  reason: string;
  confidence: number;
}

interface RecipientAnalytics {
  recipientEmail: string;
  timezone: {
    timezone: string;
    offset: number;
    name: string;
  };
  optimalTime: {
    hour: number;
    confidence: number;
    reason: string;
  };
  analytics: {
    timezone: string;
    timezoneDisplayName: string;
    optimalHour: number;
    confidence: number;
    reason: string;
  };
}

export function EmailScheduler() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [timeSuggestion, setTimeSuggestion] = useState<TimeSuggestion | null>(null);
  const [recipientAnalytics, setRecipientAnalytics] = useState<RecipientAnalytics | null>(null);
  const [useOptimalTime, setUseOptimalTime] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch scheduled emails
  const { data: scheduledEmails = [], isLoading } = useQuery<ScheduledEmail[]>({
    queryKey: ["/api/email-scheduling/scheduled"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/email-scheduling/scheduled");
      return res.json();
    },
  });

  // Schedule email mutation
  const scheduleEmailMutation = useMutation({
    mutationFn: async (emailData: any) => {
      const res = await apiRequest("POST", "/api/email-scheduling/schedule", emailData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-scheduling/scheduled"] });
      setIsDialogOpen(false);
      clearForm();
      toast({
        title: "Email Scheduled",
        description: "Your email has been scheduled successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Scheduling Failed",
        description: error.message || "Failed to schedule email",
        variant: "destructive",
      });
    },
  });

  // Cancel email mutation
  const cancelEmailMutation = useMutation({
    mutationFn: async (emailId: number) => {
      const res = await apiRequest("DELETE", `/api/email-scheduling/${emailId}/cancel`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-scheduling/scheduled"] });
      toast({
        title: "Email Cancelled",
        description: "The scheduled email has been cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel email",
        variant: "destructive",
      });
    },
  });

  // Get optimal time suggestion
  const getTimeSuggestion = async () => {
    if (!recipientEmail) return;

    try {
      const res = await apiRequest("POST", "/api/email-scheduling/suggest-time", {
        recipientEmail,
        preferredSendTime: scheduledFor || undefined
      });
      const suggestion = await res.json();
      setTimeSuggestion(suggestion);
    } catch (error) {
      console.error("Failed to get time suggestion:", error);
    }
  };

  // Get recipient analytics
  const getRecipientAnalytics = async () => {
    if (!recipientEmail) return;

    try {
      const res = await apiRequest("GET", `/api/email-scheduling/analytics/${encodeURIComponent(recipientEmail)}`);
      const analytics = await res.json();
      setRecipientAnalytics(analytics);
    } catch (error) {
      console.error("Failed to get recipient analytics:", error);
    }
  };

  // Auto-suggest optimal time when recipient email changes
  useEffect(() => {
    if (recipientEmail && recipientEmail.includes("@")) {
      getTimeSuggestion();
      getRecipientAnalytics();
    }
  }, [recipientEmail]);

  const clearForm = () => {
    setRecipientEmail("");
    setRecipientName("");
    setSubject("");
    setContent("");
    setScheduledFor("");
    setTimeSuggestion(null);
    setRecipientAnalytics(null);
    setUseOptimalTime(false);
  };

  const handleSchedule = () => {
    if (!recipientEmail || !subject || !content || !scheduledFor) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const finalScheduledTime = useOptimalTime && timeSuggestion 
      ? timeSuggestion.suggestedTime 
      : scheduledFor;

    scheduleEmailMutation.mutate({
      recipientEmail,
      recipientName: recipientName || undefined,
      subject,
      content,
      scheduledFor: finalScheduledTime,
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "scheduled": return "default";
      case "sent": return "secondary";
      case "cancelled": return "destructive";
      case "failed": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Scheduling Intelligence</h2>
          <p className="text-muted-foreground">
            Schedule emails at optimal times based on recipient behavior and timezone analysis
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Send className="h-4 w-4 mr-2" />
              Schedule Email
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Smart Email</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="compose" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compose">Compose</TabsTrigger>
                <TabsTrigger value="analytics" disabled={!recipientAnalytics}>
                  <Brain className="h-4 w-4 mr-2" />
                  AI Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="compose" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Email *</Label>
                    <Input
                      id="recipient"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Message *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Your email message..."
                    rows={6}
                  />
                </div>

                {/* Timing Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Scheduling Options</h3>
                  
                  {timeSuggestion && (
                    <Card className="bg-blue-50 dark:bg-blue-950/20">
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-3">
                          <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-blue-900 dark:text-blue-100">
                                AI Suggests: {formatDateTime(timeSuggestion.suggestedTime)}
                              </span>
                              <Badge variant="secondary">
                                {Math.round(timeSuggestion.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              {timeSuggestion.reason}
                            </p>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={useOptimalTime}
                                onChange={(e) => setUseOptimalTime(e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Use AI-optimized time</span>
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="scheduledFor">
                      {useOptimalTime ? "Manual Override Time" : "Scheduled Time *"}
                    </Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleSchedule}
                    disabled={scheduleEmailMutation.isPending}
                    className="flex-1"
                  >
                    {scheduleEmailMutation.isPending ? "Scheduling..." : "Schedule Email"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4 mt-4">
                {recipientAnalytics && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Globe className="h-5 w-5" />
                          <span>Timezone Analysis</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Detected Timezone:</span>
                            <Badge variant="secondary">
                              {recipientAnalytics.analytics.timezoneDisplayName}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Optimal Send Time:</span>
                            <span className="text-sm">
                              {recipientAnalytics.analytics.optimalHour}:00
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Confidence Level:</span>
                            <Badge variant={recipientAnalytics.analytics.confidence > 0.7 ? "default" : "secondary"}>
                              {Math.round(recipientAnalytics.analytics.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5" />
                          <span>Behavioral Insights</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {recipientAnalytics.analytics.reason}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">
                  {scheduledEmails.filter(e => e.status === "scheduled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Send className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">
                  {scheduledEmails.filter(e => e.status === "sent").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Pending Today</p>
                <p className="text-2xl font-bold">
                  {scheduledEmails.filter(e => 
                    e.status === "scheduled" && 
                    new Date(e.scheduledFor).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">AI Optimized</p>
                <p className="text-2xl font-bold">
                  {scheduledEmails.filter(e => e.optimalTimeSuggestion).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Emails List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Emails</CardTitle>
          <CardDescription>
            Manage your scheduled emails and view delivery insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading scheduled emails...</div>
          ) : scheduledEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scheduled emails. Create your first scheduled email to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledEmails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{email.subject}</h4>
                      <Badge variant={getStatusBadgeVariant(email.status)}>
                        {email.status}
                      </Badge>
                      {email.optimalTimeSuggestion && (
                        <Badge variant="outline" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          AI Optimized
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      To: {email.recipientEmail}
                      {email.recipientName && ` (${email.recipientName})`}
                    </p>
                    <p className="text-sm">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Scheduled: {formatDateTime(email.scheduledFor)}
                    </p>
                    {email.scheduleReason && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {email.scheduleReason}
                      </p>
                    )}
                  </div>
                  {email.status === "scheduled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelEmailMutation.mutate(email.id)}
                      disabled={cancelEmailMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}