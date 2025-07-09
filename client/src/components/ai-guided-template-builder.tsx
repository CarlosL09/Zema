import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, ArrowRight, Check, X, MessageCircle, Sparkles, Zap, Settings } from "lucide-react";
import { SiGmail, SiSlack, SiTrello, SiNotion, SiZapier, SiGooglecalendar, SiDropbox, SiAsana, SiSalesforce, SiHubspot } from "react-icons/si";

interface AIGuidedTemplateBuilderProps {
  onClose: () => void;
  onComplete: () => void;
}

interface AIConversation {
  type: 'ai' | 'user';
  message: string;
  options?: string[];
  integrationOptions?: string[];
}

const getIntegrationIcon = (integration: string) => {
  switch (integration.toLowerCase()) {
    case 'gmail': return <SiGmail className="h-4 w-4" />;
    case 'slack': return <SiSlack className="h-4 w-4" />;
    case 'trello': return <SiTrello className="h-4 w-4" />;
    case 'notion': return <SiNotion className="h-4 w-4" />;
    case 'zapier': return <SiZapier className="h-4 w-4" />;
    case 'google calendar': return <SiGooglecalendar className="h-4 w-4" />;
    case 'dropbox': return <SiDropbox className="h-4 w-4" />;
    case 'asana': return <SiAsana className="h-4 w-4" />;
    case 'salesforce': return <SiSalesforce className="h-4 w-4" />;
    case 'hubspot': return <SiHubspot className="h-4 w-4" />;
    default: return <Settings className="h-4 w-4" />;
  }
};

export default function AIGuidedTemplateBuilder({ onClose, onComplete }: AIGuidedTemplateBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [conversation, setConversation] = useState<AIConversation[]>([
    {
      type: 'ai',
      message: "Hi! I'm your AI template assistant. I'll help you create a reusable email template that others can use. What type of email template would you like to create?",
      options: [
        "Customer service response templates",
        "Sales outreach email templates", 
        "Meeting invitation templates",
        "Follow-up email templates",
        "Newsletter and marketing templates"
      ]
    }
  ]);
  const [templateData, setTemplateData] = useState({
    purpose: '',
    integration: '',
    emailType: '',
    content: '',
    name: '',
    details: {}
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOptionSelect = async (option: string) => {
    // Add user response to conversation
    const newConversation = [...conversation, { type: 'user' as const, message: option }];
    setConversation(newConversation);
    setIsProcessing(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    let aiResponse: AIConversation;
    let nextTemplateData = { ...templateData };

    switch (currentStep) {
      case 0: // Purpose selection
        nextTemplateData.purpose = option;
        if (option.includes("Customer service")) {
          aiResponse = {
            type: 'ai',
            message: "Great! Let's create customer service templates. Which platform will handle responses?",
            integrationOptions: ["Gmail", "Outlook", "Slack", "HubSpot", "Salesforce"]
          };
        } else if (option.includes("Sales outreach")) {
          aiResponse = {
            type: 'ai',
            message: "Perfect! Sales outreach templates are powerful. Which CRM or email platform do you use?",
            integrationOptions: ["Salesforce", "HubSpot", "Gmail", "Outlook", "Pipedrive"]
          };
        } else if (option.includes("Meeting invitation")) {
          aiResponse = {
            type: 'ai',
            message: "Excellent! Meeting templates save lots of time. Which calendar system do you use?",
            integrationOptions: ["Google Calendar", "Outlook Calendar", "Calendly", "Zoom", "Microsoft Teams"]
          };
        } else if (option.includes("Follow-up")) {
          aiResponse = {
            type: 'ai',
            message: "Smart choice! Follow-up templates increase response rates. Where should these be sent from?",
            integrationOptions: ["Gmail", "Outlook", "Salesforce", "HubSpot", "Slack"]
          };
        } else {
          aiResponse = {
            type: 'ai',
            message: "Perfect! Marketing templates are essential. Which email marketing platform do you use?",
            integrationOptions: ["Mailchimp", "SendGrid", "Gmail", "Outlook", "HubSpot"]
          };
        }
        break;

      case 1: // Integration selection
        nextTemplateData.integration = option;
        if (templateData.purpose.includes("Customer service")) {
          aiResponse = {
            type: 'ai',
            message: `Great! What type of customer service emails should this ${option} template handle?`,
            options: [
              "Support ticket responses and troubleshooting",
              "Billing and payment inquiries",
              "Product information and feature questions",
              "Refund and return requests",
              "General customer inquiries"
            ]
          };
        } else if (templateData.purpose.includes("Sales outreach")) {
          aiResponse = {
            type: 'ai',
            message: `Perfect! What type of sales emails should this ${option} template create?`,
            options: [
              "Cold outreach to new prospects",
              "Follow-up after initial contact",
              "Product demo invitations",
              "Proposal and pricing emails",
              "Deal closing and contract emails"
            ]
          };
        } else if (templateData.purpose.includes("Meeting")) {
          aiResponse = {
            type: 'ai',
            message: `Excellent! What type of meetings should this ${option} template schedule?`,
            options: [
              "Client consultations and discovery calls",
              "Team meetings and project updates",
              "Product demos and presentations",
              "One-on-one meetings and check-ins",
              "Interview and hiring meetings"
            ]
          };
        } else if (templateData.purpose.includes("Follow-up")) {
          aiResponse = {
            type: 'ai',
            message: `Smart! What type of follow-up emails should this ${option} template send?`,
            options: [
              "Post-meeting follow-up with action items",
              "Follow-up on proposals and quotes",
              "Check-in after product delivery",
              "Follow-up on networking connections",
              "Re-engagement with inactive leads"
            ]
          };
        } else {
          aiResponse = {
            type: 'ai',
            message: `Perfect! What type of marketing emails should this ${option} template create?`,
            options: [
              "Weekly newsletters with company updates",
              "Product announcements and launches",
              "Educational content and how-to guides",
              "Event invitations and webinar promotions",
              "Customer success stories and testimonials"
            ]
          };
        }
        break;

      case 2: // Email type details
        nextTemplateData.emailType = option;
        aiResponse = {
          type: 'ai',
          message: "Excellent! Now, what key information should be included in this email template? (This will help others customize it)",
          options: [
            "Personalized greeting with recipient name",
            "Company/product specific details",
            "Contact information and next steps",
            "Professional closing and signature",
            "Call-to-action buttons and links"
          ]
        };
        break;

      case 3: // Content details
        nextTemplateData.content = option;
        aiResponse = {
          type: 'ai',
          message: "Perfect! What would you like to name this email template?",
          options: []
        };
        break;

      default:
        aiResponse = {
          type: 'ai',
          message: "Excellent! Let me create your email template now...",
          options: []
        };
    }

    setTemplateData(nextTemplateData);
    setConversation([...newConversation, aiResponse]);
    setCurrentStep(currentStep + 1);
    setIsProcessing(false);
  };

  const handleCustomInput = (input: string) => {
    if (currentStep === 4) {
      // Name input
      const finalTemplateData = { ...templateData, name: input };
      setTemplateData(finalTemplateData);
      
      // Create the template
      createTemplate(finalTemplateData);
    }
  };

  const createTemplate = async (finalTemplateData: any) => {
    setIsProcessing(true);
    
    const newConversation = [...conversation, 
      { type: 'user' as const, message: finalTemplateData.name },
      { type: 'ai' as const, message: "Creating your email template... This will just take a moment!" }
    ];
    setConversation(newConversation);

    // Simulate template creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add success message
    setConversation([...newConversation, {
      type: 'ai',
      message: `🎉 Success! I've created your "${finalTemplateData.name}" email template. Others can now use it with ${finalTemplateData.integration} integration!`
    }]);

    setIsProcessing(false);
    
    // Wait a moment then complete
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const currentMessage = conversation[conversation.length - 1];
  const isWaitingForName = currentStep === 4 && currentMessage?.options?.length === 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bot className="h-6 w-6 text-purple-600" />
            AI-Guided Template Builder
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-0">
              {conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white dark:bg-gray-800 border shadow-sm'
                  }`}>
                    {msg.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-600">ZEMA AI</span>
                      </div>
                    )}
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border shadow-sm p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-600">ZEMA AI</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="mt-4 space-y-3 bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
              {/* Show options only when available */}
              {!isWaitingForName && currentMessage?.options && currentMessage.options.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                  {currentMessage.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start h-auto p-3 hover:border-purple-500"
                      onClick={() => handleOptionSelect(option)}
                      disabled={isProcessing}
                    >
                      <span className="text-sm">{option}</span>
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  ))}
                </div>
              )}
              
              {!isWaitingForName && currentMessage?.integrationOptions && currentMessage.integrationOptions.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {currentMessage.integrationOptions.map((integration, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start h-auto p-3 hover:border-purple-500"
                      onClick={() => handleOptionSelect(integration)}
                      disabled={isProcessing}
                    >
                      <div className="flex items-center gap-2">
                        {getIntegrationIcon(integration)}
                        <span className="text-sm">{integration}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  ))}
                </div>
              )}
              
              {/* Always show text input */}
              <div className="flex gap-2">
                <Input 
                  placeholder={isWaitingForName ? "Enter a name for your template (e.g., 'Customer Support Response')" : "Or type your own response..."}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        if (isWaitingForName) {
                          handleCustomInput(input.value.trim());
                        } else {
                          handleOptionSelect(input.value.trim());
                          input.value = '';
                        }
                      }
                    }
                  }}
                  className="flex-1"
                  disabled={isProcessing}
                />
                <Button 
                  onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      if (isWaitingForName) {
                        handleCustomInput(input.value.trim());
                      } else {
                        handleOptionSelect(input.value.trim());
                        input.value = '';
                      }
                    }
                  }}
                  disabled={isProcessing}
                  variant="outline"
                >
                  {isWaitingForName ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { step: 0, label: "Choose Type", desc: "What kind of template?" },
                  { step: 1, label: "Select Platform", desc: "Which integration?" },
                  { step: 2, label: "Define Purpose", desc: "What emails to send?" },
                  { step: 3, label: "Set Content", desc: "What to include?" },
                  { step: 4, label: "Name Template", desc: "Give it a name" }
                ].map((item) => (
                  <div key={item.step} className={`flex items-center gap-2 p-2 rounded ${
                    currentStep > item.step ? 'bg-green-50 dark:bg-green-900/20' :
                    currentStep === item.step ? 'bg-purple-50 dark:bg-purple-900/20' :
                    'bg-gray-50 dark:bg-gray-800'
                  }`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentStep > item.step ? 'bg-green-500 text-white' :
                      currentStep === item.step ? 'bg-purple-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {currentStep > item.step ? <Check className="h-3 w-3" /> : item.step + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {templateData.purpose && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Template Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {templateData.purpose && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Type</Label>
                      <p className="text-sm">{templateData.purpose}</p>
                    </div>
                  )}
                  {templateData.integration && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Platform</Label>
                      <div className="flex items-center gap-2">
                        {getIntegrationIcon(templateData.integration)}
                        <p className="text-sm">{templateData.integration}</p>
                      </div>
                    </div>
                  )}
                  {templateData.emailType && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Purpose</Label>
                      <p className="text-sm">{templateData.emailType}</p>
                    </div>
                  )}
                  {templateData.content && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Content</Label>
                      <p className="text-sm">{templateData.content}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}