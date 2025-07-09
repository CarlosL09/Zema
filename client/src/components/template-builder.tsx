import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Plus, X, Settings, Zap, Mail, Calendar, Filter, Send, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TriggerCondition {
  type: 'email_received' | 'email_sent' | 'keyword_match' | 'sender_match' | 'time_schedule';
  value: string;
  operator?: 'contains' | 'equals' | 'starts_with' | 'ends_with';
}

interface Action {
  type: 'auto_reply' | 'forward_email' | 'add_label' | 'create_task' | 'send_notification' | 'archive';
  value: string;
  parameters?: Record<string, any>;
}

interface TemplateBuilder {
  name: string;
  description: string;
  category: string;
  icon: string;
  triggers: TriggerCondition[];
  actions: Action[];
  isPublic: boolean;
}

const triggerTypes = [
  { value: 'email_received', label: 'Email Received', icon: Mail },
  { value: 'email_sent', label: 'Email Sent', icon: Send },
  { value: 'keyword_match', label: 'Keyword Match', icon: Filter },
  { value: 'sender_match', label: 'Sender Match', icon: Mail },
  { value: 'time_schedule', label: 'Time Schedule', icon: Calendar }
];

const actionTypes = [
  { value: 'auto_reply', label: 'Auto Reply', icon: Mail },
  { value: 'forward_email', label: 'Forward Email', icon: ArrowRight },
  { value: 'add_label', label: 'Add Label', icon: Badge },
  { value: 'create_task', label: 'Create Task', icon: Plus },
  { value: 'send_notification', label: 'Send Notification', icon: Send },
  { value: 'archive', label: 'Archive Email', icon: X }
];

const categories = [
  'email_management',
  'lead_qualification', 
  'customer_support',
  'meeting_scheduling',
  'follow_up',
  'content_analysis'
];

const iconOptions = ['⚡', '📧', '🤖', '📋', '🔔', '📅', '🎯', '📊', '🚀', '💼'];

export default function TemplateBuilder({ onClose, onSave }: { onClose: () => void; onSave?: () => void }) {
  const [template, setTemplate] = useState<TemplateBuilder>({
    name: '',
    description: '',
    category: 'email_management',
    icon: '⚡',
    triggers: [{ type: 'email_received', value: '', operator: 'contains' }],
    actions: [{ type: 'auto_reply', value: '' }],
    isPublic: false
  });

  const queryClient = useQueryClient();

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: TemplateBuilder) => {
      return await apiRequest('POST', '/api/custom-templates', templateData);
    },
    onSuccess: () => {
      toast({
        title: "Template Created",
        description: "Your custom automation template has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-templates'] });
      onSave?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive"
      });
    }
  });

  const addTrigger = () => {
    setTemplate(prev => ({
      ...prev,
      triggers: [...prev.triggers, { type: 'email_received', value: '', operator: 'contains' }]
    }));
  };

  const removeTrigger = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      triggers: prev.triggers.filter((_, i) => i !== index)
    }));
  };

  const updateTrigger = (index: number, field: keyof TriggerCondition, value: string) => {
    setTemplate(prev => ({
      ...prev,
      triggers: prev.triggers.map((trigger, i) => 
        i === index ? { ...trigger, [field]: value } : trigger
      )
    }));
  };

  const addAction = () => {
    setTemplate(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'auto_reply', value: '' }]
    }));
  };

  const removeAction = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, field: keyof Action, value: string) => {
    setTemplate(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const handleSave = () => {
    if (!template.name || !template.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in template name and description",
        variant: "destructive"
      });
      return;
    }

    if (template.triggers.some(t => !t.value) || template.actions.some(a => !a.value)) {
      toast({
        title: "Validation Error", 
        description: "Please fill in all trigger and action values",
        variant: "destructive"
      });
      return;
    }

    createTemplateMutation.mutate(template);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Create Custom Template
              </CardTitle>
              <CardDescription>
                Build your own automation template with custom triggers and actions
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={template.name}
                    onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Template"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={template.category} onValueChange={(value) => setTemplate(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={template.description}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this template does..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map(icon => (
                      <Button
                        key={icon}
                        variant={template.icon === icon ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTemplate(prev => ({ ...prev, icon }))}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="public">Share with Community</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={template.isPublic}
                      onCheckedChange={(checked) => setTemplate(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="public" className="text-sm text-gray-600">
                      Make this template available to all users
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="triggers" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">When should this template trigger?</h3>
                <Button onClick={addTrigger} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trigger
                </Button>
              </div>

              {template.triggers.map((trigger, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-3">
                        <Label>Trigger Type</Label>
                        <Select value={trigger.type} onValueChange={(value) => updateTrigger(index, 'type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {triggerTypes.map(type => {
                              const Icon = type.icon;
                              return (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-3">
                        <Label>Operator</Label>
                        <Select value={trigger.operator} onValueChange={(value) => updateTrigger(index, 'operator', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="starts_with">Starts With</SelectItem>
                            <SelectItem value="ends_with">Ends With</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-5">
                        <Label>Value</Label>
                        <Input
                          value={trigger.value}
                          onChange={(e) => updateTrigger(index, 'value', e.target.value)}
                          placeholder="Enter trigger value..."
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeTrigger(index)}
                          disabled={template.triggers.length === 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">What actions should be performed?</h3>
                <Button onClick={addAction} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Action
                </Button>
              </div>

              {template.actions.map((action, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-4">
                        <Label>Action Type</Label>
                        <Select value={action.type} onValueChange={(value) => updateAction(index, 'type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map(type => {
                              const Icon = type.icon;
                              return (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-7">
                        <Label>Value</Label>
                        <Input
                          value={action.value}
                          onChange={(e) => updateAction(index, 'value', e.target.value)}
                          placeholder="Enter action value..."
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeAction(index)}
                          disabled={template.actions.length === 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createTemplateMutation.isPending}>
              {createTemplateMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Create Template
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}