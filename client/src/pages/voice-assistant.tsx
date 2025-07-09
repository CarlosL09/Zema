import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Play, Pause, Download, Clock, Trash2, MessageCircle, Sparkles, Mail, Volume2, Settings, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface VoiceCommand {
  id: number;
  userId: string;
  command: string;
  intent: string;
  parameters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  audioTranscription?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface VoiceResponse {
  id: number;
  userId: string;
  originalEmailId: string;
  voiceInput: string;
  enhancedResponse: string;
  audioTranscription: string;
  contextAnalysis: any;
  sentimentScore: number;
  confidence: number;
  createdAt: Date;
}

interface EmailAudioSummary {
  id: number;
  userId: string;
  emailId: string;
  summary: string;
  audioUrl?: string;
  duration: number;
  keyPoints: string[];
  actionItems: string[];
  createdAt: Date;
}

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceInput, setVoiceInput] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch voice commands
  const { data: voiceCommands = [], isLoading: commandsLoading } = useQuery({
    queryKey: ['/api/voice/demo/commands'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/voice/demo/commands');
      return response.json();
    }
  });

  // Fetch voice responses
  const { data: voiceResponses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ['/api/voice/demo/responses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/voice/demo/responses');
      return response.json();
    }
  });

  // Fetch audio summaries
  const { data: audioSummaries = [], isLoading: summariesLoading } = useQuery({
    queryKey: ['/api/voice/demo/audio-summaries'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/voice/demo/audio-summaries');
      return response.json();
    }
  });

  // Voice command mutation
  const processVoiceCommand = useMutation({
    mutationFn: async (audioBuffer: string) => {
      const response = await apiRequest('POST', '/api/voice/command', { audioBuffer });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voice/commands'] });
      toast({
        title: "Voice Command Processed",
        description: "Your voice command has been successfully processed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Voice Processing Failed",
        description: error.message || "Failed to process voice command",
        variant: "destructive",
      });
    }
  });

  // Voice response mutation
  const generateVoiceResponse = useMutation({
    mutationFn: async (data: { originalEmailId: string; voiceInput: string; conversationContext?: any }) => {
      const response = await apiRequest('POST', '/api/voice/response', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voice/responses'] });
      toast({
        title: "Voice Response Generated",
        description: "Your voice response has been enhanced and is ready to send.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Response Generation Failed",
        description: error.message || "Failed to generate voice response",
        variant: "destructive",
      });
    }
  });

  // Audio summary mutation
  const generateAudioSummary = useMutation({
    mutationFn: async (data: { emailIds: string[]; summaryType?: string }) => {
      const response = await apiRequest('POST', '/api/voice/audio-summary', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voice/audio-summaries'] });
      toast({
        title: "Audio Summary Generated",
        description: "Your audio summary is ready to listen.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Summary Generation Failed",
        description: error.message || "Failed to generate audio summary",
        variant: "destructive",
      });
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          processVoiceCommand.mutate(base64Audio);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Speak your voice command...",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      toast({
        title: "Recording Stopped",
        description: "Processing your voice command...",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'mark_read': return <Mail className="h-4 w-4" />;
      case 'archive': return <MessageCircle className="h-4 w-4" />;
      case 'search': return <Sparkles className="h-4 w-4" />;
      case 'summarize': return <Volume2 className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const playAudioSummary = async (summaryId: number) => {
    if (currentlyPlaying === summaryId) {
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    } else {
      setIsPlaying(true);
      setCurrentlyPlaying(summaryId);
      
      // Simulate audio playback
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentlyPlaying(null);
      }, 3000);
    }
  };

  const generateDemoSummary = () => {
    const demoEmailIds = ['email-1', 'email-2', 'email-3'];
    generateAudioSummary.mutate({ emailIds: demoEmailIds, summaryType: 'daily' });
  };

  const generateDemoResponse = () => {
    const demoData = {
      originalEmailId: 'email-1',
      voiceInput: voiceInput || "Thank you for the update. I'll review the proposal and get back to you by Friday.",
      conversationContext: { priority: 'high', topic: 'proposal_review' }
    };
    generateVoiceResponse.mutate(demoData);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Voice-to-Email AI Assistant
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Transform your email workflow with intelligent voice commands, dictated responses, and audio summaries
            </p>
          </div>

          {/* Voice Recording Interface */}
          <Card className="mb-8 border-2 border-dashed border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Command Center
              </CardTitle>
              <CardDescription>
                Record voice commands to control your email workflow or dictate responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                <motion.button
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 scale-110'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={processVoiceCommand.isPending}
                  whileTap={{ scale: 0.95 }}
                  animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
                >
                  {isRecording ? (
                    <MicOff className="h-8 w-8 text-white" />
                  ) : (
                    <Mic className="h-8 w-8 text-white" />
                  )}
                  {isRecording && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-red-300"
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  )}
                </motion.button>

                {isRecording && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                  <Button 
                    variant="outline" 
                    onClick={() => startRecording()}
                    disabled={isRecording}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Quick Command
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={generateDemoResponse}
                    disabled={generateVoiceResponse.isPending}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Dictate Response
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={generateDemoSummary}
                    disabled={generateAudioSummary.isPending}
                    className="flex items-center gap-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    Generate Summary
                  </Button>
                </div>

                {processVoiceCommand.isPending && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Processing voice command...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different voice features */}
          <Tabs defaultValue="commands" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="commands" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Voice Commands
              </TabsTrigger>
              <TabsTrigger value="responses" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Voice Responses
              </TabsTrigger>
              <TabsTrigger value="summaries" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Summaries
              </TabsTrigger>
            </TabsList>

            {/* Voice Commands Tab */}
            <TabsContent value="commands">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Voice Commands
                  </CardTitle>
                  <CardDescription>
                    View and manage your voice command history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {commandsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {voiceCommands.map((command: VoiceCommand) => (
                        <motion.div
                          key={command.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {getIntentIcon(command.intent)}
                            <div>
                              <p className="font-medium">{command.command}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {command.audioTranscription}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(command.status)}>
                              {command.status}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(command.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voice Responses Tab */}
            <TabsContent value="responses">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI-Enhanced Responses
                  </CardTitle>
                  <CardDescription>
                    View your dictated responses enhanced by AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {responsesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {voiceResponses.map((response: VoiceResponse) => (
                        <motion.div
                          key={response.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                Confidence: {Math.round(response.confidence * 100)}%
                              </Badge>
                              <Badge variant={response.sentimentScore > 0.5 ? "default" : "destructive"}>
                                Sentiment: {response.sentimentScore > 0.5 ? "Positive" : "Negative"}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(response.createdAt).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Original Voice Input
                              </h4>
                              <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500">
                                {response.voiceInput}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                                AI-Enhanced Response
                              </h4>
                              <p className="text-sm bg-green-50 dark:bg-green-900 p-3 rounded border-l-4 border-green-500">
                                {response.enhancedResponse}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audio Summaries Tab */}
            <TabsContent value="summaries">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Audio Email Summaries
                  </CardTitle>
                  <CardDescription>
                    Listen to AI-generated audio summaries of your emails
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {summariesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {audioSummaries.map((summary: EmailAudioSummary) => (
                        <motion.div
                          key={summary.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(summary.duration)}
                              </Badge>
                              <Badge variant="secondary">
                                {summary.keyPoints.length} Key Points
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(summary.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Summary
                              </h4>
                              <p className="text-sm bg-blue-50 dark:bg-blue-900 p-3 rounded">
                                {summary.summary}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Key Points
                                </h4>
                                <ul className="text-sm space-y-1">
                                  {summary.keyPoints.map((point, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Action Items
                                </h4>
                                <ul className="text-sm space-y-1">
                                  {summary.actionItems.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => playAudioSummary(summary.id)}
                                className="flex items-center gap-2"
                              >
                                {currentlyPlaying === summary.id && isPlaying ? (
                                  <Pause className="h-3 w-3" />
                                ) : (
                                  <Play className="h-3 w-3" />
                                )}
                                {currentlyPlaying === summary.id && isPlaying ? 'Pause' : 'Play'} Audio
                              </Button>
                              
                              {summary.audioUrl && (
                                <Button size="sm" variant="ghost" className="flex items-center gap-2">
                                  <Download className="h-3 w-3" />
                                  Download
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}