import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Book,
  Play,
  Settings,
  Mail,
  Zap,
  Users,
  Calendar,
  Shield,
  Target,
  FileText,
  Clock,
  Bot,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import zemaLogo from "../assets/zema-logo-latest.png";

export default function HowToGuide() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const sections = [
    { id: "getting-started", title: "Getting Started", icon: <Play className="h-4 w-4" /> },
    { id: "email-accounts", title: "Email Accounts", icon: <Mail className="h-4 w-4" /> },
    { id: "automation-templates", title: "Automation Templates", icon: <Zap className="h-4 w-4" /> },
    { id: "ai-features", title: "AI Features", icon: <Bot className="h-4 w-4" /> },
    { id: "integrations", title: "Integrations", icon: <Settings className="h-4 w-4" /> },
    { id: "security", title: "Security", icon: <Shield className="h-4 w-4" /> },
    { id: "troubleshooting", title: "Troubleshooting", icon: <Target className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={zemaLogo} 
                alt="ZEMA" 
                className="h-12 w-auto opacity-90 brightness-105"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  ZEMA How-To Guide
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Complete guide to mastering Zero Effort Mail Automation
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Guide Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.icon}
                      <span className="ml-2">{section.title}</span>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === "getting-started" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-green-500" />
                      Getting Started with ZEMA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">1. Create Your Account</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Visit the ZEMA homepage and click "Sign Up"</p>
                        <p>• Enter your email and create a secure password</p>
                        <p>• Verify your email address when prompted</p>
                        <p>• Your 14-day free trial starts immediately</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">2. Connect Your First Email Account</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Go to "Email Accounts" in the sidebar</p>
                        <p>• Click "Add Account" and choose your provider (Gmail/Outlook)</p>
                        <p>• Follow the OAuth authentication flow</p>
                        <p>• Wait for initial sync to complete (usually 1-2 minutes)</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">3. Set Up Your First Automation</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Navigate to the Dashboard main page</p>
                        <p>• Browse the automation templates</p>
                        <p>• Click on "Smart Email Classifier" (recommended for beginners)</p>
                        <p>• Review settings and click "Create Automation"</p>
                        <p>• Your automation is now active!</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium mb-2">
                        <CheckCircle className="h-4 w-4" />
                        Pro Tip
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">
                        Start with simple automation templates like "Email Auto-Organizer" or "Newsletter Organizer" 
                        before moving to advanced features like "Lead Scoring Engine".
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "email-accounts" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      Managing Email Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Adding Email Accounts</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Navigate to "Email Accounts" in the sidebar</p>
                        <p>• Click "Add Account" button</p>
                        <p>• Choose your email provider:</p>
                        <div className="ml-4 space-y-1">
                          <p>- Gmail: Full OAuth integration with Google Workspace support</p>
                          <p>- Outlook: Microsoft 365 and Outlook.com compatibility</p>
                        </div>
                        <p>• Complete the authentication process</p>
                        <p>• Set account preferences (sync frequency, folders to monitor)</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Multi-Account Management</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Add multiple accounts from the same or different providers</p>
                        <p>• Set one account as "Primary" for default actions</p>
                        <p>• View unified inbox across all accounts</p>
                        <p>• Apply automation rules per account or globally</p>
                        <p>• Monitor sync status and resolve connection issues</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Account Security & Permissions</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• ZEMA uses OAuth 2.0 for secure authentication</p>
                        <p>• We never store your email passwords</p>
                        <p>• Revoke access anytime from your email provider's settings</p>
                        <p>• All data is encrypted in transit and at rest</p>
                        <p>• Regular security audits ensure data protection</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "automation-templates" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-500" />
                      Automation Templates Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="smart-filters" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="smart-filters">Smart Filters</TabsTrigger>
                        <TabsTrigger value="auto-responders">Auto Responders</TabsTrigger>
                        <TabsTrigger value="organization">Organization</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="smart-filters" className="space-y-4">
                        <div className="grid gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold text-blue-600 dark:text-blue-400">Smart Email Classifier</h4>
                            <Badge variant="secondary" className="mt-1 mb-2">Easy</Badge>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Automatically categorizes emails by content and sender using AI analysis.
                            </p>
                            <p className="text-xs text-gray-500">
                              Best for: Users with high email volume who need automatic organization
                            </p>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold text-emerald-600 dark:text-emerald-400">Lead Scoring Engine</h4>
                            <Badge variant="destructive" className="mt-1 mb-2">Advanced</Badge>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Scores and prioritizes potential leads based on email content and sender behavior.
                            </p>
                            <p className="text-xs text-gray-500">
                              Best for: Sales teams and business development professionals
                            </p>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold text-pink-600 dark:text-pink-400">Social Media Alert Manager</h4>
                            <Badge variant="secondary" className="mt-1 mb-2">Easy</Badge>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Consolidates and prioritizes social media notifications from all platforms.
                            </p>
                            <p className="text-xs text-gray-500">
                              Best for: Social media managers and content creators
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="auto-responders" className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold text-cyan-600 dark:text-cyan-400">Smart Auto-Responder</h4>
                          <Badge variant="outline" className="mt-1 mb-2">Medium</Badge>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            Context-aware automatic responses based on email content and intent analysis.
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>• Analyzes incoming email context</p>
                            <p>• Generates appropriate responses</p>
                            <p>• Learns from your communication style</p>
                            <p>• Supports multiple languages</p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="organization" className="space-y-4">
                        <div className="grid gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold text-green-600 dark:text-green-400">Email Auto-Organizer</h4>
                            <Badge variant="secondary" className="mt-1 mb-2">Easy</Badge>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Automatically sorts emails into folders and applies labels based on content.
                            </p>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold text-yellow-600 dark:text-yellow-400">Expense Email Tracker</h4>
                            <Badge variant="destructive" className="mt-1 mb-2">Advanced</Badge>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Extracts and categorizes financial information from receipts and invoices.
                            </p>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold text-sky-600 dark:text-sky-400">Travel Booking Assistant</h4>
                            <Badge variant="outline" className="mt-1 mb-2">Medium</Badge>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Auto-organizes travel confirmations, boarding passes, and itineraries.
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "ai-features" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      AI Features Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Personalized Writing Style Learning
                      </h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Navigate to "AI Features" from the sidebar</p>
                        <p>• Click on "Writing Style Learning" tab</p>
                        <p>• Upload 3-5 sample emails you've written</p>
                        <p>• AI analyzes your tone, complexity, and vocabulary</p>
                        <p>• Generate drafts that match your personal style</p>
                      </div>
                      <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          <strong>Pro Tip:</strong> Include emails from different contexts (formal, casual, client communication) 
                          for better style adaptation.
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Calendar Integration
                      </h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Connect your Google Calendar in "AI Features"</p>
                        <p>• AI detects meeting requests in emails</p>
                        <p>• Automatically suggests available time slots</p>
                        <p>• Creates calendar events with email context</p>
                        <p>• Handles timezone conversions automatically</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Attachment Analysis
                      </h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• AI automatically analyzes email attachments</p>
                        <p>• Supports PDFs, images, spreadsheets, and documents</p>
                        <p>• Extracts key information and action items</p>
                        <p>• Generates summaries for quick review</p>
                        <p>• Creates searchable metadata for future reference</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "integrations" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-500" />
                      Platform Integrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Setting Up Integrations</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Go to "My Integrations" in the navigation menu</p>
                        <p>• Browse 40+ available platform integrations</p>
                        <p>• Click "Connect" on your desired platform</p>
                        <p>• Enter your API key or complete OAuth flow</p>
                        <p>• Test the connection and configure settings</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Popular Integration Categories</h3>
                      <div className="grid gap-3">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-blue-600 dark:text-blue-400">CRM Systems</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Salesforce, HubSpot, Pipedrive - Sync leads and contacts automatically
                          </p>
                        </div>
                        
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-green-600 dark:text-green-400">Project Management</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Trello, Asana, Monday.com, ClickUp - Create tasks from emails
                          </p>
                        </div>
                        
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-purple-600 dark:text-purple-400">Communication</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Slack, Discord, Microsoft Teams - Forward important emails
                          </p>
                        </div>
                        
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-orange-600 dark:text-orange-400">Productivity</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Notion, Airtable, Google Drive - Organize email data
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Data Protection</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• All data encrypted with AES-256 encryption</p>
                        <p>• OAuth 2.0 authentication (no password storage)</p>
                        <p>• Regular security audits and penetration testing</p>
                        <p>• GDPR and SOC 2 compliant infrastructure</p>
                        <p>• Data processed only for automation purposes</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Account Security</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Enable two-factor authentication (2FA)</p>
                        <p>• Use strong, unique passwords</p>
                        <p>• Regular session monitoring and logout</p>
                        <p>• API key rotation for integrations</p>
                        <p>• Audit log access for account activity</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Privacy Controls</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Data retention policy settings</p>
                        <p>• Email content exclusion options</p>
                        <p>• Automated data deletion tools</p>
                        <p>• Export your data anytime</p>
                        <p>• Complete account deletion available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "troubleshooting" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-500" />
                      Troubleshooting Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Common Issues</h3>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                            Email Account Not Syncing
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <p>• Check internet connection</p>
                            <p>• Verify email provider permissions</p>
                            <p>• Re-authenticate account in Email Accounts page</p>
                            <p>• Contact support if issue persists</p>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2">
                            Automation Rules Not Working
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <p>• Check rule conditions and triggers</p>
                            <p>• Verify email account is active</p>
                            <p>• Review automation logs in Dashboard</p>
                            <p>• Test with simple rules first</p>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                            Integration Connection Issues
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <p>• Verify API key is correct and active</p>
                            <p>• Check integration permissions</p>
                            <p>• Test connection in My Integrations</p>
                            <p>• Update API keys if expired</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Getting Help</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>• Check the in-app help tooltips and guides</p>
                        <p>• Visit our comprehensive documentation</p>
                        <p>• Contact support through the chat widget</p>
                        <p>• Join our community forum for user tips</p>
                        <p>• Schedule a one-on-one onboarding call</p>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
                        <CheckCircle className="h-4 w-4" />
                        Need Immediate Help?
                      </div>
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        Use the chat widget in the bottom-right corner for 24/7 support, 
                        or email us at support@zema.app for detailed assistance.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}