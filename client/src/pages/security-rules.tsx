import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Ban, 
  Flag, 
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Search
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: 'domain' | 'keyword' | 'pattern' | 'header' | 'attachment';
  rule: string;
  action: 'block' | 'quarantine' | 'flag' | 'warn';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  triggeredCount?: number;
  lastTriggered?: string;
}

export default function SecurityRules() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SecurityRule | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch security rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['/api/security/rules'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/security/rules');
      return response.json();
    }
  });

  // Mock data for demonstration
  const mockRules: SecurityRule[] = [
    {
      id: "rule_1",
      name: "Block dangerous file extensions",
      description: "Blocks emails with potentially dangerous executable attachments",
      type: "attachment",
      rule: "\\.exe$|\\.scr$|\\.bat$|\\.cmd$",
      action: "block",
      severity: "critical",
      enabled: true,
      triggeredCount: 12,
      lastTriggered: "2025-01-05"
    },
    {
      id: "rule_2", 
      name: "Flag urgent financial requests",
      description: "Flags emails with urgent financial language",
      type: "keyword",
      rule: "urgent.*transfer|immediate.*payment|emergency.*funds",
      action: "flag",
      severity: "high",
      enabled: true,
      triggeredCount: 8,
      lastTriggered: "2025-01-04"
    },
    {
      id: "rule_3",
      name: "Quarantine lottery scams",
      description: "Quarantines obvious lottery and inheritance scams", 
      type: "keyword",
      rule: "congratulations.*won|inheritance.*million|lottery.*winner",
      action: "quarantine",
      severity: "high",
      enabled: true,
      triggeredCount: 25,
      lastTriggered: "2025-01-05"
    },
    {
      id: "rule_4",
      name: "Warn about suspicious domains",
      description: "Warns about emails from suspicious TLDs",
      type: "domain", 
      rule: "\\.tk$|\\.ml$|\\.ga$|\\.cf$",
      action: "warn",
      severity: "medium",
      enabled: true,
      triggeredCount: 5,
      lastTriggered: "2025-01-03"
    },
    {
      id: "rule_5",
      name: "Flag account verification requests",
      description: "Flags emails requesting account verification",
      type: "keyword",
      rule: "verify.*account|confirm.*identity|update.*details", 
      action: "flag",
      severity: "medium",
      enabled: false,
      triggeredCount: 0,
      lastTriggered: undefined
    }
  ];

  const displayRules = rules || mockRules;

  // Filter rules
  const filteredRules = displayRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.rule.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || rule.type === filterType;
    const matchesSeverity = filterSeverity === "all" || rule.severity === filterSeverity;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  // Mutations
  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: Omit<SecurityRule, 'id'>) => {
      const response = await apiRequest('POST', '/api/security/rules', ruleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/rules'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Security Rule Created",
        description: "Your new security rule has been created successfully."
      });
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, ...ruleData }: SecurityRule) => {
      const response = await apiRequest('PUT', `/api/security/rules/${id}`, ruleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/rules'] });
      setEditingRule(null);
      toast({
        title: "Security Rule Updated",
        description: "Your security rule has been updated successfully."
      });
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/security/rules/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/rules'] });
      toast({
        title: "Security Rule Deleted",
        description: "The security rule has been deleted successfully."
      });
    }
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await apiRequest('PATCH', `/api/security/rules/${id}/toggle`, { enabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/rules'] });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'block': return <Ban className="h-4 w-4" />;
      case 'quarantine': return <Shield className="h-4 w-4" />;
      case 'flag': return <Flag className="h-4 w-4" />;
      case 'warn': return <AlertTriangle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'domain': return '🌐';
      case 'keyword': return '🔤';
      case 'pattern': return '🔍';
      case 'header': return '📋';
      case 'attachment': return '📎';
      default: return '⚡';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Rules</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage automated security rules to protect your email from threats
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Rules</p>
                <p className="text-2xl font-bold">{displayRules.length}</p>
              </div>
              <Shield className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">
                  {displayRules.filter(r => r.enabled).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Threats Blocked</p>
                <p className="text-2xl font-bold text-red-600">
                  {displayRules.reduce((sum, r) => sum + (r.triggeredCount || 0), 0)}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical Rules</p>
                <p className="text-2xl font-bold text-orange-600">
                  {displayRules.filter(r => r.severity === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="keyword">Keyword</SelectItem>
                <SelectItem value="pattern">Pattern</SelectItem>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="attachment">Attachment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{getTypeIcon(rule.type)}</span>
                    <h3 className="text-lg font-semibold">{rule.name}</h3>
                    <Badge className={getSeverityColor(rule.severity)}>
                      {rule.severity.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getActionIcon(rule.action)}
                      <span className="text-sm font-medium capitalize">{rule.action}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{rule.description}</p>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                    <code className="text-sm font-mono">{rule.rule}</code>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Type: <strong>{rule.type}</strong></span>
                    {rule.triggeredCount !== undefined && (
                      <span>Triggered: <strong>{rule.triggeredCount} times</strong></span>
                    )}
                    {rule.lastTriggered && (
                      <span>Last: <strong>{rule.lastTriggered}</strong></span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(enabled) => {
                      toggleRuleMutation.mutate({ id: rule.id, enabled });
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRule(rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRuleMutation.mutate(rule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rules found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || filterType !== "all" || filterSeverity !== "all"
                ? "Try adjusting your filters to see more rules."
                : "Create your first security rule to start protecting your emails."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Rule Dialog */}
      <RuleDialog
        isOpen={isCreateDialogOpen || editingRule !== null}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingRule(null);
        }}
        rule={editingRule}
        onSave={(ruleData) => {
          if (editingRule) {
            updateRuleMutation.mutate({ ...ruleData, id: editingRule.id });
          } else {
            createRuleMutation.mutate(ruleData);
          }
        }}
      />
    </div>
  );
}

// Rule creation/editing dialog component
function RuleDialog({
  isOpen,
  onClose,
  rule,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  rule: SecurityRule | null;
  onSave: (rule: Omit<SecurityRule, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'keyword' as SecurityRule['type'],
    rule: '',
    action: 'flag' as SecurityRule['action'],
    severity: 'medium' as SecurityRule['severity'],
    enabled: true
  });

  // Update form when rule changes
  useState(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        description: rule.description,
        type: rule.type,
        rule: rule.rule,
        action: rule.action,
        severity: rule.severity,
        enabled: rule.enabled
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'keyword',
        rule: '',
        action: 'flag',
        severity: 'medium',
        enabled: true
      });
    }
  }, [rule]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Edit Security Rule' : 'Create Security Rule'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter rule name"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this rule does"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Rule Type</Label>
              <Select value={formData.type} onValueChange={(value: SecurityRule['type']) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">Keyword</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="pattern">Pattern</SelectItem>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="attachment">Attachment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={formData.action} onValueChange={(value: SecurityRule['action']) => setFormData({ ...formData, action: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flag">Flag</SelectItem>
                  <SelectItem value="warn">Warn</SelectItem>
                  <SelectItem value="quarantine">Quarantine</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="severity">Severity</Label>
            <Select value={formData.severity} onValueChange={(value: SecurityRule['severity']) => setFormData({ ...formData, severity: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="rule">Rule Pattern</Label>
            <Textarea
              id="rule"
              value={formData.rule}
              onChange={(e) => setFormData({ ...formData, rule: e.target.value })}
              placeholder="Enter regex pattern or rule criteria"
              className="font-mono"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Use regex patterns for keyword/pattern rules, domain names for domain rules
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.enabled}
              onCheckedChange={(enabled) => setFormData({ ...formData, enabled })}
            />
            <Label>Enable this rule</Label>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
            {rule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}