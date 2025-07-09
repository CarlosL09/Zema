import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Brain, FileText, Calendar, Upload, Sparkles, Clock, User, TrendingUp, ChevronRight } from 'lucide-react';

interface WritingStyleProfile {
  styleAnalysis: {
    tone: string;
    complexity: string;
    length: string;
    vocabulary: string[];
    signature: string;
    greetings: string[];
    closings: string[];
  };
  examples: string[];
  lastUpdated: string;
}

interface AttachmentAnalysis {
  filename: string;
  mimeType: string;
  size: number;
  content: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  insights: string[];
  category: string;
  createdAt: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  location: string;
  isCreatedByAI: boolean;
}

export default function AIFeaturesPage() {
  const [emailSamples, setEmailSamples] = useState('');
  const [draftContext, setDraftContext] = useState('');
  const [meetingContent, setMeetingContent] = useState('');
  const [meetingSubject, setMeetingSubject] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch writing style profile
  const { data: writingProfile, isLoading: profileLoading } = useQuery<WritingStyleProfile>({
    queryKey: ['/api/writing-style/profile'],
  });

  // Fetch attachment analyses
  const { data: attachmentAnalyses, isLoading: attachmentsLoading } = useQuery<AttachmentAnalysis[]>({
    queryKey: ['/api/attachments/user-analysis'],
  });

  // Fetch calendar events
  const { data: calendarEvents, isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar/events'],
  });

  // Mutations for AI features
  const analyzeWritingStyleMutation = useMutation({
    mutationFn: async (samples: string[]) => {
      const response = await apiRequest('POST', '/api/writing-style/analyze', { emailSamples: samples });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/writing-style/profile'] });
      toast({
        title: "Writing Style Analyzed",
        description: "Your writing style has been learned and saved.",
      });
    },
  });

  const generateDraftMutation = useMutation({
    mutationFn: async (context: any) => {
      const response = await apiRequest('POST', '/api/writing-style/generate-draft', context);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Draft Generated",
        description: "A personalized email draft has been created.",
      });
    },
  });

  const detectMeetingMutation = useMutation({
    mutationFn: async (data: { emailContent: string; subject: string }) => {
      const response = await apiRequest('POST', '/api/calendar/detect-meeting', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Meeting Detected",
          description: "Found meeting request in email content.",
        });
      } else {
        toast({
          title: "No Meeting Found",
          description: "No meeting request detected in this email.",
        });
      }
    },
  });

  const handleAnalyzeWritingStyle = () => {
    if (!emailSamples.trim()) {
      toast({
        title: "No Email Samples",
        description: "Please provide some email samples to analyze.",
        variant: "destructive",
      });
      return;
    }
    const samples = emailSamples.split('\n---\n').filter(s => s.trim());
    analyzeWritingStyleMutation.mutate(samples);
  };

  const handleGenerateDraft = () => {
    if (!draftContext.trim()) {
      toast({
        title: "No Context",
        description: "Please provide context for the email draft.",
        variant: "destructive",
      });
      return;
    }
    generateDraftMutation.mutate({
      purpose: draftContext,
      recipient: "colleague",
      urgency: "normal"
    });
  };

  const handleDetectMeeting = () => {
    if (!meetingContent.trim() || !meetingSubject.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both email content and subject.",
        variant: "destructive",
      });
      return;
    }
    detectMeetingMutation.mutate({
      emailContent: meetingContent,
      subject: meetingSubject
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Email Features
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience ZEMA's three signature AI capabilities: personalized writing style learning, 
            intelligent attachment analysis, and seamless calendar integration.
          </p>
        </div>

        <Tabs defaultValue="writing-style" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="writing-style" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Writing Style
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Attachments
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Writing Style Tab */}
          <TabsContent value="writing-style" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Analyze Writing Style */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Learn Your Writing Style
                  </CardTitle>
                  <CardDescription>
                    Provide email samples to train AI on your unique communication style.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste your email samples here (separate multiple emails with '---')..."
                    value={emailSamples}
                    onChange={(e) => setEmailSamples(e.target.value)}
                    rows={8}
                  />
                  <Button 
                    onClick={handleAnalyzeWritingStyle}
                    disabled={analyzeWritingStyleMutation.isPending}
                    className="w-full"
                  >
                    {analyzeWritingStyleMutation.isPending ? 'Analyzing...' : 'Analyze Writing Style'}
                  </Button>
                </CardContent>
              </Card>

              {/* Current Writing Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Your Writing Profile
                  </CardTitle>
                  <CardDescription>
                    Your learned communication patterns and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profileLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading profile...</div>
                  ) : writingProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Tone</label>
                          <Badge variant="outline">{writingProfile.styleAnalysis.tone}</Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Complexity</label>
                          <Badge variant="outline">{writingProfile.styleAnalysis.complexity}</Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Typical Length</label>
                        <Badge variant="outline">{writingProfile.styleAnalysis.length}</Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Common Vocabulary</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {writingProfile.styleAnalysis.vocabulary.slice(0, 5).map((word, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{word}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No writing profile yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Analyze some email samples to get started.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Generate Personalized Draft */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChevronRight className="h-5 w-5 text-purple-600" />
                    Generate Personalized Draft
                  </CardTitle>
                  <CardDescription>
                    Create email drafts using your learned writing style.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Textarea
                        placeholder="Describe what you want to write about..."
                        value={draftContext}
                        onChange={(e) => setDraftContext(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div>
                      {generateDraftMutation.data && (
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">Generated Draft:</h4>
                          <p className="text-sm">{generateDraftMutation.data.draft}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={handleGenerateDraft}
                    disabled={generateDraftMutation.isPending || !writingProfile}
                    className="w-full"
                  >
                    {generateDraftMutation.isPending ? 'Generating...' : 'Generate Draft'}
                  </Button>
                  {!writingProfile && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please analyze your writing style first to enable draft generation.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Attachment Analysis History
                </CardTitle>
                <CardDescription>
                  Review AI-powered insights from your email attachments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attachmentsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading analyses...</div>
                ) : attachmentAnalyses && attachmentAnalyses.length > 0 ? (
                  <div className="space-y-4">
                    {attachmentAnalyses.slice(0, 5).map((analysis, idx) => (
                      <div key={idx} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{analysis.filename}</span>
                          </div>
                          <Badge variant="outline">{analysis.category}</Badge>
                        </div>
                        
                        {analysis.summary && (
                          <div>
                            <h4 className="font-medium text-sm mb-1">Summary</h4>
                            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                          </div>
                        )}
                        
                        {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-1">Key Points</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {analysis.keyPoints.slice(0, 3).map((point, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {analysis.actionItems && analysis.actionItems.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-1">Action Items</h4>
                            <div className="flex flex-wrap gap-1">
                              {analysis.actionItems.slice(0, 3).map((item, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Analyzed {new Date(analysis.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No attachment analyses yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Email attachments will be automatically analyzed when received.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Meeting Detection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    Detect Meeting Requests
                  </CardTitle>
                  <CardDescription>
                    Automatically identify meeting requests in email content.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Email subject..."
                    value={meetingSubject}
                    onChange={(e) => setMeetingSubject(e.target.value)}
                  />
                  <Textarea
                    placeholder="Email content to analyze for meeting requests..."
                    value={meetingContent}
                    onChange={(e) => setMeetingContent(e.target.value)}
                    rows={6}
                  />
                  <Button 
                    onClick={handleDetectMeeting}
                    disabled={detectMeetingMutation.isPending}
                    className="w-full"
                  >
                    {detectMeetingMutation.isPending ? 'Analyzing...' : 'Detect Meeting'}
                  </Button>
                  
                  {detectMeetingMutation.data && (
                    <div className="p-4 bg-muted rounded-lg mt-4">
                      <h4 className="font-medium mb-2">Detection Result:</h4>
                      {detectMeetingMutation.data ? (
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Requester:</span> {detectMeetingMutation.data.requesterEmail}</p>
                          <p><span className="font-medium">Subject:</span> {detectMeetingMutation.data.subject}</p>
                          {detectMeetingMutation.data.proposedTimes && (
                            <p><span className="font-medium">Proposed Times:</span> {detectMeetingMutation.data.proposedTimes.join(', ')}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No meeting request detected.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI-Created Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    AI-Created Events
                  </CardTitle>
                  <CardDescription>
                    Calendar events automatically created from emails.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {eventsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading events...</div>
                  ) : calendarEvents && calendarEvents.filter(e => e.isCreatedByAI).length > 0 ? (
                    <div className="space-y-3">
                      {calendarEvents.filter(e => e.isCreatedByAI).slice(0, 5).map((event) => (
                        <div key={event.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge variant="secondary" className="text-xs">AI Created</Badge>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
                          </div>
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="text-xs">
                              <span className="font-medium">Attendees:</span> {event.attendees.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No AI-created events yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Events will be automatically created when meeting requests are detected.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}