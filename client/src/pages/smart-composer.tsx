import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Copy, 
  Send, 
  RefreshCw, 
  Wand2, 
  MessageCircle,
  Lightbulb,
  Clock,
  Target,
  Users,
  FileText,
  Zap
} from "lucide-react";

const toneOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and informal' },
  { value: 'urgent', label: 'Urgent', description: 'Direct and time-sensitive' },
  { value: 'persuasive', label: 'Persuasive', description: 'Compelling and convincing' },
  { value: 'apologetic', label: 'Apologetic', description: 'Acknowledging and making amends' }
];

const purposeOptions = [
  { value: 'follow-up', label: 'Follow-up', icon: <Clock className="h-4 w-4" /> },
  { value: 'meeting-request', label: 'Meeting Request', icon: <Users className="h-4 w-4" /> },
  { value: 'proposal', label: 'Proposal', icon: <FileText className="h-4 w-4" /> },
  { value: 'introduction', label: 'Introduction', icon: <MessageCircle className="h-4 w-4" /> },
  { value: 'thank-you', label: 'Thank You', icon: <Target className="h-4 w-4" /> },
  { value: 'sales-outreach', label: 'Sales Outreach', icon: <Zap className="h-4 w-4" /> }
];

const templateSuggestions = [
  {
    title: "Project Status Update",
    purpose: "follow-up",
    tone: "professional",
    preview: "I wanted to provide you with an update on the project status and next steps..."
  },
  {
    title: "Meeting Confirmation",
    purpose: "meeting-request",
    tone: "friendly",
    preview: "I'm writing to confirm our meeting scheduled for tomorrow at 2 PM..."
  },
  {
    title: "New Partnership Proposal",
    purpose: "proposal",
    tone: "persuasive",
    preview: "I hope this email finds you well. I'm reaching out to discuss an exciting partnership opportunity..."
  },
  {
    title: "Thank You - Great Meeting",
    purpose: "thank-you",
    tone: "professional",
    preview: "Thank you for taking the time to meet with me today. I really appreciated our discussion about..."
  }
];

const smartSuggestions = [
  { text: "Include a clear call-to-action", type: "structure" },
  { text: "Add specific deadline or timeline", type: "urgency" },
  { text: "Mention previous context or conversation", type: "personalization" },
  { text: "Attach relevant documents or links", type: "resources" },
  { text: "Use bullet points for key information", type: "clarity" },
  { text: "Include your availability for next steps", type: "follow-up" }
];

export default function SmartComposer() {
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generateEmailMutation = useMutation({
    mutationFn: async ({ context, tone, purpose, recipient }: any) => {
      setIsGenerating(true);
      // Simulate AI email generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sampleEmail = `Subject: ${purpose === 'meeting-request' ? 'Meeting Request - Project Discussion' : 
                           purpose === 'follow-up' ? 'Following Up on Our Conversation' :
                           purpose === 'proposal' ? 'Partnership Proposal - Mutual Growth Opportunity' :
                           purpose === 'introduction' ? 'Introduction and Collaboration Opportunity' :
                           purpose === 'thank-you' ? 'Thank You for Your Time Today' :
                           'Exciting Opportunity for Collaboration'}

Hi ${recipient || 'there'},

${purpose === 'meeting-request' ? 
  `I hope this email finds you well. I'd like to schedule a meeting to discuss the ${context || 'upcoming project'} in more detail.` :
  purpose === 'follow-up' ? 
  `I wanted to follow up on our recent conversation about ${context || 'the project we discussed'}. I've had some time to think about our discussion and wanted to share a few thoughts.` :
  purpose === 'proposal' ?
  `I hope you're doing well. I'm reaching out because I believe there's a fantastic opportunity for us to collaborate on ${context || 'a mutually beneficial project'}.` :
  purpose === 'introduction' ?
  `I hope this email finds you well. My name is [Your Name], and I'm reaching out regarding ${context || 'a potential collaboration opportunity'}.` :
  purpose === 'thank-you' ?
  `Thank you so much for taking the time to meet with me today. I really appreciated our discussion about ${context || 'the project'}.` :
  `I'm excited to reach out about an opportunity that could be of mutual interest regarding ${context || 'our potential collaboration'}.`
}

${tone === 'urgent' ? 'Given the time-sensitive nature of this matter, I would appreciate a response at your earliest convenience.' :
  tone === 'friendly' ? 'I would love to hear your thoughts on this and see how we might move forward together.' :
  tone === 'persuasive' ? 'I believe this presents a unique opportunity that could benefit both our organizations significantly.' :
  tone === 'apologetic' ? 'I sincerely apologize for any inconvenience this may have caused and appreciate your understanding.' :
  'I would welcome the opportunity to discuss this further at your convenience.'
}

${purpose === 'meeting-request' ? 'Would you be available for a 30-minute call next week? I have availability on Tuesday afternoon or Wednesday morning.' :
  purpose === 'follow-up' ? 'Please let me know if you have any questions or if you would like to schedule a follow-up call to discuss next steps.' :
  'I would be happy to provide additional information or answer any questions you might have.'
}

Best regards,
[Your Name]`;

      return sampleEmail;
    },
    onSuccess: (data) => {
      setGeneratedEmail(data);
      setIsGenerating(false);
      toast({
        title: "Email Generated!",
        description: "Your AI-powered email has been created successfully.",
      });
    },
    onError: () => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Unable to generate email. Please try again.",
        variant: "destructive",
      });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Email content copied to clipboard.",
    });
  };

  const useTemplate = (template: any) => {
    setSelectedTemplate(template);
    setPurpose(template.purpose);
    setTone(template.tone);
    setContext(template.title);
  };

  const regenerateEmail = () => {
    if (context && tone && purpose) {
      generateEmailMutation.mutate({ context, tone, purpose, recipient });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-cyan-500" />
              Smart Email Composer
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered email generation with context-aware suggestions and professional templates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Composer */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Email Composer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Recipient
                    </label>
                    <Input
                      placeholder="e.g., John, Sarah, or leave blank"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Email Purpose
                    </label>
                    <Select value={purpose} onValueChange={setPurpose}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {purposeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {option.icon}
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Tone & Style
                  </label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Context & Details
                  </label>
                  <Textarea
                    ref={textareaRef}
                    placeholder="Describe what this email is about, key points to include, or any specific context..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => generateEmailMutation.mutate({ context, tone, purpose, recipient })}
                  disabled={!context || !tone || !purpose || isGenerating}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Email...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Smart Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Email */}
            {generatedEmail && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Generated Email
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={regenerateEmail}
                        disabled={isGenerating}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedEmail)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200">
                      {generatedEmail}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Templates */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quick Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {templateSuggestions.map((template, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => useTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                        {template.title}
                      </h4>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.purpose}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {template.preview}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Smart Suggestions */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Smart Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {smartSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer transition-colors"
                    onClick={() => {
                      if (textareaRef.current) {
                        const currentValue = textareaRef.current.value;
                        const newValue = currentValue ? `${currentValue}\n• ${suggestion.text}` : `• ${suggestion.text}`;
                        setContext(newValue);
                        textareaRef.current.focus();
                      }
                    }}
                  >
                    <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                    <span>{suggestion.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Emails Generated</span>
                  <span className="font-semibold text-gray-900 dark:text-white">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Time Saved</span>
                  <span className="font-semibold text-gray-900 dark:text-white">2.4h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Response Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">89%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}