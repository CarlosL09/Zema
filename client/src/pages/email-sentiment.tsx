import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Brain, Heart, TrendingUp, Clock, Target, Users, MessageSquare } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SentimentAnalysis {
  id: number;
  sentimentScore: number;
  sentimentLabel: "positive" | "negative" | "neutral";
  confidenceScore: number;
  emotionalTone: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  intentCategory: string;
  keyEmotionalIndicators: string[];
  contextualFactors: string[];
  relationshipTone: "professional" | "casual" | "formal" | "personal";
  suggestedResponseTone: string;
  responseStrategy: string;
  recommendedTimeframe: "immediate" | "within_hour" | "same_day" | "next_day";
}

interface ResponseCoaching {
  approachRecommendation: string;
  toneGuidance: string;
  keyPoints: string[];
  templateSuggestion?: string;
  emotionalConsiderations: string[];
  relationshipProtectionAdvice: string[];
}

interface SentimentInsights {
  dailyAverageSentiment: number;
  topEmotionalTones: Array<{ tone: string; count: number }>;
  atRiskContacts: Array<{ email: string; reason: string; lastScore: number }>;
  totalEmailsAnalyzed: number;
  responseCoachingStats: {
    totalCoachingSessions: number;
    avgResponseTime: number;
    successfulOutcomes: number;
  };
}

export default function EmailSentimentPage() {
  const { toast } = useToast();
  const [emailData, setEmailData] = useState({
    fromEmail: "",
    fromName: "",
    subject: "",
    content: ""
  });
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [coaching, setCoaching] = useState<ResponseCoaching | null>(null);

  // Fetch sentiment insights for dashboard
  const { data: insights, isLoading: insightsLoading } = useQuery<{ insights: SentimentInsights }>({
    queryKey: ['/api/email-sentiment/insights'],
    retry: false
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: typeof emailData) => {
      const emailContent = {
        id: `email-${Date.now()}`,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        subject: data.subject,
        content: data.content,
        timestamp: new Date()
      };
      
      const response = await apiRequest("POST", "/api/email-sentiment/analyze", emailContent);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setAnalysis(data.analysis);
        toast({
          title: "Analysis Complete",
          description: "Email sentiment has been analyzed successfully."
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const coachingMutation = useMutation({
    mutationFn: async (analysisId: number) => {
      const response = await apiRequest("POST", "/api/email-sentiment/coaching", { analysisId });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCoaching(data.coaching);
        toast({
          title: "Coaching Generated",
          description: "Response coaching recommendations are ready."
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Coaching Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAnalyze = () => {
    if (!emailData.fromEmail || !emailData.subject || !emailData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in sender email, subject, and content.",
        variant: "destructive"
      });
      return;
    }
    analyzeMutation.mutate(emailData);
  };

  const handleGetCoaching = () => {
    if (analysis) {
      coachingMutation.mutate(analysis.id);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return "text-green-600";
    if (score < -0.3) return "text-red-600";
    return "text-yellow-600";
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-green-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Brain className="h-10 w-10 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Email Sentiment Analysis
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              AI-powered emotional intelligence for your emails. Understand sentiment, get response coaching, and improve communication relationships.
            </p>
          </div>

          <Tabs defaultValue="analyze" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Analyze Email
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Insights Dashboard
              </TabsTrigger>
              <TabsTrigger value="coaching" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Response Coaching
              </TabsTrigger>
            </TabsList>

            {/* Email Analysis Tab */}
            <TabsContent value="analyze" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Email to Analyze
                    </CardTitle>
                    <CardDescription>
                      Enter the email details to get AI-powered sentiment analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fromEmail">Sender Email *</Label>
                        <Input
                          id="fromEmail"
                          placeholder="sender@example.com"
                          value={emailData.fromEmail}
                          onChange={(e) => setEmailData(prev => ({ ...prev, fromEmail: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fromName">Sender Name</Label>
                        <Input
                          id="fromName"
                          placeholder="John Doe"
                          value={emailData.fromName}
                          onChange={(e) => setEmailData(prev => ({ ...prev, fromName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Email subject line"
                        value={emailData.subject}
                        onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Email Content *</Label>
                      <Textarea
                        id="content"
                        placeholder="Paste the email content here..."
                        rows={8}
                        value={emailData.content}
                        onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                      />
                    </div>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={analyzeMutation.isPending}
                      className="w-full"
                    >
                      {analyzeMutation.isPending ? "Analyzing..." : "Analyze Sentiment"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis ? (
                      <div className="space-y-4">
                        {/* Sentiment Score */}
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className={`text-3xl font-bold ${getSentimentColor(analysis.sentimentScore)}`}>
                            {(analysis.sentimentScore * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Sentiment Score</div>
                          <Badge variant={analysis.sentimentLabel === 'positive' ? 'default' : analysis.sentimentLabel === 'negative' ? 'destructive' : 'secondary'}>
                            {analysis.sentimentLabel}
                          </Badge>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 border rounded-lg">
                            <div className="font-semibold">{(analysis.confidenceScore * 100).toFixed(0)}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Confidence</div>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <Badge className={getUrgencyColor(analysis.urgencyLevel)}>
                              {analysis.urgencyLevel}
                            </Badge>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Urgency</div>
                          </div>
                        </div>

                        {/* Emotional Insights */}
                        <div>
                          <h4 className="font-semibold mb-2">Emotional Tone</h4>
                          <Badge variant="outline">{analysis.emotionalTone}</Badge>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Intent Category</h4>
                          <Badge variant="outline">{analysis.intentCategory}</Badge>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Key Indicators</h4>
                          <div className="flex flex-wrap gap-1">
                            {analysis.keyEmotionalIndicators.map((indicator, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {indicator}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Recommendations</h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <div>• Response Tone: {analysis.suggestedResponseTone}</div>
                            <div>• Strategy: {analysis.responseStrategy}</div>
                            <div>• Timeframe: {analysis.recommendedTimeframe}</div>
                          </div>
                        </div>

                        <Button 
                          onClick={handleGetCoaching} 
                          disabled={coachingMutation.isPending}
                          className="w-full"
                          variant="outline"
                        >
                          {coachingMutation.isPending ? "Getting Coaching..." : "Get Response Coaching"}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Analyze an email to see sentiment insights here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Insights Dashboard Tab */}
            <TabsContent value="insights" className="space-y-6">
              {insightsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading insights...</p>
                </div>
              ) : insights?.insights ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Daily Average */}
                  <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Daily Average Sentiment</CardTitle>
                      <Heart className="h-4 w-4 ml-auto" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getSentimentColor(insights.insights.dailyAverageSentiment)}`}>
                        {(insights.insights.dailyAverageSentiment * 100).toFixed(0)}%
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Emails */}
                  <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Emails Analyzed</CardTitle>
                      <MessageSquare className="h-4 w-4 ml-auto" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{insights.insights.totalEmailsAnalyzed}</div>
                    </CardContent>
                  </Card>

                  {/* Coaching Sessions */}
                  <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Coaching Sessions</CardTitle>
                      <Target className="h-4 w-4 ml-auto" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{insights.insights.responseCoachingStats.totalCoachingSessions}</div>
                    </CardContent>
                  </Card>

                  {/* Top Emotional Tones */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Top Emotional Tones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {insights.insights.topEmotionalTones.slice(0, 5).map((tone, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-sm">{tone.tone}</span>
                            <Badge variant="secondary">{tone.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* At-Risk Contacts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        At-Risk Contacts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {insights.insights.atRiskContacts.slice(0, 3).map((contact, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium truncate">{contact.email}</div>
                            <div className="text-gray-500 text-xs">{contact.reason}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sentiment data available yet. Analyze some emails to see insights.</p>
                </div>
              )}
            </TabsContent>

            {/* Response Coaching Tab */}
            <TabsContent value="coaching" className="space-y-6">
              {coaching ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Response Coaching Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Approach Recommendation */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Recommended Approach
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">{coaching.approachRecommendation}</p>
                      </div>

                      {/* Tone Guidance */}
                      <div>
                        <h4 className="font-semibold mb-2">Tone Guidance</h4>
                        <p className="text-gray-700 dark:text-gray-300">{coaching.toneGuidance}</p>
                      </div>

                      {/* Key Points */}
                      <div>
                        <h4 className="font-semibold mb-2">Key Points to Address</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                          {coaching.keyPoints.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Template Suggestion */}
                      {coaching.templateSuggestion && (
                        <div>
                          <h4 className="font-semibold mb-2">Template Suggestion</h4>
                          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm">{coaching.templateSuggestion}</pre>
                          </div>
                        </div>
                      )}

                      {/* Emotional Considerations */}
                      <div>
                        <h4 className="font-semibold mb-2">Emotional Considerations</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                          {coaching.emotionalConsiderations.map((consideration, idx) => (
                            <li key={idx}>{consideration}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Relationship Protection */}
                      <div>
                        <h4 className="font-semibold mb-2">Relationship Protection Advice</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                          {coaching.relationshipProtectionAdvice.map((advice, idx) => (
                            <li key={idx}>{advice}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analyze an email and request coaching to see recommendations here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}