import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, ArrowRight, Check, X, MessageCircle, Sparkles, Zap, Settings } from "lucide-react";
import { SiGmail, SiSlack, SiTrello, SiNotion, SiZapier, SiGooglecalendar, SiDropbox, SiAsana } from "react-icons/si";

interface AIGuidedAutomationBuilderProps {
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
    default: return <Settings className="h-4 w-4" />;
  }
};

export default function AIGuidedAutomationBuilder({ onClose, onComplete }: AIGuidedAutomationBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [conversation, setConversation] = useState<AIConversation[]>([
    {
      type: 'ai',
      message: "Hi! I'm your AI automation assistant. I'll help you create a powerful email automation that connects with your favorite apps. What would you like to automate?",
      options: [
        "Create tasks when I receive project emails",
        "Send Slack notifications for urgent emails",
        "Save email attachments to cloud storage",
        "Schedule meetings from email requests",
        "Track customer emails in my CRM"
      ]
    }
  ]);
  const [automationData, setAutomationData] = useState({
    purpose: '',
    integration: '',
    trigger: '',
    action: '',
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
    let nextAutomationData = { ...automationData };

    switch (currentStep) {
      case 0: // Purpose selection
        nextAutomationData.purpose = option;
        if (option.includes("tasks")) {
          aiResponse = {
            type: 'ai',
            message: "Great! Let's create tasks from your emails. Which app would you like me to create tasks in?",
            integrationOptions: ["Trello", "Asana", "Notion", "ClickUp", "Monday.com"]
          };
        } else if (option.includes("Slack")) {
          aiResponse = {
            type: 'ai',
            message: "Perfect! I'll help you send Slack notifications. Which Slack workspace should I connect to?",
            integrationOptions: ["Slack", "Discord", "Microsoft Teams"]
          };
        } else if (option.includes("attachments")) {
          aiResponse = {
            type: 'ai',
            message: "Excellent! Let's save your attachments automatically. Where should I store them?",
            integrationOptions: ["Google Drive", "Dropbox", "OneDrive", "Box"]
          };
        } else if (option.includes("meetings")) {
          aiResponse = {
            type: 'ai',
            message: "Smart choice! I'll help schedule meetings. Which calendar app do you use?",
            integrationOptions: ["Google Calendar", "Outlook Calendar", "Calendly", "Zoom"]
          };
        } else {
          aiResponse = {
            type: 'ai',
            message: "Perfect! Let's track customer emails. Which CRM system do you use?",
            integrationOptions: ["Salesforce", "HubSpot", "Pipedrive", "Airtable"]
          };
        }
        break;

      case 1: // Integration selection
        nextAutomationData.integration = option;
        if (automationData.purpose.includes("tasks")) {
          aiResponse = {
            type: 'ai',
            message: `Great! Now, when should I create ${option} tasks? What type of emails should trigger this?`,
            options: [
              "Emails from specific clients or projects",
              "Emails with keywords like 'task', 'todo', or 'action'",
              "Emails marked as important or urgent",
              "All emails from work contacts"
            ]
          };
        } else if (automationData.purpose.includes("Slack")) {
          aiResponse = {
            type: 'ai',
            message: `Perfect! When should I send ${option} notifications? What makes an email notification-worthy?`,
            options: [
              "Emails marked as urgent or high priority",
              "Emails from VIP contacts or bosses",
              "Emails containing specific keywords",
              "Any email that arrives outside business hours"
            ]
          };
        } else if (automationData.purpose.includes("attachments")) {
          aiResponse = {
            type: 'ai',
            message: `Excellent! What type of attachments should I save to ${option}?`,
            options: [
              "All PDF documents and contracts",
              "Images and media files",
              "Spreadsheets and data files",
              "Any attachment from specific senders"
            ]
          };
        } else if (automationData.purpose.includes("meetings")) {
          aiResponse = {
            type: 'ai',
            message: `Smart! When should I schedule meetings in ${option}? What indicates a meeting request?`,
            options: [
              "Emails containing 'meeting', 'call', or 'schedule'",
              "Emails asking for availability",
              "Emails from clients requesting consultations",
              "Any email mentioning specific time slots"
            ]
          };
        } else {
          aiResponse = {
            type: 'ai',
            message: `Perfect! What customer emails should I track in ${option}?`,
            options: [
              "All emails from potential leads",
              "Support requests and inquiries",
              "Follow-up emails from prospects",
              "Emails from existing customers"
            ]
          };
        }
        break;

      case 2: // Trigger details
        nextAutomationData.trigger = option;
        if (automationData.purpose.includes("tasks")) {
          aiResponse = {
            type: 'ai',
            message: `Excellent! What should happen when I create a ${automationData.integration} task?`,
            options: [
              "Create task with email subject as title",
              "Add email content as task description",
              "Set due date based on email urgency",
              "Assign to specific team member",
              "Add project labels automatically"
            ]
          };
        } else if (automationData.purpose.includes("Slack")) {
          aiResponse = {
            type: 'ai',
            message: `Great! What should the ${automationData.integration} notification include?`,
            options: [
              "Email sender and subject line",
              "First few lines of email content",
              "Direct link to the email",
              "Urgency level and priority",
              "Suggested response options"
            ]
          };
        } else if (automationData.purpose.includes("attachments")) {
          aiResponse = {
            type: 'ai',
            message: `Perfect! How should I organize files in ${automationData.integration}?`,
            options: [
              "Create folders by sender name",
              "Organize by date received",
              "Sort by file type",
              "Create project-specific folders",
              "Keep all in one main folder"
            ]
          };
        } else if (automationData.purpose.includes("meetings")) {
          aiResponse = {
            type: 'ai',
            message: `Smart! How should I handle meeting scheduling in ${automationData.integration}?`,
            options: [
              "Create calendar event and send confirmation",
              "Check availability and suggest times",
              "Block time automatically",
              "Send meeting link if virtual",
              "Add agenda from email content"
            ]
          };
        } else {
          aiResponse = {
            type: 'ai',
            message: `Excellent! What information should I add to ${automationData.integration}?`,
            options: [
              "Create new contact with email details",
              "Log email as activity/interaction",
              "Update existing contact records",
              "Create follow-up tasks",
              "Track email engagement"
            ]
          };
        }
        break;

      case 3: // Action details
        nextAutomationData.action = option;
        aiResponse = {
          type: 'ai',
          message: "Almost done! What would you like to name this automation?",
          options: []
        };
        break;

      default:
        aiResponse = {
          type: 'ai',
          message: "Perfect! Let me create your automation now...",
          options: []
        };
    }

    setAutomationData(nextAutomationData);
    setConversation([...newConversation, aiResponse]);
    setCurrentStep(currentStep + 1);
    setIsProcessing(false);
  };

  const handleCustomInput = (input: string) => {
    if (currentStep === 4) {
      // Name input
      const finalAutomationData = { ...automationData, name: input };
      setAutomationData(finalAutomationData);
      
      // Create the automation
      createAutomation(finalAutomationData);
    }
  };

  const createAutomation = async (finalAutomationData: any) => {
    setIsProcessing(true);
    
    const newConversation = [...conversation, 
      { type: 'user' as const, message: finalAutomationData.name },
      { type: 'ai' as const, message: "Creating your email automation... This will just take a moment!" }
    ];
    setConversation(newConversation);

    // Simulate automation creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add success message
    setConversation([...newConversation, {
      type: 'ai',
      message: `🎉 Success! I've created your "${finalAutomationData.name}" automation. It's now active and will start working with new emails that connect to ${finalAutomationData.integration}!`
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
            <Bot className="h-6 w-6 text-cyan-600" />
            AI-Guided Automation Builder
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              {conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-white dark:bg-gray-800 border shadow-sm'
                  }`}>
                    {msg.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-cyan-600" />
                        <span className="font-medium text-cyan-600">ZEMA AI</span>
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
                      <Bot className="h-4 w-4 text-cyan-600" />
                      <span className="font-medium text-cyan-600">ZEMA AI</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="animate-spin h-4 w-4 border-2 border-cyan-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="mt-4 space-y-3">
              {isWaitingForName ? (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter a name for your automation (e.g., 'Project Task Creator')"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomInput((e.target as HTMLInputElement).value);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => {
                      const input = document.querySelector('input') as HTMLInputElement;
                      handleCustomInput(input.value);
                    }}
                    disabled={isProcessing}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  {currentMessage?.options && currentMessage.options.length > 0 && (
                    <div className="grid grid-cols-1 gap-2">
                      {currentMessage.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="text-left justify-start h-auto p-3 hover:border-cyan-500"
                          onClick={() => handleOptionSelect(option)}
                          disabled={isProcessing}
                        >
                          <span className="text-sm">{option}</span>
                          <ArrowRight className="h-4 w-4 ml-auto" />
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {currentMessage?.integrationOptions && currentMessage.integrationOptions.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {currentMessage.integrationOptions.map((integration, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="text-left justify-start h-auto p-3 hover:border-cyan-500"
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
                </>
              )}
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
                  { step: 0, label: "Choose Purpose", desc: "What to automate?" },
                  { step: 1, label: "Select App", desc: "Which integration?" },
                  { step: 2, label: "Set Trigger", desc: "When to activate?" },
                  { step: 3, label: "Define Action", desc: "What should happen?" },
                  { step: 4, label: "Name Automation", desc: "Give it a name" }
                ].map((item) => (
                  <div key={item.step} className={`flex items-center gap-2 p-2 rounded ${
                    currentStep > item.step ? 'bg-green-50 dark:bg-green-900/20' :
                    currentStep === item.step ? 'bg-cyan-50 dark:bg-cyan-900/20' :
                    'bg-gray-50 dark:bg-gray-800'
                  }`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentStep > item.step ? 'bg-green-500 text-white' :
                      currentStep === item.step ? 'bg-cyan-500 text-white' :
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

            {automationData.purpose && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Automation Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {automationData.purpose && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Purpose</Label>
                      <p className="text-sm">{automationData.purpose}</p>
                    </div>
                  )}
                  {automationData.integration && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Integration</Label>
                      <div className="flex items-center gap-2">
                        {getIntegrationIcon(automationData.integration)}
                        <p className="text-sm">{automationData.integration}</p>
                      </div>
                    </div>
                  )}
                  {automationData.trigger && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Trigger</Label>
                      <p className="text-sm">{automationData.trigger}</p>
                    </div>
                  )}
                  {automationData.action && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Action</Label>
                      <p className="text-sm">{automationData.action}</p>
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