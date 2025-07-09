import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, ArrowRight, Check, X, MessageCircle, Sparkles, Zap } from "lucide-react";

interface AIGuidedRuleBuilderProps {
  onClose: () => void;
  onComplete: () => void;
}

interface AIConversation {
  type: 'ai' | 'user';
  message: string;
  options?: string[];
}

export default function AIGuidedRuleBuilder({ onClose, onComplete }: AIGuidedRuleBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [conversation, setConversation] = useState<AIConversation[]>([
    {
      type: 'ai',
      message: "Hi! I'm your AI assistant. I'll help you create an email rule step by step. What would you like your email rule to do?",
      options: [
        "Organize newsletters and promotional emails",
        "Detect and prioritize urgent emails",
        "Auto-forward emails from specific people",
        "Archive old emails automatically",
        "Create reminders for follow-ups"
      ]
    }
  ]);
  const [ruleData, setRuleData] = useState({
    purpose: '',
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
    let nextRuleData = { ...ruleData };

    switch (currentStep) {
      case 0: // Purpose selection - be flexible and responsive
        nextRuleData.purpose = option;
        aiResponse = {
          type: 'ai',
          message: `Great choice! For "${option}", I need to know how to identify these emails. What criteria should I use to detect them?`,
          options: [
            "Specific sender email addresses",
            "Keywords in subject line or content", 
            "Sender domain (like @company.com)",
            "Email size or attachment criteria",
            "Time-based criteria (weekends, after hours)"
          ]
        };
        break;

      case 1: // Trigger details
        nextRuleData.trigger = option;
        if (ruleData.purpose.includes("newsletters")) {
          aiResponse = {
            type: 'ai',
            message: "Excellent! Now what should happen when I find these newsletter emails?",
            options: [
              "Move them to a 'Newsletters' folder",
              "Mark as read and archive them",
              "Add a 'Newsletter' label and keep in inbox",
              "Forward to a different email address"
            ]
          };
        } else if (ruleData.purpose.includes("urgent")) {
          aiResponse = {
            type: 'ai',
            message: "Got it! How should I handle urgent emails when I find them?",
            options: [
              "Mark with a red star and move to top",
              "Send a push notification to my phone",
              "Forward to my manager",
              "Add 'URGENT' label and flag for follow-up"
            ]
          };
        } else {
          aiResponse = {
            type: 'ai',
            message: "Perfect! What should happen with these emails?",
            options: [
              "Forward immediately to another address",
              "Copy to a special folder and notify me",
              "Mark as VIP and add special label",
              "Create a task reminder for follow-up"
            ]
          };
        }
        break;

      case 2: // Action details
        nextRuleData.action = option;
        aiResponse = {
          type: 'ai',
          message: "Almost done! What would you like to name this email rule?",
          options: []
        };
        break;

      default:
        aiResponse = {
          type: 'ai',
          message: "Perfect! Let me create your email rule now...",
          options: []
        };
    }

    setRuleData(nextRuleData);
    setConversation([...newConversation, aiResponse]);
    setCurrentStep(currentStep + 1);
    setIsProcessing(false);
  };

  const handleCustomInput = (input: string) => {
    if (currentStep === 3) {
      // Name input
      const finalRuleData = { ...ruleData, name: input };
      setRuleData(finalRuleData);
      
      // Create the rule
      createRule(finalRuleData);
    }
  };

  const createRule = async (finalRuleData: any) => {
    setIsProcessing(true);
    
    const newConversation = [...conversation, 
      { type: 'user' as const, message: finalRuleData.name },
      { type: 'ai' as const, message: "Creating your email rule... This will just take a moment!" }
    ];
    setConversation(newConversation);

    // Simulate rule creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add success message
    setConversation([...newConversation, {
      type: 'ai',
      message: `🎉 Success! I've created your "${finalRuleData.name}" rule. It's now active and will start working on new emails!`
    }]);

    setIsProcessing(false);
    
    // Wait a moment then complete
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const currentMessage = conversation[conversation.length - 1];
  const isWaitingForName = currentStep === 3 && currentMessage?.options?.length === 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bot className="h-6 w-6 text-cyan-600" />
            AI-Guided Rule Builder
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
            <div className="mt-4 space-y-3 bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
              {/* Show options only when available */}
              {!isWaitingForName && currentMessage?.options && currentMessage.options.length > 0 && (
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
              
              {/* Always show text input */}
              <div className="flex gap-2">
                <Input 
                  placeholder={isWaitingForName ? "Enter a name for your rule (e.g., 'Newsletter Organizer')" : "Or type your own response..."}
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
                  { step: 0, label: "Choose Purpose", desc: "What should the rule do?" },
                  { step: 1, label: "Set Trigger", desc: "When should it activate?" },
                  { step: 2, label: "Define Action", desc: "What should happen?" },
                  { step: 3, label: "Name Rule", desc: "Give it a memorable name" }
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

            {ruleData.purpose && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Rule Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ruleData.purpose && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Purpose</Label>
                      <p className="text-sm">{ruleData.purpose}</p>
                    </div>
                  )}
                  {ruleData.trigger && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Trigger</Label>
                      <p className="text-sm">{ruleData.trigger}</p>
                    </div>
                  )}
                  {ruleData.action && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Action</Label>
                      <p className="text-sm">{ruleData.action}</p>
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