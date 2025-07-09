import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Trash2, 
  Edit, 
  Share, 
  Play, 
  Search, 
  Plus, 
  Settings,
  Calendar,
  TrendingUp,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import TemplateBuilder from '@/components/template-builder';
import CustomRulesBuilder from '@/components/custom-rules-builder';

interface CustomTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  triggers: any[];
  actions: any[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomRule {
  id: number;
  name: string;
  description: string;
  conditions: string;
  actions: string;
  priority: number;
  isActive: boolean;
  triggerType: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyTemplates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showRulesBuilder, setShowRulesBuilder] = useState(false);
  const queryClient = useQueryClient();

  // Fetch custom templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/custom-templates'],
    queryFn: async () => {
      return await apiRequest('GET', '/api/custom-templates');
    }
  });

  // Fetch custom rules
  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['/api/custom-rules'],
    queryFn: async () => {
      return await apiRequest('GET', '/api/custom-rules');
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return await apiRequest('DELETE', `/api/custom-templates/${templateId}`);
    },
    onSuccess: () => {
      toast({
        title: "Template Deleted",
        description: "Your custom template has been deleted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-templates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive"
      });
    }
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: number) => {
      return await apiRequest('DELETE', `/api/custom-rules/${ruleId}`);
    },
    onSuccess: () => {
      toast({
        title: "Rule Deleted",
        description: "Your custom rule has been deleted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-rules'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete rule",
        variant: "destructive"
      });
    }
  });

  // Toggle rule active status
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: number; isActive: boolean }) => {
      return await apiRequest('PUT', `/api/custom-rules/${ruleId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-rules'] });
    }
  });

  // Toggle template visibility
  const toggleTemplateMutation = useMutation({
    mutationFn: async ({ templateId, isPublic }: { templateId: number; isPublic: boolean }) => {
      return await apiRequest('PUT', `/api/custom-templates/${templateId}`, { isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-templates'] });
    }
  });

  const filteredTemplates = templates.filter((template: CustomTemplate) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRules = rules.filter((rule: CustomRule) =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTemplate = (templateId: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleDeleteRule = (ruleId: number) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Custom Templates & Rules
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your custom automation templates and rules
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTemplateBuilder(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
          <Button onClick={() => setShowRulesBuilder(true)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search templates and rules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">
            Custom Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="rules">
            Custom Rules ({rules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 text-lg">
                {searchQuery ? 'No templates match your search' : 'No custom templates yet'}
              </div>
              {!searchQuery && (
                <Button 
                  onClick={() => setShowTemplateBuilder(true)} 
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template: CustomTemplate) => (
                <Card key={template.id} className="relative group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{template.icon}</div>
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {template.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTemplateMutation.mutate({
                            templateId: template.id,
                            isPublic: !template.isPublic
                          })}
                        >
                          {template.isPublic ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{template.usageCount} uses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Triggers: {template.triggers.length} | Actions: {template.actions.length}
                      </div>
                      <div className="flex items-center gap-2">
                        {template.isPublic && (
                          <Badge variant="outline" className="text-xs">
                            <Share className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        Use
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          {rulesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 text-lg">
                {searchQuery ? 'No rules match your search' : 'No custom rules yet'}
              </div>
              {!searchQuery && (
                <Button 
                  onClick={() => setShowRulesBuilder(true)} 
                  className="mt-4"
                  variant="outline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Create Your First Rule
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRules.map((rule: CustomRule) => (
                <Card key={rule.id} className="relative group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{rule.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">
                            {rule.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <Badge variant={rule.isActive ? "default" : "outline"}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            Priority: {rule.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {rule.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="font-medium">Conditions:</div>
                      <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 line-clamp-2">
                        {rule.conditions}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(rule.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Trigger: {rule.triggerType}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant={rule.isActive ? "outline" : "default"} 
                        size="sm" 
                        className="flex-1"
                        onClick={() => toggleRuleMutation.mutate({
                          ruleId: rule.id,
                          isActive: !rule.isActive
                        })}
                      >
                        {rule.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Builders */}
      {showTemplateBuilder && (
        <TemplateBuilder 
          onClose={() => setShowTemplateBuilder(false)} 
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/custom-templates'] });
          }}
        />
      )}
      {showRulesBuilder && (
        <CustomRulesBuilder 
          onClose={() => setShowRulesBuilder(false)} 
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/custom-rules'] });
          }}
        />
      )}
    </div>
  );
}