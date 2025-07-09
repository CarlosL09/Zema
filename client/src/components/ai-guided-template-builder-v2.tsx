import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, ArrowRight, Check, X, Sparkles, Zap } from "lucide-react";

interface AIGuidedTemplateBuilderProps {
  onClose: () => void;
  onComplete: () => void;
}

interface AIConversation {
  type: 'ai' | 'user';
  message: string;
  suggestions?: string[];
}

export default function AIGuidedTemplateBuilderV2({ onClose, onComplete }: AIGuidedTemplateBuilderProps) {
  const [conversation, setConversation] = useState<AIConversation[]>([
    {
      type: 'ai',
      message: "Hi! I'm your AI template assistant. I'll help you create a reusable email template. What type of email template do you want to create? Describe it in your own words.",
      suggestions: [
        "Customer support response templates",
        "Sales follow-up email templates", 
        "Meeting invitation and scheduling templates",
        "Thank you and follow-up templates",
        "Newsletter and announcement templates"
      ]
    }
  ]);
  
  const [templateData, setTemplateData] = useState({
    purpose: '',
    platform: '',
    content: '',
    name: ''
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateAIResponse = (userInput: string, step: number): AIConversation => {
    switch (step) {
      case 0: // Purpose defined, ask about platform
        return {
          type: 'ai',
          message: `Perfect! You want to create ${userInput.toLowerCase()}. Which email platform or system will you use this template with?`,
          suggestions: [
            "Gmail - Google's email service",
            "Outlook - Microsoft email platform",
            "Salesforce - CRM email system",
            "HubSpot - Marketing and sales platform",
            "Any email platform (generic template)"
          ]
        };
      
      case 1: // Platform defined, ask about content
        return {
          type: 'ai',
          message: `Great choice! For ${userInput}, what key elements should be included in this ${templateData.purpose} template?`,
          suggestions: [
            "Personalized greeting with recipient name",
            "Professional signature and contact info",
            "Call-to-action buttons or links",
            "Company branding and logo placeholders",
            "Variable fields for customization"
          ]
        };
      
      case 2: // Content defined, ask for name
        return {
          type: 'ai',
          message: `Excellent! I'll create a template that includes ${userInput.toLowerCase()} for your ${templateData.purpose}. What would you like to name this template?`,
          suggestions: []
        };
      
      default:
        return {
          type: 'ai',
          message: "Creating your email template now...",
          suggestions: []
        };
    }
  };

  const handleUserInput = async (input: string) => {
    if (!input.trim()) return;
    
    // Add user message to conversation
    const newConversation = [...conversation, { type: 'user' as const, message: input }];
    setConversation(newConversation);
    setIsProcessing(true);

    // Update template data
    const updatedTemplateData = { ...templateData };
    switch (currentStep) {
      case 0:
        updatedTemplateData.purpose = input;
        break;
      case 1:
        updatedTemplateData.platform = input;
        break;
      case 2:
        updatedTemplateData.content = input;
        break;
      case 3:
        updatedTemplateData.name = input;
        break;
    }
    setTemplateData(updatedTemplateData);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (currentStep === 3) {
      // Final step - create template
      const finalConversation = [...newConversation, {
        type: 'ai' as const,
        message: `🎉 Perfect! I've created your email template "${input}". This template is for ${updatedTemplateData.purpose} with ${updatedTemplateData.platform}, including ${updatedTemplateData.content.toLowerCase()}. Your template is ready to use and share with your team!`
      }];
      setConversation(finalConversation);
      setIsProcessing(false);
      
      // Complete after a short delay
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      // Generate next AI response
      const aiResponse = generateAIResponse(input, currentStep);
      setConversation([...newConversation, aiResponse]);
      setCurrentStep(currentStep + 1);
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleUserInput(suggestion);
  };

  const currentMessage = conversation[conversation.length - 1];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bot className="h-6 w-6 text-purple-600" />
            AI-Guided Template Builder
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-0 max-h-[400px]">
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

            {/* Input Area - Fixed at bottom */}
            <div className="mt-4 space-y-3 bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm flex-shrink-0">
              {/* Suggestions */}
              {currentMessage?.suggestions && currentMessage.suggestions.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                  {currentMessage.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start h-auto p-3 hover:border-purple-500"
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isProcessing}
                    >
                      <span className="text-sm">{suggestion}</span>
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  ))}
                </div>
              )}
              
              {/* Text Input */}
              <div className="flex gap-2">
                <Input 
                  placeholder="Type your response here..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        handleUserInput(input.value.trim());
                        input.value = '';
                      }
                    }
                  }}
                  className="flex-1"
                  disabled={isProcessing}
                />
                <Button 
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Type your response here..."]') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      handleUserInput(input.value.trim());
                      input.value = '';
                    }
                  }}
                  disabled={isProcessing}
                  variant="outline"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Sidebar */}
          <div className="space-y-4 overflow-y-auto max-h-[600px]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { step: 0, label: "Define Type", desc: "What kind of template?" },
                  { step: 1, label: "Choose Platform", desc: "Which email system?" },
                  { step: 2, label: "Set Content", desc: "What to include?" },
                  { step: 3, label: "Name Template", desc: "Give it a name" }
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
                      <Label className="text-xs font-medium text-gray-600">Purpose</Label>
                      <p className="text-sm">{templateData.purpose}</p>
                    </div>
                  )}
                  {templateData.platform && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Platform</Label>
                      <p className="text-sm">{templateData.platform}</p>
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