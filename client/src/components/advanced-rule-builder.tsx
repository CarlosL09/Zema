import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Plus, X, Zap, Filter, Mail, Calendar, AlertCircle, Check } from "lucide-react";

interface AdvancedRuleBuilderProps {
  onClose: () => void;
  onComplete: () => void;
}

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  connector?: 'AND' | 'OR';
}

interface RuleAction {
  id: string;
  type: string;
  parameters: Record<string, string>;
}

export default function AdvancedRuleBuilder({ onClose, onComplete }: AdvancedRuleBuilderProps) {
  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [conditions, setConditions] = useState<RuleCondition[]>([{
    id: '1',
    field: '',
    operator: '',
    value: '',
  }]);
  const [actions, setActions] = useState<RuleAction[]>([{
    id: '1',
    type: '',
    parameters: {}
  }]);
  const [priority, setPriority] = useState("medium");
  const [isActive, setIsActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const conditionFields = [
    { value: 'sender_email', label: 'Sender Email' },
    { value: 'sender_name', label: 'Sender Name' },
    { value: 'subject', label: 'Subject Line' },
    { value: 'body', label: 'Email Body' },
    { value: 'attachment_count', label: 'Number of Attachments' },
    { value: 'attachment_type', label: 'Attachment Type' },
    { value: 'received_time', label: 'Received Time' },
    { value: 'is_reply', label: 'Is Reply' },
    { value: 'thread_length', label: 'Thread Length' },
    { value: 'has_links', label: 'Contains Links' },
    { value: 'word_count', label: 'Word Count' },
    { value: 'importance', label: 'Importance Level' }
  ];

  const operators = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'not_contains', label: 'Does not contain' },
      { value: 'equals', label: 'Equals' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' },
      { value: 'regex', label: 'Matches regex' }
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
      { value: 'greater_equal', label: 'Greater than or equal' },
      { value: 'less_equal', label: 'Less than or equal' }
    ],
    boolean: [
      { value: 'is_true', label: 'Is true' },
      { value: 'is_false', label: 'Is false' }
    ]
  };

  const actionTypes = [
    { value: 'move_to_folder', label: 'Move to Folder', icon: <Mail className="h-4 w-4" /> },
    { value: 'add_label', label: 'Add Label', icon: <Plus className="h-4 w-4" /> },
    { value: 'mark_as_read', label: 'Mark as Read', icon: <Check className="h-4 w-4" /> },
    { value: 'mark_important', label: 'Mark as Important', icon: <AlertCircle className="h-4 w-4" /> },
    { value: 'forward_to', label: 'Forward To', icon: <Mail className="h-4 w-4" /> },
    { value: 'auto_reply', label: 'Auto Reply', icon: <Mail className="h-4 w-4" /> },
    { value: 'delete', label: 'Delete Email', icon: <X className="h-4 w-4" /> },
    { value: 'archive', label: 'Archive Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'create_task', label: 'Create Task', icon: <Calendar className="h-4 w-4" /> },
    { value: 'send_notification', label: 'Send Notification', icon: <AlertCircle className="h-4 w-4" /> }
  ];

  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: Date.now().toString(),
      field: '',
      operator: '',
      value: '',
      connector: 'AND'
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, field: keyof RuleCondition, value: string) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const addAction = () => {
    const newAction: RuleAction = {
      id: Date.now().toString(),
      type: '',
      parameters: {}
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (id: string) => {
    if (actions.length > 1) {
      setActions(actions.filter(a => a.id !== id));
    }
  };

  const updateAction = (id: string, type: string, parameters: Record<string, string> = {}) => {
    setActions(actions.map(a => 
      a.id === id ? { ...a, type, parameters } : a
    ));
  };

  const updateActionParameter = (id: string, parameter: string, value: string) => {
    setActions(actions.map(a => 
      a.id === id ? { 
        ...a, 
        parameters: { ...a.parameters, [parameter]: value }
      } : a
    ));
  };

  const getOperatorsForField = (field: string) => {
    const numberFields = ['attachment_count', 'thread_length', 'word_count'];
    const booleanFields = ['is_reply', 'has_links'];
    
    if (numberFields.includes(field)) return operators.number;
    if (booleanFields.includes(field)) return operators.boolean;
    return operators.text;
  };

  const getParametersForAction = (actionType: string) => {
    switch (actionType) {
      case 'move_to_folder':
        return [{ key: 'folder_name', label: 'Folder Name', placeholder: 'e.g., Important' }];
      case 'add_label':
        return [{ key: 'label_name', label: 'Label Name', placeholder: 'e.g., Urgent' }];
      case 'forward_to':
        return [{ key: 'email_address', label: 'Email Address', placeholder: 'e.g., manager@company.com' }];
      case 'auto_reply':
        return [{ key: 'reply_message', label: 'Reply Message', placeholder: 'Thank you for your email...' }];
      case 'create_task':
        return [
          { key: 'task_title', label: 'Task Title', placeholder: 'Follow up on email' },
          { key: 'due_date', label: 'Due Date', placeholder: '2 days' }
        ];
      case 'send_notification':
        return [{ key: 'notification_message', label: 'Notification Message', placeholder: 'Important email received' }];
      default:
        return [];
    }
  };

  const handleCreateRule = async () => {
    if (!ruleName.trim()) {
      alert('Please enter a rule name');
      return;
    }

    if (conditions.some(c => !c.field || !c.operator)) {
      alert('Please complete all conditions');
      return;
    }

    if (actions.some(a => !a.type)) {
      alert('Please select all action types');
      return;
    }

    setIsCreating(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const rule = {
      name: ruleName,
      description: ruleDescription,
      conditions,
      actions,
      priority,
      isActive
    };

    console.log('Created rule:', rule);
    setIsCreating(false);
    onComplete();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Settings className="h-6 w-6 text-purple-600" />
            Advanced Rule Builder
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="h-[65vh] overflow-y-auto">
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name *</Label>
                  <Input
                    id="rule-name"
                    placeholder="e.g., VIP Client Email Handler"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Describe what this rule does..."
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <Label htmlFor="is-active">Activate rule immediately</Label>
              </div>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Email Conditions</h3>
                <Button onClick={addCondition} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>

              <div className="space-y-4">
                {conditions.map((condition, index) => (
                  <Card key={condition.id} className="p-4">
                    {index > 0 && (
                      <div className="mb-3">
                        <Select
                          value={condition.connector || 'AND'}
                          onValueChange={(value) => updateCondition(condition.id, 'connector', value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="space-y-2">
                        <Label>Email Field</Label>
                        <Select
                          value={condition.field}
                          onValueChange={(value) => updateCondition(condition.id, 'field', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionFields.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Operator</Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                          disabled={!condition.field}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperatorsForField(condition.field).map(op => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          placeholder="Enter value..."
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(condition.id)}
                        disabled={conditions.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Actions to Take</h3>
                <Button onClick={addAction} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              </div>

              <div className="space-y-4">
                {actions.map((action) => (
                  <Card key={action.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label>Action Type</Label>
                          <Select
                            value={action.type}
                            onValueChange={(value) => updateAction(action.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select action..." />
                            </SelectTrigger>
                            <SelectContent>
                              {actionTypes.map(actionType => (
                                <SelectItem key={actionType.value} value={actionType.value}>
                                  <div className="flex items-center gap-2">
                                    {actionType.icon}
                                    {actionType.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAction(action.id)}
                          disabled={actions.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {action.type && getParametersForAction(action.type).length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {getParametersForAction(action.type).map(param => (
                            <div key={param.key} className="space-y-2">
                              <Label>{param.label}</Label>
                              <Input
                                placeholder={param.placeholder}
                                value={action.parameters[param.key] || ''}
                                onChange={(e) => updateActionParameter(action.id, param.key, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Rule Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Rule Name</Label>
                    <p className="text-lg font-semibold">{ruleName || 'Untitled Rule'}</p>
                  </div>

                  {ruleDescription && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p>{ruleDescription}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant={priority === 'urgent' ? 'destructive' : priority === 'high' ? 'default' : 'secondary'}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </Badge>
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-2 block">When these conditions are met:</Label>
                    <div className="space-y-2">
                      {conditions.map((condition, index) => (
                        <div key={condition.id} className="text-sm">
                          {index > 0 && (
                            <span className="font-medium text-purple-600">{condition.connector} </span>
                          )}
                          <span className="font-medium">
                            {conditionFields.find(f => f.value === condition.field)?.label || condition.field}
                          </span>
                          <span> {getOperatorsForField(condition.field).find(o => o.value === condition.operator)?.label || condition.operator} </span>
                          <span className="font-medium">"{condition.value}"</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Take these actions:</Label>
                    <div className="space-y-2">
                      {actions.map((action) => (
                        <div key={action.id} className="text-sm flex items-center gap-2">
                          {actionTypes.find(a => a.value === action.type)?.icon}
                          <span className="font-medium">
                            {actionTypes.find(a => a.value === action.type)?.label || action.type}
                          </span>
                          {Object.entries(action.parameters).length > 0 && (
                            <span className="text-gray-600">
                              ({Object.values(action.parameters).join(', ')})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="flex justify-between mt-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRule}
              disabled={isCreating || !ruleName.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Creating Rule...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Rule
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}