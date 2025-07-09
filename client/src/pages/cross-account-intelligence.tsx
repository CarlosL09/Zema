import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Network, 
  Users, 
  Mail, 
  Building, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Copy,
  Merge,
  Eye,
  BarChart3,
  Star,
  ArrowRight,
  Target,
  Zap,
  Filter
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CrossAccountContact {
  id: number;
  contactEmail: string;
  contactName?: string;
  accounts: string[];
  relationshipStrength: number;
  businessValue: number;
  totalInteractions: number;
  lastInteraction: Date;
  communicationFrequency: string;
  responseRate: number;
  preferredAccount: string;
  tags: string[];
  insights: string[];
  unifiedContactId: string;
  strengthFactors: any;
}

interface DuplicateConversation {
  id: number;
  primaryConversationId: string;
  duplicateConversationId: string;
  primaryAccount: string;
  duplicateAccount: string;
  similarityScore: number;
  participants: string[];
  subject?: string;
  detectionMethod: string;
  recommendedAction: string;
  status: string;
}

interface AccountOptimization {
  id: number;
  contactEmail: string;
  currentAccount: string;
  recommendedAccount: string;
  reason: string;
  potentialBenefit: string;
  confidence: number;
  estimatedImprovement: string;
  priority: string;
  status: string;
}

interface CrossAccountOverview {
  totalContacts: number;
  unifiedContacts: number;
  duplicateConversations: number;
  accountOptimizations: number;
  crossAccountSavings: number;
  efficiencyGain: number;
}

export default function CrossAccountIntelligence() {
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<CrossAccountContact | null>(null);

  // Fetch cross-account overview
  const { data: overview, isLoading: overviewLoading } = useQuery<CrossAccountOverview>({
    queryKey: ["/api/cross-account/overview"],
  });

  // Fetch contact intelligence
  const { data: contacts = [], isLoading: contactsLoading } = useQuery<CrossAccountContact[]>({
    queryKey: ["/api/cross-account/contact-intelligence"],
  });

  // Fetch duplicate conversations
  const { data: duplicates = [], isLoading: duplicatesLoading } = useQuery<DuplicateConversation[]>({
    queryKey: ["/api/cross-account/duplicate-conversations"],
  });

  // Fetch account optimizations
  const { data: optimizations = [], isLoading: optimizationsLoading } = useQuery<AccountOptimization[]>({
    queryKey: ["/api/cross-account/optimizations"],
  });

  // Apply optimization mutation
  const applyOptimizationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/cross-account/apply-optimization/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cross-account/optimizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cross-account/overview"] });
      toast({
        title: "Optimization Applied",
        description: "Account optimization has been successfully applied.",
      });
    },
  });

  // Dismiss optimization mutation
  const dismissOptimizationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/cross-account/dismiss-optimization/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cross-account/optimizations"] });
      toast({
        title: "Optimization Dismissed",
        description: "Account optimization has been dismissed.",
      });
    },
  });

  // Resolve duplicate mutation
  const resolveDuplicateMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      return apiRequest("POST", `/api/cross-account/resolve-duplicate/${id}`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cross-account/duplicate-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cross-account/overview"] });
      toast({
        title: "Duplicate Resolved",
        description: "Duplicate conversation has been resolved.",
      });
    },
  });

  const getContactInitials = (email: string, name?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return "text-green-600";
    if (strength >= 60) return "text-blue-600";
    if (strength >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  const getBusinessValueColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-blue-600";
    if (value >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 90) return "text-red-600";
    if (score >= 75) return "text-orange-600";
    if (score >= 60) return "text-yellow-600";
    return "text-gray-600";
  };

  if (overviewLoading || contactsLoading || duplicatesLoading || optimizationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Network className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Cross-Account Intelligence
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Unify your email communications across multiple accounts with AI-powered contact intelligence, 
            duplicate detection, and optimization recommendations.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unified Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.unifiedContacts || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {overview?.totalContacts || 0} total contacts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duplicate Conversations</CardTitle>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.duplicateConversations || 0}</div>
              <p className="text-xs text-muted-foreground">
                requiring attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Optimizations</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.accountOptimizations || 0}</div>
              <p className="text-xs text-muted-foreground">
                account improvements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.efficiencyGain || 0}%</div>
              <p className="text-xs text-muted-foreground">
                productivity improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Contact Intelligence</span>
            </TabsTrigger>
            <TabsTrigger value="duplicates" className="flex items-center space-x-2">
              <Copy className="h-4 w-4" />
              <span>Duplicate Detection</span>
            </TabsTrigger>
            <TabsTrigger value="optimizations" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Optimizations</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Contact Intelligence Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Unified Contacts</span>
                    </CardTitle>
                    <CardDescription>
                      Contacts unified across your email accounts with relationship insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          selectedContact?.id === contact.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {getContactInitials(contact.contactEmail, contact.contactName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {contact.contactName || contact.contactEmail}
                              </div>
                              <div className="text-sm text-gray-500">
                                {contact.contactEmail}
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">
                                  {contact.accounts.length} accounts
                                </span>
                                <span className="text-xs text-gray-500">
                                  {contact.totalInteractions} interactions
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center space-x-2">
                              <Star className={`h-4 w-4 ${getStrengthColor(contact.relationshipStrength)}`} />
                              <span className={`text-sm font-medium ${getStrengthColor(contact.relationshipStrength)}`}>
                                {contact.relationshipStrength}%
                              </span>
                            </div>
                            <Badge variant="outline" className={getPriorityColor(
                              contact.businessValue >= 80 ? 'high' : 
                              contact.businessValue >= 60 ? 'medium' : 'low'
                            )}>
                              ${contact.businessValue}k value
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Contact accounts */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {contact.accounts.map((account, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {account}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Details */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                    <CardDescription>
                      {selectedContact ? 'Detailed insights for selected contact' : 'Select a contact to view details'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedContact ? (
                      <div className="space-y-4">
                        <div className="text-center pb-4 border-b">
                          <Avatar className="h-16 w-16 mx-auto mb-3">
                            <AvatarFallback>
                              {getContactInitials(selectedContact.contactEmail, selectedContact.contactName)}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-medium">
                            {selectedContact.contactName || selectedContact.contactEmail}
                          </h3>
                          <p className="text-sm text-gray-500">{selectedContact.contactEmail}</p>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium mb-1">Relationship Strength</div>
                            <Progress value={selectedContact.relationshipStrength} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1">
                              {selectedContact.relationshipStrength}% strength
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-1">Business Value</div>
                            <Progress value={selectedContact.businessValue} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1">
                              ${selectedContact.businessValue}k estimated value
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-1">Response Rate</div>
                            <Progress value={selectedContact.responseRate} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1">
                              {selectedContact.responseRate}% response rate
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <div className="text-sm font-medium mb-2">Key Insights</div>
                            <div className="space-y-2">
                              {selectedContact.insights.map((insight, index) => (
                                <div key={index} className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                  {insight}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2">Preferred Account</div>
                            <Badge variant="outline">{selectedContact.preferredAccount}</Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Select a contact to view detailed insights</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Duplicate Detection Tab */}
          <TabsContent value="duplicates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Copy className="h-5 w-5" />
                  <span>Duplicate Conversations</span>
                </CardTitle>
                <CardDescription>
                  Identical or similar conversations detected across your email accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {duplicates.map((duplicate) => (
                    <div key={duplicate.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium mb-1">
                            {duplicate.subject || 'No Subject'}
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            Participants: {duplicate.participants.join(', ')}
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline">{duplicate.primaryAccount}</Badge>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">{duplicate.duplicateAccount}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getSimilarityColor(duplicate.similarityScore)}`}>
                            {duplicate.similarityScore}%
                          </div>
                          <div className="text-xs text-gray-500">similarity</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {duplicate.detectionMethod}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {duplicate.recommendedAction}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveDuplicateMutation.mutate({ 
                              id: duplicate.id, 
                              action: 'keep-separate' 
                            })}
                            disabled={resolveDuplicateMutation.isPending}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Keep Separate
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => resolveDuplicateMutation.mutate({ 
                              id: duplicate.id, 
                              action: 'merge' 
                            })}
                            disabled={resolveDuplicateMutation.isPending}
                          >
                            <Merge className="h-4 w-4 mr-1" />
                            Merge
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {duplicates.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <h3 className="font-medium mb-1">No Duplicates Found</h3>
                      <p className="text-gray-500">
                        All your conversations are unique across accounts
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimizations Tab */}
          <TabsContent value="optimizations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Account Optimizations</span>
                </CardTitle>
                <CardDescription>
                  AI-powered recommendations to optimize your email account usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizations.map((optimization) => (
                    <div key={optimization.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{optimization.contactEmail}</span>
                            <Badge className={getPriorityColor(optimization.priority)}>
                              {optimization.priority} priority
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {optimization.reason}
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">From:</span>
                              <Badge variant="outline">{optimization.currentAccount}</Badge>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">To:</span>
                              <Badge variant="outline">{optimization.recommendedAccount}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {optimization.confidence}%
                          </div>
                          <div className="text-xs text-gray-500">confidence</div>
                        </div>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded mb-3">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Expected Benefit:
                          </span>
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {optimization.potentialBenefit}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {optimization.estimatedImprovement}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-sm text-gray-500">
                          Status: {optimization.status}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dismissOptimizationMutation.mutate(optimization.id)}
                            disabled={dismissOptimizationMutation.isPending}
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => applyOptimizationMutation.mutate(optimization.id)}
                            disabled={applyOptimizationMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {optimizations.length === 0 && (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                      <h3 className="font-medium mb-1">All Optimized</h3>
                      <p className="text-gray-500">
                        Your account usage is already optimized
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Contact Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High-Value Contacts</span>
                      <span className="font-medium">
                        {contacts.filter(c => c.businessValue >= 80).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Strong Relationships</span>
                      <span className="font-medium">
                        {contacts.filter(c => c.relationshipStrength >= 80).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Multi-Account Contacts</span>
                      <span className="font-medium">
                        {contacts.filter(c => c.accounts.length > 1).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active This Month</span>
                      <span className="font-medium">
                        {contacts.filter(c => {
                          const lastInteraction = new Date(c.lastInteraction);
                          const monthAgo = new Date();
                          monthAgo.setMonth(monthAgo.getMonth() - 1);
                          return lastInteraction > monthAgo;
                        }).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Efficiency Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Time Saved</span>
                      <span className="font-medium text-green-600">
                        {overview?.crossAccountSavings || 0} hours/month
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Duplicate Reduction</span>
                      <span className="font-medium text-blue-600">
                        {duplicates.length} conversations
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Account Efficiency</span>
                      <span className="font-medium text-purple-600">
                        {overview?.efficiencyGain || 0}% improvement
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Optimization Rate</span>
                      <span className="font-medium text-orange-600">
                        {optimizations.length} pending
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}