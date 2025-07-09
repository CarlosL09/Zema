import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Globe, 
  Calendar, 
  Brain, 
  Send, 
  Edit3, 
  X, 
  CheckCircle,
  AlertCircle,
  Users,
  Timer,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EmailSchedulingIntelligenceProps {
  recipients: string[];
  emailContent: string;
  subject: string;
  onSchedule?: (scheduledTime: Date, settings: any) => void;
  onSend?: () => void;
  className?: string;
}

interface RecipientTimezone {
  email: string;
  timezone: string;
  offset: number;
  confidence: number;
  optimalHours: number[];
  currentTime: string;
  isOnline: boolean;
}

interface OptimalSendTime {
  suggestedTime: Date;
  confidence: number;
  reason: string;
  alternativeTimes: Date[];
}

export default function EmailSchedulingIntelligence({
  recipients,
  emailContent,
  subject,
  onSchedule,
  onSend,
  className = ""
}: EmailSchedulingIntelligenceProps) {
  const { toast } = useToast();
  const [useSmartScheduling, setUseSmartScheduling] = useState(true);
  const [manualTime, setManualTime] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(5);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch recipient timezone and optimal times
  const { data: recipientAnalysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['/api/scheduling/recipient-analysis', recipients],
    queryFn: async () => {
      if (recipients.length === 0) return [];
      const response = await apiRequest('POST', '/api/scheduling/recipient-analysis', {
        recipients
      });
      return response.json();
    },
    enabled: recipients.length > 0
  });

  // Get optimal send time suggestion
  const { data: optimalTime, isLoading: loadingOptimal } = useQuery({
    queryKey: ['/api/scheduling/optimal-time', recipients, useSmartScheduling],
    queryFn: async () => {
      if (!useSmartScheduling || recipients.length === 0) return null;
      const response = await apiRequest('POST', '/api/scheduling/optimal-time', {
        recipients,
        emailContent,
        currentTime: new Date().toISOString()
      });
      return response.json();
    },
    enabled: useSmartScheduling && recipients.length > 0
  });

  // Schedule email mutation
  const scheduleEmail = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await apiRequest('POST', '/api/scheduling/schedule', scheduleData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Email Scheduled",
        description: `Email will be sent at ${new Date(data.scheduledFor).toLocaleString()}`,
      });
      if (onSchedule) {
        onSchedule(new Date(data.scheduledFor), data);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Scheduling Failed",
        description: error.message || "Failed to schedule email",
        variant: "destructive",
      });
    }
  });

  // Send with delay mutation (change your mind option)
  const sendWithDelay = useMutation({
    mutationFn: async (delayData: any) => {
      const response = await apiRequest('POST', '/api/scheduling/send-delayed', delayData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Email Queued",
        description: `Email will send in ${delayMinutes} minutes. You can cancel anytime.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to queue email",
        variant: "destructive",
      });
    }
  });

  const handleSmartSchedule = () => {
    if (!optimalTime) return;
    
    scheduleEmail.mutate({
      recipients,
      subject,
      content: emailContent,
      scheduledFor: optimalTime.suggestedTime,
      useSmartTiming: true,
      reason: optimalTime.reason
    });
  };

  const handleManualSchedule = () => {
    if (!manualTime) return;
    
    const scheduledDate = new Date(manualTime);
    scheduleEmail.mutate({
      recipients,
      subject,
      content: emailContent,
      scheduledFor: scheduledDate,
      useSmartTiming: false,
      reason: "Manual scheduling"
    });
  };

  const handleDelayedSend = () => {
    const sendTime = new Date(Date.now() + delayMinutes * 60 * 1000);
    
    sendWithDelay.mutate({
      recipients,
      subject,
      content: emailContent,
      delayMinutes,
      scheduledFor: sendTime,
      cancellable: true
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Email Scheduling Intelligence
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Recipient Analysis */}
        {loadingAnalysis ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            Analyzing recipient timezones...
          </div>
        ) : recipientAnalysis && recipientAnalysis.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Recipient Analysis
            </h4>
            <div className="grid gap-2">
              {recipientAnalysis.map((recipient: RecipientTimezone) => (
                <div key={recipient.email} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{recipient.email}</p>
                      <p className="text-xs text-gray-600">
                        {recipient.timezone} • {recipient.currentTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={recipient.isOnline ? "default" : "secondary"}>
                      {recipient.isOnline ? "Online" : "Offline"}
                    </Badge>
                    <Badge variant="outline">
                      {recipient.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Smart Scheduling Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Send when recipients are most likely online
            </Label>
            <p className="text-xs text-gray-600">
              AI analyzes recipient patterns to find optimal send times
            </p>
          </div>
          <Switch
            checked={useSmartScheduling}
            onCheckedChange={setUseSmartScheduling}
          />
        </div>

        {/* Optimal Time Suggestion */}
        {useSmartScheduling && optimalTime && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Optimal Send Time Found
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {formatTime(optimalTime.suggestedTime)} • {optimalTime.confidence}% confidence
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {optimalTime.reason}
                </p>
                
                {optimalTime.alternativeTimes && optimalTime.alternativeTimes.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                      Alternative times:
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {optimalTime.alternativeTimes.slice(0, 3).map((time: Date, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {formatTime(time)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t pt-4"
            >
              <h4 className="font-medium">Advanced Scheduling</h4>
              
              {/* Manual Time Selection */}
              <div className="space-y-2">
                <Label htmlFor="manual-time">Custom Send Time</Label>
                <Input
                  id="manual-time"
                  type="datetime-local"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Delay Settings */}
              <div className="space-y-2">
                <Label htmlFor="delay-minutes">Delayed Send (Change Your Mind Option)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="delay-minutes"
                    type="number"
                    min="1"
                    max="60"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 5)}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">minutes delay</span>
                </div>
                <p className="text-xs text-gray-500">
                  Email will be queued and you can cancel before it's sent
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {useSmartScheduling && optimalTime ? (
            <Button
              onClick={handleSmartSchedule}
              disabled={scheduleEmail.isPending}
              className="flex-1"
            >
              {scheduleEmail.isPending ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Schedule Optimally
            </Button>
          ) : (
            <Button
              onClick={handleManualSchedule}
              disabled={!manualTime || scheduleEmail.isPending}
              variant="outline"
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule for {manualTime ? formatTime(manualTime) : "..."}
            </Button>
          )}

          <Button
            onClick={handleDelayedSend}
            disabled={sendWithDelay.isPending}
            variant="secondary"
          >
            {sendWithDelay.isPending ? (
              <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2"></div>
            ) : (
              <Timer className="h-4 w-4 mr-2" />
            )}
            Send in {delayMinutes}m
          </Button>

          <Button
            onClick={onSend}
            variant="default"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Now
          </Button>
        </div>

        {/* Processing Indicators */}
        {(scheduleEmail.isPending || sendWithDelay.isPending || loadingOptimal) && (
          <div className="mt-3 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {scheduleEmail.isPending && "Scheduling email..."}
              {sendWithDelay.isPending && "Queueing delayed send..."}
              {loadingOptimal && "Finding optimal send time..."}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}