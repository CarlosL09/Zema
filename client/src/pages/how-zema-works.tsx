import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  Zap, 
  Bot, 
  Shield, 
  Clock, 
  Users, 
  BarChart3,
  Settings,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Smartphone,
  Monitor,
  Cloud,
  RefreshCw,
  Bell,
  Filter,
  Forward,
  Tags,
  AlertTriangle,
  MessageSquare,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Eye,
  Sparkles
} from "lucide-react";

export default function HowZemaWorks() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const workflowSteps = [
    {
      id: "connect",
      title: "Connect Your Email Accounts",
      description: "Secure OAuth connection to Gmail and Outlook",
      icon: <Mail className="h-8 w-8 text-blue-500" />,
      details: [
        "One-click OAuth authentication",
        "Bank-level security encryption",
        "Read-only access by default",
        "Supports multiple accounts"
      ]
    },
    {
      id: "analyze",
      title: "AI Email Analysis",
      description: "GPT-4o powered content understanding",
      icon: <Bot className="h-8 w-8 text-purple-500" />,
      details: [
        "Content analysis within 1-2 seconds",
        "Intent recognition and classification",
        "Sender relationship scoring",
        "Context-aware processing"
      ]
    },
    {
      id: "automate",
      title: "Execute Automation Rules",
      description: "Smart actions based on email content",
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      details: [
        "25+ pre-built templates",
        "Custom rule creation",
        "Multi-platform integrations",
        "Real-time execution"
      ]
    },
    {
      id: "integrate",
      title: "Platform Actions",
      description: "Connect with your favorite tools",
      icon: <Settings className="h-8 w-8 text-green-500" />,
      details: [
        "Slack notifications",
        "Trello card creation",
        "Calendar scheduling",
        "20+ app integrations"
      ]
    }
  ];

  const emailScenarios = [
    {
      title: "Client Project Email",
      email: {
        from: "sarah@clientcompany.com",
        subject: "Urgent: Website Launch Delayed",
        content: "Hi Team, We need to postpone the website launch by 2 weeks due to content delays. Can we schedule a call this week to discuss the new timeline? Thanks, Sarah"
      },
      analysis: {
        intent: "Meeting Request + Project Update",
        urgency: "High",
        sentiment: "Concerned",
        keywords: ["urgent", "delayed", "schedule", "call"]
      },
      actions: [
        "🔴 Flag as High Priority",
        "📅 Detect meeting request",
        "💬 Send Slack alert to project team",
        "📋 Create Trello card: 'Client meeting needed'",
        "⏰ Schedule follow-up reminder in 2 days"
      ]
    },
    {
      title: "Newsletter Subscription",
      email: {
        from: "newsletter@techblog.com",
        subject: "Weekly Tech Trends - Issue #47",
        content: "This week in tech: AI breakthroughs, new frameworks, and startup funding rounds..."
      },
      analysis: {
        intent: "Newsletter Content",
        urgency: "Low",
        sentiment: "Neutral",
        keywords: ["weekly", "trends", "newsletter"]
      },
      actions: [
        "📁 Auto-file to 'Newsletters' folder",
        "🏷️ Apply 'Tech News' label",
        "⚡ Skip inbox (direct to folder)",
        "📊 Track engagement for unsubscribe suggestion"
      ]
    },
    {
      title: "Customer Support Request",
      email: {
        from: "user@company.com",
        subject: "Account Access Issue",
        content: "I can't log into my account after the recent update. Getting error code 403. Please help ASAP."
      },
      analysis: {
        intent: "Support Request",
        urgency: "High",
        sentiment: "Frustrated",
        keywords: ["error", "ASAP", "help", "issue"]
      },
      actions: [
        "🎫 Create support ticket #12847",
        "⚡ Route to technical support team",
        "📧 Send auto-acknowledgment reply",
        "⏱️ Set 4-hour response SLA reminder",
        "📈 Log in customer satisfaction tracking"
      ]
    }
  ];

  const integrationExamples = [
    {
      platform: "Slack",
      icon: "💬",
      trigger: "Email from VIP client",
      action: "Send alert to #sales channel with email summary and suggested response"
    },
    {
      platform: "Trello",
      icon: "📋",
      trigger: "Project-related email",
      action: "Create card in appropriate board with email content and due date"
    },
    {
      platform: "Google Calendar",
      icon: "📅",
      trigger: "Meeting request detected",
      action: "Check availability and suggest optimal meeting times"
    },
    {
      platform: "Zapier",
      icon: "⚡",
      trigger: "Invoice email received",
      action: "Add to accounting spreadsheet and notify finance team"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 dark:from-gray-900 dark:to-cyan-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            How ZEMA Works
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Understanding every component of your AI-powered email automation platform
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="sync">Sync Process</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* What ZEMA Is */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-purple-500" />
                    What ZEMA Is
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    ZEMA is an intelligent middleware that sits between your email accounts and your productivity tools. 
                    It analyzes every email using AI and executes automated actions based on your custom rules.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Works behind the scenes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">No change to your email habits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">AI-powered decision making</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Connects all your tools</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What ZEMA Isn't */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-6 w-6 text-orange-500" />
                    What ZEMA Isn't
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    ZEMA doesn't replace your email client or change how you read and send emails. 
                    Your Gmail and Outlook stay exactly the same.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <span className="text-sm">Not an email client replacement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <span className="text-sm">Doesn't store your emails</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <span className="text-sm">No new interface to learn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <span className="text-sm">Doesn't interrupt your workflow</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Architecture Diagram */}
            <Card>
              <CardHeader>
                <CardTitle>ZEMA Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div className="text-center">
                    <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg mb-2">
                      <Mail className="h-8 w-8 text-blue-600 mx-auto" />
                    </div>
                    <p className="text-sm font-medium">Your Email</p>
                    <p className="text-xs text-gray-500">Gmail/Outlook</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg mb-2">
                      <Bot className="h-8 w-8 text-purple-600 mx-auto" />
                    </div>
                    <p className="text-sm font-medium">ZEMA AI</p>
                    <p className="text-xs text-gray-500">Analysis & Rules</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg mb-2">
                      <Settings className="h-8 w-8 text-green-600 mx-auto" />
                    </div>
                    <p className="text-sm font-medium">Your Tools</p>
                    <p className="text-xs text-gray-500">Slack, Trello, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {workflowSteps.map((step, index) => (
                <Card key={step.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 p-3 rounded-lg">
                        {step.icon}
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2">Step {index + 1}</Badge>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Timeline View */}
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Processing Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div className="flex-1">
                      <p className="font-medium">Email Arrives (0:00)</p>
                      <p className="text-sm text-gray-500">New message hits your Gmail/Outlook inbox</p>
                    </div>
                    <Badge variant="outline">Instant</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div className="flex-1">
                      <p className="font-medium">ZEMA Notification (0:01)</p>
                      <p className="text-sm text-gray-500">ZEMA receives webhook notification from email provider</p>
                    </div>
                    <Badge variant="outline">1-2 seconds</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div className="flex-1">
                      <p className="font-medium">AI Analysis (0:02)</p>
                      <p className="text-sm text-gray-500">GPT-4o processes content, intent, urgency, and context</p>
                    </div>
                    <Badge variant="outline">1-3 seconds</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div className="flex-1">
                      <p className="font-medium">Rules Execution (0:05)</p>
                      <p className="text-sm text-gray-500">Automation rules trigger and actions execute across platforms</p>
                    </div>
                    <Badge variant="outline">2-5 seconds</Badge>
                  </div>
                  
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Total Processing Time: 5-10 seconds</strong> from email arrival to completed automation
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-8">
            <div className="space-y-8">
              {emailScenarios.map((scenario, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-blue-500" />
                      {scenario.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Original Email */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Original Email
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">From:</span> {scenario.email.from}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Subject:</span> {scenario.email.subject}
                          </div>
                          <div className="text-sm mt-3 p-3 bg-white dark:bg-gray-700 rounded border-l-4 border-blue-500">
                            {scenario.email.content}
                          </div>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          AI Analysis
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <Badge variant="outline" className="mb-1">Intent</Badge>
                            <p className="text-sm">{scenario.analysis.intent}</p>
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-1">Urgency</Badge>
                            <p className="text-sm">{scenario.analysis.urgency}</p>
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-1">Sentiment</Badge>
                            <p className="text-sm">{scenario.analysis.sentiment}</p>
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-1">Key Terms</Badge>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {scenario.analysis.keywords.map((keyword, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Automated Actions */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Automated Actions
                        </h4>
                        <div className="space-y-2">
                          {scenario.actions.map((action, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>How Integrations Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    ZEMA connects with your favorite tools through secure APIs and webhooks. 
                    When an automation rule triggers, ZEMA can perform actions across multiple platforms simultaneously.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Settings className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">OAuth Authentication</p>
                        <p className="text-xs text-gray-500">Secure, revokable access to your accounts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Zap className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Real-time Actions</p>
                        <p className="text-xs text-gray-500">Instant execution across all connected platforms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Encrypted Data</p>
                        <p className="text-xs text-gray-500">All communication is encrypted end-to-end</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {integrationExamples.map((example, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{example.icon}</span>
                        <span className="font-medium text-sm">{example.platform}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p><strong>Trigger:</strong> {example.trigger}</p>
                        <p><strong>Action:</strong> {example.action}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Available Platforms */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { name: "Slack", icon: "💬", category: "Communication" },
                    { name: "Discord", icon: "🎮", category: "Communication" },
                    { name: "Trello", icon: "📋", category: "Project Management" },
                    { name: "Asana", icon: "✅", category: "Project Management" },
                    { name: "Notion", icon: "📝", category: "Productivity" },
                    { name: "Airtable", icon: "📈", category: "Productivity" },
                    { name: "Google Drive", icon: "📁", category: "Storage" },
                    { name: "Dropbox", icon: "☁️", category: "Storage" },
                    { name: "GitHub", icon: "💻", category: "Development" },
                    { name: "Zapier", icon: "⚡", category: "Automation" },
                    { name: "Calendar", icon: "📅", category: "Scheduling" },
                    { name: "Teams", icon: "👥", category: "Communication" }
                  ].map((platform, index) => (
                    <div key={index} className="text-center p-3 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-2xl mb-1">{platform.icon}</div>
                      <div className="text-xs font-medium">{platform.name}</div>
                      <div className="text-xs text-gray-500">{platform.category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Data Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">End-to-End Encryption</p>
                        <p className="text-xs text-gray-500">All data transmission uses AES-256 encryption</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Zero Data Storage</p>
                        <p className="text-xs text-gray-500">Email content is not stored, only processed</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">OAuth 2.0 Authentication</p>
                        <p className="text-xs text-gray-500">Secure, revokable access tokens</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">SOC 2 Compliance</p>
                        <p className="text-xs text-gray-500">Independently audited security controls</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    Privacy Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Granular Permissions</p>
                        <p className="text-xs text-gray-500">Control exactly what ZEMA can access</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Instant Disconnection</p>
                        <p className="text-xs text-gray-500">Revoke access anytime from your dashboard</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Activity Logging</p>
                        <p className="text-xs text-gray-500">Complete audit trail of all actions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Data Anonymization</p>
                        <p className="text-xs text-gray-500">Personal information is masked for AI processing</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Your Data Security:</strong> ZEMA processes your emails in real-time but never stores the content. 
                Only metadata (sender, subject, timestamp) and automation results are retained for analytics.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Sync Process Tab */}
          <TabsContent value="sync" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                    Sync Mechanisms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Real-time Webhooks</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Gmail and Outlook push notifications to ZEMA instantly when new emails arrive
                      </p>
                      <Badge variant="secondary">Latency: 1-2 seconds</Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Periodic Sync</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Background sync every 15 minutes to catch any missed messages
                      </p>
                      <Badge variant="secondary">Frequency: Every 15 min</Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Manual Refresh</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Force immediate sync from your dashboard
                      </p>
                      <Badge variant="secondary">On-demand</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Sync Status Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Gmail Personal</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Last sync: 30s ago</p>
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Outlook Work</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Last sync: 1m ago</p>
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Gmail Work</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Syncing now...</p>
                        <Badge variant="outline" className="text-xs">Syncing</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sync Process Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Sync Process Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg mb-3">
                        <Bell className="h-8 w-8 text-blue-600 mx-auto" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">Webhook Received</h4>
                      <p className="text-xs text-gray-500">Email provider notifies ZEMA</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg mb-3">
                        <Bot className="h-8 w-8 text-purple-600 mx-auto" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">Fetch & Analyze</h4>
                      <p className="text-xs text-gray-500">Retrieve email content via API</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mb-3">
                        <Zap className="h-8 w-8 text-yellow-600 mx-auto" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">Execute Rules</h4>
                      <p className="text-xs text-gray-500">Apply automation logic</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg mb-3">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">Actions Complete</h4>
                      <p className="text-xs text-gray-500">Results logged and displayed</p>
                    </div>
                  </div>
                  
                  <Alert>
                    <RefreshCw className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Sync Reliability:</strong> ZEMA maintains 99.9% sync reliability with multiple 
                      fallback mechanisms to ensure no emails are missed.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}