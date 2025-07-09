import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  Forward, 
  MoreHorizontal,
  Clock,
  User,
  Tag,
  Filter,
  Settings,
  Plus,
  Zap,
  Shield,
  AlertTriangle,
  XCircle,
  Eye,
  Ban
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailThread {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  labels: string[];
  priority: 'high' | 'medium' | 'low';
  accountId: number;
  messageCount: number;
  threatLevel?: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  threatTypes?: string[];
  isQuarantined?: boolean;
  threatWarning?: string;
  threatConfidence?: number;
}

interface AutomationRule {
  id: number;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  conditions: any;
  createdAt: string;
}

export default function Inbox() {
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [threatWarningOpen, setThreatWarningOpen] = useState(false);
  const [threatThread, setThreatThread] = useState<EmailThread | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email threads
  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ['/api/inbox/threads'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/inbox/threads');
      return response.json();
    }
  });

  // Fetch automation rules
  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ['/api/automation-rules'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/automation-rules');
      return response.json();
    }
  });

  // Mock data for demonstration
  const mockThreads: EmailThread[] = [
    {
      id: "1",
      subject: "Project proposal review needed",
      sender: "Sarah Johnson",
      senderEmail: "sarah@company.com",
      preview: "Hi team, I've attached the updated project proposal for Q2. Please review and provide feedback by Friday...",
      timestamp: "2 hours ago",
      isRead: false,
      isStarred: true,
      hasAttachments: true,
      labels: ["work", "urgent"],
      priority: "high",
      accountId: 1,
      messageCount: 3
    },
    {
      id: "2",
      subject: "URGENT: Your PayPal account will be suspended!",
      sender: "PayPal Security",
      senderEmail: "security@payp4l-verification.com",
      preview: "We have detected suspicious activity on your account. Click here immediately to verify your identity or your account will be suspended within 24 hours...",
      timestamp: "1 hour ago",
      isRead: false,
      isStarred: false,
      hasAttachments: false,
      labels: ["suspicious"],
      priority: "high",
      accountId: 1,
      messageCount: 1,
      threatLevel: "critical",
      threatTypes: ["phishing", "impersonation"],
      isQuarantined: false,
      threatWarning: "This email appears to be a phishing attempt impersonating PayPal. The sender domain 'payp4l-verification.com' is suspicious and uses urgency tactics typical of scams.",
      threatConfidence: 0.95
    },
    {
      id: "3",
      subject: "You've won $1,000,000! Claim now!",
      sender: "Lottery Commission",
      senderEmail: "winner@mega-lottery-2025.tk",
      preview: "CONGRATULATIONS! You have been selected as the lucky winner of our international lottery! To claim your prize of $1,000,000, please reply with your bank details...",
      timestamp: "6 hours ago",
      isRead: false,
      isStarred: false,
      hasAttachments: false,
      labels: ["spam"],
      priority: "low",
      accountId: 1,
      messageCount: 1,
      threatLevel: "high",
      threatTypes: ["scam", "financial_fraud"],
      isQuarantined: true,
      threatWarning: "This email is a lottery scam attempting to steal personal and financial information. The sender uses a suspicious domain and typical scam language.",
      threatConfidence: 0.92
    },
    {
      id: "4",
      subject: "Marketing campaign results",
      sender: "Mike Chen",
      senderEmail: "mike@marketing.com",
      preview: "The Q4 campaign exceeded expectations with a 25% increase in conversion rates. Here's the detailed breakdown...",
      timestamp: "4 hours ago",
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      labels: ["marketing"],
      priority: "medium",
      accountId: 1,
      messageCount: 1
    },
    {
      id: "3",
      subject: "Weekly team standup notes",
      sender: "Team Lead",
      senderEmail: "lead@team.com",
      preview: "Here are this week's action items and progress updates from our standup meetings...",
      timestamp: "1 day ago",
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      labels: ["team", "weekly"],
      priority: "low",
      accountId: 2,
      messageCount: 2
    }
  ];

  const mockRules: AutomationRule[] = [
    {
      id: 1,
      name: "Auto-archive newsletters",
      trigger: "Email from newsletter sender",
      action: "Archive and mark as read",
      isActive: true,
      conditions: { senderContains: "newsletter", subjectContains: "unsubscribe" },
      createdAt: "2025-01-01"
    },
    {
      id: 2,
      name: "Priority flag for urgent emails",
      trigger: "Subject contains 'urgent' or 'ASAP'",
      action: "Mark as high priority and star",
      isActive: true,
      conditions: { subjectContains: ["urgent", "ASAP"], priority: "high" },
      createdAt: "2025-01-02"
    }
  ];

  const displayThreads = threads || mockThreads;
  const displayRules = rules || mockRules;

  // Handle clicking on emails with threats
  const handleThreadClick = (thread: EmailThread) => {
    if (thread.threatLevel && thread.threatLevel !== 'safe') {
      setThreatThread(thread);
      setThreatWarningOpen(true);
    } else {
      setSelectedThread(thread);
    }
  };

  // Handle viewing a threatening email anyway
  const viewThreatEmailAnyway = () => {
    if (threatThread) {
      setSelectedThread(threatThread);
      setThreatWarningOpen(false);
      setThreatThread(null);
    }
  };

  const filteredThreads = displayThreads.filter(thread => {
    const matchesSearch = thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.preview.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" ||
                         (selectedFilter === "unread" && !thread.isRead) ||
                         (selectedFilter === "starred" && thread.isStarred) ||
                         (selectedFilter === "important" && thread.priority === "high");
    
    return matchesSearch && matchesFilter;
  });

  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: any) => {
      const response = await apiRequest('POST', '/api/automation-rules', ruleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation-rules'] });
      setIsRuleDialogOpen(false);
      toast({
        title: "Rule Created",
        description: "Your automation rule has been created successfully."
      });
    }
  });

  const handleCreateRule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const ruleData = {
      name: formData.get('ruleName'),
      trigger: formData.get('trigger'),
      action: formData.get('action'),
      conditions: {
        senderContains: formData.get('senderCondition'),
        subjectContains: formData.get('subjectCondition')
      }
    };

    createRuleMutation.mutate(ruleData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (threadsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unified Inbox</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage emails from all your connected accounts in one place
            </p>
          </div>
          <div className="flex space-x-4">
            <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Create Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Automation Rule</DialogTitle>
                  <DialogDescription>
                    Set up automated actions for incoming emails based on specific conditions.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateRule} className="space-y-6">
                  <div>
                    <Label htmlFor="ruleName">Rule Name</Label>
                    <Input name="ruleName" placeholder="e.g., Auto-archive newsletters" required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trigger">Trigger Condition</Label>
                      <Select name="trigger" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trigger" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sender">Sender matches</SelectItem>
                          <SelectItem value="subject">Subject contains</SelectItem>
                          <SelectItem value="attachment">Has attachments</SelectItem>
                          <SelectItem value="priority">Priority level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="action">Action to Take</Label>
                      <Select name="action" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="archive">Archive email</SelectItem>
                          <SelectItem value="star">Star email</SelectItem>
                          <SelectItem value="priority">Set priority</SelectItem>
                          <SelectItem value="forward">Forward to</SelectItem>
                          <SelectItem value="label">Add label</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="senderCondition">Sender Condition (optional)</Label>
                      <Input name="senderCondition" placeholder="e.g., newsletter@company.com" />
                    </div>
                    
                    <div>
                      <Label htmlFor="subjectCondition">Subject Condition (optional)</Label>
                      <Input name="subjectCondition" placeholder="e.g., urgent, ASAP" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createRuleMutation.isPending}>
                      {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="rules">Automation Rules</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All emails</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="starred">Starred</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email List */}
              <div className="lg:col-span-2 space-y-4">
                {filteredThreads.map((thread) => (
                  <Card 
                    key={thread.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedThread?.id === thread.id ? 'ring-2 ring-primary' : ''
                    } ${!thread.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => handleThreadClick(thread)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {thread.isStarred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                              {thread.hasAttachments && <Tag className="h-4 w-4 text-gray-400" />}
                              {!thread.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                              {/* Threat Level Indicators */}
                              {thread.threatLevel === 'critical' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                                  <XCircle className="h-3 w-3 text-red-600" />
                                  <span className="text-xs font-medium text-red-700 dark:text-red-300">CRITICAL THREAT</span>
                                </div>
                              )}
                              {thread.threatLevel === 'high' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-full">
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                  <span className="text-xs font-medium text-red-600 dark:text-red-400">HIGH RISK</span>
                                </div>
                              )}
                              {thread.threatLevel === 'medium' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">SUSPICIOUS</span>
                                </div>
                              )}
                              {thread.isQuarantined && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                  <Ban className="h-3 w-3 text-gray-600" />
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">QUARANTINED</span>
                                </div>
                              )}
                            </div>
                            <Badge className={getPriorityColor(thread.priority)}>
                              {thread.priority}
                            </Badge>
                            {thread.messageCount > 1 && (
                              <Badge variant="secondary">{thread.messageCount}</Badge>
                            )}
                          </div>
                          
                          <h3 className={`font-semibold text-sm truncate ${!thread.isRead ? 'font-bold' : ''}`}>
                            {thread.subject}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <User className="h-3 w-3" />
                            <span className="truncate">{thread.sender}</span>
                            <span className="text-xs">•</span>
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{thread.timestamp}</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {thread.preview}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {thread.labels.map((label) => (
                              <Badge key={label} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Forward className="h-4 w-4 mr-2" />
                              Forward
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Email Detail */}
              <div className="lg:col-span-1">
                {selectedThread ? (
                  <Card className="sticky top-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{selectedThread.subject}</CardTitle>
                        <Badge className={getPriorityColor(selectedThread.priority)}>
                          {selectedThread.priority}
                        </Badge>
                      </div>
                      <CardDescription>
                        From: {selectedThread.sender} ({selectedThread.senderEmail})
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {selectedThread.timestamp}
                        </div>
                        
                        <div className="prose prose-sm max-w-none">
                          <p>{selectedThread.preview}</p>
                          <p>This is where the full email content would be displayed. Users can read the complete message, view attachments, and take actions like reply, forward, or create automation rules based on this email.</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-4 border-t">
                          <Button size="sm" className="flex items-center gap-1">
                            <Reply className="h-3 w-3" />
                            Reply
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Forward className="h-3 w-3" />
                            Forward
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Create Rule
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Select an email to view its content
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <div className="grid gap-4">
              {displayRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          When: {rule.trigger}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Then: {rule.action}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch checked={rule.isActive} />
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Emails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,234</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rules Applied</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">89</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automated actions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Time Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4.2h</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This week</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Threat Warning Dialog */}
      <AlertDialog open={threatWarningOpen} onOpenChange={setThreatWarningOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <AlertDialogTitle className="text-red-700 dark:text-red-400">
                Security Warning
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              {threatThread && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="font-medium text-red-800 dark:text-red-300">
                      This email has been flagged as potentially dangerous
                    </p>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                      <strong>Subject:</strong> {threatThread.subject}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-400">
                      <strong>From:</strong> {threatThread.senderEmail}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Threat Analysis:</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Risk Level:</span>
                      <Badge 
                        className={
                          threatThread.threatLevel === 'critical' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        }
                      >
                        {threatThread.threatLevel?.toUpperCase()}
                      </Badge>
                    </div>
                    {threatThread.threatTypes && (
                      <div className="text-sm">
                        <strong>Threats:</strong> {threatThread.threatTypes.join(', ')}
                      </div>
                    )}
                    {threatThread.threatConfidence && (
                      <div className="text-sm">
                        <strong>Confidence:</strong> {Math.round(threatThread.threatConfidence * 100)}%
                      </div>
                    )}
                  </div>
                  
                  {threatThread.threatWarning && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm">{threatThread.threatWarning}</p>
                    </div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={viewThreatEmailAnyway}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}