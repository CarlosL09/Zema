import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Zap, 
  Settings, 
  Lightbulb,
  CheckCircle,
  MessageCircle,
  Wand2,
  ArrowRight,
  Star
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: any[];
}

interface AutomationSuggestion {
  name: string;
  description: string;
  category: string;
  icon: string;
  triggers: any[];
  actions: any[];
  confidence: number;
  reasoning: string;
}

interface RuleSuggestion {
  name: string;
  description: string;
  conditions: string;
  actions: string;
  priority: number;
  category: string;
  triggerType: string;
  confidence: number;
  reasoning: string;
}

export default function AIAutomationAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI automation assistant. I can help you create smart email automations and rules. What would you like to automate today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState('planning');
  const [context, setContext] = useState({});

  const queryClient = useQueryClient();

  // Get automation suggestions
  const automationSuggestionMutation = useMutation({
    mutationFn: async (userRequest: string) => {
      const response = await apiRequest('POST', '/api/ai/suggest-automation', { userRequest });
      return response.json();
    },
    onSuccess: (data: any) => {
      const suggestions = data.suggestions || [];
      addMessage('assistant', 
        `I found ${suggestions.length} automation suggestions for you:`,
        suggestions
      );
    },
    onError: (error: any) => {
      addMessage('assistant', `Sorry, I couldn't generate suggestions: ${error.message}`);
    }
  });

  // Get rule suggestions  
  const ruleSuggestionMutation = useMutation({
    mutationFn: async (userRequest: string) => {
      const response = await apiRequest('POST', '/api/ai/suggest-rule', { userRequest });
      return response.json();
    },
    onSuccess: (data: any) => {
      const suggestions = data.suggestions || [];
      addMessage('assistant',
        `I found ${suggestions.length} rule suggestions for you:`,
        suggestions
      );
    },
    onError: (error: any) => {
      addMessage('assistant', `Sorry, I couldn't generate rule suggestions: ${error.message}`);
    }
  });

  // Get step-by-step guidance
  const guidanceMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      const response = await apiRequest('POST', '/api/ai/guidance', { 
        userQuery, 
        currentStep, 
        context 
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      addMessage('assistant', data.guidance, data.suggestions);
      if (data.nextStep) setCurrentStep(data.nextStep);
      if (data.context) setContext(data.context);
    },
    onError: (error: any) => {
      addMessage('assistant', `Sorry, I couldn't provide guidance: ${error.message}`);
    }
  });

  // Create automation from AI suggestion
  const createFromSuggestionMutation = useMutation({
    mutationFn: async ({ suggestion, type }: { suggestion: any; type: string }) => {
      const response = await apiRequest('POST', '/api/ai/create-from-suggestion', { suggestion, type });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-rules'] });
      addMessage('assistant', `✅ ${data.message}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      addMessage('assistant', `❌ Failed to create automation: ${error.message}`);
    }
  });

  const addMessage = (type: 'user' | 'assistant', content: string, suggestions?: any[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      suggestions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    addMessage('user', input);
    setIsTyping(true);

    // Determine intent and route to appropriate AI service
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('rule') || lowerInput.includes('condition') || lowerInput.includes('priority')) {
      ruleSuggestionMutation.mutate(input);
    } else if (lowerInput.includes('guide') || lowerInput.includes('help') || lowerInput.includes('how')) {
      guidanceMutation.mutate(input);
    } else {
      automationSuggestionMutation.mutate(input);
    }

    setInput('');
    setIsTyping(false);
  };

  const handleUseSuggestion = (suggestion: AutomationSuggestion | RuleSuggestion, type: 'template' | 'rule') => {
    createFromSuggestionMutation.mutate({ suggestion, type });
  };

  const quickPrompts = [
    "Auto-reply to customer support emails",
    "Prioritize emails from VIP clients", 
    "Forward urgent emails to my manager",
    "Create tasks from meeting requests",
    "Archive promotional emails automatically",
    "Set up follow-up reminders"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Automation Assistant
                </CardTitle>
                <CardDescription>
                  Get personalized automation suggestions powered by AI
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>

        <div className="flex-1 flex flex-col">
          {/* Chat Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <div className="text-sm">{message.content}</div>
                    
                    {/* Suggestions Display */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Card key={index} className="p-3 bg-white dark:bg-gray-900">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{suggestion.icon || '⚡'}</span>
                                <div>
                                  <div className="font-medium text-sm">{suggestion.name}</div>
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {Math.round((suggestion.confidence || 0.8) * 100)}% match
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUseSuggestion(suggestion, suggestion.conditions ? 'rule' : 'template')}
                                  disabled={createFromSuggestionMutation.isPending}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Use This
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {suggestion.description}
                            </div>
                            {suggestion.reasoning && (
                              <div className="text-xs text-blue-600 dark:text-blue-400">
                                💡 {suggestion.reasoning}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-b bg-gray-50 dark:bg-gray-900">
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Quick Start Ideas:
              </div>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(prompt)}
                    className="text-xs"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe what you want to automate..."
                className="flex-1 min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || automationSuggestionMutation.isPending || ruleSuggestionMutation.isPending || guidanceMutation.isPending}
                className="px-6"
              >
                {automationSuggestionMutation.isPending || ruleSuggestionMutation.isPending || guidanceMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>Powered by AI ✨</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}