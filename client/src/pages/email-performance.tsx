import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, TrendingDown, Phone, MessageSquare, Users, Clock, Mail, AlertTriangle, CheckCircle } from "lucide-react";

interface ContactPerformance {
  contactEmail: string;
  contactName: string;
  totalEmailsSent: number;
  totalEmailsReceived: number;
  responseRate: number;
  avgResponseTime: number;
  communicationEfficiencyScore: number;
  lastInteractionDate: Date;
  preferredCommunicationTime?: string;
  engagementTrend: 'increasing' | 'decreasing' | 'stable';
  recommendedActions: string[];
  channelSwitchSuggestion: {
    suggested: boolean;
    reason: string;
    alternativeChannel: 'phone' | 'video' | 'chat' | 'meeting';
    urgencyLevel: 'low' | 'medium' | 'high';
  };
}

interface CommunicationInsight {
  type: 'response_rate' | 'timing' | 'engagement' | 'efficiency';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high';
  actionItems: string[];
  affectedContacts: string[];
  metrics: Record<string, any>;
}

interface PerformanceData {
  contacts: ContactPerformance[];
  insights: CommunicationInsight[];
  summary: {
    totalContacts: number;
    avgResponseRate: number;
    avgEfficiencyScore: number;
    channelSwitchCandidates: number;
  };
}

function getEngagementIcon(trend: string) {
  switch (trend) {
    case 'increasing':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'decreasing':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-blue-500" />;
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  }
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case 'phone':
      return <Phone className="h-4 w-4" />;
    case 'video':
      return <Users className="h-4 w-4" />;
    case 'chat':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
}

export default function EmailPerformancePage() {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const { data: performanceData, isLoading } = useQuery<PerformanceData>({
    queryKey: ['/api/email-performance/demo'],
    staleTime: 30000, // 30 seconds
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

  if (!performanceData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No performance data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { contacts, insights, summary } = performanceData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Email Performance Insights</h1>
        <p className="text-muted-foreground">
          Track response rates, communication efficiency, and channel optimization suggestions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              Active communication partners
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgResponseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Across all contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgEfficiencyScore}</div>
            <p className="text-xs text-muted-foreground">
              Communication effectiveness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Channel Switch Candidates</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.channelSwitchCandidates}</div>
            <p className="text-xs text-muted-foreground">
              Contacts needing different approach
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contact Performance</TabsTrigger>
          <TabsTrigger value="insights">Communication Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <div className="grid gap-4">
            {contacts.map((contact, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{contact.contactName}</CardTitle>
                      <CardDescription>{contact.contactEmail}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getEngagementIcon(contact.engagementTrend)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {contact.engagementTrend}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Response Rate</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={contact.responseRate} className="flex-1" />
                        <span className="text-sm font-bold">{contact.responseRate}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Efficiency Score</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={contact.communicationEfficiencyScore} className="flex-1" />
                        <span className="text-sm font-bold">{contact.communicationEfficiencyScore}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Avg Response Time</p>
                      <p className="text-sm font-bold flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {contact.avgResponseTime}h
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Emails Exchanged</p>
                      <p className="text-sm font-bold">
                        {contact.totalEmailsSent + contact.totalEmailsReceived}
                      </p>
                    </div>
                  </div>

                  {/* Channel Switch Suggestion */}
                  {contact.channelSwitchSuggestion.suggested && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                            Channel Switch Recommended
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            {contact.channelSwitchSuggestion.reason}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-sm text-yellow-700 dark:text-yellow-300">
                              Suggested:
                            </span>
                            <Badge variant="outline" className="border-yellow-300 text-yellow-800 dark:text-yellow-200">
                              {getChannelIcon(contact.channelSwitchSuggestion.alternativeChannel)}
                              <span className="ml-1 capitalize">
                                {contact.channelSwitchSuggestion.alternativeChannel}
                              </span>
                            </Badge>
                            <Badge 
                              className={`ml-2 ${getSeverityColor(contact.channelSwitchSuggestion.urgencyLevel)}`}
                            >
                              {contact.channelSwitchSuggestion.urgencyLevel} priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommended Actions */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
                    <div className="space-y-1">
                      {contact.recommendedActions.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Communication Time */}
                  {contact.preferredCommunicationTime && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Best time to reach: {contact.preferredCommunicationTime}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                    <Badge className={getSeverityColor(insight.severity)}>
                      {insight.severity} impact
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Impact and Type */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Type: {insight.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {insight.impact === 'positive' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : insight.impact === 'negative' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-sm capitalize">{insight.impact} impact</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  {Object.keys(insight.metrics).length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-2">Key Metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(insight.metrics).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                            </span>
                            <span className="ml-1 font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Action Items</h4>
                    <div className="space-y-1">
                      {insight.actionItems.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-blue-500" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Affected Contacts */}
                  {insight.affectedContacts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Affected Contacts</h4>
                      <div className="flex flex-wrap gap-1">
                        {insight.affectedContacts.map((contact, contactIndex) => (
                          <Badge key={contactIndex} variant="outline" className="text-xs">
                            {contact}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}