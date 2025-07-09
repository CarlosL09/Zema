import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, Brain, Mail, Users, DollarSign, Clock, Target, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailVolumeForecast {
  id: number;
  userId: string;
  forecastDate: string;
  predictedVolume: number;
  confidenceScore: number;
  trendDirection: string;
  seasonalFactors: any;
  createdAt: string;
}

interface EmailFollowupPrediction {
  id: number;
  userId: string;
  emailId: string;
  fromEmail: string;
  followupProbability: number;
  recommendedAction: string;
  urgencyLevel: string;
  reasoning: string;
  predictedResponseTime: number;
  createdAt: string;
  updatedAt: string;
}

interface CommunicationPatternAnalysis {
  id: number;
  userId: string;
  contactEmail: string;
  communicationFrequency: number;
  responseTimeAvg: number;
  lastInteraction: string;
  relationshipStrength: number;
  priority: string;
  estimatedBusinessValue: number;
  strengthFactors: any;
  trendAnalysis: string;
  recommendedActions: any;
  createdAt: string;
  updatedAt: string;
}

interface EmailRoiAnalysis {
  id: number;
  userId: string;
  periodType: string;
  analysisDate: string;
  totalEmailsSent: number;
  totalResponsesReceived: number;
  responseRate: number;
  avgResponseTime: number;
  estimatedTimeInvestment: number;
  estimatedBusinessValue: number;
  roiScore: number;
  efficiencyMetrics: any;
  recommendations: any;
  createdAt: string;
}

interface PredictiveAnalyticsInsight {
  id: number;
  userId: string;
  insightType: string;
  title: string;
  description: string;
  priority: string;
  actionable: boolean;
  estimatedImpact: string;
  confidence: number;
  relatedMetrics: any;
  recommendedActions: any;
  acknowledged: boolean;
  implementedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PredictiveAnalytics() {
  const { toast } = useToast();
  const [selectedInsight, setSelectedInsight] = useState<PredictiveAnalyticsInsight | null>(null);

  // Fetch all predictive analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/predictive-analytics/forecasts'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: volumeForecasts } = useQuery({
    queryKey: ['/api/predictive-analytics/volume-forecasts'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: followupPredictions } = useQuery({
    queryKey: ['/api/predictive-analytics/followup-predictions'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: communicationPatterns } = useQuery({
    queryKey: ['/api/predictive-analytics/communication-patterns'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: roiAnalysis } = useQuery({
    queryKey: ['/api/predictive-analytics/roi-analysis'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: insights } = useQuery({
    queryKey: ['/api/predictive-analytics/insights'],
    staleTime: 5 * 60 * 1000,
  });

  // Mutation to acknowledge insights
  const acknowledgeInsightMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/predictive-analytics/insights/${id}`, {
        acknowledged: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/predictive-analytics/insights'] });
      toast({
        title: "Insight Acknowledged",
        description: "The insight has been marked as reviewed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to acknowledge insight.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  const handleAcknowledgeInsight = (insight: PredictiveAnalyticsInsight) => {
    acknowledgeInsightMutation.mutate(insight.id);
  };

  // Process forecast data for charts
  const forecastChartData = volumeForecasts?.map((forecast: EmailVolumeForecast) => ({
    date: new Date(forecast.forecastDate).toLocaleDateString(),
    volume: forecast.predictedVolume,
    confidence: Math.round(forecast.confidenceScore * 100),
  })) || [];

  // Process followup data for priority distribution
  const followupDistribution = followupPredictions?.reduce((acc: any, pred: EmailFollowupPrediction) => {
    const priority = pred.urgencyLevel;
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const followupChartData = Object.entries(followupDistribution || {}).map(([level, count]) => ({
    level,
    count,
  }));

  // Process ROI analysis for trend chart
  const roiTrendData = roiAnalysis?.map((roi: EmailRoiAnalysis) => ({
    period: roi.periodType,
    responseRate: Math.round(roi.responseRate * 100),
    roiScore: Math.round(roi.roiScore),
    businessValue: roi.estimatedBusinessValue,
  })) || [];

  // Process communication patterns for relationship strength
  const patternData = communicationPatterns?.map((pattern: CommunicationPatternAnalysis) => ({
    contact: pattern.contactEmail.split('@')[0],
    strength: Math.round(pattern.relationshipStrength * 100),
    frequency: pattern.communicationFrequency,
    value: pattern.estimatedBusinessValue,
  })) || [];

  const unacknowledgedInsights = insights?.filter((insight: PredictiveAnalyticsInsight) => !insight.acknowledged) || [];
  const highPriorityInsights = unacknowledgedInsights.filter((insight: PredictiveAnalyticsInsight) => insight.priority === 'high');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Predictive Email Analytics
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Advanced AI-powered insights to optimize your email communication strategy
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Next 7 Days</p>
                  <p className="text-3xl font-bold">
                    {forecastChartData.reduce((sum, item) => sum + item.volume, 0)}
                  </p>
                  <p className="text-blue-100 text-sm">Predicted Emails</p>
                </div>
                <Mail className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Average ROI</p>
                  <p className="text-3xl font-bold">
                    {roiTrendData.length > 0 ? Math.round(roiTrendData.reduce((sum, item) => sum + item.roiScore, 0) / roiTrendData.length) : 0}%
                  </p>
                  <p className="text-green-100 text-sm">Email Efficiency</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">High-Risk Followups</p>
                  <p className="text-3xl font-bold">
                    {followupPredictions?.filter((pred: EmailFollowupPrediction) => pred.followupProbability > 0.7).length || 0}
                  </p>
                  <p className="text-purple-100 text-sm">Need Attention</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">AI Insights</p>
                  <p className="text-3xl font-bold">
                    {unacknowledgedInsights.length}
                  </p>
                  <p className="text-orange-100 text-sm">New Recommendations</p>
                </div>
                <Brain className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="forecasts" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <TabsTrigger value="forecasts">Volume Forecasts</TabsTrigger>
            <TabsTrigger value="followups">Followup Predictions</TabsTrigger>
            <TabsTrigger value="patterns">Communication Patterns</TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Volume Forecasts Tab */}
          <TabsContent value="forecasts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Email Volume Forecasts
                </CardTitle>
                <CardDescription>
                  Predicted email volume for the next 7 days with confidence intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        name="Predicted Volume"
                      />
                      <Area
                        type="monotone"
                        dataKey="confidence"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.2}
                        name="Confidence %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Followup Predictions Tab */}
          <TabsContent value="followups" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Followup Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={followupChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ level, count }) => `${level}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {followupChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>High-Risk Followups</CardTitle>
                  <CardDescription>Emails requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {followupPredictions?.filter((pred: EmailFollowupPrediction) => pred.followupProbability > 0.7)
                      .slice(0, 5)
                      .map((prediction: EmailFollowupPrediction) => (
                        <div key={prediction.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{prediction.fromEmail}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{prediction.recommendedAction}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive" className="text-xs">
                              {Math.round(prediction.followupProbability * 100)}% Risk
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {prediction.urgencyLevel.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communication Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Relationship Strength Analysis
                </CardTitle>
                <CardDescription>
                  Your most valuable communication relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patternData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="contact" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="strength" fill="#8884d8" name="Relationship Strength %" />
                      <Bar dataKey="value" fill="#82ca9d" name="Business Value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROI Analysis Tab */}
          <TabsContent value="roi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Email ROI Performance
                </CardTitle>
                <CardDescription>
                  Return on investment analysis for your email communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={roiTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="responseRate"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Response Rate %"
                      />
                      <Line
                        type="monotone"
                        dataKey="roiScore"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="ROI Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* High Priority Insights */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Priority Insights
                  </CardTitle>
                  <CardDescription>AI-generated recommendations requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {highPriorityInsights.map((insight: PredictiveAnalyticsInsight) => (
                      <div key={insight.id} className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {insight.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                                {insight.priority.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {Math.round(insight.confidence * 100)}% confidence
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledgeInsight(insight)}
                            disabled={acknowledgeInsightMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Insights Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Insights Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Insights</span>
                    <Badge variant="secondary">{insights?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Priority</span>
                    <Badge variant="destructive">{highPriorityInsights.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Unacknowledged</span>
                    <Badge variant="outline">{unacknowledgedInsights.length}</Badge>
                  </div>
                  <Progress 
                    value={(insights?.length - unacknowledgedInsights.length) / (insights?.length || 1) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500">
                    {Math.round((insights?.length - unacknowledgedInsights.length) / (insights?.length || 1) * 100)}% insights reviewed
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}