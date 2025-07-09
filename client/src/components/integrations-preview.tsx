import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Calendar, 
  Video, 
  Users, 
  Zap, 
  Database, 
  CheckSquare, 
  FileText,
  Cloud,
  BarChart3,
  MessageSquare,
  Globe,
  Shield,
  CheckCircle,
  Plus,
  Clock
} from "lucide-react";
import zemaLogo from "@assets/41_1751750660031.png";

// Integration icons from react-icons/si for professional branding
import {
  SiGmail,
  SiMicrosoftoutlook,
  SiCalendly,
  SiGooglecalendar,
  SiLinkedin,
  SiNotion,
  SiSalesforce,
  SiSlack,
  SiTrello,
  SiZapier
} from "react-icons/si";

// Integration stats (like your dashboard)
const integrationStats = [
  {
    label: "Connected",
    value: "8",
    icon: CheckCircle,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-slate-800"
  },
  {
    label: "Available", 
    value: "40+",
    icon: Plus,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-slate-800"
  },
  {
    label: "Active Webhooks",
    value: "24", 
    icon: Zap,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-slate-800"
  }
];

// Popular integrations (like your dashboard screenshot)
const popularIntegrations = [
  {
    name: "Calendly",
    description: "Scheduling platform",
    icon: SiCalendly,
    status: "Available",
    statusColor: "text-gray-400",
    actionButton: "Connect",
    buttonColor: "bg-cyan-500 hover:bg-cyan-400"
  },
  {
    name: "Google Calendar", 
    description: "Schedule meetings",
    icon: SiGooglecalendar,
    status: "Connected",
    statusColor: "text-green-400",
    actionButton: "Configure",
    buttonColor: "bg-gray-600 hover:bg-gray-500"
  },
  {
    name: "LinkedIn",
    description: "Professional network", 
    icon: SiLinkedin,
    status: "Available",
    statusColor: "text-gray-400",
    actionButton: "Connect",
    buttonColor: "bg-cyan-500 hover:bg-cyan-400"
  },
  {
    name: "Notion",
    description: "Knowledge management",
    icon: SiNotion,
    status: "Available", 
    statusColor: "text-gray-400",
    actionButton: "Connect",
    buttonColor: "bg-cyan-500 hover:bg-cyan-400"
  },
  {
    name: "Pabbly Connect",
    description: "Unlimited workflows",
    icon: Zap,
    status: "Available",
    statusColor: "text-gray-400", 
    actionButton: "Connect",
    buttonColor: "bg-cyan-500 hover:bg-cyan-400"
  },
  {
    name: "Salesforce",
    description: "CRM platform",
    icon: SiSalesforce,
    status: "Available",
    statusColor: "text-gray-400",
    actionButton: "Connect", 
    buttonColor: "bg-cyan-500 hover:bg-cyan-400"
  },
  {
    name: "Slack",
    description: "Team communication",
    icon: SiSlack,
    status: "Connected",
    statusColor: "text-green-400",
    actionButton: "Configure",
    buttonColor: "bg-gray-600 hover:bg-gray-500" 
  },
  {
    name: "Trello",
    description: "Project management",
    icon: SiTrello,
    status: "Connected", 
    statusColor: "text-green-400",
    actionButton: "Configure",
    buttonColor: "bg-gray-600 hover:bg-gray-500"
  },
  {
    name: "Zapier",
    description: "Workflow automation",
    icon: SiZapier,
    status: "Connected",
    statusColor: "text-green-400", 
    actionButton: "Configure",
    buttonColor: "bg-gray-600 hover:bg-gray-500"
  }
];

const integrations = [
  {
    category: "Email Providers",
    icon: <Mail className="w-6 h-6" />,
    items: [
      { name: "Gmail", description: "OAuth authentication and basic email access", status: "Available" },
      { name: "Outlook", description: "Microsoft OAuth integration for email access", status: "Available" },
      { name: "Yahoo Mail", description: "Yahoo Mail integration planned", status: "Coming Soon" },
      { name: "Apple Mail", description: "iCloud mail integration planned", status: "Coming Soon" }
    ]
  },
  {
    category: "AI & Automation", 
    icon: <Zap className="w-6 h-6" />,
    items: [
      { name: "GPT-4o AI Assistant", description: "Advanced AI email processing with OpenAI integration", status: "Available" },
      { name: "Smart Email Labeling", description: "AI-powered automatic email categorization", status: "Available" },
      { name: "Priority Detection", description: "AI analyzes and prioritizes emails by importance", status: "Available" },
      { name: "Draft Generation", description: "AI creates professional email responses with context", status: "Available" }
    ]
  },
  {
    category: "Platform Integrations",
    icon: <Globe className="w-6 h-6" />,
    items: [
      { name: "40+ Platforms", description: "CRM, Project Management, Calendar, Payments, AI Services", status: "Available" },
      { name: "Secure API Keys", description: "Encrypted storage and management of integration credentials", status: "Available" },
      { name: "Two-Way Webhooks", description: "Real-time data synchronization with external platforms", status: "Available" },
      { name: "Custom Endpoints", description: "Connect to any REST API with custom webhook configurations", status: "Available" }
    ]
  },
  {
    category: "Security & Compliance",
    icon: <Shield className="w-6 h-6" />,
    items: [
      { name: "OAuth 2.0", description: "Secure authentication without storing passwords", status: "Available" },
      { name: "Encrypted Storage", description: "All data encrypted at rest and in transit", status: "Available" },
      { name: "Password Validation", description: "Enterprise-grade password requirements", status: "Available" },
      { name: "API Key Management", description: "Secure API key generation and management", status: "Available" }
    ]
  },
  {
    category: "Third-Party Platforms",
    icon: <Globe className="w-6 h-6" />,
    items: [
      { name: "Messaging Apps", description: "Discord, Slack, Telegram, Teams, WhatsApp", status: "Available" },
      { name: "Project Management", description: "Trello, Asana, Monday, ClickUp, Linear, Jira", status: "Available" },
      { name: "CRM Systems", description: "Salesforce, HubSpot, Pipedrive, Zendesk", status: "Available" },
      { name: "Payment Platforms", description: "Stripe, PayPal, Shopify, Square", status: "Available" },
      { name: "Calendar Services", description: "Google Calendar, Outlook, Zoom, Calendly", status: "Available" },
      { name: "AI Services", description: "OpenAI, Anthropic, Cohere, Google AI", status: "Available" },
      { name: "Development Tools", description: "GitHub, GitLab, Bitbucket, Jenkins", status: "Available" },
      { name: "Cloud Storage", description: "Google Drive, OneDrive, Dropbox, AWS S3", status: "Available" }
    ]
  },
  {
    category: "User Management",
    icon: <Users className="w-6 h-6" />,
    items: [
      { name: "Multi-Account Support", description: "Connect multiple email accounts", status: "Available" },
      { name: "User Dashboard", description: "Unified interface for managing all accounts", status: "Available" },
      { name: "Template Sharing", description: "Share automation templates with team", status: "In Development" },
      { name: "Role-Based Access", description: "Admin and user permission levels", status: "Coming Soon" }
    ]
  }
];

export default function IntegrationsPreview() {
  return (
    <section id="integrations" className="py-20 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center mb-6"
          >
            <img 
              src={zemaLogo} 
              alt="ZEMA" 
              className="h-20 md:h-24 lg:h-32 w-auto opacity-90 brightness-105 drop-shadow-lg hover:opacity-100 hover:scale-105 transition-all duration-500"
            />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Works With Everything You Already Use
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            No need to change your workflow. ZEMA connects with 40+ popular platforms through secure OAuth and API key management.
          </motion.p>
        </div>

        {/* Integration Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {integrationStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className={`${stat.bgColor} border border-slate-700 p-6 text-center hover:border-cyan-500/50 transition-all duration-300`}>
                <div className="flex items-center justify-center mb-4">
                  <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </Card>
            );
          })}
        </motion.div>

        {/* Popular Integrations Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Popular Integrations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularIntegrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <Card key={index} className="bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-white p-2 rounded-lg mr-4">
                      <Icon className="w-6 h-6 text-slate-800" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">{integration.name}</h4>
                      <p className="text-gray-400 text-sm">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${integration.statusColor}`}>
                      {integration.status}
                    </span>
                    <button className={`${integration.buttonColor} text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm`}>
                      {integration.actionButton}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* All Available Integrations Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">All Available Integrations</h3>
            <Link href="/integrations">
              <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Browse All
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Airtable", icon: "🗃️" },
              { name: "Asana", icon: "📋" },
              { name: "Bitbucket", icon: "🪣" },
              { name: "Calendly", icon: "📅" },
              { name: "ClickUp", icon: "⚡" },
              { name: "Discord", icon: "💬" },
              { name: "Dropbox", icon: "📦" },
              { name: "GitHub", icon: "🐙" },
              { name: "GitLab", icon: "🦊" },
              { name: "Google Drive", icon: "💾" },
              { name: "Google Meet", icon: "📹" },
              { name: "HubSpot", icon: "🎯" },
              { name: "LinkedIn", icon: "💼" },
              { name: "Mailchimp", icon: "📧" },
              { name: "Monday.com", icon: "📊" },
              { name: "OneDrive", icon: "☁️" },
              { name: "OpenAI", icon: "🤖" },
              { name: "Pabbly Connect", icon: "🔗" },
              { name: "PayPal", icon: "💳" },
              { name: "Pipedrive", icon: "🔧" },
              { name: "SendGrid", icon: "📨" },
              { name: "Shopify", icon: "🛒" },
              { name: "Slack", icon: "💬" },
              { name: "Stripe", icon: "💰" },
              { name: "Teams", icon: "👥" },
              { name: "Telegram", icon: "✈️" },
              { name: "Trello", icon: "📌" },
              { name: "WhatsApp", icon: "📱" },
              { name: "Zapier", icon: "⚡" },
              { name: "Zoom", icon: "🎥" }
            ].map((app, index) => (
              <Card key={index} className="bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 p-4 text-center h-24 flex flex-col items-center justify-center">
                <div className="text-2xl mb-1">{app.icon}</div>
                <span className="text-xs text-gray-300 font-medium">{app.name}</span>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-sm">
            <Shield className="w-5 h-5 text-cyan-400 mr-2" />
            <span className="text-gray-300">Secure OAuth & API key management for all integrations</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}