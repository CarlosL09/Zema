import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Clock, Star, TrendingUp, Zap, Filter, Search, Plus, Settings, Bot, Sparkles } from 'lucide-react';
import Navigation from '@/components/navigation';
import TemplateBuilder from '@/components/template-builder';
import CustomRulesBuilder from '@/components/custom-rules-builder';
import MyTemplates from '@/components/my-templates';
import AIAutomationAssistant from '@/components/ai-automation-assistant';

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'email_management' | 'lead_qualification' | 'customer_support' | 'meeting_scheduling' | 'follow_up' | 'content_analysis';
  icon: string;
  triggers: string[];
  actions: string[];
  conditions: Record<string, any>;
  settings: Record<string, any>;
  popularity: number;
  estimatedTimeSaved: string;
}

const categoryLabels = {
  email_management: 'Email Management',
  lead_qualification: 'Lead Qualification', 
  customer_support: 'Customer Support',
  meeting_scheduling: 'Meeting Scheduling',
  follow_up: 'Follow-up',
  content_analysis: 'Content Analysis'
};

export default function AutomationTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'name'>('popularity');
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showRulesBuilder, setShowRulesBuilder] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/automation-templates'],
    queryFn: async () => {
      const response = await fetch('/api/automation-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Fetch popular templates
  const { data: popularTemplates = [] } = useQuery({
    queryKey: ['/api/automation-templates', { popular: true }],
    queryFn: async () => {
      const response = await fetch('/api/automation-templates?popular=true&limit=5');
      if (!response.ok) throw new Error('Failed to fetch popular templates');
      return response.json();
    }
  });

  // Create automation from template
  const createAutomationMutation = useMutation({
    mutationFn: async ({ templateId, customSettings }: { templateId: string; customSettings?: any }) => {
      const response = await fetch(`/api/automation-templates/${templateId}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customSettings })
      });
      if (!response.ok) throw new Error('Failed to create automation');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Automation Created',
        description: 'Your automation rule has been successfully created and activated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/automation-rules'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create automation rule. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Filter and sort templates
  const filteredTemplates = templates
    .filter((template: AutomationTemplate) => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === 'all' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: AutomationTemplate, b: AutomationTemplate) => {
      if (sortBy === 'popularity') return b.popularity - a.popularity;
      return a.name.localeCompare(b.name);
    });

  // Group templates by category
  const templatesByCategory = templates.reduce((acc: Record<string, AutomationTemplate[]>, template: AutomationTemplate) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {});

  const handleCreateAutomation = (templateId: string) => {
    createAutomationMutation.mutate({ templateId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto py-8 pt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto py-8 pt-24 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Automation Templates
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Choose from {templates.length}+ pre-built automation templates to streamline your email workflow
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button 
            onClick={() => setShowAIAssistant(true)} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Bot className="w-4 h-4 mr-2" />
            <Sparkles className="w-3 h-3 mr-1" />
            AI Assistant
          </Button>
          <Button onClick={() => setShowTemplateBuilder(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
          <Button onClick={() => setShowRulesBuilder(true)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Popular Templates */}
      {popularTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Most Popular
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTemplates.map((template: AutomationTemplate) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onCreateAutomation={handleCreateAutomation}
                isCreating={createAutomationMutation.isPending}
                showPopularBadge
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search automation templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value: 'popularity' | 'name') => setSortBy(value)}>
          <SelectTrigger className="w-full md:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Popular</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates */}
      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3 mx-auto">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="my-templates">My Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: AutomationTemplate) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onCreateAutomation={handleCreateAutomation}
                isCreating={createAutomationMutation.isPending}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-8">
          {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTemplates.map((template: AutomationTemplate) => (
                  <TemplateCard 
                    key={template.id} 
                    template={template} 
                    onCreateAutomation={handleCreateAutomation}
                    isCreating={createAutomationMutation.isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="my-templates" className="space-y-6">
          <MyTemplates />
        </TabsContent>
      </Tabs>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 text-lg">
            No templates found matching your criteria
          </div>
        </div>
      )}

      {/* Template and Rules Builders */}
      {showTemplateBuilder && (
        <TemplateBuilder 
          onClose={() => setShowTemplateBuilder(false)} 
          onSave={() => {
            // Refresh templates list
            queryClient.invalidateQueries({ queryKey: ['/api/automation-templates'] });
          }}
        />
      )}
      {showRulesBuilder && (
        <CustomRulesBuilder 
          onClose={() => setShowRulesBuilder(false)} 
          onSave={() => {
            // Refresh any related data
            toast({
              title: "Success",
              description: "Your custom rule has been created and is now active."
            });
          }}
        />
      )}

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <AIAutomationAssistant onClose={() => setShowAIAssistant(false)} />
      )}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: AutomationTemplate;
  onCreateAutomation: (templateId: string) => void;
  isCreating: boolean;
  showPopularBadge?: boolean;
}

function TemplateCard({ template, onCreateAutomation, isCreating, showPopularBadge }: TemplateCardProps) {
  return (
    <Card className="relative group hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{template.icon}</div>
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {categoryLabels[template.category]}
              </Badge>
            </div>
          </div>
          {showPopularBadge && (
            <Badge variant="default" className="bg-yellow-500 text-yellow-900">
              <Star className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Saves {template.estimatedTimeSaved}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp className="h-4 w-4" />
            <span>{template.popularity}% success rate</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Triggers: {template.triggers.length}
          </div>
          <div className="flex flex-wrap gap-1">
            {template.triggers.slice(0, 3).map((trigger, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {trigger.replace('_', ' ')}
              </Badge>
            ))}
            {template.triggers.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.triggers.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Actions: {template.actions.length}
          </div>
          <div className="flex flex-wrap gap-1">
            {template.actions.slice(0, 3).map((action, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {action.replace('_', ' ')}
              </Badge>
            ))}
            {template.actions.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.actions.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <Button 
          onClick={() => onCreateAutomation(template.id)}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Creating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Use Template
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
