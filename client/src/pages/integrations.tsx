import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar,
  Video,
  Users,
  Building,
  CheckCircle,
  ExternalLink,
  Settings,
  Zap,
  Clock,
  Globe,
  Shield,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function Integrations() {
  const [activeTab, setActiveTab] = useState("crm");

  const automationPlatforms = [
    {
      name: "Zapier",
      description: "Connect over 5,000 apps with automated workflows and triggers",
      status: "available",
      features: ["5000+ App Integrations", "Custom Webhooks", "Multi-step Workflows", "Real-time Triggers"],
      logo: "⚡"
    },
    {
      name: "Pabbly Connect",
      description: "Affordable automation platform with unlimited workflow executions",
      status: "available",
      features: ["Unlimited Workflows", "Premium App Integrations", "Data Transformation", "Real-time Sync"],
      logo: "🔗"
    }
  ];

  const productivityPlatforms = [
    {
      name: "Notion",
      description: "All-in-one workspace for notes, tasks, wikis, and databases",
      status: "available",
      features: ["Database Sync", "Page Creation", "Task Management", "Team Collaboration"],
      logo: "📝"
    },
    {
      name: "Airtable",
      description: "Powerful database platform that's as easy as a spreadsheet",
      status: "available", 
      features: ["Base Sync", "Record Creation", "Custom Fields", "Advanced Views"],
      logo: "📊"
    }
  ];

  const projectPlatforms = [
    {
      name: "Trello",
      description: "Visual project management with boards, lists, and cards",
      status: "available",
      features: ["Card Creation", "Due Dates", "Labels & Tags", "Team Boards"],
      logo: "📋"
    },
    {
      name: "Asana",
      description: "Team collaboration and project tracking platform",
      status: "available",
      features: ["Task Creation", "Project Management", "Team Assignments", "Timeline View"],
      logo: "✅"
    },
    {
      name: "Monday.com",
      description: "Work operating system for teams and projects",
      status: "available",
      features: ["Custom Workflows", "Timeline View", "Automation", "Team Collaboration"],
      logo: "📅"
    },
    {
      name: "ClickUp",
      description: "All-in-one productivity and project management suite",
      status: "available",
      features: ["Task Management", "Time Tracking", "Goals", "Multiple Views"],
      logo: "🎯"
    }
  ];

  const crmPlatforms = [
    {
      name: "Salesforce",
      description: "World's #1 CRM platform with comprehensive lead and deal management",
      status: "available",
      features: ["Contact Sync", "Deal Creation", "Lead Scoring", "Activity Tracking"],
      logo: "🏢"
    },
    {
      name: "HubSpot",
      description: "All-in-one inbound marketing, sales, and service platform",
      status: "available", 
      features: ["Contact Management", "Deal Pipeline", "Email Tracking", "Analytics"],
      logo: "🎯"
    },
    {
      name: "Pipedrive",
      description: "Visual sales pipeline software for managing deals and activities",
      status: "available",
      features: ["Pipeline Management", "Contact Sync", "Activity Logging", "Sales Reports"],
      logo: "📊"
    }
  ];

  const calendarPlatforms = [
    {
      name: "Google Calendar",
      description: "Seamless calendar integration with meeting scheduling and availability",
      status: "available",
      features: ["Event Creation", "Availability Check", "Meeting Scheduling", "Conflict Detection"],
      logo: "📅"
    },
    {
      name: "Outlook Calendar",
      description: "Microsoft calendar integration for enterprise environments",
      status: "coming-soon",
      features: ["Event Management", "Team Scheduling", "Meeting Rooms", "Enterprise Sync"],
      logo: "📆"
    }
  ];

  const videoPlatforms = [
    {
      name: "Zoom",
      description: "Professional video conferencing with automated meeting creation",
      status: "available",
      features: ["Meeting Creation", "Automatic Links", "Recording Setup", "Waiting Rooms"],
      logo: "📹"
    },
    {
      name: "Microsoft Teams",
      description: "Enterprise collaboration with integrated video meetings",
      status: "available",
      features: ["Team Meetings", "Channel Integration", "Recording", "Security Controls"],
      logo: "👥"
    },
    {
      name: "Google Meet",
      description: "Instant video meetings with calendar integration",
      status: "available",
      features: ["Instant Meetings", "Calendar Integration", "Screen Sharing", "Mobile Support"],
      logo: "🎥"
    },
    {
      name: "WebEx",
      description: "Enterprise-grade video conferencing and collaboration",
      status: "available",
      features: ["Enterprise Meetings", "Webinars", "Breakout Rooms", "Advanced Security"],
      logo: "🌐"
    }
  ];

  const automationExamples = [
    {
      trigger: "Email from VIP client",
      actions: ["Create Salesforce opportunity", "Schedule follow-up meeting", "Notify team in Slack"],
      platforms: ["Salesforce", "Google Calendar", "Slack"]
    },
    {
      trigger: "Meeting request detected",
      actions: ["Check calendar availability", "Create Zoom meeting", "Send calendar invite"],
      platforms: ["Google Calendar", "Zoom", "Email"]
    },
    {
      trigger: "Lead inquiry received",
      actions: ["Add to HubSpot pipeline", "Create task in project management", "Send personalized response"],
      platforms: ["HubSpot", "Asana", "Email"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Integrations
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Connect your favorite tools and platforms to create seamless workflows that save time and boost productivity.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 max-w-4xl mx-auto">
            <TabsTrigger value="crm" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              CRM
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="productivity" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Productivity
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Project Mgmt
            </TabsTrigger>
          </TabsList>

          {/* CRM Integrations */}
          <TabsContent value="crm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  CRM Integrations
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Automatically sync contacts, create deals, and track interactions across leading CRM platforms.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {crmPlatforms.map((platform, index) => (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{platform.logo}</span>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                        </div>
                        <Badge variant={platform.status === "available" ? "default" : "secondary"}>
                          {platform.status === "available" ? "Available" : "Coming Soon"}
                        </Badge>
                      </div>
                      <CardDescription>{platform.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Features:</h4>
                          <div className="space-y-1">
                            {platform.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button 
                          className="w-full" 
                          disabled={platform.status !== "available"}
                        >
                          {platform.status === "available" ? "Connect Now" : "Coming Soon"}
                          {platform.status === "available" && <ExternalLink className="h-4 w-4 ml-2" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Calendar Integrations */}
          <TabsContent value="calendar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Calendar Integrations
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Smart scheduling with automatic availability checking and seamless meeting coordination.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {calendarPlatforms.map((platform, index) => (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{platform.logo}</span>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                        </div>
                        <Badge variant={platform.status === "available" ? "default" : "secondary"}>
                          {platform.status === "available" ? "Available" : "Coming Soon"}
                        </Badge>
                      </div>
                      <CardDescription>{platform.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Capabilities:</h4>
                          <div className="space-y-1">
                            {platform.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Clock className="h-4 w-4 text-blue-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button 
                          className="w-full" 
                          disabled={platform.status !== "available"}
                        >
                          {platform.status === "available" ? "Connect Calendar" : "Coming Soon"}
                          {platform.status === "available" && <ExternalLink className="h-4 w-4 ml-2" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Calendar Features Showcase */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Smart Scheduling Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg mb-3">
                        <Calendar className="h-8 w-8 text-blue-600 mx-auto" />
                      </div>
                      <h3 className="font-medium mb-2">Automatic Scheduling</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        AI detects scheduling requests and finds optimal meeting times automatically.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg mb-3">
                        <Shield className="h-8 w-8 text-green-600 mx-auto" />
                      </div>
                      <h3 className="font-medium mb-2">Conflict Prevention</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Real-time availability checking prevents double-booking and scheduling conflicts.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-lg mb-3">
                        <Globe className="h-8 w-8 text-purple-600 mx-auto" />
                      </div>
                      <h3 className="font-medium mb-2">Multi-Platform Sync</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Seamlessly sync events across all your calendars and platforms.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Video Platform Integrations */}
          <TabsContent value="video">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Video Platform Integrations
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Automatically create video meetings and include meeting links in calendar invites.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videoPlatforms.map((platform, index) => (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{platform.logo}</span>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                        </div>
                        <Badge variant="default">Available</Badge>
                      </div>
                      <CardDescription>{platform.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Features:</h4>
                          <div className="space-y-1">
                            {platform.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Video className="h-4 w-4 text-red-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button className="w-full">
                          Connect {platform.name}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Automation Examples */}
          <TabsContent value="automation">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Automation Platform Integrations
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with powerful automation platforms to create sophisticated workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {automationPlatforms.map((platform, index) => (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{platform.logo}</span>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                        </div>
                        <Badge variant="default">Available</Badge>
                      </div>
                      <CardDescription>{platform.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Features:</h4>
                          <div className="space-y-1">
                            {platform.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Zap className="h-4 w-4 text-orange-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button className="w-full">
                          Connect {platform.name}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Workflow Examples
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  See how Jace AI orchestrates complex workflows across multiple platforms automatically.
                </p>
              </div>

              <div className="space-y-6">
                {automationExamples.map((example, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                          <Zap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg mb-2">
                            When: {example.trigger}
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                                Jace AI automatically:
                              </h4>
                              <div className="space-y-2">
                                {example.actions.map((action, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Platforms used:
                              </span>
                              <div className="flex gap-2">
                                {example.platforms.map((platform, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {platform}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Smart Automation:</strong> Jace AI learns from your email patterns and automatically suggests new workflow automations based on your communication habits and business needs.
                </AlertDescription>
              </Alert>
            </motion.div>
          </TabsContent>

          {/* Productivity Platform Integrations */}
          <TabsContent value="productivity">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Productivity Platform Integrations
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Sync emails, contacts, and tasks with your favorite productivity tools.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {productivityPlatforms.map((platform, index) => (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{platform.logo}</span>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                        </div>
                        <Badge variant="default">Available</Badge>
                      </div>
                      <CardDescription>{platform.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Features:</h4>
                          <div className="space-y-1">
                            {platform.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button className="w-full">
                          Connect {platform.name}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Productivity Automation Examples
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-medium">Notion Integration</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Auto-sync emails to Email Log database</li>
                        <li>• Create tasks from meeting requests</li>
                        <li>• Update contact database with new leads</li>
                        <li>• Generate meeting notes automatically</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-medium">Airtable Integration</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Sync contact information to CRM base</li>
                        <li>• Track email interactions by lead</li>
                        <li>• Update project status from emails</li>
                        <li>• Generate reports from email data</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Project Management Integrations */}
          <TabsContent value="project">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Project Management Integrations
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Turn emails into actionable tasks across your favorite project management tools.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectPlatforms.map((platform, index) => (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{platform.logo}</span>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                        </div>
                        <Badge variant="default">Available</Badge>
                      </div>
                      <CardDescription>{platform.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Features:</h4>
                          <div className="space-y-1">
                            {platform.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button className="w-full">
                          Connect {platform.name}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Smart Task Creation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg mb-3">
                        <ArrowRight className="h-8 w-8 text-blue-600 mx-auto" />
                      </div>
                      <h3 className="font-medium mb-2">Email Analysis</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        AI analyzes incoming emails for action items and follow-up requirements.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg mb-3">
                        <Settings className="h-8 w-8 text-green-600 mx-auto" />
                      </div>
                      <h3 className="font-medium mb-2">Smart Assignment</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Tasks are automatically assigned based on email context and team structure.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-lg mb-3">
                        <Clock className="h-8 w-8 text-purple-600 mx-auto" />
                      </div>
                      <h3 className="font-medium mb-2">Due Date Detection</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        AI automatically sets due dates based on email urgency and mentioned deadlines.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-none">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Connect Your Tools?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Start building powerful automated workflows that connect all your favorite platforms. 
                Setup takes just minutes and saves hours every week.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Settings className="h-5 w-5 mr-2" />
                  Setup Integrations
                </Button>
                <Button size="lg" variant="outline">
                  <Users className="h-5 w-5 mr-2" />
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}