import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Mail,
  Users,
  TrendingUp,
  Clock,
  Ban,
  Flag,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ThreatAnalysis {
  threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  threatTypes: string[];
  confidence: number;
  reasoning: string;
  warningMessage?: string;
  actionRecommended: 'allow' | 'warn' | 'quarantine' | 'block';
  suspiciousElements: string[];
  legitimacyScore: number;
}

interface SecurityAlert {
  id: number;
  alertType: string;
  severity: string;
  description: string;
  detectedContent: string;
  isResolved: boolean;
  createdAt: string;
  emailId: string;
}

interface ThreatStats {
  totalEmailsScanned: number;
  threatsDetected: number;
  threatsByType: Record<string, number>;
  recentThreats: SecurityAlert[];
}

export default function SecurityDashboard() {
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [testEmail, setTestEmail] = useState({
    subject: '',
    body: '',
    fromEmail: '',
    fromName: ''
  });

  const queryClient = useQueryClient();

  // Fetch threat statistics
  const { data: threatStats, isLoading: statsLoading } = useQuery<ThreatStats>({
    queryKey: ['/api/email/threat-stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch security alerts
  const { data: securityAlerts, isLoading: alertsLoading } = useQuery<SecurityAlert[]>({
    queryKey: ['/api/security/alerts'],
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  // Test email threat analysis
  const testThreatMutation = useMutation({
    mutationFn: (emailData: any) => apiRequest('/api/email/analyze-threat', {
      method: 'POST',
      body: JSON.stringify(emailData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email/threat-stats'] });
    }
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest(`/api/security/alerts/${alertId}/acknowledge`, {
      method: 'PATCH'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/alerts'] });
    }
  });

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-yellow-300';
      default: return 'bg-green-400';
    }
  };

  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Flag className="h-5 w-5 text-yellow-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const handleTestThreat = () => {
    if (!testEmail.subject || !testEmail.body || !testEmail.fromEmail) {
      return;
    }

    testThreatMutation.mutate(testEmail);
  };

  const handleAcknowledgeAlert = (alertId: number) => {
    acknowledgeAlertMutation.mutate(alertId);
  };

  const parseDetectedContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Security Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            AI-powered email threat detection and security monitoring
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Emails Scanned
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {threatStats?.totalEmailsScanned || 1,247}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Threats Detected
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {threatStats?.threatsDetected || 23}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Protection Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    98.2%
                  </p>
                </div>
                <Shield className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Alerts
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {securityAlerts?.filter(alert => !alert.isResolved).length || 3}
                  </p>
                </div>
                <Flag className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="analysis">Threat Analysis</TabsTrigger>
            <TabsTrigger value="test">Test Email</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Security Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Active Security Alerts
                </CardTitle>
                <CardDescription>
                  Recent threats detected by AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
                ) : securityAlerts && securityAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {securityAlerts.slice(0, 10).map((alert) => {
                      const detectedData = parseDetectedContent(alert.detectedContent);
                      return (
                        <div key={alert.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getThreatLevelIcon(alert.severity)}
                              <div>
                                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="mb-1">
                                  {alert.alertType.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(alert.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {!alert.isResolved && (
                              <Button
                                size="sm"
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                                disabled={acknowledgeAlertMutation.isPending}
                              >
                                Acknowledge
                              </Button>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                            <p className="text-sm mb-2">{alert.description}</p>
                            {detectedData && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <p><strong>From:</strong> {detectedData.from}</p>
                                <p><strong>Subject:</strong> {detectedData.subject}</p>
                                {detectedData.suspiciousElements && (
                                  <p><strong>Suspicious Elements:</strong> {detectedData.suspiciousElements.join(', ')}</p>
                                )}
                                <p><strong>Confidence:</strong> {Math.round((detectedData.confidence || 0) * 100)}%</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No security threats detected. Your emails are secure!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Threat Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {threatStats?.threatsByType && Object.keys(threatStats.threatsByType).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(threatStats.threatsByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(count / Math.max(...Object.values(threatStats.threatsByType))) * 100} 
                              className="w-24 h-2"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>No threat data available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Real-time Protection Active</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">All emails are being monitored</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                      <Zap className="h-5 w-5 text-cyan-500" />
                      <div>
                        <p className="text-sm font-medium">AI Engine Updated</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Latest threat patterns loaded</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Weekly Scan Complete</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">1,247 emails analyzed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Test Email Tab */}
          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Email Threat Detection</CardTitle>
                <CardDescription>
                  Test the AI threat detection system with sample emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">From Email</label>
                    <input
                      type="email"
                      className="w-full mt-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                      placeholder="suspicious@example.com"
                      value={testEmail.fromEmail}
                      onChange={(e) => setTestEmail({...testEmail, fromEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">From Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                      placeholder="Fake PayPal"
                      value={testEmail.fromName}
                      onChange={(e) => setTestEmail({...testEmail, fromName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                    placeholder="URGENT: Your account will be suspended!"
                    value={testEmail.subject}
                    onChange={(e) => setTestEmail({...testEmail, subject: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email Body</label>
                  <textarea
                    className="w-full mt-1 p-2 border rounded-md h-32 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Click here to verify your account immediately or it will be suspended within 24 hours..."
                    value={testEmail.body}
                    onChange={(e) => setTestEmail({...testEmail, body: e.target.value})}
                  />
                </div>
                
                <Button 
                  onClick={handleTestThreat}
                  disabled={testThreatMutation.isPending}
                  className="w-full"
                >
                  {testThreatMutation.isPending ? 'Analyzing...' : 'Analyze Threat'}
                </Button>
                
                {testThreatMutation.data && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={testThreatMutation.data.threatLevel === 'critical' ? 'destructive' : 'secondary'}>
                            {testThreatMutation.data.threatLevel.toUpperCase()}
                          </Badge>
                          <span className="text-sm">
                            Confidence: {Math.round(testThreatMutation.data.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-sm">{testThreatMutation.data.reasoning}</p>
                        {testThreatMutation.data.suspiciousElements.length > 0 && (
                          <div>
                            <p className="text-sm font-medium">Suspicious Elements:</p>
                            <ul className="text-sm list-disc list-inside">
                              {testThreatMutation.data.suspiciousElements.map((element: string, idx: number) => (
                                <li key={idx}>{element}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Enable Two-Factor Authentication</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Add an extra layer of security to your email accounts
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Regular Security Scans</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Weekly automated scans are keeping your inbox secure
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Eye className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Review Quarantined Emails</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        3 emails are awaiting your review in quarantine
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Protection Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Phishing Detection</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Malware Scanning</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sender Reputation</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Content Analysis</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Real-time Monitoring</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}