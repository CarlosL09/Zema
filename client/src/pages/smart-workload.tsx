import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, Zap, Brain, TrendingUp, CheckCircle, AlertCircle, Timer, Target, BarChart } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailWorkloadClassification {
  id: number;
  emailId: string;
  fromEmail: string;
  subject: string;
  timeToComplete: string;
  complexityScore: number;
  taskType: string;
  priorityLevel: string;
  batchCategory: string;
  suggestedProcessingTime: string;
  focusBlockDuration: number;
  cognitiveLoad: string;
  energyLevel: string;
  estimatedTimeMinutes: number;
  reasoningFactors: string[];
  confidenceScore: number;
  completed: boolean;
  actualTimeSpent?: number;
  createdAt: string;
}

interface WorkloadAnalytics {
  id: number;
  totalEmailsProcessed: number;
  avgProcessingTime: number;
  accuracyScore: number;
  productivityScore: number;
  energyEfficiencyScore: number;
  recommendations: string[];
  date: string;
}

interface FocusBlock {
  duration: number;
  category: string;
  estimatedEmailCount: number;
  energyRequired: string;
}

export default function SmartWorkloadPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch workload classifications
  const { data: classifications = [], isLoading: classificationsLoading } = useQuery({
    queryKey: ["/api/workload/classifications"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/workload/classifications?limit=50");
      return res.json();
    }
  });

  // Fetch workload analytics
  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/workload/analytics"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/workload/analytics?limit=7");
      return res.json();
    }
  });

  // Fetch energy patterns
  const { data: energyPatterns = [], isLoading: energyLoading } = useQuery({
    queryKey: ["/api/workload/energy-patterns"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/workload/energy-patterns");
      return res.json();
    }
  });

  // Fetch workload recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/workload/recommendations"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/workload/recommendations");
      return res.json();
    }
  });

  // Demo email processing mutation
  const processDemoEmailsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/workload/demo/process-email");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Demo Emails Processed",
        description: `Successfully analyzed ${data.classifications.length} demo emails with AI workload intelligence.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workload/classifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workload/analytics"] });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Generate focus blocks mutation
  const generateFocusBlocksMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/workload/focus-blocks", {
        date: new Date().toISOString()
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Focus Blocks Generated",
        description: `Created ${data.length} optimized focus blocks for today.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getTimeToCompleteColor = (time: string) => {
    switch (time) {
      case "2min": return "bg-green-100 text-green-800";
      case "15min": return "bg-yellow-100 text-yellow-800";
      case "1hr": return "bg-orange-100 text-orange-800";
      case "2hr+": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (classificationsLoading || analyticsLoading || energyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Smart Email Workload Management</h1>
        <p className="text-gray-600 mb-6">
          AI-powered email categorization, energy pattern analysis, and productivity optimization for smarter email processing.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={() => processDemoEmailsMutation.mutate()}
            disabled={processDemoEmailsMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            {processDemoEmailsMutation.isPending ? "Processing..." : "Process Demo Emails"}
          </Button>
          
          <Button 
            onClick={() => generateFocusBlocksMutation.mutate()}
            disabled={generateFocusBlocksMutation.isPending}
            variant="outline"
          >
            <Target className="w-4 h-4 mr-2" />
            {generateFocusBlocksMutation.isPending ? "Generating..." : "Generate Focus Blocks"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classifications">Email Analysis</TabsTrigger>
          <TabsTrigger value="energy">Energy Patterns</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Emails Analyzed</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classifications.length}</div>
                <p className="text-xs text-muted-foreground">
                  AI-powered workload classification
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classifications.length > 0 
                    ? Math.round(classifications.reduce((sum, c) => sum + c.estimatedTimeMinutes, 0) / classifications.length)
                    : 0
                  } min
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated time per email
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.length > 0 
                    ? Math.round(analytics[0]?.productivityScore || 0)
                    : 85
                  }%
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on energy patterns
                </p>
              </CardContent>
            </Card>
          </div>

          {analytics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Workload Trends</CardTitle>
                <CardDescription>
                  Your email processing patterns and productivity metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.slice(0, 3).map((analytic: WorkloadAnalytics, index) => (
                    <div key={analytic.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{new Date(analytic.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{analytic.totalEmailsProcessed} emails processed</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{Math.round(analytic.avgProcessingTime)} min avg</p>
                          <p className="text-xs text-gray-600">Processing time</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{Math.round(analytic.productivityScore)}%</p>
                          <p className="text-xs text-gray-600">Productivity</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="classifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Workload Classifications</CardTitle>
              <CardDescription>
                AI analysis of email complexity, time requirements, and optimal processing strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classifications.length > 0 ? (
                  classifications.slice(0, 10).map((classification: EmailWorkloadClassification) => (
                    <div key={classification.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{classification.subject || "No Subject"}</h4>
                          <p className="text-sm text-gray-600">From: {classification.fromEmail}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {classification.completed && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <Badge className={getTimeToCompleteColor(classification.timeToComplete)}>
                            {classification.timeToComplete}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="text-center">
                          <Badge className={getPriorityColor(classification.priorityLevel)}>
                            {classification.priorityLevel}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">Priority</p>
                        </div>
                        <div className="text-center">
                          <Badge className={getEnergyColor(classification.energyLevel)}>
                            {classification.energyLevel}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">Energy</p>
                        </div>
                        <div className="text-center">
                          <Badge variant="outline">
                            {classification.taskType.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">Type</p>
                        </div>
                        <div className="text-center">
                          <Badge variant="secondary">
                            {classification.suggestedProcessingTime}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">Best Time</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Complexity Score</span>
                          <span>{classification.complexityScore}/10</span>
                        </div>
                        <Progress value={classification.complexityScore * 10} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>AI Confidence</span>
                          <span>{Math.round(classification.confidenceScore * 100)}%</span>
                        </div>
                        <Progress value={classification.confidenceScore * 100} className="h-2" />
                      </div>

                      {classification.reasoningFactors.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">AI Reasoning:</p>
                          <div className="flex flex-wrap gap-1">
                            {classification.reasoningFactors.slice(0, 3).map((factor, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Classifications Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Process some demo emails to see AI workload analysis in action.
                    </p>
                    <Button 
                      onClick={() => processDemoEmailsMutation.mutate()}
                      disabled={processDemoEmailsMutation.isPending}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Process Demo Emails
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Energy Patterns Analysis</CardTitle>
              <CardDescription>
                Understanding your peak productivity hours for optimal email processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {energyPatterns.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">Morning</div>
                      <p className="text-sm text-gray-600">High Energy</p>
                      <p className="text-xs text-gray-500">Best for complex tasks</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">Afternoon</div>
                      <p className="text-sm text-gray-600">Medium Energy</p>
                      <p className="text-xs text-gray-500">Good for routine tasks</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">Evening</div>
                      <p className="text-sm text-gray-600">Variable Energy</p>
                      <p className="text-xs text-gray-500">Quick responses only</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Optimal Processing Schedule</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-medium">9:00 AM - 11:00 AM</span>
                        </div>
                        <Badge className="bg-red-100 text-red-800">Complex Tasks</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">2:00 PM - 4:00 PM</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Medium Tasks</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">5:00 PM - 6:00 PM</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Quick Replies</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Building Energy Patterns</h3>
                  <p className="text-gray-600">
                    Process more emails to develop personalized energy pattern insights.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Workload Recommendations</CardTitle>
              <CardDescription>
                Personalized suggestions to optimize your email processing workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!recommendationsLoading && recommendations ? (
                <div className="space-y-4">
                  {recommendations.insights?.map((insight: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium">{insight.type.replace('_', ' ')}</h4>
                        <p className="text-sm text-gray-600">{insight.suggestion}</p>
                        {insight.impact && (
                          <p className="text-xs text-green-600 mt-1">
                            Expected impact: {insight.impact}
                          </p>
                        )}
                      </div>
                    </div>
                  )) || [
                    {
                      type: "Energy Optimization",
                      suggestion: "Process complex emails during your peak energy hours (9-11 AM) for better efficiency.",
                      impact: "20% faster completion time"
                    },
                    {
                      type: "Batch Processing",
                      suggestion: "Group similar email types together to reduce context switching overhead.",
                      impact: "15% productivity increase"
                    },
                    {
                      type: "Focus Blocks",
                      suggestion: "Create 45-minute focused email processing blocks with 15-minute breaks.",
                      impact: "Improved concentration and quality"
                    }
                  ].map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium">{rec.type}</h4>
                        <p className="text-sm text-gray-600">{rec.suggestion}</p>
                        <p className="text-xs text-green-600 mt-1">
                          Expected impact: {rec.impact}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600">Generating personalized recommendations...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}