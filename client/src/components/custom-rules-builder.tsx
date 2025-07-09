import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { X, Settings, Filter, Zap, Plus, Minus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CustomRule {
  name: string;
  description: string;
  conditions: string;
  actions: string;
  priority: number;
  isActive: boolean;
  triggerType: 'all' | 'any';
  category: string;
}

const ruleCategories = [
  'email_filtering',
  'auto_response',
  'organization',
  'security',
  'priority_management',
  'follow_up',
  'lead_scoring'
];

const priorityLabels = {
  1: 'Low',
  2: 'Medium', 
  3: 'High',
  4: 'Critical',
  5: 'Urgent'
};

export default function CustomRulesBuilder({ onClose, onSave }: { onClose: () => void; onSave?: () => void }) {
  const [rule, setRule] = useState<CustomRule>({
    name: '',
    description: '',
    conditions: '',
    actions: '',
    priority: 3,
    isActive: true,
    triggerType: 'all',
    category: 'email_filtering'
  });

  const queryClient = useQueryClient();

  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: CustomRule) => {
      return await apiRequest('POST', '/api/custom-rules', ruleData);
    },
    onSuccess: () => {
      toast({
        title: "Rule Created",
        description: "Your custom automation rule has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-rules'] });
      onSave?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create rule",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!rule.name || !rule.description || !rule.conditions || !rule.actions) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createRuleMutation.mutate(rule);
  };

  const conditionExamples = [
    'sender.email.contains("important@company.com")',
    'subject.includes("urgent") AND priority > 3',
    'body.word_count > 100 AND attachments.count > 0',
    'received_time.hour >= 9 AND received_time.hour <= 17',
    'thread.reply_count = 0 AND days_since_sent > 3'
  ];

  const actionExamples = [
    'add_label("High Priority")',
    'forward_to("manager@company.com")',
    'auto_reply("Thank you for your message...")',
    'create_task("Follow up with client", due: +2days)',
    'move_to_folder("VIP Clients")'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Create Custom Rule
              </CardTitle>
              <CardDescription>
                Build intelligent automation rules with custom conditions and actions
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Rule Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name *</Label>
                <Input
                  id="rule-name"
                  value={rule.name}
                  onChange={(e) => setRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="VIP Client Priority Handler"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={rule.category} onValueChange={(value) => setRule(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ruleCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">Description *</Label>
              <Textarea
                id="rule-description"
                value={rule.description}
                onChange={(e) => setRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Automatically prioritize and handle emails from VIP clients..."
                rows={2}
              />
            </div>
          </div>

          {/* Rule Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Rule Configuration
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select value={rule.triggerType} onValueChange={(value: 'all' | 'any') => setRule(prev => ({ ...prev, triggerType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All conditions must match</SelectItem>
                    <SelectItem value="any">Any condition can match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <div className="px-3 py-2 border rounded-md bg-background">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Low</span>
                    <span className="font-medium">{priorityLabels[rule.priority as keyof typeof priorityLabels]}</span>
                    <span>Urgent</span>
                  </div>
                  <Slider
                    value={[rule.priority]}
                    onValueChange={([value]) => setRule(prev => ({ ...prev, priority: value }))}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="active">Rule Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="active"
                    checked={rule.isActive}
                    onCheckedChange={(checked) => setRule(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="active" className="text-sm">
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Conditions *</h3>
              <div className="text-xs text-gray-500">
                Use logical expressions to define when this rule triggers
              </div>
            </div>
            
            <Textarea
              value={rule.conditions}
              onChange={(e) => setRule(prev => ({ ...prev, conditions: e.target.value }))}
              placeholder="sender.email.endsWith('@vipcompany.com') AND subject.contains('urgent')"
              rows={3}
              className="font-mono text-sm"
            />
            
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium mb-2">Example Conditions:</h4>
                <div className="space-y-1">
                  {conditionExamples.map((example, index) => (
                    <div key={index} className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border">
                      {example}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Actions *</h3>
              <div className="text-xs text-gray-500">
                Define what happens when conditions are met
              </div>
            </div>
            
            <Textarea
              value={rule.actions}
              onChange={(e) => setRule(prev => ({ ...prev, actions: e.target.value }))}
              placeholder="add_label('VIP'); set_priority(5); notify_user('VIP email received')"
              rows={3}
              className="font-mono text-sm"
            />
            
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium mb-2">Example Actions:</h4>
                <div className="space-y-1">
                  {actionExamples.map((example, index) => (
                    <div key={index} className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border">
                      {example}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createRuleMutation.isPending}>
              {createRuleMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Create Rule
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}