import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Archive, Trash2, Forward, Reply, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import VoiceEmailControls from "@/components/voice-email-controls";
import EmailSchedulingIntelligence from "@/components/email-scheduling-intelligence";

const demoEmail = {
  id: "email-demo-123",
  from: {
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    avatar: null
  },
  to: [
    { name: "You", email: "demo@zema.com" }
  ],
  subject: "Q4 Project Update and Review Meeting",
  date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  priority: "high",
  labels: ["Work", "Important"],
  content: `Hi there,

I hope this email finds you well. I wanted to provide you with an update on our Q4 project progress and discuss scheduling our upcoming review meeting.

**Project Status:**
- Phase 1: Completed ✅ (Design specifications finalized)
- Phase 2: In Progress 🔄 (Development at 75% completion)
- Phase 3: Pending ⏳ (Testing phase scheduled for next week)

**Key Accomplishments:**
1. Successfully integrated the new authentication system
2. Optimized database performance by 40%
3. Completed user interface redesign based on feedback
4. Resolved 18 critical bugs identified in Phase 1 testing

**Upcoming Milestones:**
- November 15: Beta testing begins
- November 22: Stakeholder review meeting
- November 30: Final deployment (if approved)

**Meeting Request:**
I'd like to schedule a review meeting for next Thursday (November 16th) at 2:00 PM to discuss:
- Current progress and any roadblocks
- Resource allocation for Phase 3
- Timeline adjustments if needed
- Go-live strategy and rollback plan

Could you please confirm your availability? If this time doesn't work, I'm also available on Friday morning.

Additionally, I've attached the latest project documentation and performance metrics for your review before our meeting.

Looking forward to hearing from you soon.

Best regards,
Sarah Johnson
Senior Project Manager
TechCorp Solutions
sarah.johnson@techcorp.com
(555) 123-4567`,
  attachments: [
    { name: "Q4_Project_Report.pdf", size: "2.4 MB" },
    { name: "Performance_Metrics.xlsx", size: "1.2 MB" }
  ]
};

function EmailViewerDemo() {
  const [isStarred, setIsStarred] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState("");

  const handleVoiceResponse = (response: string) => {
    setVoiceResponse(response);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Inbox
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsStarred(!isStarred)}
            >
              <Star className={`h-4 w-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Email Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={demoEmail.from.avatar || ""} />
                  <AvatarFallback>
                    {demoEmail.from.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{demoEmail.subject}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{demoEmail.from.name}</span>
                      <span className="text-gray-500">&lt;{demoEmail.from.email}&gt;</span>
                      {demoEmail.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">High Priority</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {demoEmail.to.map(t => t.name).join(', ')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {formatDate(demoEmail.date)}
                      </span>
                      {demoEmail.labels.map(label => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email Body */}
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {demoEmail.content}
              </div>
            </div>

            {/* Attachments */}
            {demoEmail.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attachments ({demoEmail.attachments.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {demoEmail.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                          {attachment.name.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{attachment.size}</p>
                      </div>
                      <Button size="sm" variant="outline">Download</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Voice Controls Integration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Voice Assistant</h3>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <VoiceEmailControls
                  emailId={demoEmail.id}
                  emailContent={demoEmail.content}
                  onVoiceResponse={handleVoiceResponse}
                />
              </motion.div>
            </div>

            <Separator />

            {/* Email Scheduling Intelligence */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Smart Email Scheduling</h3>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <EmailSchedulingIntelligence
                  recipients={[demoEmail.from.email]}
                  emailContent="Thanks for the detailed Q4 update! I'd like to schedule our review meeting for next Thursday as you suggested. Let me know if 2:00 PM works for you, or if you need to adjust the time."
                  subject="Re: Q4 Project Update and Review Meeting"
                  onSchedule={(scheduledTime, settings) => {
                    console.log('Email scheduled for:', scheduledTime, 'with settings:', settings);
                  }}
                  onSend={() => {
                    console.log('Email sent immediately');
                  }}
                />
              </motion.div>
            </div>

            <Separator />

            {/* Traditional Reply Actions */}
            <div className="flex gap-3">
              <Button className="flex items-center gap-2">
                <Reply className="h-4 w-4" />
                Reply
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Forward className="h-4 w-4" />
                Forward
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              AI Features Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <strong>Voice Commands:</strong> Say "Mark as read", "Archive this email", "Delete this", or "Set reminder for tomorrow"
              </div>
              <div>
                <strong>Voice Reply:</strong> Dictate your response naturally and the AI will enhance it with proper tone and formatting
              </div>
              <div>
                <strong>Audio Summary:</strong> Get an audio summary of the email content read aloud with key points highlighted
              </div>
              <div>
                <strong>Smart Scheduling:</strong> Send emails when recipients are most likely online, with delayed send and change-your-mind options
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EmailViewerDemo;