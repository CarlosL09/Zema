import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, MessageCircle, Sparkles, Play, Pause, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface VoiceEmailControlsProps {
  emailId: string;
  emailContent?: string;
  className?: string;
  onVoiceResponse?: (response: string) => void;
}

export default function VoiceEmailControls({ 
  emailId, 
  emailContent = "", 
  className = "",
  onVoiceResponse 
}: VoiceEmailControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceResponse, setVoiceResponse] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Voice command mutation
  const processVoiceCommand = useMutation({
    mutationFn: async (audioBuffer: string) => {
      const response = await apiRequest('POST', '/api/voice/command', { audioBuffer });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Voice Command Processed",
        description: `${data.intent}: ${data.result}`,
      });
      setActiveCommand(data.intent);
      setTimeout(() => setActiveCommand(null), 3000);
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
    mutationFn: async (voiceInput: string) => {
      const response = await apiRequest('POST', '/api/voice/response', {
        originalEmailId: emailId,
        voiceInput,
        conversationContext: { emailContent }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setVoiceResponse(data.enhancedResponse);
      setShowResponse(true);
      if (onVoiceResponse) {
        onVoiceResponse(data.enhancedResponse);
      }
      toast({
        title: "Response Enhanced",
        description: "Your voice input has been enhanced and is ready to send.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Response Generation Failed",
        description: error.message || "Failed to generate response",
        variant: "destructive",
      });
    }
  });

  // AI draft response mutation
  const generateAIDraft = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/voice/ai-draft', {
        originalEmailId: emailId,
        emailContent,
        responseType: 'professional'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setVoiceResponse(data.draftResponse);
      setShowResponse(true);
      if (onVoiceResponse) {
        onVoiceResponse(data.draftResponse);
      }
      toast({
        title: "AI Draft Generated",
        description: "A professional response has been drafted based on the email content.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "AI Draft Failed",
        description: error.message || "Failed to generate AI draft",
        variant: "destructive",
      });
    }
  });

  // Audio summary mutation
  const generateAudioSummary = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/voice/audio-summary', {
        emailIds: [emailId],
        summaryType: 'single'
      });
      return response.json();
    },
    onSuccess: () => {
      setIsPlaying(true);
      toast({
        title: "Audio Summary Generated",
        description: "Playing audio summary of this email.",
      });
      // Simulate audio playback
      setTimeout(() => setIsPlaying(false), 5000);
    },
    onError: (error: any) => {
      toast({
        title: "Summary Generation Failed",
        description: error.message || "Failed to generate audio summary",
        variant: "destructive",
      });
    }
  });

  const startRecording = async (action: 'command' | 'response') => {
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
          
          if (action === 'command') {
            processVoiceCommand.mutate(base64Audio);
          } else {
            // For response, we'll simulate transcription and then enhance
            const mockTranscription = "Thank you for your email. I'll review this and get back to you soon.";
            generateVoiceResponse.mutate(mockTranscription);
          }
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
        description: action === 'command' ? "Speak your voice command..." : "Dictate your response...",
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
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCommandIcon = (command: string) => {
    switch (command) {
      case 'mark_read': return '✓';
      case 'archive': return '📁';
      case 'delete': return '🗑️';
      case 'reply': return '↩️';
      default: return '⚡';
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Control Panel */}
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Voice Controls
            </h3>
            {activeCommand && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <span className="text-lg">{getCommandIcon(activeCommand)}</span>
                <Badge variant="secondary" className="text-xs">
                  {activeCommand.replace('_', ' ')}
                </Badge>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Quick Voice Command */}
            <motion.button
              className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
                isRecording
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }`}
              onClick={() => isRecording ? stopRecording() : startRecording('command')}
              disabled={processVoiceCommand.isPending}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-red-600" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-xs font-medium">Command</span>
                {isRecording && (
                  <span className="text-xs text-red-600 font-mono">
                    {formatTime(recordingTime)}
                  </span>
                )}
              </div>
            </motion.button>

            {/* Voice Response */}
            <motion.button
              className="p-3 rounded-lg border-2 border-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-300"
              onClick={() => startRecording('response')}
              disabled={generateVoiceResponse.isPending}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <Mic className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium">Reply</span>
              </div>
            </motion.button>

            {/* Audio Summary */}
            <motion.button
              className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                isPlaying
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30'
              }`}
              onClick={() => generateAudioSummary.mutate()}
              disabled={generateAudioSummary.isPending}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-purple-600" />
                ) : (
                  <Volume2 className="h-4 w-4 text-purple-600" />
                )}
                <span className="text-xs font-medium">Listen</span>
              </div>
            </motion.button>

            {/* AI Draft Response */}
            <motion.button
              className="p-3 rounded-lg border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all duration-300"
              onClick={() => generateAIDraft.mutate()}
              disabled={generateAIDraft.isPending}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="h-4 w-4 text-yellow-600" />
                <span className="text-xs font-medium">AI Draft</span>
              </div>
            </motion.button>
          </div>

          {/* Processing Indicators */}
          {(processVoiceCommand.isPending || generateVoiceResponse.isPending || generateAudioSummary.isPending || generateAIDraft.isPending) && (
            <div className="mt-3 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {processVoiceCommand.isPending && "Processing command..."}
                {generateVoiceResponse.isPending && "Enhancing response..."}
                {generateAudioSummary.isPending && "Generating audio..."}
                {generateAIDraft.isPending && "Drafting AI response..."}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voice Response Display */}
      <AnimatePresence>
        {showResponse && voiceResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">AI-Enhanced Response</span>
                  </div>
                  <Badge variant="secondary">Ready to Send</Badge>
                </div>
                
                <Textarea
                  value={voiceResponse}
                  onChange={(e) => setVoiceResponse(e.target.value)}
                  placeholder="Your AI-enhanced response will appear here..."
                  className="min-h-[100px] resize-none"
                />
                
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex items-center gap-2">
                    <Send className="h-3 w-3" />
                    Send Reply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowResponse(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}